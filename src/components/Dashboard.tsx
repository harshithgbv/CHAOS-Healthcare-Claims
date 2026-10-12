import { Claim } from '../logic/types';

export const Dashboard = ({ claims }: { claims: Claim[] }) => {
  const requiresReview = claims.filter(c => c.flags.length > 0).length;
  const duplicates = claims.filter(c => c.flags.some(f => f.rule === 'Duplicate Candidate')).length;
  const dataQuality = claims.filter(c => c.flags.some(f => f.rule === 'Data Quality')).length;
  const highPriority = claims.filter(c => c.priorityScore >= 70).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatCard title="Total Claims" value={claims.length} />
      <StatCard title="Requires Review" value={requiresReview} className="text-teal-400" />
      <StatCard title="Duplicates" value={duplicates} />
      <StatCard title="High Priority" value={highPriority} className="text-red-400" />
    </div>
  );
};

const StatCard = ({ title, value, className = '' }: { title: string, value: number, className?: string }) => (
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className={`text-4xl font-bold mt-2 ${className}`}>{value}</p>
  </div>
);
