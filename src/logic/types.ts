export type Flag = {
  rule: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
};

export type Claim = {
  id: string;
  patientId: string;
  providerId: string;
  procedureCode: string;
  serviceDate: string;
  amount: number;
  status: 'Pending' | 'Investigate' | 'Dismissed' | 'Escalated';
  flags: Flag[];
  priorityScore: number;
};
