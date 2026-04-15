import React from 'react';
import type { Company } from '../types';
import type { AppAnalysisStatus } from '../types';
import type { WorkspaceDocument } from '../types/workspace';
import { WORKSPACE_RESEARCH_WIDGET_MS } from '../constants';
import { getBlockDisplayConfig } from '../utils/workspaceDocument';
import { ErrorCallout } from '../components/feedback';
import { WidgetLoading, KpiTable } from '../components/widgets';
import { ProgressIndicator } from '../components/progress';

const RESEARCH_EXPANDED_SOURCE_LINE = 'Source: Company financial statements (10-K / 10-Q)';

export type WorkspaceScreenProps = {
  company: Company;
  researchDocument: WorkspaceDocument | null;
  analysisStatus: AppAnalysisStatus;
  analysisLoadError: string | null;
  onRetryAnalysis: () => void;
  onContinueToAnalysis: () => void;
};

export const WorkspaceScreen: React.FC<WorkspaceScreenProps> = ({
  company,
  researchDocument,
  analysisStatus,
  analysisLoadError,
  onRetryAnalysis,
  onContinueToAnalysis,
}) => {
  const workspace = researchDocument;
  const tableVisible = analysisStatus === 'complete' && !!workspace;
  const showError = !!analysisLoadError;
  const block = workspace?.blocks[0];
  const config = block ? getBlockDisplayConfig(block.id) : undefined;

  const summaryLine =
    block && block.blockType === 'sourcedTable' && block.rows.length
      ? block.rows.map((r) => `${r.metric}: ${r.value}`).join(' · ')
      : '';

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 3 · Research Workspace</div>
        <div className="app-section-title">Research Workspace</div>
        <div className="app-section-subtitle">
          <strong>Sourced facts only</strong> — structured data with explicit source. Interpretation happens in Analysis
          Workspace (next step).
        </div>
      </div>

      <div className="workspace-header">
        <div className="workspace-company">
          <strong>
            {company.name} — {company.exchange} — {company.marketCap} Market Cap
          </strong>
          <div className="workspace-meta">
            Ticker {company.ticker} · Sector {company.sector} · {company.industry}
          </div>
        </div>
        <div className="workspace-analyst">
          Research by <strong>Fundamental Analyst</strong>
        </div>
      </div>

      {showError && (
        <ErrorCallout message={analysisLoadError!} actionLabel="Retry" onAction={onRetryAnalysis} />
      )}

      {!showError && (
        <>
          <div className="workspace-layout">
            <div className="widget-card">
              <div className="widget-header">
                <div className="widget-title-group">
                  <div className="widget-title">{config?.title ?? 'Revenue & earnings'}</div>
                  <div className="widget-subtitle">{config?.subtitle ?? ''}</div>
                </div>
                <span className="widget-pill">{config?.pill ?? 'Research'}</span>
              </div>
              <div className="widget-body">
                {!tableVisible ? (
                  <WidgetLoading
                    label="Loading sourced revenue & earnings table…"
                    estimatedSeconds={WORKSPACE_RESEARCH_WIDGET_MS / 1000}
                  />
                ) : block && block.blockType === 'sourcedTable' ? (
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: '#d8daf0' }}>{summaryLine}</div>
                    <details style={{ marginTop: 14 }}>
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontSize: 13,
                          color: 'var(--color-accent, #8b9cff)',
                          userSelect: 'none',
                        }}
                      >
                        Show full table
                      </summary>
                      <div style={{ marginTop: 14 }}>
                        <KpiTable rows={block.rows} />
                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 14,
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            fontSize: 11,
                            color: '#9094b8',
                            lineHeight: 1.45,
                          }}
                        >
                          {RESEARCH_EXPANDED_SOURCE_LINE}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#a3a7c2' }}>No research table for this selection.</div>
                )}
              </div>
            </div>
          </div>

          <ProgressIndicator
            completedCount={tableVisible ? 1 : 0}
            totalCount={1}
            message=""
            statusText={
              tableVisible
                ? 'Research complete — continue to analysis'
                : 'Gathering structured research…'
            }
            ctaCopy="Next: Analysis Workspace."
            ctaLabel="Continue to Analysis Workspace"
            onCtaClick={onContinueToAnalysis}
            ctaDisabled={!tableVisible}
          />
        </>
      )}
    </div>
  );
};
