const Rule = require('../models/rule');
const { generateRuleId } = require('../utils/generateId');

// Flow: Validate → Check role already done by authorize middleware → Create Rule

const createRule = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { category, title, description } = req.body;

    // Validation of  required fields
    if (!category || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, title and description'
      });
    }

    //Validation of category is one of the allowed values
    const allowedCategories = [
      'PARKING', 'NOISE', 'VISITORS', 'PETS', 'SECURITY', 
      'WASTE', 'COMMON_AREAS', 'RENOVATION', 'MAINTENANCE', 'EMERGENCY'
    ];
    if (!allowedCategories.includes(category.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${allowedCategories.join(', ')}`
      });
    }

    //Generating unique rule ID
    const ruleId = await generateRuleId();

    //Create  rule function
    const rule = await Rule.create({
      society: societyId,
      category: category.toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      ruleId,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      rule
    });

  } catch (error) {
    console.error('Create Rule Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating rule'
    });
  }
};

module.exports = { createRule };