
import assert from 'node:assert/strict';
import { analyzeClaims } from './detector';
import { Claim } from './types';

const makeClaim = (overrides: Partial<Claim> = {}): Claim => ({
  id: 'BASE',
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

const hasRule = (claim: Claim, rule: string) =>
  claim.flags.some((flag) => flag.rule === rule);

const cases: Array<{ name: string; run: () => void }> = [
  {
    name: 'Missing procedure and invalid amount both flagged',
    run: () => {
      const [result] = analyzeClaims([
        makeClaim({ procedureCode: '', amount: -10 }),
      ]);

      assert.ok(hasRule(result, 'Data Quality'));
      assert.ok(
        result.flags.some((flag) =>
          flag.description.includes('Missing procedure code'),
        ),
      );
      assert.ok(
        result.flags.some((flag) =>
          flag.description.includes('Invalid claim amount'),
        ),
      );
    },
  },
  {
    name: 'Duplicate and data-quality flags coexist',
    run: () => {
      const claims = [
        makeClaim({
          id: 'DUP',
          procedureCode: '',
        }),
        makeClaim({
          id: 'DUP',
          procedureCode: '',
        }),
      ];

      const results = analyzeClaims(claims);

      for (const result of results) {
        assert.ok(hasRule(result, 'Data Quality'));
        assert.ok(hasRule(result, 'Duplicate Candidate'));
      }
    },
  },
  {
    name: 'Billing anomaly and duplicate flags coexist',
    run: () => {
      const claims = [
        makeClaim({
          id: 'NORMAL',
          patientId: 'PAT-A',
          providerId: 'PROV-A',
          procedureCode: 'PROC-HIGH',
          serviceDate: '2026-08-01',
          amount: 100,
        }),
        makeClaim({
          id: 'NORMAL-2',
          patientId: 'PAT-B',
          providerId: 'PROV-B',
          procedureCode: 'PROC-HIGH',
          serviceDate: '2026-08-02',
          amount: 100,
        }),
        makeClaim({
          id: 'HIGH-DUP-1',
          patientId: 'PAT-C',
          providerId: 'PROV-C',
          procedureCode: 'PROC-HIGH',
          serviceDate: '2026-08-03',
          amount: 500,
        }),
        makeClaim({
          id: 'HIGH-DUP-2',
          patientId: 'PAT-C',
          providerId: 'PROV-C',
          procedureCode: 'PROC-HIGH',
          serviceDate: '2026-08-03',
          amount: 500,
        }),
      ];

      const results = analyzeClaims(claims);
      const highClaims = results.filter((claim) =>
        claim.id.startsWith('HIGH-DUP'),
      );

      for (const result of highClaims) {
        assert.ok(hasRule(result, 'Billing Anomaly'));
        assert.ok(hasRule(result, 'Duplicate Candidate'));
      }
    },
  },
  {
    name: 'Priority score remains capped at 100',
    run: () => {
      const claims = [
        makeClaim({
          id: 'CAP',
          patientId: 'PAT-CAP',
          providerId: 'PROV-CAP',
          procedureCode: '',
          serviceDate: 'not-a-date',
          amount: -10,
        }),
        makeClaim({
          id: 'CAP',
          patientId: 'PAT-CAP',
          providerId: 'PROV-CAP',
          procedureCode: '',
          serviceDate: 'not-a-date',
          amount: -10,
        }),
      ];

      const results = analyzeClaims(claims);

      for (const result of results) {
        assert.ok(result.priorityScore <= 100);
        assert.ok(result.priorityScore >= 0);
      }
    },
  },
];

let passed = 0;

for (const testCase of cases) {
  try {
    testCase.run();
    passed++;
    console.log(`PASS: ${testCase.name}`);
  } catch (error) {
    console.error(`FAIL: ${testCase.name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

console.log(`\nRule interaction tests: ${passed}/${cases.length} passed.`);
