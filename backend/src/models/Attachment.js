const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    linkedTo: {
      kind: {
        type: String,
        enum: ['transaction', 'bill', 'emi', 'creditCard', 'warranty', 'reimbursement'],
        required: true,
      },
      refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', AttachmentSchema);

