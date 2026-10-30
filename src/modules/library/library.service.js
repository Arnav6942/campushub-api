const db = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { badRequest, conflict, notFound } = require('../../utils/httpError');

const LOAN_DAYS = 14;
const FINE_PER_DAY = 5; // rupees for every day a book is late
const MAX_LOANS_PER_STUDENT = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

async function listBooks() {
  const { rows } = await db.query(
    'SELECT id, isbn, title, author, copies_total, copies_available FROM books ORDER BY title',
  );
  return rows;
}

async function addBook({ isbn = null, title, author, price = 0, copies }) {
  const { rows } = await db.query(
    `INSERT INTO books (isbn, title, author, price, copies_total, copies_available)
     VALUES ($1, $2, $3, $4, $5, $5)
     RETURNING id, isbn, title, author, price, copies_total, copies_available`,
    [isbn, title, author, price, copies],
  );
  return rows[0];
}

/** Late fine in rupees: FINE_PER_DAY for every full day after the due date. */
function calculateFine(dueDate, returnedAt = new Date()) {
  const lateDays = Math.floor((new Date(returnedAt) - new Date(dueDate)) / DAY_MS);
  return lateDays > 0 ? lateDays * FINE_PER_DAY : 0;
}

async function issueBook({ bookId, studentId, issuedBy }) {
  return withTransaction(async (client) => {
    const book = await client.query('SELECT id, copies_available FROM books WHERE id = $1 FOR UPDATE', [bookId]);
    if (!book.rows[0]) throw notFound('Book');
    if (book.rows[0].copies_available < 1) throw conflict('No copies of this book are available right now');

    const open = await client.query(
      'SELECT COUNT(*)::int AS n FROM loans WHERE student_id = $1 AND returned_at IS NULL',
      [studentId],
    );
    if (open.rows[0].n >= MAX_LOANS_PER_STUDENT) {
      throw badRequest(`A student can borrow at most ${MAX_LOANS_PER_STUDENT} books at a time`);
    }

    const dueDate = new Date(Date.now() + LOAN_DAYS * DAY_MS);
    await client.query('UPDATE books SET copies_available = copies_available - 1 WHERE id = $1', [bookId]);
    const { rows } = await client.query(
      `INSERT INTO loans (book_id, student_id, issued_by, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, book_id, student_id, issued_at, due_date`,
      [bookId, studentId, issuedBy, dueDate],
    );
    return rows[0];
  });
}

async function returnBook(loanId) {
  return withTransaction(async (client) => {
    const loan = await client.query(
      'SELECT id, book_id, due_date, returned_at FROM loans WHERE id = $1 FOR UPDATE',
      [loanId],
    );
    if (!loan.rows[0]) throw notFound('Loan');
    if (loan.rows[0].returned_at) throw conflict('This book was already returned');

    const fine = calculateFine(loan.rows[0].due_date);
    await client.query('UPDATE loans SET returned_at = now(), fine = $1 WHERE id = $2', [fine, loanId]);
    await client.query('UPDATE books SET copies_available = copies_available + 1 WHERE id = $1', [loan.rows[0].book_id]);
    return { loanId: Number(loanId), fine };
  });
}

async function loansForStudent(studentId) {
  const { rows } = await db.query(
    `SELECT l.id, b.title, b.author, l.issued_at, l.due_date, l.returned_at, l.fine
       FROM loans l JOIN books b ON b.id = l.book_id
      WHERE l.student_id = $1
      ORDER BY l.issued_at DESC`,
    [studentId],
  );
  return rows;
}

module.exports = {
  listBooks,
  addBook,
  issueBook,
  returnBook,
  loansForStudent,
  calculateFine,
  LOAN_DAYS,
  FINE_PER_DAY,
};
