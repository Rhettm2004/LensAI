import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Company } from '../types';
import { CompanyCard } from '../components/cards';
import { searchCompanies } from '../services';

const SEARCH_DEBOUNCE_MS = 280;

export type SetupScreenProps = {
  tickerInput: string;
  selectedCompany: Company | null;
  onTickerChange: (value: string) => void;
  onCompanySelect: (company: Company) => void;
  onStartResearch: () => void;
};

export const SetupScreen: React.FC<SetupScreenProps> = ({
  tickerInput,
  selectedCompany,
  onTickerChange,
  onCompanySelect,
  onStartResearch,
}) => {
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCompletedForQuery, setSearchCompletedForQuery] = useState<string | null>(null);
  const searchSeq = useRef(0);

  const runSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      searchSeq.current += 1;
      setResults([]);
      setLoading(false);
      setSearchCompletedForQuery(null);
      return;
    }
    const seq = ++searchSeq.current;
    setLoading(true);
    setSearchCompletedForQuery(null);
    try {
      const companies = await searchCompanies(trimmed);
      if (seq !== searchSeq.current) return;
      setResults(companies);
      setSearchCompletedForQuery(trimmed);
    } finally {
      if (seq === searchSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = tickerInput.trim();
    if (trimmed.length === 0) {
      searchSeq.current += 1;
      setResults([]);
      setLoading(false);
      setSearchCompletedForQuery(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      runSearch(tickerInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [tickerInput, runSearch]);

  const trimmedQuery = tickerInput.trim();
  const showInitialState = trimmedQuery.length === 0;
  const showNoResults =
    trimmedQuery.length > 0 &&
    !loading &&
    searchCompletedForQuery === trimmedQuery &&
    results.length === 0;

  return (
    <div className="screen-centered" style={{ alignItems: 'stretch', maxWidth: 560, margin: '0 auto' }}>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 1 · Setup</div>
        <div className="app-section-title">Company &amp; analyst</div>
        <div className="app-section-subtitle">
          Choose a company, then confirm the <strong>Fundamental Analyst</strong> to load the Research Workspace.
        </div>
      </div>

      <input
        className="input-underline"
        placeholder="Search by name or ticker"
        value={tickerInput}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onTickerChange(e.target.value)}
        aria-label="Search companies by name or ticker"
      />

      {loading && (
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted, #a3a7c2)' }}>Searching…</div>
      )}

      {showInitialState && !loading && (
        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-muted, #a3a7c2)',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Start typing to search the company list.
        </div>
      )}

      {showNoResults && (
        <div
          role="status"
          style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#c4c8e0',
            fontSize: 13,
          }}
        >
          No companies match &quot;{trimmedQuery}&quot;. Try another name or ticker.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ marginTop: 18, width: '100%' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted, #a3a7c2)', marginBottom: 10 }}>
            {results.length} result{results.length === 1 ? '' : 's'} — click to select
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((company) => (
              <CompanyCard
                key={company.ticker}
                company={company}
                selected={selectedCompany?.ticker === company.ticker}
                onClick={() => onCompanySelect(company)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="analyst-card" style={{ marginBottom: 16 }}>
          <div className="analyst-title-row">
            <div className="analyst-title">Fundamental Analyst</div>
          </div>
          <div className="analyst-desc">
            Loads revenue and earnings research. Additional analyst lenses will be available in a future release.
          </div>
        </div>
        <button
          type="button"
          className="button-primary"
          disabled={!selectedCompany}
          onClick={onStartResearch}
        >
          Continue to Research Workspace
        </button>
        {!selectedCompany && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#7075a0' }}>Select a company above to continue.</div>
        )}
      </div>
    </div>
  );
};
