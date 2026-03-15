import React, { useState, useCallback } from 'react';
import type { Company } from '../types';
import type { GeneratedReportByType, ReportTypeId, ReportingEngineState } from '../types';
import { ErrorCallout } from '../components/feedback';
import { getReportTypeLabel, REPORT_TYPE_CONFIG } from '../state';

const OPENING_REPORT_DELAY_MS = 300;

export type ReportingEngineScreenProps = {
  company: Company;
  generatedReportByType: GeneratedReportByType;
  reportingEngineState: ReportingEngineState;
  generatingReportType: ReportTypeId | null;
  reportGenerationError: string | null;
  onStartGenerateReport: (reportType: ReportTypeId) => void;
  onOpenReportWorkspace: (reportType: ReportTypeId) => void;
};

export const ReportingEngineScreen: React.FC<ReportingEngineScreenProps> = ({
  company,
  generatedReportByType,
  reportingEngineState,
  generatingReportType,
  reportGenerationError,
  onStartGenerateReport,
  onOpenReportWorkspace,
}) => {
  const [isOpeningReport, setIsOpeningReport] = useState<ReportTypeId | null>(null);
  const reportTypeBeingGenerated = generatingReportType ?? 'overview';

  const handleOpenReportWorkspace = useCallback(
    (reportType: ReportTypeId) => {
      setIsOpeningReport(reportType);
      setTimeout(() => {
        onOpenReportWorkspace(reportType);
        setIsOpeningReport(null);
      }, OPENING_REPORT_DELAY_MS);
    },
    [onOpenReportWorkspace]
  );

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 4 · Analysis Engine</div>
        <div className="app-section-title">Analysis Engine</div>
        <div className="app-section-subtitle">
          {reportingEngineState === 'engine'
            ? 'Generate report outputs from your completed analysis. Choose a report type below and click Generate or View.'
            : `Generating ${getReportTypeLabel(reportTypeBeingGenerated).toLowerCase()} from workspace outputs…`}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#a3a7c2' }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {reportingEngineState === 'engine' && reportGenerationError && (
        <ErrorCallout
          message={reportGenerationError}
          actionLabel="Try again"
          onAction={() => onStartGenerateReport('overview')}
        />
      )}

      {reportingEngineState === 'engine' && (
        <div className="screen-grid" style={{ marginBottom: 20 }}>
          {REPORT_TYPE_CONFIG.map((config) => {
            const isGenerated = generatedReportByType[config.id] != null;
            const isAvailable = config.availableInV0;
            const isMuted = !isAvailable;
            const isOpeningThis = isOpeningReport === config.id;

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
                    isOpeningThis ? (
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        Preparing report…
                      </div>
                    ) : isGenerated ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="button-primary"
                          onClick={() => handleOpenReportWorkspace(config.id)}
                          disabled={isOpeningReport != null}
                        >
                          View
                        </button>
                        {config.id === 'overview' && (
                          <button
                            type="button"
                            className="button-ghost"
                            style={{ fontSize: 12 }}
                            onClick={() => {
                              onStartGenerateReport(config.id);
                              handleOpenReportWorkspace(config.id);
                            }}
                            disabled={isOpeningReport != null}
                          >
                            Regenerate
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => {
                          if (config.id === 'overview') {
                            handleOpenReportWorkspace(config.id);
                            onStartGenerateReport(config.id);
                          } else {
                            onStartGenerateReport(config.id);
                          }
                        }}
                        disabled={isOpeningReport != null}
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
