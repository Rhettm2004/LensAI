import React from 'react';
import type { Company } from '../types';
import type { AnalysisWorkspaceDocument } from '../types/report';
import { ANALYSIS_WORKSPACE_REVEAL_MS } from '../constants';
import { WidgetLoading } from '../components/widgets';

export type AnalysisWorkspaceScreenProps = {
  company: Company;
  analysisDoc: AnalysisWorkspaceDocument;
  analysisContentReady: boolean;
  onContinueToReporting: () => void;
};

export const AnalysisWorkspaceScreen: React.FC<AnalysisWorkspaceScreenProps> = ({
  company,
  analysisDoc,
  analysisContentReady,
  onContinueToReporting,
}) => {
  const paragraphs = analysisDoc.commentary.split(/\n\n+/).filter(Boolean);
  const summaryPara = paragraphs[0] ?? '';
  const detailParagraphs = paragraphs.slice(1);
  const hasDetail = detailParagraphs.length > 0;

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 4 · Analysis Workspace</div>
        <div className="app-section-title">Analysis Workspace</div>
        <div className="app-section-subtitle">Revenue &amp; earnings analysis</div>
      </div>

      <div style={{ marginBottom: 20, fontSize: 13, color: '#a3a7c2' }}>
        <strong style={{ color: '#e8e9f5' }}>{company.name}</strong> ({company.ticker})
      </div>

      {!analysisContentReady ? (
        <div style={{ marginBottom: 24 }}>
          <WidgetLoading
            label="Preparing analysis…"
            estimatedSeconds={ANALYSIS_WORKSPACE_REVEAL_MS / 1000}
          />
        </div>
      ) : (
        <div className="widget-card" style={{ marginBottom: 24 }}>
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-title">Revenue &amp; earnings analysis</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted, #9094b8)',
                  marginTop: 6,
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                Derived from: Revenue &amp; earnings (Research Workspace)
              </div>
              <div className="widget-subtitle">FY21–FY24</div>
            </div>
            <span className="widget-pill">Analysis</span>
          </div>
          <div className="widget-body">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#d8daf0' }}>{summaryPara}</p>

            {hasDetail && (
              <details style={{ marginTop: 14 }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--color-accent, #8b9cff)',
                    userSelect: 'none',
                  }}
                >
                  View analysis
                </summary>
                <div style={{ marginTop: 14 }}>
                  {detailParagraphs.map((p, i) => (
                    <p
                      key={i}
                      style={{ margin: i === 0 ? 0 : '14px 0 0', fontSize: 14, lineHeight: 1.6, color: '#d8daf0' }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      <button type="button" className="button-primary" onClick={onContinueToReporting} disabled={!analysisContentReady}>
        Continue to Reporting Engine
      </button>
    </div>
  );
};
