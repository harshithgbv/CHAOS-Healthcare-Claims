
import { Claim, Flag } from './types';

const isValidServiceDate = (value: string): boolean => {
  if (!value || Number.isNaN(Date.parse(value))) {
    return false;
  }

  // Reject impossible calendar dates such as 2026-02-30.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }

  return true;
};

export const analyzeClaims = (claims: Claim[]): Claim[] => {
  return claims.map((claim) => {
    const flags: Flag[] = [];
    let priorityScore = 0;

    const validAmount = Number.isFinite(claim.amount) && claim.amount > 0;

    // Data quality checks
    if (!claim.procedureCode?.trim()) {
      flags.push({
        rule: 'Data Quality',
        description: 'Missing procedure code',
        severity: 'high',
      });
      priorityScore += 40;
    }

    if (!validAmount) {
      flags.push({
        rule: 'Data Quality',
        description: 'Invalid claim amount (must be finite and greater than 0)',
        severity: 'high',
      });
      priorityScore += 50;
    }

    if (!isValidServiceDate(claim.serviceDate)) {
      flags.push({
        rule: 'Data Quality',
        description: 'Invalid service date',
        severity: 'high',
      });
      priorityScore += 40;
    }

    // Outlier detection: compare against OTHER valid claims for this procedure.
    // The claim being assessed must not inflate its own baseline.
    if (claim.procedureCode && validAmount) {
      const comparisonClaims = claims.filter(
        (other) =>
          other.id !== claim.id &&
          other.procedureCode === claim.procedureCode &&
          Number.isFinite(other.amount) &&
          other.amount > 0
      );

      if (comparisonClaims.length > 0) {
        const average =
          comparisonClaims.reduce((sum, other) => sum + other.amount, 0) /
          comparisonClaims.length;

        if (claim.amount > average * 2 && claim.amount > 100) {
          flags.push({
            rule: 'Billing Anomaly',
            description: `High amount outlier (comparison average: ${average.toFixed(2)})`,
            severity: 'medium',
          });
          priorityScore += 30;
        }
      }
    }

    // Duplicate candidate detection
    const matchingClaims = claims.filter(
      (other) =>
        other.id !== claim.id &&
        other.patientId === claim.patientId &&
        other.providerId === claim.providerId &&
        other.serviceDate === claim.serviceDate
    );

    const exactDuplicates = matchingClaims.filter(
      (other) =>
        other.amount === claim.amount &&
        other.procedureCode === claim.procedureCode
    );

    const potentialDuplicates = matchingClaims.filter(
      (other) =>
        Math.abs(other.amount - claim.amount) < 0.01 &&
        other.procedureCode !== claim.procedureCode
    );

    if (exactDuplicates.length > 0) {
      flags.push({
        rule: 'Duplicate Candidate',
        description: `Exact duplicate(s) found: ${exactDuplicates
          .map((duplicate) => duplicate.id)
          .join(', ')}`,
        severity: 'high',
      });
      priorityScore += 70;
    } else if (potentialDuplicates.length > 0) {
      flags.push({
        rule: 'Duplicate Candidate',
        description: `Potential duplicate(s) found: ${potentialDuplicates
          .map((duplicate) => duplicate.id)
          .join(', ')}`,
        severity: 'medium',
      });
      priorityScore += 40;
    }

    return {
      ...claim,
      flags,
      priorityScore: Math.min(100, priorityScore),
    };
  });
};
