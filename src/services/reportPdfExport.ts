/**
 * Download the same PDF bytes already stored in the artifact — no regeneration.
 */

import type { GeneratedReportArtifact } from '../types/reportDocument';

export function downloadReportPdfArtifact(artifact: GeneratedReportArtifact): void {
  const blob = new Blob([new Uint8Array(artifact.pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = globalThis.document.createElement('a');
  a.href = url;
  const safeTicker = artifact.company.ticker.replace(/[^a-zA-Z0-9]/g, '_');
  const date = artifact.generatedAt.slice(0, 10);
  a.download = `LensAI_${artifact.reportTypeId}_${safeTicker}_${date}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
