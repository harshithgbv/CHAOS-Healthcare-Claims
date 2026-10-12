
import assert from 'node:assert/strict';
import { parseClaimsCsv } from './csvImport';

const headers =
  'id,patientId,providerId,procedureCode,serviceDate,amount';

function csvRow(
  id: string,
  procedureCode = 'PROC-001',
  serviceDate = '2026-10-01',
  amount = '150',
): string {
  return `${id},P100,PR200,${procedureCode},${serviceDate},${amount}`;
}

// 1. A valid claim is imported with default review fields.
{
  const result = parseClaimsCsv(
    `${headers}\n${csvRow('C001')}`,
  );

  assert.equal(result.totalRows, 1);
  assert.equal(result.claims.length, 1);
  assert.equal(result.rejectedRows.length, 0);
  assert.equal(result.claims[0].id, 'C001');
  assert.equal(result.claims[0].status, 'Pending');
  assert.equal(result.claims[0].priorityScore, 0);
}

// 2. Quoted CSV fields containing commas are parsed correctly.
{
  const result = parseClaimsCsv(
    `${headers}\n${csvRow('C002', '"PROC,001"')}`,
  );

  assert.equal(result.claims.length, 1);
  assert.equal(result.claims[0].procedureCode, 'PROC,001');
}

// 3. Impossible calendar dates are rejected.
{
  const result = parseClaimsCsv(
    `${headers}\n${csvRow('C003', 'PROC-001', '2026-02-30')}`,
  );

  assert.equal(result.claims.length, 0);
  assert.match(result.rejectedRows[0].reason, /Invalid service date/);
}

// 4. Duplicate claim IDs are rejected.
{
  const result = parseClaimsCsv(
    `${headers}\n${csvRow('C004')}\n${csvRow('C004')}`,
  );

  assert.equal(result.claims.length, 1);
  assert.equal(result.rejectedRows.length, 1);
  assert.match(result.rejectedRows[0].reason, /Duplicate claim ID/);
}

// 5. Zero, negative, and non-numeric amounts are rejected.
{
  const result = parseClaimsCsv(
    [
      headers,
      csvRow('C005', 'PROC-001', '2026-10-01', '0'),
      csvRow('C006', 'PROC-001', '2026-10-01', '-10'),
      csvRow('C007', 'PROC-001', '2026-10-01', 'abc'),
    ].join('\n'),
  );

  assert.equal(result.claims.length, 0);
  assert.equal(result.rejectedRows.length, 3);
}

// 6. Missing required headers produce a clear error.
{
  assert.throws(
    () => parseClaimsCsv('id,patientId\nC008,P100'),
    /Missing required columns/,
  );
}

console.log('CSV import tests passed: 6 test groups.');
