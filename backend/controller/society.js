const Society = require('../models/society');
const Membership = require('../models/membership');
const { generateSocietyId } = require('../utils/generateId');
const User = require('../models/user');

// Flow: Validate → Create Society → Auto-assign Creator as CHAIRMAN

const createSociety = async (req, res) => {
  try {
    const { name, address, configuration, chairmanFlat } = req.body;

    if (!name || !address || !chairmanFlat) {
      return res.status(400).json({
        success: false,
        message: 'Please provide society name, address, and your flat details'
      });
    }

    //Validate address fields
    const { street, city, state, pincode } = address;
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Address must include street, city, state and pincode'
      });
    }

    // Validate chairman's own flat details
    // (The creator is usually a resident too, so we assign them a flat)
    const { wing, floor, flatNo } = chairmanFlat;
    if (!wing || floor === undefined || !flatNo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your wing, floor and flat number'
      });
    }

    const societyId = await generateSocietyId();

    // Create the Society in database
    const society = await Society.create({
      name: name.trim(),
      address,
      societyId,
      creator: req.user._id,      // req.user comes from 'protect' middleware
      configuration: configuration || {}
    });

    // STEP 6: Build the full flat number e.g. "A-101"
    const fullFlatNo = `${wing.toUpperCase()}-${flatNo}`;

    // STEP 7: Auto-create Membership — creator becomes CHAIRMAN
    const membership = await Membership.create({
      user: req.user._id,
      society: society._id,
      wing: wing.toUpperCase(),
      floor: floor,              
      flatNo: flatNo,           
      fullFlatNo: fullFlatNo,
      role: 'CHAIRMAN',
      status: 'ACTIVE',          // No approval needed — as they created it
      addedBy: req.user._id      // Self-assigned
    });

    // STEP 8: Send response
    res.status(201).json({
      success: true,
      message: 'Society created successfully. You are now the Chairman.',
      society: {
        id: society._id,
        societyId: society.societyId,
        name: society.name,
        address: society.address,
        configuration: society.configuration
      },
      membership: {
        id: membership._id,
        role: membership.role,
        flatNo: membership.fullFlatNo,
        status: membership.status
      }
    });

  } catch (error) {
    // Handle duplicate societyId (very rare race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Society ID conflict, please try again'
      });
    }
    console.error('Create Society Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating society',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Flow: Get logged-in user → Find all their ACTIVE memberships → Return society details
const getMySocieties = async (req, res) => {
  try {
    const memberships = await Membership.find({
      user: req.user._id,
      status: 'ACTIVE'
    }).populate('society', 'name societyId address logo configuration');
    

    // If user has no societies yet, it's not an error — just an empty list
    res.status(200).json({
      success: true,
      count: memberships.length,
      memberships
    });

  } catch (error) {
    console.error('Get My Societies Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching societies'
    });
  }
};
const getSocietyDetails = async (req, res) => {
  try {
    const { societyId } = req.params;

    const myMembership = await Membership.findOne({
      user: req.user._id,
      society: societyId,
      status: 'ACTIVE'
    });

    if (!myMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this society'
      });
    }

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    let members;

    if (myMembership.role === 'CHAIRMAN') {
      members = await Membership.find({
        society: societyId,
        status: 'ACTIVE'
      })
      .select('+addedBy')
      .populate('user', 'name email phone userId avatar')
      .populate('addedBy', 'name userId');
    } else {
      members = await Membership.find({
        society: societyId,
        status: 'ACTIVE'
      })
      .populate('user', 'name email phone userId avatar');
    }

    res.status(200).json({
      success: true,
      society,
      myRole: myMembership.role,
      myFlat: myMembership.fullFlatNo,
      members
    });

  } catch (error) {
    console.error('Get Society Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching society details'
    });
  }
};

