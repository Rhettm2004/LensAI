import React from 'react';
import type { Company } from '../types';
import type { ReportDocument, ReportBlock } from '../types/report';
import { getReportTypeLabel } from '../state';
import { formatReportGeneratedAt } from '../utils/formatReportTimestamp';
import { ReportBlockCard } from '../components/report/ReportBlockCard';

const OVERVIEW_SUMMARY_ID = 'overviewSummary';
const INVESTMENT_THESIS_ID = 'investmentThesis';
const FINANCIAL_TAKEAWAYS_ID = 'financialTakeaways';
const KEY_POSITIVES_ID = 'keyPositives';
const KEY_NEGATIVES_ID = 'keyNegatives';

function getBlockById(doc: ReportDocument, id: string): ReportBlock | undefined {
  return doc.blocks.find((b) => b.id === id);
}

export type ReportWorkspaceScreenProps = {
  company: Company;
  reportDocument: ReportDocument | null;
  reportTypeLabel: string;
  onBack: () => void;
  onRegenerate: () => void;
  onGoToExport: () => void;
};

export const ReportWorkspaceScreen: React.FC<ReportWorkspaceScreenProps> = ({
  company,
  reportDocument,
  reportTypeLabel,
  onBack,
  onRegenerate,
  onGoToExport,
}) => {
  const overviewSummary = reportDocument ? getBlockById(reportDocument, OVERVIEW_SUMMARY_ID) : undefined;
  const investmentThesis = reportDocument ? getBlockById(reportDocument, INVESTMENT_THESIS_ID) : undefined;
  const financialTakeaways = reportDocument ? getBlockById(reportDocument, FINANCIAL_TAKEAWAYS_ID) : undefined;
  const keyPositives = reportDocument ? getBlockById(reportDocument, KEY_POSITIVES_ID) : undefined;
  const keyNegatives = reportDocument ? getBlockById(reportDocument, KEY_NEGATIVES_ID) : undefined;

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Analysis Workspace</div>
        <div className="app-section-title">Analysis Workspace</div>
        <div className="app-section-subtitle">
          Structured report built from your research. Inspect each block; go to Export when ready.
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
        <button type="button" className="button-primary" onClick={onGoToExport}>
          Go to Export
        </button>
      </div>

      {reportDocument ? (
        <>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            {formatReportGeneratedAt(reportDocument.generatedAt)} · {reportDocument.blocks.length} blocks
          </div>
          <div className="report-workspace-layout">
            {overviewSummary && (
              <div className="report-workspace-row report-workspace-row-full">
                <ReportBlockCard key={overviewSummary.id} block={overviewSummary} />
              </div>
            )}
            <div className="report-workspace-row report-workspace-row-half">
              {investmentThesis && <ReportBlockCard key={investmentThesis.id} block={investmentThesis} />}
              {financialTakeaways && <ReportBlockCard key={financialTakeaways.id} block={financialTakeaways} />}
            </div>
            <div className="report-workspace-row report-workspace-row-half">
              {keyPositives && <ReportBlockCard key={keyPositives.id} block={keyPositives} />}
              {keyNegatives && <ReportBlockCard key={keyNegatives.id} block={keyNegatives} />}
            </div>
          </div>
        </>
      ) : (
        <div className="report-section">
          <div className="report-body">
            No report document available. Go to the Analysis Engine and generate an Overview Report.
          </div>
        </div>
      )}
    </div>
  );
};
