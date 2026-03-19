import React from 'react';
import type { Company } from '../../types';

export type CompanyCardProps = {
  company: Company;
  onClick: () => void;
  actionLabel?: string;
  selected?: boolean;
};

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onClick,
  actionLabel = 'Continue',
  selected = false,
}) => (
  <button
    type="button"
    className={`company-card${selected ? ' company-card-selected' : ''}`}
    onClick={onClick}
    aria-pressed={selected}
  >
    <div className="company-logo">{company.initial ?? company.ticker?.[0] ?? '?'}</div>
    <div className="company-main">
      <div className="company-name">{company.name}</div>
      <div className="company-ticker">{company.ticker}</div>
      <div className="company-meta">
        {company.exchange} · {company.marketCap} · {company.sector} · {company.industry}
      </div>
    </div>
    <div className="pill-tag">{actionLabel}</div>
  </button>
);
