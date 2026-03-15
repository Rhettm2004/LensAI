import React, { useState } from 'react';
import type { AnalysisOutput } from '../../types';
import { getNarrativeBlocks } from '../../utils/analysisNarrative';

export type ProductReportBodyProps = {
  analysis: AnalysisOutput;
};

const PREVIEW_MAX_CHARS = 320;

/**
 * Collapsed: concise preview only. Expanded: full narrative — same blocks that feed the PDF.
 */
export const ProductReportBody: React.FC<ProductReportBodyProps> = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const blocks = getNarrativeBlocks(analysis);
  const fullText = blocks.map((b) => `${b.title}\n${b.content}`).join('\n\n');
  const preview =
    fullText.length > PREVIEW_MAX_CHARS ? `${fullText.slice(0, PREVIEW_MAX_CHARS)}…` : fullText;

  if (blocks.length === 0) {
    return <div style={{ fontSize: 13, color: '#a3a7c2' }}>No narrative content available.</div>;
  }

  if (!expanded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#a3a7c2' }}>
          Preview — everything below also appears in the generated report PDF.
        </div>
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{preview}</div>
        {fullText.length > PREVIEW_MAX_CHARS && (
          <button
            type="button"
            className="button-ghost"
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
            onClick={() => setExpanded(true)}
          >
            Expand full Product Report
          </button>
        )}
        {fullText.length <= PREVIEW_MAX_CHARS && (
          <button
            type="button"
            className="button-ghost"
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
            onClick={() => setExpanded(true)}
          >
            Show section layout
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12, color: '#a3a7c2' }}>
        Full narrative (source for report PDF). Collapse to return to preview.
      </div>
      {blocks.map((block) => (
        <div key={block.title} style={{ borderLeft: '3px solid #5B6CFF', paddingLeft: 12 }}>
          <div style={{ fontSize: 13, color: '#f5f6fa', marginBottom: 6 }}>
            <strong>{block.title}</strong>
          </div>
          <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {block.content.includes('\n') ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {block.content
                  .split('\n')
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {line.replace(/^•\s*/, '').trim()}
                    </li>
                  ))}
              </ul>
            ) : (
              block.content
            )}
          </div>
        </div>
      ))}
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
