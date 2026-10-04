const Society = require('../models/society');
const Membership = require('../models/membership');
const { generateSocietyId } = require('../utils/generateId');

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

module.exports = { createSociety, getMySocieties, getSocietyDetails };