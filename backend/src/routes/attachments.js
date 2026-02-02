const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Attachment = require('../models/Attachment');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/attachments
router.post(
  '/',
  auth,
  upload.single('file'),
  [
    body('kind')
      .isIn(['transaction', 'bill', 'emi', 'creditCard', 'warranty', 'reimbursement'])
      .withMessage('Invalid attachment kind'),
    body('refId').notEmpty().withMessage('refId is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }

      const { kind, refId } = req.body;

      const attachment = new Attachment({
        user: req.user.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: path.relative(path.join(__dirname, '..'), req.file.path),
        linkedTo: {
          kind,
          refId,
        },
      });

      await attachment.save();

      return res.status(201).json(attachment);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/attachments/:id/download
router.get('/:id/download', auth, async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '..', attachment.path);
    return res.download(filePath, attachment.originalName);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

