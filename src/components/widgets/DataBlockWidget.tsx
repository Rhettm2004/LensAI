import React, { useState } from 'react';
import { getContentSummary } from '../../utils/contentSummary';

export type DataBlockWidgetProps = {
  /** Full content; collapsed state shows a summary (later AI-generated). */
  content: string;
};

/**
 * Single data block: collapsed = summary of important info, expanded = full data.
 * Summary is derived from content now; will be AI-generated later.
 */
export const DataBlockWidget: React.FC<DataBlockWidgetProps> = ({ content }) => {
  const [expanded, setExpanded] = useState(false);

  if (!content.trim()) {
    return <div style={{ fontSize: 13, color: '#a3a7c2' }}>No data available.</div>;
  }

  const summary = getContentSummary(content);
  const hasMore = content.trim().length > summary.length || summary.endsWith('…');

  if (!expanded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#a3a7c2' }}>
          Summary — expand to see full data.
        </div>
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{summary}</div>
        {hasMore && (
          <button
            type="button"
            className="button-ghost"
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
            onClick={() => setExpanded(true)}
          >
            Expand to see full data
          </button>
        )}
        {!hasMore && (
          <button
            type="button"
            className="button-ghost"
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
            onClick={() => setExpanded(true)}
          >
            Show full content
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12, color: '#a3a7c2' }}>
        Full data. Collapse to return to summary.
      </div>
      <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {content.includes('\n') ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {content
              .split('\n')
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {line.replace(/^•\s*/, '').trim()}
                </li>
              ))}
          </ul>
        ) : (
          content
        )}
      </div>
      <button
        type="button"
        className="button-ghost"
        style={{ alignSelf: 'flex-start', fontSize: 12 }}
        onClick={() => setExpanded(false)}
      >
        Collapse
      </button>
    </div>
  );
};
