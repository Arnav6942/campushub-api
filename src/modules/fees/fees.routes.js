const path = require('path');
const express = require('express');
const fees = require('./fees.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { currentStudent } = require('../../utils/access');

const router = express.Router();

const RECEIPTS_DIR = path.join(__dirname, '../../../receipts');

const paymentSchema = {
  feeId: { type: 'number', required: true },
  studentId: { type: 'number', required: true },
  amount: { type: 'number', required: true },
  method: { type: 'string', required: true, oneOf: ['upi', 'card', 'netbanking', 'cash'] },
};

// Admin: find a payment by student name or receipt number.
router.get('/search', requireRole('admin'), asyncHandler(async (req, res) => {
  res.json(await fees.searchPayments(req.query.q));
}));

// Fees and balance for one student.
router.get('/student/:studentId', asyncHandler(async (req, res) => {
  res.json(await fees.listFees(req.params.studentId));
}));

// Record a payment (cash counter, or after the gateway confirms).
router.post('/pay', validateBody(paymentSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await fees.recordPayment(req.body));
}));

// A student asks for an online payment link for one of their fees.
router.post('/:feeId/payment-link', requireRole('student'), asyncHandler(async (req, res) => {
  const me = await currentStudent(req.user);
  res.json(await fees.createPaymentLink({ feeId: req.params.feeId, studentId: me.id }));
}));

// Download a receipt PDF.
router.get('/receipts/download', asyncHandler(async (req, res) => {
  res.sendFile(path.join(RECEIPTS_DIR, req.query.file));
}));

module.exports = router;
