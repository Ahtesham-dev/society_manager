const Feedback = require('../models/feedback');
const { createNotification } = require('../utils/notify');

const submitFeedback = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { category, title, message } = req.body;

    if (!category || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, title and message'
      });
    }

    const allowedCategories = [
      'SUGGESTION',
      'ISSUE',
      'APPRECIATION',
      'OTHER'
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be SUGGESTION, ISSUE, APPRECIATION or OTHER'
      });
    }

    const feedback = await Feedback.create({
      society: societyId,
      submittedBy: req.user._id,
      category,
      title,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { status } = req.query;

    const filter = { society: societyId };
    if (status) {
      filter.status = status;
    }

    const feedbackList = await Feedback.find(filter)
      .select('+submittedBy')
      .populate('submittedBy', 'name userId')
      .populate('respondedBy', 'name userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList
    });

  } catch (error) {
    console.error('Get All Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback'
    });
  }
};

const respondToFeedback = async (req, res) => {
  try {
    const { societyId, feedbackId } = req.params;
    const { response, status } = req.body;

    const allowedStatuses = ['UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be UNDER_REVIEW, RESOLVED or REJECTED'
      });
    }

    const feedback = await Feedback.findOne({
      _id: feedbackId,
      society: societyId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found in this society'
      });
    }

    feedback.status = status;
    if (response) {
      feedback.response = response;
    }
    feedback.respondedBy = req.user._id;
    feedback.respondedAt = Date.now();

    await feedback.save();

    await createNotification({
      society: societyId,
      recipient: feedback.submittedBy,
      message: `Your feedback "${feedback.title}" was updated to ${status}`,
     type: 'FEEDBACK',
     link: `/feedback/${feedback._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Respond To Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to feedback'
    });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    const { societyId } = req.params;

    const feedbackList = await Feedback.find({
      society: societyId,
      submittedBy: req.user._id
    })
      .select('+submittedBy')
      .populate('respondedBy', 'name userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList
    });

  } catch (error) {
    console.error('Get My Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your feedback'
    });
  }
};

module.exports = { submitFeedback, getAllFeedback, respondToFeedback, getMyFeedback };