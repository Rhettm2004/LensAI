import React, { useState } from 'react';
import type { ReportBlock } from '../../types/report';
import { ReportBlockRenderer, getReportBlockPreview } from './ReportBlockRenderer';

export type ReportBlockCardProps = {
  block: ReportBlock;
};

export const ReportBlockCard: React.FC<ReportBlockCardProps> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const preview = getReportBlockPreview(block);
  const hasContent = preview.length > 0;

  return (
    <div className="widget-card report-block-card">
      <div className="widget-header">
        <div className="widget-title-group">
          <div className="widget-title">{block.title}</div>
        </div>
      </div>
      <div className="widget-body">
        {!expanded ? (
          <>
            {hasContent ? (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>{preview}</div>
            ) : (
              <div className="report-block-empty">No report content generated yet.</div>
            )}
            <button
              type="button"
              className="button-ghost"
              style={{ alignSelf: 'flex-start', fontSize: 12, marginTop: 10 }}
              onClick={() => setExpanded(true)}
            >
              {hasContent ? 'Expand' : 'Show block'}
            </button>
          </>
        ) : (
          <>
            <ReportBlockRenderer block={block} />
            <button
              type="button"
              className="button-ghost"
              style={{ alignSelf: 'flex-start', fontSize: 12, marginTop: 10 }}
              onClick={() => setExpanded(false)}
            >
              Collapse
            </button>
          </>
        )}
      </div>
    </div>
  );
};
