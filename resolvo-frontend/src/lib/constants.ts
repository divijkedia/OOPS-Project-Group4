export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
}

export const LIFECYCLE_STEPS: StepItem[] = [
  { id: 'REPORT', label: 'Report', description: 'Incident logged by user' },
  { id: 'CLASSIFY', label: 'Classify', description: 'Category identified' },
  { id: 'PRIORITIZE', label: 'Prioritize', description: 'P1-P4 calculated' },
  { id: 'ASSIGN', label: 'Assign', description: 'Technician assigned' },
  { id: 'INVESTIGATE', label: 'Investigate', description: 'Troubleshooting in progress' },
  { id: 'RESOLVE', label: 'Resolve', description: 'Solution applied' },
  { id: 'VERIFY', label: 'Verify', description: 'Validation by reporter' },
  { id: 'CLOSE', label: 'Close', description: 'Incident finalized' },
];
