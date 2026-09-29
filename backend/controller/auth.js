const User = require('../models/user');
const Membership = require('../models/membership');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUserId } = require('../utils/generateId');

// Flow: Validate → Hash Password → Create User → Generate userId → Send Token

const createToken = (userId) => {
    return jwt.sign(
        { id: userId },                    // Payload
        process.env.JWT_SECRET,            // Secret key
        { expiresIn: process.env.JWT_EXPIRE || '7d' }  // Token expires in 7 days 
    );
};


const sendTokenResponse = (user, statusCode, res, membership = null) => {
    // Create token using user's database _id
    const token = createToken(user._id);

    // response object
    const response = {
        success: true,
        token,             //stored in frontend 
        user: {
            id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar
        }
    };

    // If user has membership, include it
    // This tells frontend which society, flat, and role user has
    if (membership) {
        response.membership = {
            societyId: membership.society,
            flatNo: membership.fullFlatNo,
            role: membership.role,
            status: membership.status
        };
    }

    res.status(statusCode).json(response);
};



const register = async (req, res) => {
    try {
       
        const { name, email, phone, password } = req.body;
        // Check all required fields exist
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, phone and password'
            });
        }

        //  Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        // Check if phone number already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered.'
            });
        }

        // Validation of password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const userId = await generateUserId();
        

        //Created user in database
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password: hashedPassword,  // Store hashed, NOT plain text!
            userId
        });

        //Send response with token
        // New user has NO society/flat/role yet
        // Chairman assigns them
        sendTokenResponse(user, 201, res);

    } catch (error) {
        // Handle MongoDB duplicate key error 
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        console.error('Register Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Flow: Find User → Verify Password → Load Membership → Send Token

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Check fields exist
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        //Find user by email
        // using .select('+password') because password has select:false
        // Without this, password won't be returned even if we need it!
        const user = await User.findOne({ 
            email: email.toLowerCase() 
        }).select('+password');

        //Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated. Contact your Chairman.'
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'  
            });
        }

        //Load membership (society + flat + role)
        const membership = await Membership.findOne({
            user: user._id,
            status: 'ACTIVE'
        })
        .populate('society', 'name societyId address')
        .sort({ createdAt: -1 });  // Most recent first

        //Send token response
        // Include membership data if they have one
        sendTokenResponse(user, 200, res, membership);

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};



const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Load all memberships for this user
        const memberships = await Membership.find({
            user: user._id,
            status: 'ACTIVE'
        }).populate('society', 'name societyId address logo');

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                createdAt: user.createdAt
            },
            memberships  // All societies this user belongs to
        });

    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        token: null  
    });
};

module.exports = { register, login, getMe, logout };