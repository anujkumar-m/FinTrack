const mongoose = require('mongoose');

const ReimbursementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'received'],
      default: 'pending',
    },
    date: {
      type: Date,
      required: true,
    },
    receivedDate: {
      type: Date,
    },
    attachment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attachment',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reimbursement', ReimbursementSchema);

