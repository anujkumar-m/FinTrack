const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all categories for the user
router.get('/', auth, async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ createdAt: 1 });
    return res.json(categories);
  } catch (err) {
    return next(err);
  }
});

// Create category
router.post(
  '/',
  auth,
  [body('name').notEmpty().withMessage('Name is required'), body('type').isIn(['expense', 'income', 'both']).withMessage('Invalid type')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, icon, color, type } = req.body;
      const category = new Category({
        user: req.user.id,
        name,
        icon,
        color,
        type,
      });
      await category.save();
      return res.status(201).json(category);
    } catch (err) {
      return next(err);
    }
  }
);

// Update category
router.put('/:id', auth, async (req, res, next) => {
  try {
    const updates = (({ name, icon, color, type }) => ({ name, icon, color, type }))(req.body);

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(category);
  } catch (err) {
    return next(err);
  }
});

// Delete category
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

