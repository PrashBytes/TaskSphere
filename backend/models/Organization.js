const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 100
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
