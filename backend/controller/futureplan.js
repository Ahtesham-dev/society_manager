const FuturePlan = require('../models/futureplan');
const asyncHandler = require('../utils/asyncHandler');

// Flow: Validate title/description → Create plan → Attach createdBy → Save
const createPlan = asyncHandler(async (req, res) => {
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

});

// Flow: Find plans by society → Populate createdBy → Sort newest first → Return list
const getPlans = asyncHandler(async (req, res) => {
    const { societyId } = req.params;

    const plans = await FuturePlan.find({ society: societyId })
      .populate('createdBy', 'name userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });

});

// Flow: Validate status → Find plan in society → Update status → Save
const updatePlanStatus = asyncHandler(async (req, res) => {
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

    if (plan.status === status) {
      return res.status(400).json({
        success: false,
        message: `Future plan status is already set to ${status}`
      });
    }

    plan.status = status;
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Plan status updated successfully',
      plan
    });

});

// Flow: Validate voteType → Find plan → Check if user already voted → Add/Toggle-off/Update vote → Save
const castVote = asyncHandler(async (req, res) => {
    const { societyId, planId } = req.params;
    const { voteType } = req.body;

    if (!voteType || (voteType !== 'LIKE' && voteType !== 'DISLIKE')) {
      return res.status(400).json({
        success: false,
        message: 'voteType must be LIKE or DISLIKE'
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

    const existingVote = plan.votes.find(
      (vote) => vote.user.toString() === req.user._id.toString()
    );

    if (!existingVote) {
      plan.votes.push({ user: req.user._id, voteType });
    } else if (existingVote.voteType === voteType) {
      plan.votes = plan.votes.filter(
        (vote) => vote.user.toString() !== req.user._id.toString()
      );
    } else {
      existingVote.voteType = voteType;
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded',
      likeCount: plan.likeCount,
      dislikeCount: plan.dislikeCount,
      plan
    });

});

module.exports = { createPlan, getPlans, updatePlanStatus, castVote };