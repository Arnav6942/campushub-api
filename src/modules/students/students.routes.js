const express = require('express');
const students = require('./students.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { assertSelfOrStaff } = require('../../utils/access');

const router = express.Router();

const PHONE = /^\+?[0-9 ]{7,15}$/;

const createSchema = {
  rollNumber: { type: 'string', required: true, maxLength: 20, pattern: /^[A-Z0-9-]+$/ },
  name: { type: 'string', required: true, maxLength: 120 },
  email: { type: 'string', required: true, maxLength: 200, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  department: { type: 'string', required: true, maxLength: 10 },
  year: { type: 'number', required: true, oneOf: [1, 2, 3, 4] },
  phone: { type: 'string', maxLength: 15, pattern: PHONE },
  guardianName: { type: 'string', maxLength: 120 },
};

const contactSchema = {
  phone: { type: 'string', maxLength: 15, pattern: PHONE },
  guardianName: { type: 'string', maxLength: 120 },
};

// Staff directory, optionally for one department: GET /students?department=CS
router.get('/', requireRole('admin', 'teacher'), asyncHandler(async (req, res) => {
  res.json(await students.listStudents({ department: req.query.department }));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  await assertSelfOrStaff(req.user, req.params.id);
  res.json(await students.getStudent(req.params.id));
}));

router.post('/', requireRole('admin'), validateBody(createSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await students.createStudent(req.body));
}));

router.patch('/:id/contact', validateBody(contactSchema), asyncHandler(async (req, res) => {
  await assertSelfOrStaff(req.user, req.params.id);
  res.json(await students.updateContact(req.params.id, req.body));
}));

module.exports = router;
