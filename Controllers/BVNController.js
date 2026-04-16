const BVN = require('../Models/BVN');

// Function to validate BVN format
const validateBVNFormat = (bvn) => {
  const bvnRegex = /^\d{11}$/;
  return bvnRegex.test(bvn);
};

const insertBVN = async (req, res) => {
  try {
    const { bvn, firstName, lastName, dob, phone } = req.body;

    if (!validateBVNFormat(bvn)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BVN format. BVN must be exactly 11 digits.'
      });
    }

    const existingBVN = await BVN.findOne({ bvn });
    if (existingBVN) {
      return res.status(409).json({
        success: false,
        message: 'BVN already exists in the system.'
      });
    }

    const newBVN = new BVN({
      bvn,
      firstName,
      lastName,
      dob: new Date(dob),
      phone
    });

    await newBVN.save();

    res.status(201).json({
      success: true,
      message: 'BVN record created successfully.',
      data: {
        bvn: newBVN.bvn,
        firstName: newBVN.firstName,
        lastName: newBVN.lastName,
        dob: newBVN.dob,
        phone: newBVN.phone,
        createdAt: newBVN.createdAt
      }
    });
  } catch (error) {
    console.error('Error inserting BVN:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while inserting BVN.'
    });
  }
};

const validateBVN = async (req, res) => {
  try {
    const { bvn, firstName, lastName, dob, phone } = req.body;

    if (!validateBVNFormat(bvn)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BVN format. BVN must be exactly 11 digits.'
      });
    }

    const bvnRecord = await BVN.findOne({ bvn });
    if (!bvnRecord) {
      return res.status(404).json({
        success: false,
        message: 'BVN not found in the system.'
      });
    }

    let isValid = true;
    const mismatches = [];

    if (firstName && bvnRecord.firstName.toLowerCase() !== firstName.toLowerCase()) {
      isValid = false;
      mismatches.push('firstName');
    }

    if (lastName && bvnRecord.lastName.toLowerCase() !== lastName.toLowerCase()) {
      isValid = false;
      mismatches.push('lastName');
    }

    if (dob && new Date(dob).getTime() !== bvnRecord.dob.getTime()) {
      isValid = false;
      mismatches.push('dob');
    }

    if (phone && bvnRecord.phone !== phone) {
      isValid = false;
      mismatches.push('phone');
    }

    if (isValid) {
      return res.json({
        success: true,
        message: 'BVN validation successful.',
        data: {
          bvn: bvnRecord.bvn,
          firstName: bvnRecord.firstName,
          lastName: bvnRecord.lastName,
          dob: bvnRecord.dob,
          phone: bvnRecord.phone
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'BVN validation failed. Provided data does not match records.',
      mismatches
    });
  } catch (error) {
    console.error('Error validating BVN:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating BVN.'
    });
  }
};

const getBVNByNumber = async (req, res) => {
  try {
    const { bvn } = req.params;

    if (!validateBVNFormat(bvn)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BVN format. BVN must be exactly 11 digits.'
      });
    }

    const bvnRecord = await BVN.findOne({ bvn });
    if (!bvnRecord) {
      return res.status(404).json({
        success: false,
        message: 'BVN not found.'
      });
    }

    res.json({
      success: true,
      data: {
        bvn: bvnRecord.bvn,
        firstName: bvnRecord.firstName,
        lastName: bvnRecord.lastName,
        dob: bvnRecord.dob,
        phone: bvnRecord.phone,
        createdAt: bvnRecord.createdAt,
        updatedAt: bvnRecord.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching BVN:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching BVN.'
    });
  }
};

module.exports = {
  insertBVN,
  validateBVN,
  getBVNByNumber
};
