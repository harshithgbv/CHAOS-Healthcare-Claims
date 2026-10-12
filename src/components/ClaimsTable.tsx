import { Claim } from '../logic/types';

export const ClaimsTable = ({ claims }: { claims: Claim[] }) => {
return (
<div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mt-6">
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-slate-700 text-slate-300 uppercase text-xs">
<tr>
<th className="p-4">ID</th>
<th className="p-4">Patient ID</th>
<th className="p-4">Amount</th>
<th className="p-4">Priority Score</th>
<th className="p-4">Flags & Reasons</th>
</tr>
</thead>

      <tbody className="divide-y divide-slate-700">
        {claims.map((claim) => (
          <tr key={claim.id} className="text-slate-200">
            <td className="p-4">{claim.id}</td>

            <td className="p-4">{claim.patientId}</td>

            <td className="p-4">
              ${claim.amount.toFixed(2)}
            </td>

            <td className="p-4">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  claim.priorityScore >= 70
                    ? 'bg-red-900 text-red-200'
                    : 'bg-slate-600 text-slate-200'
                }`}
              >
                {claim.priorityScore}
              </span>
            </td>

            <td className="p-4">
              {claim.flags.length > 0 ? (
                <div className="flex flex-col gap-2 min-w-48">
                  {claim.flags.map((flag, index) => (
                    <div
                      key={`${claim.id}-${flag.rule}-${index}`}
                      className="rounded-md bg-slate-700 p-2"
                    >
                      <div className="font-semibold text-xs text-amber-300">
                        {flag.rule}
                      </div>

                      <p className="text-xs text-slate-200 mt-1 whitespace-normal">
                        {flag.description}
                      </p>

                      <span
                        className={`inline-block mt-2 rounded px-2 py-1 text-xs ${
                          flag.severity === 'high'
                            ? 'bg-red-900 text-red-200'
                            : flag.severity === 'medium'
                              ? 'bg-amber-900 text-amber-200'
                              : 'bg-slate-600 text-slate-200'
                        }`}
                      >
                        {flag.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  No flags
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

);
};