import React, { useEffect, useState } from 'react';
import type { Company, GeneratedReportByType, ReportTypeId } from '../types';
import type { GeneratedReportArtifact } from '../types/reportDocument';
import { getReportTypeLabel } from '../state';
import { downloadReportPdfArtifact } from '../services/reportPdfExport';

export type ReportViewerScreenProps = {
  company: Company;
  generatedReportByType: GeneratedReportByType;
  activeReportType: ReportTypeId | null;
  onSelectReport: (reportType: ReportTypeId) => void;
};

export const ReportViewerScreen: React.FC<ReportViewerScreenProps> = ({
  company,
  generatedReportByType,
  activeReportType,
  onSelectReport,
}) => {
  const generatedList = (['overview', 'valuation', 'industry', 'news'] as const).filter(
    (id) => generatedReportByType[id] != null && generatedReportByType[id]!.pdfBytes.length > 0
  );
  const effectiveReportType =
    activeReportType && generatedReportByType[activeReportType] != null
      ? activeReportType
      : generatedList[0] ?? null;

  const activeArtifact: GeneratedReportArtifact | null =
    effectiveReportType ? generatedReportByType[effectiveReportType] : null;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (generatedList.length > 0 && !activeReportType) {
      onSelectReport(generatedList[0]);
    }
  }, [generatedList.length, activeReportType, onSelectReport]);

  // Single artifact: embed same blob the download uses
  useEffect(() => {
    if (!activeArtifact) {
      setPdfUrl(null);
      return;
    }
    const blob = new Blob([new Uint8Array(activeArtifact.pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeArtifact]);

  const reportTitle = effectiveReportType ? getReportTypeLabel(effectiveReportType) : 'Report';

  const handleDownloadPdf = () => {
    if (activeArtifact) downloadReportPdfArtifact(activeArtifact);
  };

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Report Viewer</div>
        <div className="app-section-title">Report Viewer</div>
        <div className="app-section-subtitle">
          View the generated report PDF below. The same file is used for download—no separate layout.
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
          <div className="tabs" style={{ flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
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
            {activeArtifact && (
              <button
                type="button"
                className="button-ghost"
                style={{ fontSize: 12, marginLeft: 8 }}
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
            )}
          </div>
        </div>
      )}

      {activeArtifact && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10 }}>
          Generated {new Date(activeArtifact.generatedAt).toLocaleString()} · {activeArtifact.title} · sourced from
          Workspace outputs only
        </div>
      )}

      {generatedList.length === 0 && (
        <div className="report-section">
          <div className="report-body">
            No reports generated yet. Go to the Reporting Engine (step 4) to generate report outputs.
          </div>
        </div>
      )}

      {pdfUrl && (
        <div
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            background: '#1a1d35',
            minHeight: 480,
          }}
        >
          <iframe
            title="Generated report PDF"
            src={pdfUrl}
            style={{ width: '100%', height: '70vh', minHeight: 480, border: 'none' }}
          />
        </div>
      )}

      {effectiveReportType && !activeArtifact && (
        <div className="report-section">
          <div className="report-section-title">{reportTitle}</div>
          <div className="report-body">
            This report type is not yet available in V0. Generate from the Reporting Engine when enabled.
          </div>
        </div>
      )}
    </div>
  );
};
