
import assert from 'node:assert/strict';
import { analyzeClaims } from './detector';
import { robustnessCases } from './robustnessData';

let passed = 0;
let failed = 0;

console.log('--- CHAOS Robustness Evaluation ---\n');

for (const scenario of robustnessCases) {
  const actualClaims = analyzeClaims(scenario.claims);

  for (const [id, expectedRules] of Object.entries(
    scenario.expectedRulesById,
  )) {
    const actualClaim = actualClaims.find((claim) => claim.id === id);

    if (!actualClaim) {
      failed++;
      console.error(`FAIL ${id} | Claim not found`);
      continue;
    }

    const actualRules = [...new Set(
      actualClaim.flags.map((flag) => flag.rule),
    )].sort();

    const expected = [...expectedRules].sort();

    try {
      assert.deepEqual(actualRules, expected);
      passed++;
      console.log(`PASS ${id} | ${scenario.name}`);
    } catch {
      failed++;
      console.error(`FAIL ${id} | ${scenario.name}`);
      console.error(`  Expected: ${expected.join(', ') || 'No flags'}`);
      console.error(`  Actual:   ${actualRules.join(', ') || 'No flags'}`);
      console.error(`  Why: ${scenario.explanation}`);
    }
  }
}

console.log('\n--- Summary ---');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
