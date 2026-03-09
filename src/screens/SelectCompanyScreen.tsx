import React from 'react';
import type { Company } from '../types';
import { CompanyCard } from '../components/cards';

export type SelectCompanyScreenProps = {
  tickerInput: string;
  onTickerChange: (value: string) => void;
  previewCompany: Company | null;
  tickerUnavailable: boolean;
  normalizedTicker: string;
  availableTickers: string[];
  onCompanySelect: (company: Company) => void;
};

export const SelectCompanyScreen: React.FC<SelectCompanyScreenProps> = ({
  tickerInput,
  onTickerChange,
  previewCompany,
  tickerUnavailable,
  normalizedTicker,
  availableTickers,
  onCompanySelect,
}) => {
  const handleCardClick = () => previewCompany && onCompanySelect(previewCompany);

  return (
    <div className="screen-centered">
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 1 · Company Selection</div>
        <div className="app-section-title">Select Company</div>
        <div className="app-section-subtitle">
          Enter a ticker to preview a company card. V0 uses curated placeholder data.
        </div>
      </div>

      <input
        className="input-underline"
        placeholder="Enter ticker (e.g. AAPL, MU, MSFT, NVDA)"
        value={tickerInput}
        maxLength={8}
        onChange={(e) => onTickerChange(e.target.value)}
      />

      {tickerUnavailable && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(220, 80, 80, 0.12)',
            border: '1px solid rgba(220, 80, 80, 0.35)',
            color: '#e8a0a0',
            fontSize: 13,
          }}
        >
          Ticker &quot;{normalizedTicker}&quot; is not available. Available tickers: {availableTickers.join(', ')}.
        </div>
      )}

      {previewCompany && (
        <CompanyCard company={previewCompany} onClick={handleCardClick} />
      )}
    </div>
  );
};
