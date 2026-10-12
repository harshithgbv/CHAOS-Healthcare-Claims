
// @ts-ignore papaparse does not have declarations installed in this project.
import PapaModule from 'papaparse';
import type { Claim } from './types';

export type CsvImportResult = {
  claims: Claim[];
  rejectedRows: {
    row: number;
    reason: string;
  }[];
  totalRows: number;
};

type CsvRow = Record<string, unknown>;

const Papa = PapaModule as {
  parse<T>(
    input: string,
    config: {
      header: boolean;
      skipEmptyLines: 'greedy';
      transformHeader: (header: string) => string;
    },
  ): {
    meta: { fields?: string[] };
    errors: { row?: number; message: string }[];
    data: T[];
  };
};

const REQUIRED_HEADERS = [
  'id',
  'patientId',
  'providerId',
  'procedureCode',
  'serviceDate',
  'amount',
] as const;

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getText(row: CsvRow, key: string): string {
  const value = row[key];
  return value == null ? '' : String(value).trim();
}

export function parseClaimsCsv(csvText: string): CsvImportResult {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header: string) => header.trim(),
  });

  if (!parsed.meta.fields?.length) {
    throw new Error('The CSV must contain a header row.');
  }

  const headers = parsed.meta.fields;
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing required columns: ${missingHeaders.join(', ')}`,
    );
  }

  // Do not silently accept structurally malformed CSV.
  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0];
    throw new Error(
      `Malformed CSV near row ${(firstError.row ?? 0) + 2}: ${firstError.message}`,
    );
  }

  const claims: Claim[] = [];
  const rejectedRows: CsvImportResult['rejectedRows'] = [];
  const seenIds = new Set<string>();

  for (const [index, row] of parsed.data.entries()) {
    const rowNumber = index + 2;
    const id = getText(row, 'id');
    const patientId = getText(row, 'patientId');
    const providerId = getText(row, 'providerId');
    const procedureCode = getText(row, 'procedureCode');
    const serviceDate = getText(row, 'serviceDate');
    const amountText = getText(row, 'amount');
    const amount = Number(amountText);

    let reason = '';

    if (!id) {
      reason = 'Missing claim ID.';
    } else if (seenIds.has(id)) {
      reason = `Duplicate claim ID "${id}".`;
    } else if (!patientId) {
      reason = 'Missing patient ID.';
    } else if (!providerId) {
      reason = 'Missing provider ID.';
    } else if (!procedureCode) {
      reason = 'Missing procedure code.';
    } else if (!isValidDate(serviceDate)) {
      reason =
        'Invalid service date; expected a real date in YYYY-MM-DD format.';
    } else if (
      amountText === '' ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      reason = 'Amount must be a finite number greater than zero.';
    }

    if (reason) {
      rejectedRows.push({ row: rowNumber, reason });
      continue;
    }

    // Reserve the ID only after the entire row passes validation.
    seenIds.add(id);

    claims.push({
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
  }

  return {
    claims,
    rejectedRows,
    totalRows: parsed.data.length,
  };
}
