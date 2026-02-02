const mongoose = require('mongoose');

// Generic transaction model used for both income and expenses
const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // For simplicity with the current UI we store the category name as a string.
    // You can later add a separate Category reference if needed.
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'bank', 'upi', 'credit_card'],
      default: 'cash',
    },
    // Links to other finance entities
    creditCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditCard',
    },
    isSavingsTransfer: {
      type: Boolean,
      default: false,
    },
    savingsGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
    },
    emi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EMI',
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
    meta: {
      // Free-form metadata for future extension
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);

