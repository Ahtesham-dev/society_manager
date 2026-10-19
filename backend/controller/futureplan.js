const FuturePlan = require('../models/futureplan');

// Flow: Validate title/description → Create plan → Attach createdBy → Save
const createPlan = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { title, description, estimatedCost, targetDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description'
      });
    }

    const plan = await FuturePlan.create({
      society: societyId,
      title,
      description,
      estimatedCost,
      targetDate,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Future plan created successfully',
      plan
    });

  } catch (error) {
    console.error('Create Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating future plan'
    });
  }
};

// Flow: Find plans by society → Populate createdBy → Sort newest first → Return list
const getPlans = async (req, res) => {
  try {
    const { societyId } = req.params;

    const plans = await FuturePlan.find({ society: societyId })
      .populate('createdBy', 'name userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });

  } catch (error) {
    console.error('Get Plans Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching future plans'
    });
  }
};

// Flow: Validate status → Find plan in society → Update status → Save
const updatePlanStatus = async (req, res) => {
  try {
    const { societyId, planId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED, IN_PROGRESS, COMPLETED or CANCELLED'
      });
    }

    const plan = await FuturePlan.findOne({
      _id: planId,
      society: societyId
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Future plan not found in this society'
      });
    }

    plan.status = status;
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Plan status updated successfully',
      plan
    });

  } catch (error) {
    console.error('Update Plan Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating plan status'
    });
  }
};

module.exports = { createPlan, getPlans, updatePlanStatus };