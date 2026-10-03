// Flow: Request → Check Token → Verify → Attach user → Next
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Membership = require('../models/membership');



const protect = async (req, res, next) => {
    try {
        let token;
        // Frontend sends token in Header: Authorization: Bearer <token>
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            // Extract just the 
            // "Bearer eyJhbGci..." → "eyJhbGci..."
            token = req.headers.authorization.split(' ')[1];
        }

        //Checking if  token exists
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. Please login first.'
            });
        }

        // Verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user from token
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        //Check account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account deactivated' 
            });
        }

        // STEP 6: Attach user to request
        // Now any controller can access req.user
        req.user = user;

        // STEP 7: Pass to next middleware/controller
        next();

    } catch (error) {
        // Token expired or tampered
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};



const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            const societyId = 
                req.params.societyId || 
                req.body.societyId || 
                req.query.societyId;

            if (!societyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Society ID required'
                });
            }

            const membership = await Membership.findOne({
                user: req.user._id,
                society: societyId,
                status: 'ACTIVE'
            });

            if (!membership) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not a member of this society'
                });
            }
            
            if (!roles.includes(membership.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${roles.join(' or ')}`
                });
            }

            // Attach membership to request
            // Controllers can now access req.membership
            req.membership = membership;
            req.societyId = societyId;
            req.userRole = membership.role;

            next();

        } catch (error) {
            console.error('Authorize Error:', error);
            res.status(500).json({
                success: false,
                message: 'Authorization check failed'
            });
        }
    };
};

module.exports = { protect, authorize };