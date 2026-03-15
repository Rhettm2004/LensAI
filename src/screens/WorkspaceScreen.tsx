import React from 'react';
import type { Company, AnalysisOutput } from '../types';
import type { AppAnalysisStatus } from '../types';
import type { WorkspaceDocument } from '../types/workspace';
import {
  WORKSPACE_WIDGET_1_MS,
  WORKSPACE_WIDGET_2_MS,
} from '../constants';
import {
  analysisOutputToWorkspaceDocument,
  getBlockDisplayConfig,
  WORKSPACE_BLOCK_IDS_IN_ORDER,
} from '../utils/workspaceDocument';
import { ErrorCallout } from '../components/feedback';
import { WidgetLoading, KpiTable, DataBlockWidget } from '../components/widgets';
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
  const workspace: WorkspaceDocument | null = analysis ? analysisOutputToWorkspaceDocument(analysis) : null;
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
          Data for the selected company — verify it&apos;s correct and understandable. Evaluation (thesis, pros/cons) is produced when you generate a report.
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
        {workspace
          ? workspace.blocks.map((block) => {
              const config = getBlockDisplayConfig(block.id);
              const title = config?.title ?? block.title;
              const subtitle = config?.subtitle ?? '';
              const pill = config?.pill ?? '';

              if (block.blockType === 'narrative') {
                const showLoading = !widget1Visible;
                const isEmpty = !block.fullContent.trim();
                return (
                  <div key={block.id} className="widget-card">
                    <div className="widget-header">
                      <div className="widget-title-group">
                        <div className="widget-title">{title}</div>
                        <div className="widget-subtitle">{subtitle}</div>
                      </div>
                      <span className="widget-pill">{pill}</span>
                    </div>
                    <div className="widget-body">
                      {showLoading ? (
                        <WidgetLoading
                          label={getWidget1LoadingLabel(analysisStatus)}
                          estimatedSeconds={WORKSPACE_WIDGET_1_MS / 1000}
                        />
                      ) : isEmpty ? (
                        <div style={{ fontSize: 13, color: '#a3a7c2' }}>No data available.</div>
                      ) : (
                        <DataBlockWidget
                          content={block.fullContent}
                          summaryContent={block.summaryContent}
                        />
                      )}
                    </div>
                  </div>
                );
              }

              // kpiTable block
              const showKpiLoading = !widget2Visible;
              return (
                <div key={block.id} className="widget-card">
                  <div className="widget-header">
                    <div className="widget-title-group">
                      <div className="widget-title">{title}</div>
                      <div className="widget-subtitle">{subtitle}</div>
                    </div>
                    <span className="widget-pill">{pill}</span>
                  </div>
                  <div className="widget-body">
                    {showKpiLoading ? (
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
                        {block.caption && (
                          <div style={{ fontSize: 12, color: '#a3a7c2', marginBottom: 10, lineHeight: 1.45 }}>
                            {block.caption}
                          </div>
                        )}
                        <KpiTable rows={block.rows} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          : WORKSPACE_BLOCK_IDS_IN_ORDER.map((blockId) => {
              const config = getBlockDisplayConfig(blockId);
              if (!config) return null;
              const isKpi = blockId === 'kpiTable';
              return (
                <div key={blockId} className="widget-card">
                  <div className="widget-header">
                    <div className="widget-title-group">
                      <div className="widget-title">{config.title}</div>
                      <div className="widget-subtitle">{config.subtitle}</div>
                    </div>
                    <span className="widget-pill">{config.pill}</span>
                  </div>
                  <div className="widget-body">
                    {isKpi ? (
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
                      <WidgetLoading
                        label={getWidget1LoadingLabel(analysisStatus)}
                        estimatedSeconds={WORKSPACE_WIDGET_1_MS / 1000}
                      />
                    )}
                  </div>
                </div>
              );
            })}
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
