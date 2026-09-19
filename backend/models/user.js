const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
     name: {
        type: String,
        required: [true, 'Name is required'], 
        trim: true,                            
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,                          
        lowercase: true,                       
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
    },
    
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        minlength: [10, 'Phone number must be at least 10 digits'],
        maxlength: [15, 'Phone number cannot exceed 15 digits']
    },
    
    
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  
    },
    
    // Auto-generated unique ID 
    userId: {
        type: String,
        unique: true
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true  
    },
    
    // Profile image 
    avatar: {
        type: String,
        default: 'default-avatar.png'
    }
}, {
    timestamps: true  //  adds createdAt and updatedAt fields
});


userSchema.virtual('memberships', {
    ref: 'Membership',           
    localField: '_id',           
    foreignField: 'user'         
});


userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('User', userSchema);