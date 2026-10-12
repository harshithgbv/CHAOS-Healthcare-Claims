import { Claim } from '../logic/types';

export const ClaimsTable = ({ claims }: { claims: Claim[] }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mt-6">
      <table className="w-full text-left">
        <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Patient ID</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Priority Score</th>
            <th className="p-4">Flags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {claims.map(claim => (
            <tr key={claim.id} className="text-slate-200">
              <td className="p-4">{claim.id}</td>
              <td className="p-4">{claim.patientId}</td>
              <td className="p-4">${claim.amount.toFixed(2)}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${claim.priorityScore > 70 ? 'bg-red-900 text-red-200' : 'bg-slate-600'}`}>
                  {claim.priorityScore}
                </span>
              </td>
              <td className="p-4">
                {claim.flags.map((f, i) => (
                  <span key={i} className="text-xs bg-slate-700 p-1 rounded mr-1">
                    {f.rule}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
