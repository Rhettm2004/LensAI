import React from 'react';
import type { ReportBlock } from '../../types/report';
import { getContentSummary } from '../../utils/contentSummary';

const EMPTY_PLACEHOLDER = 'No report content generated yet.';

function NarrativeContent({ content }: { content: string }) {
  if (!content.trim()) {
    return <div className="report-block-empty">{EMPTY_PLACEHOLDER}</div>;
  }
  return (
    <div className="report-block-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
      {content}
    </div>
  );
}

function BulletsContent({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <div className="report-block-empty">{EMPTY_PLACEHOLDER}</div>;
  }
  return (
    <ul className="report-block-list" style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function KpiContent({ rows }: { rows: Array<{ metric: string; value: string }> }) {
  if (rows.length === 0) {
    return <div className="report-block-empty">{EMPTY_PLACEHOLDER}</div>;
  }
  return (
    <div className="report-block-kpi">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <td style={{ padding: '8px 12px 8px 0', color: 'var(--color-text-muted)' }}>{row.metric}</td>
              <td style={{ padding: '8px 0', fontWeight: 500 }}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders block body only (no card). Used by ReportBlockCard. */
export function ReportBlockRenderer({ block }: { block: ReportBlock }) {
  switch (block.blockType) {
    case 'reportNarrative':
      return <NarrativeContent content={block.content} />;
    case 'reportBullets':
      return <BulletsContent items={block.items} />;
    case 'reportKpiHighlights':
      return <KpiContent rows={block.rows} />;
    default:
      return null;
  }
}

/** Returns a short preview string for collapsed state. */
export function getReportBlockPreview(block: ReportBlock): string {
  switch (block.blockType) {
    case 'reportNarrative':
      if (!block.content.trim()) return '';
      return getContentSummary(block.content);
    case 'reportBullets':
      return block.items.length === 0 ? '' : `${block.items.length} item${block.items.length !== 1 ? 's' : ''}`;
    case 'reportKpiHighlights':
      return block.rows.length === 0 ? '' : `${block.rows.length} metric${block.rows.length !== 1 ? 's' : ''}`;
    default:
      return '';
  }
}
