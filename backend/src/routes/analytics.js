const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { getMonthKey } = require('../utils/dateUtils');

const router = express.Router();

// GET /api/analytics/overview?months=6
router.get('/overview', auth, async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;

    const transactions = await Transaction.find({
      user: req.user.id,
    }).sort({ date: 1 });

    const byMonth = new Map();
    const categoryTotals = new Map();

    transactions.forEach((t) => {
      if (!t.date) {
        return;
      }

      const d = t.date instanceof Date ? t.date : new Date(t.date);
      const monthKey = getMonthKey(d);

      if (!byMonth.has(monthKey)) {
        byMonth.set(monthKey, {
          month: monthKey,
          totalIncome: 0,
          totalExpenses: 0,
        });
      }

      const bucket = byMonth.get(monthKey);
      if (t.type === 'income') {
        bucket.totalIncome += t.amount;
      } else if (t.type === 'expense') {
        bucket.totalExpenses += t.amount;
      }

      if (t.type === 'expense' && t.category) {
        const catName = typeof t.category === 'string' ? t.category : 'Other';
        const prev = categoryTotals.get(catName) || 0;
        categoryTotals.set(catName, prev + t.amount);
      }
    });

    const monthsArray = Array.from(byMonth.values())
      .map((m) => ({
        ...m,
        balance: m.totalIncome - m.totalExpenses,
        savings: 0,
      }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    const recentMonths =
      monthsArray.length > months ? monthsArray.slice(monthsArray.length - months) : monthsArray;

    const categoryExpenses = Array.from(categoryTotals.entries()).map(([name, value]) => ({
      name,
      value,
      color: 'hsl(199, 89%, 48%)',
    }));

    return res.json({
      monthlyStats: recentMonths,
      categoryExpenses,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

