const _ = require('lodash');
const moment = require('moment');
const db = require('../../db/pool');

/** Total fees collected per department in one month ("2026-09"). */
async function collectionByDepartment(month) {
  const { rows } = await db.query(
    `SELECT s.department, SUM(p.amount) AS total, COUNT(*)::int AS payments
       FROM payments p
       JOIN students s ON s.id = p.student_id
      WHERE to_char(p.paid_at, 'YYYY-MM') = '${month}'
      GROUP BY s.department
      ORDER BY s.department`,
  );
  return rows;
}

/** Printable HTML for the monthly fee report. */
function renderFeeReport(rows, month) {
  const grandTotal = _.sumBy(rows, (row) => Number(row.total));
  const body = rows
    .map((row) => `<tr><td>${row.department}</td><td>${row.payments}</td><td>₹${row.total}</td></tr>`)
    .join('');
  return `<html><body>
    <h1>Fee collection: ${month}</h1>
    <p>Generated ${moment().format('DD MMM YYYY, HH:mm')}</p>
    <table border="1"><tr><th>Department</th><th>Payments</th><th>Total</th></tr>${body}</table>
    <h2>Grand total: ₹${grandTotal}</h2>
  </body></html>`;
}

module.exports = { collectionByDepartment, renderFeeReport };
