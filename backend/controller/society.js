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
      floor,
      flatNo,
      fullFlatNo,
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

module.exports = { createSociety };