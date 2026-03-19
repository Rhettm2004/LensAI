import React, { useMemo } from 'react';
import type { Company } from '../types';
import type { ReportBlock } from '../types/report';
import type { ReportDocument } from '../types/report';
import { ReportBlockRenderer } from '../components/report/ReportBlockRenderer';

function blocksInDisplayOrder(doc: ReportDocument): ReportBlock[] {
  const byId = Object.fromEntries(doc.blocks.map((b) => [b.id, b])) as Record<string, ReportBlock>;
  const out: ReportBlock[] = [];
  const seen = new Set<string>();

  const push = (id: string) => {
    const b = byId[id];
    if (b && !seen.has(id)) {
      out.push(b);
      seen.add(id);
    }
  };

  push('valuationFinancialSummary');
  if (byId.valuationFinancialInterpretation) push('valuationFinancialInterpretation');
  else if (byId.valuationAnalysis) push('valuationAnalysis');
  push('valuationFraming');
  push('valuationEstimate');
  if (byId.valuationClosing) push('valuationClosing');
  else if (byId.valuationConclusion) push('valuationConclusion');

  for (const b of doc.blocks) {
    if (!seen.has(b.id)) {
      out.push(b);
      seen.add(b.id);
    }
  }
  return out;
}

function ReportPreviewSection({
  title,
  children,
  first,
}: {
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section
      style={{
        marginTop: first ? 4 : 24,
        borderTop: first ? 'none' : '1px solid rgba(255,255,255,0.06)',
        paddingTop: first ? 0 : 4,
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted, #9094b8)',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function sectionTitleForBlock(block: ReportBlock): string {
  if (block.title?.trim()) return block.title;
  if (block.id === 'valuationAnalysis') return 'Financial Interpretation';
  return 'Section';
}

export type ExportScreenProps = {
  company: Company;
  reportDocument: ReportDocument | null;
  reportTypeLabel: string;
  onExportPdf: () => void;
  onBackToReporting: () => void;
};

export const ExportScreen: React.FC<ExportScreenProps> = ({
  company,
  reportDocument,
  reportTypeLabel,
  onExportPdf,
  onBackToReporting,
}) => {
  const hasReport = reportDocument != null;
  const orderedBlocks = useMemo(
    () => (reportDocument ? blocksInDisplayOrder(reportDocument) : []),
    [reportDocument]
  );

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 6 · Report Viewer / Export</div>
        <div className="app-section-title">Report Viewer / Export</div>
        <div className="app-section-subtitle">Preview and download</div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 13 }}>
          <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{reportTypeLabel}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          className="button-primary"
          onClick={onExportPdf}
          disabled={!hasReport}
        >
          Download PDF
        </button>
        <button type="button" className="button-ghost" onClick={onBackToReporting}>
          Back to Reporting Engine
        </button>
      </div>

      {hasReport && reportDocument && (
        <div className="widget-card" style={{ marginBottom: 24 }}>
          <div
            className="widget-header"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 0 }}
          >
            <div className="widget-title-group">
              <div className="widget-title">
                {company.name} ({company.ticker}) — {reportTypeLabel}
              </div>
              <div className="widget-subtitle" style={{ marginTop: 6 }}>
                Generated {new Date(reportDocument.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="widget-body" style={{ paddingTop: 4 }}>
            {orderedBlocks.map((block, idx) => (
              <ReportPreviewSection
                key={`${block.id}-${idx}`}
                title={sectionTitleForBlock(block)}
                first={idx === 0}
              >
                <ReportBlockRenderer block={block} />
              </ReportPreviewSection>
            ))}
          </div>
        </div>
      )}

      {!hasReport && (
        <div className="report-section">
          <div className="report-body">
            Generate a report from the Reporting Engine, then return here.
          </div>
        </div>
      )}
    </div>
  );
};
