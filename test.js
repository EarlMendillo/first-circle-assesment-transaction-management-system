'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateTransaction,
  isRealDate
} = require('./server');

// Date validation tests
test('accepts a valid calendar date', () => {
  assert.equal(isRealDate('2025-03-01'), true);
});

test('rejects an invalid calendar date', () => {
  assert.equal(isRealDate('2025-02-30'), false);
});

test('rejects an invalid date format', () => {
  const result = validateTransaction({
    date: '03-01-2025',
    accountNumber: '1234-5678-9012',
    accountHolder: 'John Smith',
    amount: '100.00'
  });

  assert.ok(result.errors.date);
});

// Account number validation
test('rejects an incorrectly formatted account number', () => {
  const result = validateTransaction({
    date: '2025-03-01',
    accountNumber: '123456789012',
    accountHolder: 'John Smith',
    amount: '100.00'
  });

  assert.ok(result.errors.accountNumber);
});

// Amount validation
test('rejects a negative amount', () => {
  const result = validateTransaction({
    date: '2025-03-01',
    accountNumber: '1234-5678-9012',
    accountHolder: 'John Smith',
    amount: '-100'
  });

  assert.ok(result.errors.amount);
});

// Valid transaction
test('accepts valid transaction data', () => {
  const result = validateTransaction({
    date: '2025-03-01',
    accountNumber: '1234-5678-9012',
    accountHolder: 'John Smith',
    amount: '100.50'
  });

  assert.equal(Object.keys(result.errors).length, 0);
  assert.equal(result.clean.amount, 100.50);
});