const express = require('express');
const enrollments = require('./enrollments.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { currentStudent } = require('../../utils/access');

const router = express.Router();

const enrollSchema = {
  courseId: { type: 'number', required: true },
  studentId: { type: 'number' },
};

// Students enrol themselves. Admins may enrol anyone by passing studentId.
router.post('/', validateBody(enrollSchema), asyncHandler(async (req, res) => {
  const studentId =
    req.user.role === 'admin' && req.body.studentId ? req.body.studentId : (await currentStudent(req.user)).id;
  res.status(201).json(await enrollments.enroll({ studentId, courseId: req.body.courseId }));
}));

router.get('/mine', asyncHandler(async (req, res) => {
  const me = await currentStudent(req.user);
  res.json(await enrollments.enrollmentsForStudent(me.id));
}));

router.delete('/:courseId', asyncHandler(async (req, res) => {
  const me = await currentStudent(req.user);
  await enrollments.drop({ studentId: me.id, courseId: req.params.courseId });
  res.status(204).end();
}));

router.get('/course/:courseId', requireRole('admin', 'teacher'), asyncHandler(async (req, res) => {
  res.json(await enrollments.roster(req.params.courseId));
}));

module.exports = router;
