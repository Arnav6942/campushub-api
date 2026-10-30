const express = require('express');
const attendance = require('./attendance.service');
const requireRole = require('../../middleware/requireRole');
const { validateBody } = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { assertSelfOrStaff } = require('../../utils/access');

const router = express.Router();

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const markSchema = {
  courseId: { type: 'number', required: true },
  date: { type: 'string', required: true, pattern: DATE },
};

// Teacher marks a class: { courseId, date: "2026-10-05", records: [{ studentId, status }] }
router.post('/', requireRole('teacher', 'admin'), validateBody(markSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await attendance.markAttendance({ ...req.body, markedBy: req.user.id }));
}));

// One class on one day: GET /attendance/course/12?date=2026-10-05 (defaults to today)
router.get('/course/:courseId', requireRole('teacher', 'admin'), asyncHandler(async (req, res) => {
  const date = DATE.test(String(req.query.date)) ? req.query.date : new Date().toISOString().slice(0, 10);
  res.json(await attendance.attendanceForCourse(req.params.courseId, date));
}));

router.get('/student/:studentId', asyncHandler(async (req, res) => {
  await assertSelfOrStaff(req.user, req.params.studentId);
  res.json(await attendance.attendanceForStudent(req.params.studentId));
}));

module.exports = router;
