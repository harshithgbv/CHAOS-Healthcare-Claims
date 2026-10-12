
import { analyzeClaims } from './detector';
import { evaluationScenarios } from './evaluationData';

const rules = [
  'Data Quality',
  'Duplicate Candidate',
  'Billing Anomaly',
] as const;

type Counts = {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
};

const countsByRule: Record<string, Counts> = Object.fromEntries(
  rules.map((rule) => [
    rule,
    { tp: 0, fp: 0, fn: 0, tn: 0 },
  ])
);

for (const scenario of evaluationScenarios) {
  const analyzed = analyzeClaims(scenario.claims);

  for (const [claimId, expectedRules] of Object.entries(
    scenario.expectedRulesById
  )) {
    const claim = analyzed.find((item) => item.id === claimId);

    if (!claim) {
      throw new Error(`Missing claim ${claimId} in ${scenario.name}`);
    }

    const expectedSet = new Set(expectedRules);
    const actualSet = new Set(claim.flags.map((flag) => flag.rule));

    for (const rule of rules) {
      const expected = expectedSet.has(rule);
      const actual = actualSet.has(rule);
      const counts = countsByRule[rule];

      if (expected && actual) counts.tp++;
      else if (!expected && actual) counts.fp++;
      else if (expected && !actual) counts.fn++;
      else counts.tn++;
    }
  }
}

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

function getMetrics(counts: Counts) {
  const precisionDenominator = counts.tp + counts.fp;
  const recallDenominator = counts.tp + counts.fn;

  const precision =
    precisionDenominator === 0 ? 0 : counts.tp / precisionDenominator;

  const recall =
    recallDenominator === 0 ? 0 : counts.tp / recallDenominator;

  const f1 =
    precision + recall === 0
      ? 0
      : (2 * precision * recall) / (precision + recall);

  return { precision, recall, f1 };
}

console.log('\n--- CHAOS Rule-Level Evaluation ---');

for (const rule of rules) {
  const counts = countsByRule[rule];
  const metrics = getMetrics(counts);

  console.log(`\n${rule}`);
  console.log(`TP: ${counts.tp} | FP: ${counts.fp}`);
  console.log(`FN: ${counts.fn} | TN: ${counts.tn}`);
  console.log(`Precision: ${percent(metrics.precision)}`);
  console.log(`Recall: ${percent(metrics.recall)}`);
  console.log(`F1 score: ${percent(metrics.f1)}`);
}
