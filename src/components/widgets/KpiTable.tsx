import React from 'react';
import type { KpiRow } from '../../types';

const KPI_PERIOD_ORDER = ['FY21', 'FY22', 'FY23', 'FY24'];

export type KpiTableProps = {
  rows: KpiRow[];
};

export const KpiTable: React.FC<KpiTableProps> = ({ rows }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const periods = safeRows[0]?.periodValues
    ? KPI_PERIOD_ORDER.filter((p) => p in (safeRows[0].periodValues ?? {}))
    : [];
  const usePeriods = periods.length > 0;

  if (safeRows.length === 0) {
    return (
      <div className="kpi-table-empty" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        No KPI data available.
      </div>
    );
  }

  return (
    <table className="kpi-table">
      <thead>
        <tr>
          <th>KPI</th>
          {usePeriods ? periods.map((p) => <th key={p}>{p}</th>) : <th>Value</th>}
        </tr>
      </thead>
      <tbody>
        {safeRows.map((row) => (
          <tr key={row.metric}>
            <td>{row.metric}</td>
            {usePeriods
              ? periods.map((p) => <td key={p}>{row.periodValues?.[p] ?? '—'}</td>)
              : <td>{row.value}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
