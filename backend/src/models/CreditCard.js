const mongoose = require('mongoose');

const CreditCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastFourDigits: {
      type: String,
      required: true,
      trim: true,
    },
    billAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CreditCard', CreditCardSchema);

