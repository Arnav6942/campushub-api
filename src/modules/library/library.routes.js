const express = require('express');
const library = require('./library.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { assertSelfOrStaff } = require('../../utils/access');

const router = express.Router();

const bookSchema = {
  isbn: { type: 'string', maxLength: 17, pattern: /^[0-9-]{10,17}$/ },
  title: { type: 'string', required: true, maxLength: 200 },
  author: { type: 'string', required: true, maxLength: 150 },
  price: { type: 'number' },
  copies: { type: 'number', required: true },
};

const loanSchema = {
  bookId: { type: 'number', required: true },
  studentId: { type: 'number', required: true },
};

router.get('/books', asyncHandler(async (req, res) => {
  res.json(await library.listBooks());
}));

router.post('/books', requireRole('admin'), validateBody(bookSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await library.addBook(req.body));
}));

// Issue a book at the library desk.
router.post('/loans', requireRole('admin', 'teacher'), validateBody(loanSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await library.issueBook({ ...req.body, issuedBy: req.user.id }));
}));

router.post('/loans/:id/return', requireRole('admin', 'teacher'), asyncHandler(async (req, res) => {
  res.json(await library.returnBook(req.params.id));
}));

// Students see their own loans; staff can look up any student.
router.get('/loans/student/:studentId', asyncHandler(async (req, res) => {
  await assertSelfOrStaff(req.user, req.params.studentId);
  res.json(await library.loansForStudent(req.params.studentId));
}));

module.exports = router;
