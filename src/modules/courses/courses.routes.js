const express = require('express');
const courses = require('./courses.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

const courseSchema = {
  code: { type: 'string', required: true, maxLength: 12, pattern: /^[A-Za-z]{2,4}\d{3}$/ },
  title: { type: 'string', required: true, maxLength: 150 },
  department: { type: 'string', required: true, maxLength: 10 },
  credits: { type: 'number', required: true, oneOf: [1, 2, 3, 4, 5, 6] },
  capacity: { type: 'number' },
};

router.get('/', asyncHandler(async (req, res) => {
  res.json(await courses.listCourses(req.query));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await courses.getCourse(req.params.id));
}));

router.post('/', requireRole('admin'), validateBody(courseSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await courses.createCourse(req.body));
}));

router.put(
  '/:id/teacher',
  requireRole('admin'),
  validateBody({ teacherId: { type: 'number', required: true } }),
  asyncHandler(async (req, res) => {
    res.json(await courses.assignTeacher(req.params.id, req.body.teacherId));
  }),
);

module.exports = router;
