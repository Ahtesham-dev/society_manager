const User = require('../models/user');
const Society = require('../models/society');
const rulecreation = require('../models/rulescreation');

const generateUserId = async () => {
  const count = await User.countDocuments();
  const number = String(count + 1).padStart(5, '0');
  return `U${number}`;
};

const generateSocietyId = async () => {
  const count = await Society.countDocuments();
  const number = String(count + 1).padStart(3, '0');
  return `S${number}`;
};

const generateRulecreationId = async () => {
  const count = await Rule.countDocuments();
  const number = String(count + 1).padStart(3, '0');
  return `R${number}`;
};

module.exports = { generateUserId, generateSocietyId , generateRulecreationId };
