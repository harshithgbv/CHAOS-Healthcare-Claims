/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Claim } from './logic/types';
import { Dashboard } from './components/Dashboard';
import { ClaimsTable } from './components/ClaimsTable';

export default function App() {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    fetch('/api/claims')
      .then(res => res.json())
      .then(data => setClaims(data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-8">CHAOS — Claims Handling Anomaly Optimization Squad</h1>
      <Dashboard claims={claims} />
      <ClaimsTable claims={claims} />
    </div>
  );
}
