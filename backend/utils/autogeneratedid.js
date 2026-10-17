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
  const count = await rulecreation.countDocuments();
  const number = String(count + 1).padStart(3, '0');
  return `R${number}`;
};

const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const number = String(count + 1).padStart(5, '0');
  return `C${number}`;
};

const generateFineId = async () => {
  const count = await Fine.countDocuments();
  return `F${String(count + 1).padStart(5, '0')}`;
};

const generateMaintenanceId = async () => {
  const count = await Maintenance.countDocuments();
  return `M${String(count + 1).padStart(5, '0')}`;
};

const generateRecordId = async () => {
  const count = await Finance.countDocuments();
  return `FIN${String(count + 1).padStart(5, '0')}`;
};

module.exports = { generateUserId, generateSocietyId , generateRulecreationId,
   generateComplaintId, generateFineId, generateMaintenanceId, generateRecordId };