const addMember = async (req, res) => {
  try {
    // societyId is already verified by 'authorize' middleware before this runs
    const { societyId } = req.params;
    const { userId, wing, floor, flatNo, role } = req.body;

    //Validating required fields
    if (!userId || !wing || floor === undefined || !flatNo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, wing, floor and flatNo'
      });
    }

    //Finding the target user using their custom userId (e.g. "U00001")
    const targetUser = await User.findOne({ userId: userId });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this userId'
      });
    }

    //Checking if this user is already a member of this society
    const existingMembership = await Membership.findOne({
      user: targetUser._id,
      society: societyId
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of this society'
      });
    }

    //Chairman can only assign  roles  which is not taken or  CHAIRMAN)
    const allowedRoles = ['MEMBER', 'SECRETARY', 'TREASURER'];
    const finalRole = role || 'MEMBER';

    if (!allowedRoles.includes(finalRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be MEMBER, SECRETARY or TREASURER'
      });
    }

    //Check if SECRETARY/TREASURER already taken
    if (finalRole === 'SECRETARY' || finalRole === 'TREASURER') {
      const roleAlreadyTaken = await Membership.findOne({
        society: societyId,
        role: finalRole,
        status: 'ACTIVE'
      }).populate('user', 'name userId');

      if (roleAlreadyTaken) {
        return res.status(400).json({
          success: false,
          message: `${finalRole} role is already assigned to ${roleAlreadyTaken.user.name} (${roleAlreadyTaken.user.userId}). Remove or change their role first.`
        });
      }
    }

    const fullFlatNo = `${wing.toUpperCase()}-${flatNo}`;

    //Creating the membership
    const membership = await Membership.create({
      user: targetUser._id,
      society: societyId,
      wing: wing.toUpperCase(),
      floor,
      flatNo,
      fullFlatNo,
      role: finalRole,
      status: 'ACTIVE',
      addedBy: req.user._id    
    });

    res.status(201).json({
      success: true,
      message: `${targetUser.name} added to society successfully`,
      membership
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of this society'
      });
    }
    console.error('Add Member Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding member'
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { societyId, membershipId } = req.params;
    const { role } = req.body;

    // Validate if role was sent
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role'
      });
    }

    // Only these roles can be assigned through this route
    const allowedRoles = ['MEMBER', 'SECRETARY', 'TREASURER'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be MEMBER, SECRETARY or TREASURER'
      });
    }

    //Find the membership  that is to be update
    //check BOTH membershipId AND society - so Chairman of Society A cannot accidentally (or maliciously) update a membership from Society B
    const membership = await Membership.findOne({
      _id: membershipId,
      society: societyId
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found in this society'
      });
    }

    //Block changing a CHAIRMAN's role through this simple route
    if (membership.role === 'CHAIRMAN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change Chairman role here. Use chairman transfer process.'
      });
    }

    //If assigning SECRETARY/TREASURER, check it's not already taken
    // by SOMEONE ELSE (exclude this membership itself from the check)
    if (role === 'SECRETARY' || role === 'TREASURER') {
      const roleAlreadyTaken = await Membership.findOne({
        _id: { $ne: membershipId },   // $ne means "not equal" - exclude current membership
        society: societyId,
        role: role,
        status: 'ACTIVE'
      }).populate('user', 'name userId');

      if (roleAlreadyTaken) {
        return res.status(400).json({
          success: false,
          message: `${role} role is already assigned to ${roleAlreadyTaken.user.name} (${roleAlreadyTaken.user.userId}). Remove or change their role first.`
        });
      }
    }

    //Update and save
    const oldRole = membership.role;
    membership.role = role;
    await membership.save();

    res.status(200).json({
      success: true,
      message: `Role updated from ${oldRole} to ${role}`,
      membership
    });

  } catch (error) {
    console.error('Update Member Role Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating role'
    });
  }
};

const updateMemberFlat = async (req, res) => {
  try {
    const { societyId, membershipId } = req.params;
    const { wing, floor, flatNo } = req.body;

    //Validating required fields
    if (!wing || floor === undefined || !flatNo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wing, floor and flatNo'
      });
    }

    //Finding the membership of this society only
    const membership = await Membership.findOne({
      _id: membershipId,
      society: societyId
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found in this society'
      });
    }

    //updating the flat fields
    const fullFlatNo = `${wing.toUpperCase()}-${flatNo}`;

    const oldFlatNo = membership.fullFlatNo;

    membership.wing = wing.toUpperCase();
    membership.floor = floor;
    membership.flatNo = flatNo;
    membership.fullFlatNo = fullFlatNo;

    await membership.save();

    res.status(200).json({
      success: true,
      message: `Flat updated from ${oldFlatNo} to ${fullFlatNo}`,
      membership
    });

  } catch (error) {
    console.error('Update Member Flat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating flat'
    });
  }
};

module.exports = { createSociety, getMySocieties, getSocietyDetails, addMember, updateMemberRole, updateMemberFlat };