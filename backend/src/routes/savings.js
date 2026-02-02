// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const SavingsGoal = require('../models/SavingsGoal');
// const auth = require('../middleware/auth');

// const router = express.Router();

// // GET /api/savings-goals
// router.get('/', auth, async (req, res, next) => {
//   try {
//     const goals = await SavingsGoal.find({ user: req.user.id }).sort({ createdAt: 1 });
//     return res.json(goals);
//   } catch (err) {
//     return next(err);
//   }
// });

// // POST /api/savings-goals
// router.post(
//   '/',
//   auth,
//   [
//     body('name').notEmpty().withMessage('Name is required'),
//     body('targetAmount').isNumeric().withMessage('Target amount is required'),
//     body('targetDate').isISO8601().withMessage('Valid target date is required'),
//   ],
//   async (req, res, next) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { name, targetAmount, currentAmount, targetDate, icon, autoDeductFromBalance } = req.body;
//       const goal = new SavingsGoal({
//         user: req.user.id,
//         name,
//         targetAmount,
//         currentAmount,
//         targetDate,
//         icon,
//         autoDeductFromBalance,
//       });
//       await goal.save();
//       return res.status(201).json(goal);
//     } catch (err) {
//       return next(err);
//     }
//   }
// );

// // PATCH /api/savings-goals/:id/add
// // Body: { amount }
// // router.patch('/:_id/add', auth, [body('amount').isNumeric()], async (req, res, next) => {
// //   try {
// //     const { amount } = req.body;
// //     const goal = await SavingsGoal.findOneAndUpdate(
// //       { _id: req.params._id, user: req.user.id },
// //       { $inc: { currentAmount: amount } },
// //       { new: true }
// //     );

// //     if (!goal) {
// //       return res.status(404).json({ message: 'Goal not found' });
// //     }

// //     return res.json(goal);
// //   } catch (err) {
// //     return next(err);
// //   }
// // });


// router.patch('/:id/add', auth, async (req, res) => {
//   const { amount } = req.body;

//   if (!amount || amount <= 0) {
//     return res.status(400).json({ message: 'Invalid amount' });
//   }

//   const goal = await SavingsGoal.findOneAndUpdate(
//     { _id: req.params.id, user: req.user.id },
//     { $inc: { currentAmount: amount } },
//     { new: true }
//   );

//   if (!goal) {
//     return res.status(404).json({ message: 'Goal not found' });
//   }

//   res.json(goal);
// });

// // PUT /api/savings-goals/:id
// router.put('/:id', auth, async (req, res, next) => {
//   try {
//     const updates = (({ name, targetAmount, currentAmount, targetDate, icon, autoDeductFromBalance }) => ({
//       name,
//       targetAmount,
//       currentAmount,
//       targetDate,
//       icon,
//       autoDeductFromBalance,
//     }))(req.body);

//     const goal = await SavingsGoal.findOneAndUpdate(
//       { _id: req.params.id, user: req.user.id },
//       updates,
//       { new: true }
//     );

//     if (!goal) {
//       return res.status(404).json({ message: 'Goal not found' });
//     }

//     return res.json(goal);
//   } catch (err) {
//     return next(err);
//   }
// });

// // DELETE /api/savings-goals/:id
// router.delete('/:id', auth, async (req, res, next) => {
//   try {
//     const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
//     if (!goal) {
//       return res.status(404).json({ message: 'Goal not found' });
//     }
//     return res.json({ message: 'Goal deleted' });
//   } catch (err) {
//     return next(err);
//   }
// });

// module.exports = router;


const express = require('express');
const { body, validationResult } = require('express-validator');
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/savings-goals - Get all savings goals for user
router.get('/', auth, async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id }).sort({ createdAt: 1 });
    return res.json(goals);
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings-goals - Create new savings goal
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('targetAmount').isNumeric().withMessage('Target amount is required'),
    body('targetDate').isISO8601().withMessage('Valid target date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, targetAmount, currentAmount, targetDate, icon, autoDeductFromBalance } = req.body;
      const goal = new SavingsGoal({
        user: req.user.id,
        name,
        targetAmount,
        currentAmount,
        targetDate,
        icon,
        autoDeductFromBalance,
      });
      await goal.save();
      return res.status(201).json(goal);
    } catch (err) {
      return next(err);
    }
  }
);

// PATCH /api/savings-goals/:id/add - Add money to savings goal
router.patch('/:id/add', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if adding this amount would exceed target
    const newAmount = goal.currentAmount + amount;
    if (newAmount > goal.targetAmount) {
      return res.status(400).json({
        message: `Adding ${amount} would exceed target amount of ${goal.targetAmount}. Maximum you can add is ${goal.targetAmount - goal.currentAmount}`
      });
    }

    // Update the goal
    goal.currentAmount = newAmount;
    await goal.save();

    // Return the updated goal
    res.json({
      _id: goal._id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      icon: goal.icon || '💰',
      autoDeductFromBalance: goal.autoDeductFromBalance,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    });
  } catch (err) {
    console.error('Error adding savings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/savings-goals/:id - Update savings goal
router.put('/:id', auth, async (req, res, next) => {
  try {
    const updates = (({ name, targetAmount, currentAmount, targetDate, icon, autoDeductFromBalance }) => ({
      name,
      targetAmount,
      currentAmount,
      targetDate,
      icon,
      autoDeductFromBalance,
    }))(req.body);

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    return res.json(goal);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/savings-goals/:id - Delete savings goal
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    return res.json({ message: 'Goal deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;