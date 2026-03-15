import React from 'react';
import type { Company } from '../types';
import type { ReportDocument } from '../types/report';
import { getReportTypeLabel } from '../state';
import { ReportBlockCard } from '../components/report/ReportBlockCard';

export type ReportWorkspaceScreenProps = {
  company: Company;
  reportDocument: ReportDocument | null;
  reportTypeLabel: string;
  onBack: () => void;
  onRegenerate: () => void;
  onExportPdf: () => void;
};

export const ReportWorkspaceScreen: React.FC<ReportWorkspaceScreenProps> = ({
  company,
  reportDocument,
  reportTypeLabel,
  onBack,
  onRegenerate,
  onExportPdf,
}) => {
  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Report Workspace</div>
        <div className="app-section-title">Report Workspace</div>
        <div className="app-section-subtitle">
          Structured report built from your research. Inspect each block; export to PDF when ready.
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 13 }}>
          <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{reportTypeLabel}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <button type="button" className="button-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="button-ghost" onClick={onRegenerate}>
          Regenerate report
        </button>
        <button type="button" className="button-secondary" onClick={onExportPdf}>
          Export PDF
        </button>
      </div>

      {reportDocument ? (
        <>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Generated {new Date(reportDocument.generatedAt).toLocaleString()} · {reportDocument.blocks.length} blocks
          </div>
          <div className="workspace-layout" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reportDocument.blocks.map((block) => (
              <ReportBlockCard key={block.id} block={block} />
            ))}
          </div>
        </>
      ) : (
        <div className="report-section">
          <div className="report-body">
            No report document available. Go to the Reporting Engine and generate an Overview Report.
          </div>
        </div>
      )}
    </div>
  );
};
