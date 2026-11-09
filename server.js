'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const CSV_PATH = path.join(__dirname, 'data', 'transactions.csv');
const CSV_HEADERS = ['Transaction ID', 'Transaction Date', 'Account Number', 'Account Holder Name', 'Amount', 'Status'];
const STATUSES = ['Pending', 'Settled', 'Failed'];

const MAX_AMOUNT = 10000000;
const MAX_PAST_YEARS = 5;
const ACCOUNT_PATTERN = /^\d{4}-\d{4}-\d{4}$/;
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'-]*$/u;

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function newTxnId() {
  return 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function migrateLegacyCsv() {
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) {
    fs.writeFileSync(CSV_PATH, CSV_HEADERS.join(',') + '\n', 'utf8');
    return;
  }
  if (lines[0].replace(/"/g, '').startsWith('Transaction ID')) return;

  const rows = lines.slice(1).map((l) => `"${newTxnId()}",${l}`);
  fs.writeFileSync(CSV_PATH, [CSV_HEADERS.join(','), ...rows].join('\n') + '\n', 'utf8');
  console.log(`🔧 Migrated ${rows.length} existing rows: added Transaction IDs.`);
}

function ensureDataFile() {
  const dataDir = path.dirname(CSV_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, CSV_HEADERS.join(',') + '\n', 'utf8');
    console.log('📄 Created new transactions.csv with headers.');
    return;
  }

  migrateLegacyCsv();
}

function readTransactions() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          id: row['Transaction ID'],
          date: row['Transaction Date'],
          accountNumber: row['Account Number'],
          accountHolder: row['Account Holder Name'],
          amount: parseFloat(row['Amount']),
          status: row['Status'],
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function csvSafe(value) {
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function appendTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const row = [
      transaction.id,
      transaction.date,
      transaction.accountNumber,
      transaction.accountHolder,
      transaction.amount.toFixed(2),
      transaction.status,
    ]
      .map((v) => `"${csvSafe(v).replace(/"/g, '""')}"`)
      .join(',') + '\n';

    fs.appendFile(CSV_PATH, row, 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

let writeQueue = Promise.resolve();

function enqueueWrite(task) {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => {});
  return run;
}

function randomStatus() {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
}

function todayString() {
  return new Date().toLocaleDateString('en-CA');
}

function isRealDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function earliestAllowedDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MAX_PAST_YEARS);
  return d.toLocaleDateString('en-CA');
}

function validateTransaction(body) {
  const errors = {};
  const { date, accountNumber, accountHolder, amount } = body;

  const dateText = typeof date === 'string' ? date.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || !isRealDate(dateText)) {
    errors.date = 'Enter a valid date (YYYY-MM-DD).';
  } else if (dateText > todayString()) {
    errors.date = 'Transaction date cannot be in the future.';
  } else if (dateText < earliestAllowedDate()) {
    errors.date = `Transaction date cannot be older than ${MAX_PAST_YEARS} years.`;
  }

  const accountText = typeof accountNumber === 'string' ? accountNumber.trim() : '';
  if (!ACCOUNT_PATTERN.test(accountText)) {
    errors.accountNumber = 'Account number must be 12 digits in the format 1234-5678-9012.';
  }

  const nameText = typeof accountHolder === 'string' ? accountHolder.trim().replace(/\s+/g, ' ') : '';
  if (nameText.length < 2 || nameText.length > 100) {
    errors.accountHolder = 'Name must be between 2 and 100 characters.';
  } else if (!NAME_PATTERN.test(nameText)) {
    errors.accountHolder = 'Name may only contain letters, spaces, apostrophes, periods and hyphens.';
  }

  const amountText = typeof amount === 'number' || typeof amount === 'string' ? String(amount).trim() : '';
  const amountValue = Number(amountText);
  if (!AMOUNT_PATTERN.test(amountText) || !Number.isFinite(amountValue) || amountValue <= 0) {
    errors.amount = 'Amount must be a positive number with up to 2 decimal places.';
  } else if (amountValue > MAX_AMOUNT) {
    errors.amount = `Amount cannot exceed ${MAX_AMOUNT.toLocaleString('en-US')}.`;
  }

  return {
    errors,
    clean: { date: dateText, accountNumber: accountText, accountHolder: nameText, amount: amountValue },
  };
}

app.get('/transactions', async (req, res) => {
  try {
    const transactions = await readTransactions();
    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error('Error reading transactions:', err.message);
    res.status(500).json({ success: false, message: 'Failed to read transactions.' });
  }
});

app.post('/transactions', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { errors, clean } = validateTransaction(body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: Object.values(errors).join(' '), errors });
    }

    const allowDuplicate = body.allowDuplicate === true;

    const outcome = await enqueueWrite(async () => {
      const existing = await readTransactions();

      if (!allowDuplicate) {
        const duplicate = existing.some(
          (t) => t.date === clean.date && t.accountNumber === clean.accountNumber && t.amount === clean.amount
        );
        if (duplicate) return { duplicate: true };
      }

      const usedIds = new Set(existing.map((t) => t.id));
      let id = newTxnId();
      while (usedIds.has(id)) id = newTxnId();

      const transaction = { id, ...clean, status: randomStatus() };
      await appendTransaction(transaction);
      return { transaction };
    });

    if (outcome.duplicate) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE',
        message: 'A transaction with the same date, account number and amount already exists.',
      });
    }

    res.status(201).json({ success: true, data: outcome.transaction });
  } catch (err) {
    console.error('Error saving transaction:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save transaction.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must be valid JSON.' });
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

ensureDataFile();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅ Transaction API running at http://localhost:${PORT}`);
    console.log(`   GET  /transactions  — list all`);
    console.log(`   POST /transactions  — add new\n`);
  });
}

module.exports = {
  app,
  validateTransaction,
  isRealDate
};