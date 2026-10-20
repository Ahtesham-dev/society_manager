const Announcement = require('../models/announcement');
const { createNotification } = require('../utils/notify');
const Membership = require('../models/membership');

// Flow: Validate → Create Announcement (role already checked by authorize middleware)

const createAnnouncement = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    const announcement = await Announcement.create({
      society: societyId,
      title: title.trim(),
      content: content.trim(),
      createdBy: req.user._id
    });

    const activeMembers = await Membership.find({
    society: societyId,
    status: 'ACTIVE'
    });

   for (const member of activeMembers) {
     await createNotification({
     society: societyId,
     recipient: member.user,
     message: `New announcement: ${title}`,
     type: 'ANNOUNCEMENT',
     link: `/announcements/${announcement._id}`
    });
}

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });

  } catch (error) {
    console.error('Create Announcement Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    });
  }
};

// Flow: Check membership (via middleware) → Fetch all announcements → Return

const getAnnouncements = async (req, res) => {
  try {
    const { societyId } = req.params;

    const announcements = await Announcement.find({
      society: societyId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name userId');

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });

  } catch (error) {
    console.error('Get Announcements Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
};

module.exports = { createAnnouncement, getAnnouncements };