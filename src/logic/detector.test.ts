import { analyzeClaims } from './detector';
import { Claim } from './types';
import assert from 'assert';

const testClaims: Claim[] = [
  // Normal
  { id: 'N1', patientId: 'P1', providerId: 'PR1', procedureCode: 'PROC1', serviceDate: '2026-01-01', amount: 100, status: 'Pending', flags: [], priorityScore: 0 },
  // Exact Duplicate
  { id: 'E1', patientId: 'P2', providerId: 'PR2', procedureCode: 'PROC1', serviceDate: '2026-01-02', amount: 200, status: 'Pending', flags: [], priorityScore: 0 },
  { id: 'E2', patientId: 'P2', providerId: 'PR2', procedureCode: 'PROC1', serviceDate: '2026-01-02', amount: 200, status: 'Pending', flags: [], priorityScore: 0 },
  // Data Quality (Missing proc)
  { id: 'DQ1', patientId: 'P3', providerId: 'PR1', procedureCode: '', serviceDate: '2026-01-03', amount: 100, status: 'Pending', flags: [], priorityScore: 0 },
  // Data Quality (Invalid amount)
  { id: 'DQ2', patientId: 'P4', providerId: 'PR1', procedureCode: 'PROC1', serviceDate: '2026-01-04', amount: -10, status: 'Pending', flags: [], priorityScore: 0 },
  // Outlier
  { id: 'O1', patientId: 'P5', providerId: 'PR1', procedureCode: 'PROC1', serviceDate: '2026-01-05', amount: 1000, status: 'Pending', flags: [], priorityScore: 0 },

  // Invalid service date
  { id: 'DQ3', patientId: 'P6', providerId: 'PR1', procedureCode: 'PROC4', serviceDate: 'not-a-date', amount: 80, status: 'Pending', flags: [], priorityScore: 0 },

  // Non-finite amount
  { id: 'DQ4', patientId: 'P7', providerId: 'PR1', procedureCode: 'PROC5', serviceDate: '2026-01-06', amount: Number.NaN, status: 'Pending', flags: [], priorityScore: 0 },

  // Potential duplicates: same patient, provider, date and amount; different procedures
  { id: 'POT1', patientId: 'P8', providerId: 'PR3', procedureCode: 'PROC6', serviceDate: '2026-01-07', amount: 150, status: 'Pending', flags: [], priorityScore: 0 },
  { id: 'POT2', patientId: 'P8', providerId: 'PR3', procedureCode: 'PROC7', serviceDate: '2026-01-07', amount: 150, status: 'Pending', flags: [], priorityScore: 0 },

];

const results = analyzeClaims(testClaims);

console.log('--- Detection Engine Test Results ---');

// Normal
const n1 = results.find(c => c.id === 'N1')!;
assert.strictEqual(n1.flags.length, 0, 'Normal claim should have 0 flags');
console.log('PASS: Normal claim');

// Exact Duplicate
const e1 = results.find(c => c.id === 'E1')!;
assert.strictEqual(e1.flags.some(f => f.rule === 'Duplicate Candidate'), true, 'Exact duplicate should be flagged');
assert.strictEqual(e1.priorityScore > 0, true, 'Duplicate should have score > 0');
console.log('PASS: Exact Duplicate');

// Data Quality
const dq1 = results.find(c => c.id === 'DQ1')!;
assert.strictEqual(dq1.flags.some(f => f.rule === 'Data Quality' && f.description.includes('procedure')), true, 'Missing proc should be flagged');
console.log('PASS: Data Quality (Missing)');

const dq2 = results.find(c => c.id === 'DQ2')!;
assert.strictEqual(dq2.flags.some(f => f.rule === 'Data Quality' && f.description.includes('amount')), true, 'Invalid amount should be flagged');
console.log('PASS: Data Quality (Invalid amount)');

// Outlier
const o1 = results.find(c => c.id === 'O1')!;
assert.strictEqual(o1.flags.some(f => f.rule === 'Billing Anomaly'), true, 'Outlier should be flagged');
console.log('PASS: Outlier');

const dq3 = results.find((c) => c.id === 'DQ3')!;
assert.ok(
  dq3.flags.some(
    (f) => f.rule === 'Data Quality' && f.description.includes('date')
  ),
  'Invalid date should be flagged'
);
console.log('PASS: Data Quality (Invalid date)');

const dq4 = results.find((c) => c.id === 'DQ4')!;
assert.ok(
  dq4.flags.some(
    (f) => f.rule === 'Data Quality' && f.description.includes('amount')
  ),
  'Non-finite amount should be flagged'
);
console.log('PASS: Data Quality (Non-finite amount)');

const pot1 = results.find((c) => c.id === 'POT1')!;
assert.ok(
  pot1.flags.some(
    (f) =>
      f.rule === 'Duplicate Candidate' &&
      f.description.includes('Potential duplicate')
  ),
  'Potential duplicate should be flagged'
);
console.log('PASS: Potential Duplicate');

const impossibleDate = analyzeClaims([
  {
    id: 'BADDATE',
    patientId: 'PX',
    providerId: 'PRX',
    procedureCode: 'PROCX',
    serviceDate: '2026-02-30',
    amount: 50,
    status: 'Pending',
    flags: [],
    priorityScore: 0,
  },
])[0];

assert.ok(
  impossibleDate.flags.some(
    (f) => f.rule === 'Data Quality' && f.description.includes('date')
  ),
  'Impossible calendar date should be flagged'
);
console.log('PASS: Data Quality (Impossible calendar date)');

console.log('--- All tests passed ---');
