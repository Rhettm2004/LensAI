import React from 'react';
import type { Company, AnalysisOutput, GeneratedReports, ReportTypeId } from '../types';
import { getReportTypeLabel } from '../state';
import { KpiTable } from '../components/widgets';

const LIST_SECTION_TITLES = ['Key Positives', 'Key Negatives'];
const KPI_SECTION_TITLE = 'Financials (KPI Snapshot)';

export type ReportViewerScreenProps = {
  company: Company;
  analysis: AnalysisOutput | null;
  generatedReports: GeneratedReports;
  activeReportType: ReportTypeId | null;
  onSelectReport: (reportType: ReportTypeId) => void;
};

export const ReportViewerScreen: React.FC<ReportViewerScreenProps> = ({
  company,
  analysis,
  generatedReports,
  activeReportType,
  onSelectReport,
}) => {
  const generatedList = (['overview', 'valuation', 'industry', 'news'] as const).filter(
    (id) => generatedReports[id]
  );
  const effectiveReportType =
    activeReportType && generatedReports[activeReportType]
      ? activeReportType
      : generatedList[0] ?? null;

  React.useEffect(() => {
    if (generatedList.length > 0 && !activeReportType) {
      onSelectReport(generatedList[0]);
    }
  }, [generatedList.length, activeReportType, onSelectReport]);

  const reportTitle = effectiveReportType ? getReportTypeLabel(effectiveReportType) : 'Report';
  const reportSections = analysis?.reportSections ?? [];
  const kpiRows = analysis?.kpiRows ?? [];

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Report Viewer</div>
        <div className="app-section-title">Report Viewer</div>
        <div className="app-section-subtitle">
          Open and view generated reports below. Select a report to view its content.
        </div>
      </div>

      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {generatedList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Generated reports
          </div>
          <div className="tabs" style={{ flexWrap: 'wrap', gap: 6 }}>
            {generatedList.map((id) => (
              <button
                key={id}
                type="button"
                className={`tab-pill ${effectiveReportType === id ? 'tab-pill-active' : ''}`}
                onClick={() => onSelectReport(id)}
              >
                {getReportTypeLabel(id)}
              </button>
            ))}
          </div>
        </div>
      )}

      {generatedList.length === 0 && (
        <div className="report-section">
          <div className="report-body">
            No reports generated yet. Go to the Reporting Engine (step 4) to generate report outputs.
          </div>
        </div>
      )}

      {effectiveReportType === 'overview' && reportSections.length > 0 && (
        <div className="report-layout">
          <div>
            {reportSections
              .filter((s) => s.title !== KPI_SECTION_TITLE && s.title !== 'Credit & ESG')
              .map((section) => (
                <div key={section.title} className="report-section" style={{ marginTop: 10 }}>
                  <div className="report-section-title">{section.title}</div>
                  <div className="report-body">
                    {LIST_SECTION_TITLES.includes(section.title) && section.content.includes('\n') ? (
                      <ul className="bullet-list">
                        {section.content.split('\n').filter(Boolean).map((line, i) => (
                          <li key={i}>{line.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      section.content
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div>
            {reportSections
              .filter((s) => s.title === KPI_SECTION_TITLE || s.title === 'Credit & ESG')
              .map((section) => (
                <div key={section.title} className="report-section" style={{ marginTop: 10 }}>
                  <div className="report-section-title">{section.title}</div>
                  <div className="report-body">{section.content}</div>
                  {section.title === KPI_SECTION_TITLE && kpiRows.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <KpiTable rows={kpiRows} />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {effectiveReportType && effectiveReportType !== 'overview' && (
        <div className="report-section">
          <div className="report-section-title">{reportTitle}</div>
          <div className="report-body">
            This report type is not yet available in V0. Placeholder content for {reportTitle} will be
            implemented in a future release.
          </div>
        </div>
      )}
    </div>
  );
};
