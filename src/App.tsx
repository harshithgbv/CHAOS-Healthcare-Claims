/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Claim } from './logic/types';
import { analyzeClaims } from './logic/detector';
import { parseClaimsCsv } from './logic/csvImport';
import type { CsvImportResult } from './logic/csvImport';
import { Dashboard } from './components/Dashboard';
import { ClaimsTable } from './components/ClaimsTable';

export default function App() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [importResult, setImportResult] =
    useState<CsvImportResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/claims')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Could not load sample claims.');
        }
        return res.json();
      })
      .then((data: Claim[]) => setClaims(data))
      .catch(() => setError('Could not load sample claims. Please refresh and try again.'));
  }, []);

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const csvText = await file.text();
      const result = parseClaimsCsv(csvText);

      if (result.claims.length === 0) {
        setImportResult(result);
        setClaims([]);
        setError('No valid claims were found in this CSV.');
        return;
      }

      const analyzedClaims = analyzeClaims(result.claims);

      setClaims(analyzedClaims);
      setImportResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not import this CSV file.',
      );
    }

    // Allow the same file to be selected again.
    event.target.value = '';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-4">
        CHAOS - Claims Handling Anomaly Optimization Squad
      </h1>

      <section className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-2">
          Import Healthcare Claims
        </h2>

        <p className="text-sm text-slate-300 mb-4">
          Upload a CSV with the required claim columns to analyze claims.
          Use synthetic or properly de-identified data only.
        </p>

        <label
          htmlFor="claims-csv"
          className="block text-sm font-medium mb-2"
        >
          Choose CSV file
        </label>

        <input
          id="claims-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={handleCsvUpload}
          className="block w-full text-sm text-slate-300
            file:mr-4 file:rounded-lg file:border-0
            file:bg-teal-500 file:px-4 file:py-2
            file:font-semibold file:text-slate-950
            hover:file:bg-teal-400"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {importResult && (
          <div className="mt-4 text-sm text-slate-200">
            <p>
              Rows processed: <strong>{importResult.totalRows}</strong>
            </p>
            <p>
              Accepted: <strong>{importResult.claims.length}</strong>
              {' | '}
              Rejected: <strong>{importResult.rejectedRows.length}</strong>
            </p>

            {importResult.rejectedRows.length > 0 && (
              <div className="mt-3">
                <h3 className="font-semibold text-amber-400 mb-2">
                  Rejected rows
                </h3>

                <ul className="list-disc pl-5 space-y-1">
                  {importResult.rejectedRows.map((row, index) => (
                    <li key={`${row.row}-${index}`}>
                      Row {row.row}: {row.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <Dashboard claims={claims} />
      <ClaimsTable claims={claims} />
    </div>
  );
}