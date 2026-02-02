const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { getMonthRange } = require('../utils/dateUtils');

const router = express.Router();

// GET /api/transactions?type=expense|income&month=YYYY-MM&paymentMode=cash|bank|upi|credit_card
router.get('/', auth, async (req, res, next) => {
  try {
    const { type, month, paymentMode } = req.query;
    const filter = { user: req.user.id };

    if (type) {
      filter.type = type;
    }

    if (paymentMode) {
      filter.paymentMode = paymentMode;
    }

    if (month) {
      const { start, end } = getMonthRange(month);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    return res.json(transactions);
  } catch (err) {
    return next(err);
  }
});

// POST /api/transactions
router.post(
  '/',
  auth,
  [
    body('type').isIn(['expense', 'income']).withMessage('Invalid type'),
    body('amount').isNumeric().withMessage('Amount is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        type,
        amount,
        description,
        category,
        date,
        paymentMode,
        creditCard,
        savingsGoal,
        bill,
        emi,
        notes,
      } = req.body;

      const transaction = new Transaction({
        user: req.user.id,
        type,
        amount,
        description,
        category,
        date,
        paymentMode,
        creditCard,
        savingsGoal,
        bill,
        emi,
        notes,
      });

      await transaction.save();

      return res.status(201).json(transaction);
    } catch (err) {
      return next(err);
    }
  }
);

// PUT /api/transactions/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const allowedFields = [
      'type',
      'amount',
      'description',
      'category',
      'date',
      'paymentMode',
      'creditCard',
      'savingsGoal',
      'bill',
      'emi',
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json({ message: 'Transaction deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

