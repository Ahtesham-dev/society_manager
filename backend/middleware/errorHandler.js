const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const duplicateFields = Object.keys(err.keyValue || err.keyPattern || {});

    if (duplicateFields.includes('societyId')) {
      message = 'Society ID conflict, please try again';
    } else if (duplicateFields.includes('user') && duplicateFields.includes('society')) {
      message = 'This user is already a member of this society';
    } else if (duplicateFields.length > 0) {
      message = `${duplicateFields[0]} already exists`;
    } else {
      message = 'Duplicate value entered';
    }
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;