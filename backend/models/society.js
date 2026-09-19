const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, 'Society name is required'],
        trim: true
    },
    
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { 
            type: String, 
            required: true,
            match: [/^[0-9]{6}$/, 'Invalid pincode']  // Must be 6 digits
        },
        country: { type: String, default: 'India' }
    },
    
    // Unique Society ID 
    societyId: {
        type: String,
        unique: true
    },
    
    // link to User model
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    
    configuration: {
        wings: [{                    
            type: String,
            uppercase: true          
        }],
        floorsPerWing: {
            type: Number,
            default: 5,
            min: [1, 'At least 1 floor required']
        },
        flatsPerFloor: {
            type: Number,
            default: 4,
            min: [1, 'At least 1 flat per floor required']
        }
    },
    
    // Registration date
    registeredDate: {
        type: Date,
        default: Date.now
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    logo: {
        type: String,
        default: 'default-society.png'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


societySchema.virtual('members', {
    ref: 'Membership',
    localField: '_id',
    foreignField: 'society'
});

module.exports = mongoose.model('Society', societySchema);