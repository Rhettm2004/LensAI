import React from 'react';
import type { Company } from '../types';
import type { ReportingEngineState } from '../types';
import { ErrorCallout } from '../components/feedback';
import { getReportTypeLabel, REPORT_TYPE_CONFIG } from '../state';

export type ReportingEngineScreenProps = {
  company: Company;
  reportingEngineState: ReportingEngineState;
  reportGenerationError: string | null;
  hasGeneratedReport: boolean;
  onGenerateValuationReport: () => void;
  onRegenerate: () => void;
  onOpenReportViewer?: () => void;
};

export const ReportingEngineScreen: React.FC<ReportingEngineScreenProps> = ({
  company,
  reportingEngineState,
  reportGenerationError,
  hasGeneratedReport,
  onGenerateValuationReport,
  onRegenerate,
  onOpenReportViewer,
}) => {
  const config = REPORT_TYPE_CONFIG[0]!;

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Reporting Engine</div>
        <div className="app-section-title">Reporting Engine</div>
        <div className="app-section-subtitle">{config.label}</div>
      </div>

      <div style={{ marginBottom: 20, fontSize: 13, color: '#a3a7c2' }}>
        <strong style={{ color: '#e8e9f5' }}>{company.name}</strong> ({company.ticker})
      </div>

      {reportingEngineState === 'engine' && reportGenerationError && (
        <ErrorCallout
          message={reportGenerationError}
          actionLabel="Try again"
          onAction={onGenerateValuationReport}
        />
      )}

      {reportingEngineState === 'engine' && (
        <div className="analyst-card" style={{ marginBottom: 24 }}>
          <div className="analyst-title-row">
            <div className="analyst-title">{config.label}</div>
          </div>
          <div className="analyst-desc">{config.description}</div>
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {!hasGeneratedReport ? (
              <button type="button" className="button-primary" onClick={onGenerateValuationReport}>
                Generate report
              </button>
            ) : (
              <>
                {onOpenReportViewer && (
                  <button type="button" className="button-primary" onClick={onOpenReportViewer}>
                    Open report viewer
                  </button>
                )}
                <button type="button" className="button-ghost" onClick={onRegenerate}>
                  Regenerate
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {reportingEngineState === 'generating' && (
        <div className="report-generating-state" style={{ marginBottom: 24 }}>
          <div className="widget-loading" style={{ minHeight: 160 }}>
            <div className="spinner-dot-row">
              <span className="spinner-dot" />
              <span className="spinner-dot" />
              <span className="spinner-dot" />
            </div>
            <div style={{ fontSize: 13 }}>Generating report…</div>
          </div>
        </div>
      )}
    </div>
  );
};
