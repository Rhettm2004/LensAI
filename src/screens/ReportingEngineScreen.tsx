import React from 'react';
import type { Company } from '../types';
import type { GeneratedReports, ReportTypeId, ReportingEngineState } from '../types';
import { getReportTypeLabel, REPORT_TYPE_CONFIG } from '../state';

export type ReportingEngineScreenProps = {
  company: Company;
  generatedReports: GeneratedReports;
  reportingEngineState: ReportingEngineState;
  generatingReportType: ReportTypeId | null;
  onStartGenerateReport: (reportType: ReportTypeId) => void;
  onCompleteGenerateReport: (reportType: ReportTypeId) => void;
  onOpenReportViewer: (reportType: ReportTypeId) => void;
};

export const ReportingEngineScreen: React.FC<ReportingEngineScreenProps> = ({
  company,
  generatedReports,
  reportingEngineState,
  generatingReportType,
  onStartGenerateReport,
  onCompleteGenerateReport,
  onOpenReportViewer,
}) => {
  const reportTypeBeingGenerated = generatingReportType ?? 'overview';

  React.useEffect(() => {
    if (reportingEngineState !== 'generating' || !generatingReportType) return;
    const t = setTimeout(() => onCompleteGenerateReport(generatingReportType), 1400);
    return () => clearTimeout(t);
  }, [reportingEngineState, generatingReportType, onCompleteGenerateReport]);

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 4 · Reporting Engine</div>
        <div className="app-section-title">Evaluation &amp; Reporting Engine</div>
        <div className="app-section-subtitle">
          {reportingEngineState === 'engine'
            ? 'Generate report outputs from your completed analysis. Choose a report type below and click Generate or View.'
            : `Generating ${getReportTypeLabel(reportTypeBeingGenerated).toLowerCase()} from workspace outputs…`}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#a3a7c2' }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {reportingEngineState === 'engine' && (
        <div className="screen-grid" style={{ marginBottom: 20 }}>
          {REPORT_TYPE_CONFIG.map((config) => {
            const isGenerated = generatedReports[config.id];
            const isAvailable = config.availableInV0;
            const isMuted = !isAvailable;

            return (
              <div
                key={config.id}
                className={isMuted ? 'analyst-card analyst-card-muted' : 'analyst-card'}
              >
                <div className="analyst-title-row">
                  <div className="analyst-title">{config.label}</div>
                  {isAvailable && <span className="analyst-chip">V0 Active</span>}
                </div>
                <div className="analyst-desc">{config.description}</div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: isMuted ? 'flex-end' : 'flex-start' }}>
                  {isAvailable ? (
                    isGenerated ? (
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => onOpenReportViewer(config.id)}
                      >
                        View
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => onStartGenerateReport(config.id)}
                      >
                        Generate
                      </button>
                    )
                  ) : (
                    <button type="button" className="button-secondary button-disabled" disabled>
                      Coming soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reportingEngineState === 'generating' && (
        <div className="report-generating-state">
          <div className="widget-loading" style={{ minHeight: 200 }}>
            <div className="spinner-dot-row">
              <span className="spinner-dot" />
              <span className="spinner-dot" />
              <span className="spinner-dot" />
            </div>
            <div style={{ fontSize: 13 }}>
              Compiling {getReportTypeLabel(reportTypeBeingGenerated).toLowerCase()} from workspace outputs…
            </div>
            <div style={{ fontSize: 11, color: '#7075a0' }}>Processing…</div>
          </div>
        </div>
      )}
    </div>
  );
};
