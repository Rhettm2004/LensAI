import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Company } from '../types';
import { CompanyCard } from '../components/cards';
import { searchCompanies } from '../services';

const SEARCH_DEBOUNCE_MS = 280;

export type SelectCompanyScreenProps = {
  /** Current input value (also stored in app state for consistency). */
  tickerInput: string;
  onTickerChange: (value: string) => void;
  onCompanySelect: (company: Company) => void;
};

export const SelectCompanyScreen: React.FC<SelectCompanyScreenProps> = ({
  tickerInput,
  onTickerChange,
  onCompanySelect,
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
    <div className="screen-centered">
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 1 · Company Selection</div>
        <div className="app-section-title">Select Company</div>
        <div className="app-section-subtitle">
          Search by company name or ticker. Results update as you type.
        </div>
      </div>

      <input
        className="input-underline"
        placeholder="Search e.g. Apple, NVDA, micro…"
        value={tickerInput}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onTickerChange(e.target.value)}
        aria-label="Search companies by name or ticker"
      />

      {loading && (
        <div
          style={{
            marginTop: 16,
            fontSize: 13,
            color: 'var(--color-text-muted, #a3a7c2)',
          }}
        >
          Searching…
        </div>
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
          Start typing a company name or ticker to see matches from the curated list.
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
        <div style={{ marginTop: 18, width: '100%', maxWidth: 520 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-muted, #a3a7c2)',
              marginBottom: 10,
            }}
          >
            {results.length} result{results.length === 1 ? '' : 's'} — click to continue
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((company) => (
              <CompanyCard
                key={company.ticker}
                company={company}
                onClick={() => onCompanySelect(company)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
