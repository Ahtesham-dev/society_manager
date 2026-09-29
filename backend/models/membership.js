const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
   
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    
   
    wing: {
        type: String,       
        required: true,
        uppercase: true
    },
    floor: {
        type: Number,       
        required: true
    },
    flatNo: {
        type: String,      
        required: true
    },
    
    
    fullFlatNo: {
        type: String       
    },
    
    
    role: {
        type: String,
        enum: ['CHAIRMAN', 'SECRETARY', 'TREASURER', 'MEMBER'],  
        default: 'MEMBER',
        required: true
    },
    
    
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED'],
        default: 'PENDING'  
    },
    
   
    joinedDate: {
        type: Date,
        default: Date.now
    },
    
    // added by member
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// indexes 
membershipSchema.index({ user: 1, society: 1 }, { unique: true });


membershipSchema.index({ society: 1, flatNo: 1 });


membershipSchema.index({ society: 1, role: 1 });

module.exports = mongoose.model('Membership', membershipSchema)