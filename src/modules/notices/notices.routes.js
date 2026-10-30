const express = require('express');
const notices = require('./notices.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// Notices are stored and returned as plain text in JSON; the web app renders them as text,
// never as HTML.
const noticeSchema = {
  title: { type: 'string', required: true, maxLength: 150 },
  body: { type: 'string', required: true, maxLength: 5000 },
  audience: { type: 'string', oneOf: ['all', 'students', 'teachers'] },
};

router.get('/', asyncHandler(async (req, res) => {
  res.json(await notices.listNotices(req.user.role));
}));

router.post('/', requireRole('admin', 'teacher'), validateBody(noticeSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await notices.createNotice({ ...req.body, createdBy: req.user.id }));
}));

router.patch(
  '/:id/pin',
  requireRole('admin'),
  validateBody({ pinned: { type: 'boolean', required: true } }),
  asyncHandler(async (req, res) => {
    res.json(await notices.setPinned(req.params.id, req.body.pinned));
  }),
);

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  await notices.deleteNotice(req.params.id);
  res.status(204).end();
}));

module.exports = router;
