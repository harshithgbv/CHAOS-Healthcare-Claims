
import assert from 'node:assert/strict';
import { analyzeClaims } from './detector';
import { Claim } from './types';

const makeClaim = (
  overrides: Partial<Claim> = {},
): Claim => ({
  id: 'EDGE-BASE',
  patientId: 'PAT-BASE',
  providerId: 'PROV-BASE',
  procedureCode: 'PROC-BASE',
  serviceDate: '2026-09-01',
  amount: 100,
  status: 'Pending',
  flags: [],
  priorityScore: 0,
  ...overrides,
});

const rules = (claim: Claim): string[] =>
  claim.flags.map((flag) => flag.rule);

let passed = 0;

const test = (name: string, run: () => void) => {
  try {
    run();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
};

// 1. Whitespace-only procedure code must be invalid.
test('Whitespace-only procedure code', () => {
  const [result] = analyzeClaims([
    makeClaim({ procedureCode: '   ' }),
  ]);

  assert.ok(rules(result).includes('Data Quality'));
  assert.ok(
    result.flags.some((flag) =>
      flag.description.includes('Missing procedure code'),
    ),
  );
});

// 2. Zero amount must be invalid.
test('Zero claim amount', () => {
  const [result] = analyzeClaims([
    makeClaim({ id: 'EDGE-ZERO', amount: 0 }),
  ]);

  assert.ok(rules(result).includes('Data Quality'));
  assert.ok(
    result.flags.some((flag) =>
      flag.description.includes('Invalid claim amount'),
    ),
  );
});

// 3. Infinite amount must be invalid.
test('Infinite claim amount', () => {
  const [result] = analyzeClaims([
    makeClaim({ id: 'EDGE-INFINITY', amount: Infinity }),
  ]);

  assert.ok(rules(result).includes('Data Quality'));
});

// 4. Empty service date must be invalid.
test('Empty service date', () => {
  const [result] = analyzeClaims([
    makeClaim({ id: 'EDGE-DATE', serviceDate: '' }),
  ]);

  assert.ok(
    result.flags.some((flag) =>
      flag.description.includes('Invalid service date'),
    ),
  );
});

// 5. Duplicate IDs with different claim details must still be flagged
// as a data-quality issue, but not falsely classified as an exact duplicate.
test('Repeated ID with different patient details', () => {
  const first = makeClaim({
    id: 'EDGE-SAME-ID',
    patientId: 'PAT-A',
  });

  const second = makeClaim({
    id: 'EDGE-SAME-ID',
    patientId: 'PAT-B',
  });

  const results = analyzeClaims([first, second]);

  for (const result of results) {
    assert.ok(rules(result).includes('Data Quality'));
    assert.ok(
      result.flags.some((flag) =>
        flag.description.includes('Duplicate claim ID'),
      ),
    );
    assert.ok(!rules(result).includes('Duplicate Candidate'));
  }
});

// 6. A repeated ID with matching claim details should trigger both rules.
test('Repeated ID with matching claim details', () => {
  const first = makeClaim({ id: 'EDGE-EXACT-ID' });
  const second = makeClaim({ id: 'EDGE-EXACT-ID' });

  const results = analyzeClaims([first, second]);

  for (const result of results) {
    assert.ok(rules(result).includes('Data Quality'));
    assert.ok(rules(result).includes('Duplicate Candidate'));
  }
});

// 7. A normal claim should not be flagged when it has no comparison peer.
test('Single valid claim has no flags', () => {
  const [result] = analyzeClaims([
    makeClaim({ id: 'EDGE-NORMAL' }),
  ]);

  assert.deepEqual(rules(result), []);
});

// 8. All matching claims with invalid amounts must not distort
// the billing baseline.
test('Invalid comparison amounts are ignored', () => {
  const normal = makeClaim({
    id: 'EDGE-VALID',
    procedureCode: 'PROC-SHARED',
    amount: 100,
  });

  const invalid = makeClaim({
    id: 'EDGE-INVALID',
    procedureCode: 'PROC-SHARED',
    amount: -20,
  });

  const results = analyzeClaims([normal, invalid]);

  assert.ok(!rules(results[0]).includes('Billing Anomaly'));
  assert.ok(rules(results[1]).includes('Data Quality'));
});

console.log(`\nEdge-case tests: ${passed}/8 passed.`);
