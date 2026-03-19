import React from 'react';
import type { Company } from '../types';

export type ChooseAnalystScreenProps = {
  company: Company;
  onRunAnalysis: () => void;
};

export const ChooseAnalystScreen: React.FC<ChooseAnalystScreenProps> = ({
  company,
  onRunAnalysis,
}) => (
  <div>
    <div className="app-section-header">
      <div className="app-section-eyebrow">Step 2 · Select Analyst</div>
      <div className="app-section-title">Select Analyst</div>
      <div className="app-section-subtitle">
        Confirm <strong>Fundamental Analyst</strong> to open the Research Workspace for{' '}
        <strong>{company.name}</strong>.
      </div>
    </div>

    <div style={{ marginBottom: 16, fontSize: 12, color: '#a3a7c2' }}>
      Company: <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} ·{' '}
      {company.marketCap}
    </div>

    <div className="screen-grid">
      <div className="analyst-card">
        <div className="analyst-title-row">
          <div className="analyst-title">Fundamental Analyst (Active)</div>
          <span className="analyst-chip">V0 Analyst</span>
        </div>
        <div className="analyst-desc">
          Structured pass over revenue and earnings with short-form interpretation—scoped to what
          LensAI produces today.
        </div>
        <div className="analyst-list">
          <div>Scope includes:</div>
          <ul>
            <li>Revenue analysis</li>
            <li>Earnings analysis</li>
            <li>Basic financial trend interpretation</li>
          </ul>
        </div>
        <div className="analyst-list" style={{ marginTop: 8 }}>
          <div>Outputs:</div>
          <ul>
            <li>Revenue &amp; earnings table</li>
            <li>Financial interpretation</li>
            <li>Valuation report</li>
          </ul>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" className="button-primary" onClick={onRunAnalysis}>
            Continue to Research Workspace
          </button>
        </div>
      </div>

      <div className="analyst-card analyst-card-muted">
        <div className="analyst-title-row">
          <div className="analyst-title">Additional Analysts (Coming Soon)</div>
        </div>
        <div className="analyst-desc">
          Future LensAI versions will introduce specialised analyst perspectives that can be
          composed into multi-lens research workflows.
        </div>
        <div className="analyst-list">
          <div>Examples:</div>
          <ul>
            <li>Valuation Analyst</li>
            <li>Industry Analyst</li>
            <li>Risk Analyst</li>
            <li>News Impact Analyst</li>
          </ul>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button type="button" className="button-secondary button-disabled" disabled>
            Coming soon
          </button>
        </div>
      </div>
    </div>
  </div>
);
