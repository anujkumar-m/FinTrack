const express = require('express');
const Transaction = require('../models/Transaction');
const BorrowLend = require('../models/BorrowLend');
const Bill = require('../models/Bill');
const EMI = require('../models/EMI');
const CreditCard = require('../models/CreditCard');
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');
const { getMonthRange } = require('../utils/dateUtils');

const router = express.Router();

// GET /api/dashboard/summary?month=YYYY-MM
router.get('/summary', auth, async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: 'month (YYYY-MM) is required' });
    }

    const { start, end } = getMonthRange(month);

    const [transactions, borrowLend, bills, emis, creditCards, savingsGoals] = await Promise.all([
      Transaction.find({
        user: req.user.id,
        date: { $gte: start, $lte: end },
      }),
      BorrowLend.find({ user: req.user.id, status: 'pending' }),
      Bill.find({ user: req.user.id, month }),
      EMI.find({
        user: req.user.id,
        startDate: { $lte: end },
        endDate: { $gte: start },
      }),
      CreditCard.find({ user: req.user.id, isPaid: false }),
      SavingsGoal.find({ user: req.user.id }),
    ]);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const pendingBorrowed = borrowLend
      .filter((b) => b.type === 'borrowed')
      .reduce((sum, b) => sum + b.amount, 0);
    const pendingLent = borrowLend
      .filter((b) => b.type === 'lent')
      .reduce((sum, b) => sum + b.amount, 0);

    const upcomingBills = bills.filter((b) => !b.isPaid);

    const activeEmis = emis.filter((e) => e.isActive);
    const monthlyEmiTotal = activeEmis.reduce((sum, e) => sum + e.amount, 0);

    const creditCardDues = creditCards.reduce((sum, c) => sum + c.billAmount, 0);

    const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    const response = {
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        balance,
        savings: totalSavings,
      },
      borrowLend: {
        pendingBorrowed,
        pendingLent,
      },
      bills: {
        upcoming: upcomingBills,
      },
      emis: {
        active: activeEmis,
        monthlyTotal: monthlyEmiTotal,
      },
      creditCards: {
        dues: creditCardDues,
        cards: creditCards,
      },
      savingsGoals,
    };

    return res.json(response);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

