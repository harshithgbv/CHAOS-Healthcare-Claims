
import { Claim } from './types';

export type RobustnessCase = {
  name: string;
  claims: Claim[];
  expectedRulesById: Record<string, string[]>;
  explanation: string;
};

const makeClaim = (
  id: string,
  patientId: string,
  providerId: string,
  procedureCode: string,
  serviceDate: string,
  amount: number,
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

export const robustnessCases: RobustnessCase[] = [
  {
    name: 'Legitimate high-value claim with peer baseline',
    claims: [
      makeClaim('R001', 'P101', 'PR101', 'PROC-A', '2026-09-01', 800),
      makeClaim('R002', 'P102', 'PR101', 'PROC-A', '2026-09-02', 900),
      makeClaim('R003', 'P103', 'PR101', 'PROC-A', '2026-09-03', 1000),
    ],
    expectedRulesById: {
      R001: [],
      R002: [],
      R003: [],
    },
    explanation:
      'A high amount should not automatically be suspicious when peer claims support it.',
  },
  {
    name: 'Extreme amount relative to peer baseline',
    claims: [
      makeClaim('R010', 'P110', 'PR110', 'PROC-B', '2026-09-01', 100),
      makeClaim('R011', 'P111', 'PR110', 'PROC-B', '2026-09-02', 120),
      makeClaim('R012', 'P112', 'PR110', 'PROC-B', '2026-09-03', 900),
    ],
    expectedRulesById: {
      R010: [],
      R011: [],
      R012: ['Billing Anomaly'],
    },
    explanation:
      'A claim far above the comparison average should trigger the billing rule.',
  },
  {
    name: 'Same amount but different patients',
    claims: [
      makeClaim('R020', 'P120', 'PR120', 'PROC-C', '2026-09-04', 200),
      makeClaim('R021', 'P121', 'PR120', 'PROC-C', '2026-09-04', 200),
    ],
    expectedRulesById: {
      R020: [],
      R021: [],
    },
    explanation:
      'Equal amounts alone should not trigger duplicate detection.',
  },
  {
    name: 'Same patient and date but different providers',
    claims: [
      makeClaim('R030', 'P130', 'PR130', 'PROC-D', '2026-09-05', 250),
      makeClaim('R031', 'P130', 'PR131', 'PROC-D', '2026-09-05', 250),
    ],
    expectedRulesById: {
      R030: [],
      R031: [],
    },
    explanation:
      'Different providers should not be treated as duplicates by the current matching rule.',
  },
  {
    name: 'Same patient and provider but different service dates',
    claims: [
      makeClaim('R040', 'P140', 'PR140', 'PROC-E', '2026-09-06', 300),
      makeClaim('R041', 'P140', 'PR140', 'PROC-E', '2026-09-07', 300),
    ],
    expectedRulesById: {
      R040: [],
      R041: [],
    },
    explanation:
      'Different service dates should prevent a duplicate match.',
  },
  {
    name: 'Same patient provider and date with different procedure codes',
    claims: [
      makeClaim('R050', 'P150', 'PR150', 'PROC-F', '2026-09-08', 400),
      makeClaim('R051', 'P150', 'PR150', 'PROC-G', '2026-09-08', 400),
    ],
    expectedRulesById: {
      R050: ['Duplicate Candidate'],
      R051: ['Duplicate Candidate'],
    },
    explanation:
      'Matching patient, provider, date and amount with different procedures should trigger potential-duplicate review.',
  },
  {
    name: 'Missing provider ID',
    claims: [
      makeClaim('R060', 'P160', '', 'PROC-H', '2026-09-09', 150),
    ],
    expectedRulesById: {
      R060: ['Data Quality'],
    },
    explanation:
      'A missing provider identifier should be a data-quality issue.',
  },
  {
    name: 'Missing patient ID',
    claims: [
      makeClaim('R061', '', 'PR161', 'PROC-I', '2026-09-10', 150),
    ],
    expectedRulesById: {
      R061: ['Data Quality'],
    },
    explanation:
      'A missing patient identifier should be a data-quality issue.',
  },
  {
    name: 'Missing provider IDs must not create a duplicate match',
    claims: [
      makeClaim('R070', 'P170', '', 'PROC-J', '2026-09-11', 200),
      makeClaim('R071', 'P170', '', 'PROC-J', '2026-09-11', 200),
    ],
    expectedRulesById: {
      R070: ['Data Quality'],
      R071: ['Data Quality'],
    },
    explanation:
      'Two claims with missing provider IDs should not be classified as duplicates solely because both provider IDs are blank.',
  },
  {
    name: 'Missing patient IDs must not create a duplicate match',
    claims: [
      makeClaim('R080', '', 'PR180', 'PROC-K', '2026-09-12', 200),
      makeClaim('R081', '', 'PR180', 'PROC-K', '2026-09-12', 200),
    ],
    expectedRulesById: {
      R080: ['Data Quality'],
      R081: ['Data Quality'],
    },
    explanation:
      'Two claims with missing patient IDs should not be classified as duplicates solely because both patient IDs are blank.',
  },

];
