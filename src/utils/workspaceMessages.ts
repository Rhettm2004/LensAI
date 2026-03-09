import type { AppAnalysisStatus } from '../types';

export function getProgressMessage(status: AppAnalysisStatus): string {
  switch (status) {
    case 'idle':
      return 'Ready to run analysis';
    case 'running':
      return 'Running analysis…';
    case 'widget_1_complete':
      return 'Loading KPI Table…';
    case 'widget_2_complete':
      return 'Finalizing…';
    case 'complete':
      return 'Analysis complete';
    default:
      return 'Running analysis…';
  }
}

export function getWidget1LoadingLabel(status: AppAnalysisStatus): string {
  return status === 'running'
    ? 'Loading Product Report…'
    : 'Reconstructing business model and narrative…';
}
