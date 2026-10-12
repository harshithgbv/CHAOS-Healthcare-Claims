
import assert from 'node:assert/strict';
import { analyzeClaims } from './detector';
import { evaluationScenarios } from './evaluationData';

type EvaluationResult = {
  scenario: string;
  claimId: string;
  expected: string[];
  actual: string[];
  passed: boolean;
};

const results: EvaluationResult[] = [];

for (const scenario of evaluationScenarios) {
  const analyzed = analyzeClaims(scenario.claims);

  for (const [claimId, expectedRules] of Object.entries(
    scenario.expectedRulesById
  )) {
    const claim = analyzed.find((item) => item.id === claimId);

    assert.ok(
      claim,
      `Scenario "${scenario.name}" is missing claim ${claimId}`
    );

    const expected = [...expectedRules].sort();
    const actual = [...new Set(claim.flags.map((flag) => flag.rule))].sort();

    const passed =
      JSON.stringify(expected) === JSON.stringify(actual);

    results.push({
      scenario: scenario.name,
      claimId,
      expected,
      actual,
      passed,
    });
  }
}

console.log('\n--- CHAOS Detection Evaluation ---');

for (const result of results) {
  console.log(
    `${result.passed ? 'PASS' : 'FAIL'} ${result.claimId} | ` +
      `${result.scenario} | ` +
      `Expected: ${result.expected.join(', ') || 'No flags'} | ` +
      `Actual: ${result.actual.join(', ') || 'No flags'}`
  );
}

const passedCount = results.filter((result) => result.passed).length;
const failedCount = results.length - passedCount;

console.log('\n--- Summary ---');
console.log(`Claims evaluated: ${results.length}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);

if (failedCount > 0) {
  process.exitCode = 1;
}
