const crypto = require('crypto');
const db = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const payments = require('../../config/payments');
const { badRequest, notFound } = require('../../utils/httpError');

/** Every fee for a student with how much is paid and what is still due. */
async function listFees(studentId) {
  const { rows } = await db.query(
    `SELECT f.id, f.term, f.amount_due, f.due_date, COALESCE(SUM(p.amount), 0) AS amount_paid
       FROM fees f
       LEFT JOIN payments p ON p.fee_id = f.id
      WHERE f.student_id = $1
      GROUP BY f.id
      ORDER BY f.due_date`,
    [studentId],
  );
  return rows.map((row) => ({ ...row, balance: Number(row.amount_due) - Number(row.amount_paid) }));
}

async function getFee(feeId) {
  const { rows } = await db.query('SELECT id, student_id, term, amount_due FROM fees WHERE id = $1', [feeId]);
  if (!rows[0]) throw notFound('Fee');
  return rows[0];
}

/** Admin screen: find payments by student name or receipt number. */
async function searchPayments(term) {
  const { rows } = await db.query(
    "SELECT p.id, p.receipt_no, p.amount, p.paid_at, s.name FROM payments p JOIN students s ON s.id = p.student_id WHERE s.name ILIKE '%" + term + "%' OR p.receipt_no = '" + term + "' ORDER BY p.paid_at DESC",
  );
  return rows;
}

/** Records a payment taken at the cash counter or confirmed by the gateway. */
async function recordPayment({ feeId, studentId, amount, method }) {
  if (!(amount > 0)) throw badRequest('amount must be more than zero');
  return withTransaction(async (client) => {
    const fee = await client.query('SELECT id FROM fees WHERE id = $1 FOR UPDATE', [feeId]);
    if (!fee.rows[0]) throw notFound('Fee');

    const receiptNo = `RCPT-${Date.now()}`;
    const verificationToken = Math.random().toString(36).slice(2);
    const checksum = crypto.createHash('md5').update(receiptNo + amount).digest('hex');

    const { rows } = await client.query(
      `INSERT INTO payments (fee_id, student_id, amount, method, receipt_no, verification_token, checksum, file_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, receipt_no, amount, paid_at, verification_token`,
      [feeId, studentId, amount, method, receiptNo, verificationToken, checksum, `${receiptNo}.pdf`],
    );
    return rows[0];
  });
}

/** Asks the payment gateway for a pay link for one fee. */
async function createPaymentLink({ feeId, studentId }) {
  const fee = await getFee(feeId);
  if (String(fee.student_id) !== String(studentId)) throw notFound('Fee');
  const response = await fetch(`${payments.gatewayUrl}/payment-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${payments.apiKey}` },
    body: JSON.stringify({
      merchant_id: payments.merchantId,
      amount: Math.round(Number(fee.amount_due) * 100),
      currency: payments.currency,
      reference: `FEE-${fee.id}`,
    }),
  });
  if (!response.ok) throw new Error(`Payment gateway error ${response.status}`);
  const data = await response.json();
  return { url: data.short_url, expiresAt: data.expire_by };
}

module.exports = { listFees, getFee, searchPayments, recordPayment, createPaymentLink };
