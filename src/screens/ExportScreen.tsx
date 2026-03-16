import React from 'react';
import type { Company } from '../types';
import type { ReportDocument } from '../types/report';

export type ExportScreenProps = {
  company: Company;
  reportDocument: ReportDocument | null;
  reportTypeLabel: string;
  onExportPdf: () => void;
  onBackToAnalysisWorkspace: () => void;
};

export const ExportScreen: React.FC<ExportScreenProps> = ({
  company,
  reportDocument,
  reportTypeLabel,
  onExportPdf,
  onBackToAnalysisWorkspace,
}) => {
  const hasReport = reportDocument != null;

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 6 · Export</div>
        <div className="app-section-title">Export</div>
        <div className="app-section-subtitle">
          Download your report as a PDF. The file matches the report you reviewed in Analysis Workspace.
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 13 }}>
          <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{reportTypeLabel}</span>
      </div>

      {hasReport && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 20 }}>
          Generated {new Date(reportDocument.generatedAt).toLocaleString()} · {reportDocument.blocks.length} blocks
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          className="button-primary"
          onClick={onExportPdf}
          disabled={!hasReport}
        >
          Download PDF
        </button>
        <button type="button" className="button-ghost" onClick={onBackToAnalysisWorkspace}>
          Back to Analysis Workspace
        </button>
      </div>

      {!hasReport && (
        <div className="report-section">
          <div className="report-body">
            No report available to export. Go to Analysis Workspace to view your report, then return here to download the PDF.
          </div>
        </div>
      )}
    </div>
  );
};
