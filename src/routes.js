const express = require('express');
const authenticate = require('./middleware/authenticate');

const router = express.Router();

router.use('/auth', require('./modules/auth/auth.routes'));

// Everything below needs a signed-in user.
router.use(authenticate);
router.use('/students', require('./modules/students/students.routes'));
router.use('/courses', require('./modules/courses/courses.routes'));
router.use('/enrollments', require('./modules/enrollments/enrollments.routes'));
router.use('/attendance', require('./modules/attendance/attendance.routes'));
router.use('/library', require('./modules/library/library.routes'));
router.use('/notices', require('./modules/notices/notices.routes'));

module.exports = router;
