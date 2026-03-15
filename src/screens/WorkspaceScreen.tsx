import React from 'react';
import type { Company, AnalysisOutput } from '../types';
import type { AppAnalysisStatus } from '../types';
import {
  WORKSPACE_WIDGET_1_MS,
  WORKSPACE_WIDGET_2_MS,
} from '../constants';
import { ErrorCallout } from '../components/feedback';
import { WidgetLoading, KpiTable, ProductReportBody } from '../components/widgets';
import { ProgressIndicator } from '../components/progress';
import { getProgressMessage, getWidget1LoadingLabel } from '../utils/workspaceMessages';

export type WorkspaceScreenProps = {
  company: Company;
  analysis: AnalysisOutput | null;
  analysisStatus: AppAnalysisStatus;
  analysisLoadError: string | null;
  onAnalysisStatusChange: (status: AppAnalysisStatus) => void;
  /** Re-runs analysis load (dispatches RUN_ANALYSIS from App). */
  onRetryAnalysis: () => void;
  onOpenReportingEngine: () => void;
};

export const WorkspaceScreen: React.FC<WorkspaceScreenProps> = ({
  company,
  analysis,
  analysisStatus,
  analysisLoadError,
  onRetryAnalysis,
  onOpenReportingEngine,
}) => {
  const widget1Visible =
    (analysisStatus === 'widget_1_complete' || analysisStatus === 'widget_2_complete' || analysisStatus === 'complete') &&
    !!analysis;
  const widget2Visible =
    (analysisStatus === 'widget_2_complete' || analysisStatus === 'complete') && !!analysis;
  const completedCount =
    analysisStatus === 'running' ? 0 : analysisStatus === 'widget_1_complete' ? 1 : 2;
  const allComplete = analysisStatus === 'complete';
  const showError = !!analysisLoadError;

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 3 · Workspace</div>
        <div className="app-section-title">Processed Outputs</div>
        <div className="app-section-subtitle">
          Structured AI outputs for the selected company, presented as modular widgets.
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
          Analysis by <strong>Fundamental Analyst AI</strong>
        </div>
      </div>

      {showError && (
        <ErrorCallout
          message={analysisLoadError!}
          actionLabel="Retry"
          onAction={onRetryAnalysis}
        />
      )}

      {!showError && (
        <>
      <div className="workspace-layout">
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-title">Product Report</div>
              <div className="widget-subtitle">
                Concise business model and positioning overview.
              </div>
            </div>
            <span className="widget-pill">Narrative Analysis</span>
          </div>
          <div className="widget-body">
            {!widget1Visible ? (
              <WidgetLoading
                label={getWidget1LoadingLabel(analysisStatus)}
                estimatedSeconds={WORKSPACE_WIDGET_1_MS / 1000}
              />
            ) : (
              <ProductReportBody analysis={analysis!} />
            )}
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-title">KPI Table</div>
              <div className="widget-subtitle">
                Reconstructed performance trends across key financial metrics.
              </div>
            </div>
            <span className="widget-pill">KPI Trends</span>
          </div>
          <div className="widget-body">
            {!widget2Visible ? (
              <WidgetLoading
                label={
                  analysisStatus === 'widget_1_complete'
                    ? 'Loading KPI Table…'
                    : 'Aligning financial series and KPI trends…'
                }
                estimatedSeconds={
                  analysisStatus === 'widget_1_complete'
                    ? (WORKSPACE_WIDGET_2_MS - WORKSPACE_WIDGET_1_MS) / 1000
                    : WORKSPACE_WIDGET_2_MS / 1000
                }
              />
            ) : (
              <div>
                {analysis?.kpiSnapshotCaption && (
                  <div style={{ fontSize: 12, color: '#a3a7c2', marginBottom: 10, lineHeight: 1.45 }}>
                    {analysis.kpiSnapshotCaption}
                  </div>
                )}
                <KpiTable rows={analysis?.kpiRows ?? []} />
              </div>
            )}
          </div>
        </div>
      </div>

      <ProgressIndicator
        completedCount={completedCount}
        totalCount={2}
        message={getProgressMessage(analysisStatus)}
        ctaCopy="Use the completed analysis to generate structured report outputs in the next step."
        ctaLabel="Open Reporting Engine"
        onCtaClick={onOpenReportingEngine}
        ctaDisabled={!allComplete}
      />
        </>
      )}
    </div>
  );
};
