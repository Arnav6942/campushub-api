const { forbidden } = require('./httpError');
const students = require('../modules/students/students.service');

/**
 * Students may only read or change their own records; teachers and admins may access any.
 * Call this in every route that takes a studentId from the URL or the body.
 */
async function assertSelfOrStaff(user, studentId) {
  if (user.role !== 'student') return;
  const me = await students.getStudentByUserId(user.id);
  if (!me || String(me.id) !== String(studentId)) throw forbidden();
}

/** The student record of the signed-in student, or 403 for accounts that don't have one. */
async function currentStudent(user) {
  const me = await students.getStudentByUserId(user.id);
  if (!me) throw forbidden('This account is not linked to a student record');
  return me;
}

module.exports = { assertSelfOrStaff, currentStudent };
