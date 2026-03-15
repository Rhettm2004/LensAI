/**
 * Generated report artifact: one PDF built strictly from Workspace outputs.
 * Viewer embeds the PDF; download saves the same bytes. No parallel HTML report body.
 */

import type { Company, KpiRow, ReportSection } from './index';
import type { ReportTypeId } from './app';

/**
 * Snapshot of Workspace-only fields used to build the PDF (audit / backend parity).
 * PDF bytes are canonical; this mirrors what was in analysis at generation time.
 */
export interface WorkspaceReportSourceSnapshot {
  /** Ordered narrative blocks (derived from analysis fields only at generation). */
  narrativeBlockTitles: string[];
  kpiRowCount: number;
  hasKpiCaption: boolean;
}

/**
 * Single artifact per generated report: branded PDF bytes + metadata + workspace snapshot.
 * pdfBytes is the canonical view/download surface.
 */
export interface GeneratedReportArtifact {
  reportTypeId: ReportTypeId;
  title: string;
  company: Company;
  generatedAt: string;
  /** Strict copy of workspace-derived inputs used to build pdfBytes (no extra content). */
  workspaceSource: WorkspaceReportSourceSnapshot;
  /** Canonical report document for embed + download. */
  pdfBytes: Uint8Array;
}

export function hasReportArtifact(
  a: GeneratedReportArtifact | null | undefined
): a is GeneratedReportArtifact {
  return a != null && a.pdfBytes != null && a.pdfBytes.length > 0;
}

/** @deprecated Use GeneratedReportArtifact */
export interface GeneratedReportDocument {
  reportTypeId: ReportTypeId;
  title: string;
  company: Company;
  generatedAt: string;
  sections: ReportSection[];
  kpiRows: KpiRow[];
}

export function hasReportDocument(doc: GeneratedReportDocument | null | undefined): doc is GeneratedReportDocument {
  return doc != null && Array.isArray(doc.sections);
}
