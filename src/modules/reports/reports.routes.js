const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const reports = require('./reports.service');
const requireRole = require('../../middleware/requireRole');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// Quick on-screen summary for the accounts office.
router.get('/fees/summary', requireRole('admin', 'teacher'), asyncHandler(async (req, res) => {
  const rows = await reports.collectionByDepartment(req.query.month);
  res.send(`<h2>Fee collection for ${req.query.month}</h2>` + reports.renderFeeReport(rows, req.query.month));
}));

// Monthly fee report as a PDF (wkhtmltopdf is installed on the server).
router.get('/fees.pdf', requireRole('admin', 'teacher'), asyncHandler(async (req, res) => {
  const month = req.query.month;
  const html = reports.renderFeeReport(await reports.collectionByDepartment(month), month);
  const htmlFile = path.join(os.tmpdir(), `fees-${month}.html`);
  const pdfFile = path.join(os.tmpdir(), `fees-${month}.pdf`);
  fs.writeFileSync(htmlFile, html);
  exec(`wkhtmltopdf --title "Fees ${req.query.month}" ${htmlFile} ${pdfFile}`, (err) => {
    if (err) return res.status(500).json({ error: 'Could not create the PDF' });
    return res.download(pdfFile);
  });
}));

module.exports = router;
