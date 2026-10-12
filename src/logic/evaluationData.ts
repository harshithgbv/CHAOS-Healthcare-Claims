
import { Claim } from './types';

export type EvaluationScenario = {
  name: string;
  claims: Claim[];
  expectedRulesById: Record<string, string[]>;
  category: 'normal' | 'data-quality' | 'duplicate' | 'billing-anomaly';
  explanation: string;
};

const makeClaim = (
  id: string,
  patientId: string,
  providerId: string,
  procedureCode: string,
  serviceDate: string,
  amount: number
): Claim => ({
  id,
  patientId,
  providerId,
  procedureCode,
  serviceDate,
  amount,
  status: 'Pending',
  flags: [],
  priorityScore: 0,
});
export const evaluationScenarios: EvaluationScenario[] = [
  {
    name: 'Same ID with otherwise duplicate claims',
    claims: [
      makeClaim('EDGE005', 'P024', 'PR024', 'PROC-E', '2026-09-16', 175),
      makeClaim('EDGE005', 'P024', 'PR024', 'PROC-E', '2026-09-16', 175),
    ],
   expectedRulesById: {
  EDGE005: ['Data Quality', 'Duplicate Candidate'],
    },
    category: 'duplicate',
    explanation:
      'Two separate records accidentally share an ID and otherwise match.',
  },

  {
    name: 'Multiple data-quality issues',
    claims: [
      makeClaim('EDGE001', 'P020', 'PR020', '', '2026-09-12', -25),
    ],
    expectedRulesById: {
      EDGE001: ['Data Quality'],
    },
    category: 'data-quality',
    explanation:
      'One claim has both a missing procedure code and a negative amount.',
  },
  {
    name: 'High-value claim with reasonable baseline',
    claims: [
      makeClaim('EDGE002', 'P021', 'PR021', 'PROC-D', '2026-09-13', 400),
      makeClaim('EDGE003', 'P022', 'PR022', 'PROC-D', '2026-09-14', 450),
      makeClaim('EDGE004', 'P023', 'PR023', 'PROC-D', '2026-09-15', 500),
    ],
    expectedRulesById: {
      EDGE002: [],
      EDGE003: [],
      EDGE004: [],
    },
    category: 'normal',
    explanation:
      'A higher amount is not automatically anomalous when it is reasonable relative to other claims.',
  },

  {
    name: 'Normal claims',
    claims: [
      makeClaim('N001', 'P001', 'PR001', 'PROC-A', '2026-09-01', 100),
      makeClaim('N002', 'P002', 'PR001', 'PROC-A', '2026-09-02', 100),
    ],
    expectedRulesById: {
      N001: [],
      N002: [],
    },
    category: 'normal',
    explanation: 'Valid claims without duplicates or unusual amounts.',
  },
  {
    name: 'Missing procedure code',
    claims: [
      makeClaim('D001', 'P003', 'PR003', '', '2026-09-03', 100),
    ],
    expectedRulesById: {
      D001: ['Data Quality'],
    },
    category: 'data-quality',
    explanation: 'Procedure code is missing.',
  },
  {
    name: 'Negative claim amount',
    claims: [
      makeClaim('D002', 'P004', 'PR004', 'PROC-A', '2026-09-04', -10),
    ],
    expectedRulesById: {
      D002: ['Data Quality'],
    },
    category: 'data-quality',
    explanation: 'Claim amount is negative.',
  },
  {
    name: 'Impossible calendar date',
    claims: [
      makeClaim('D003', 'P005', 'PR005', 'PROC-A', '2026-02-30', 100),
    ],
    expectedRulesById: {
      D003: ['Data Quality'],
    },
    category: 'data-quality',
    explanation: 'Date does not exist on the calendar.',
  },
  {
    name: 'Exact duplicate pair',
    claims: [
      makeClaim('X001', 'P006', 'PR006', 'PROC-A', '2026-09-07', 150),
      makeClaim('X002', 'P006', 'PR006', 'PROC-A', '2026-09-07', 150),
    ],
    expectedRulesById: {
      X001: ['Duplicate Candidate'],
      X002: ['Duplicate Candidate'],
    },
    category: 'duplicate',
    explanation: 'Two claims share patient, provider, date, procedure, and amount.',
  },
  {
    name: 'Potential duplicate pair',
    claims: [
      makeClaim('P001A', 'P007', 'PR007', 'PROC-A', '2026-09-08', 200),
      makeClaim('P001B', 'P007', 'PR007', 'PROC-B', '2026-09-08', 200),
    ],
    expectedRulesById: {
      P001A: ['Duplicate Candidate'],
      P001B: ['Duplicate Candidate'],
    },
    category: 'duplicate',
    explanation: 'Same patient, provider, date, and amount but different procedures.',
  },
  {
    name: 'Billing outlier',
    claims: [
      makeClaim('B001', 'P008', 'PR008', 'PROC-C', '2026-09-09', 100),
      makeClaim('B002', 'P009', 'PR009', 'PROC-C', '2026-09-10', 100),
      makeClaim('B003', 'P010', 'PR010', 'PROC-C', '2026-09-11', 500),
    ],
    expectedRulesById: {
      B001: [],
      B002: [],
      B003: ['Billing Anomaly'],
    },
    category: 'billing-anomaly',
    explanation: 'The 500 amount is more than twice the average of the other two valid claims.',
  },
];
