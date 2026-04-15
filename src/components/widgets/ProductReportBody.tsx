import React, { useState } from 'react';
import type { AnalysisOutput } from '../../types';
import type { WorkspaceDocument } from '../../types/workspace';
import { getNarrativeSectionsFromWorkspace } from '../../utils/workspaceDocument';
import { getNarrativeBlocks } from '../../utils/analysisNarrative';

export type ProductReportBodyProps = {
  analysis: AnalysisOutput;
  /** When true, show only data blocks (workspace). When false, show full narrative (report). */
  dataOnly?: boolean;
  /**
   * When dataOnly, factual preview uses this document (e.g. app state's currentResearchDocument).
   * If omitted under dataOnly, narrative sections are empty — callers should pass the canonical research document.
   */
  researchDocument?: WorkspaceDocument | null;
};

const PREVIEW_MAX_CHARS = 320;

/**
 * Workspace: data-only blocks from WorkspaceDocument. Report: full narrative (data + evaluation).
 */
export const ProductReportBody: React.FC<ProductReportBodyProps> = ({
  analysis,
  dataOnly = false,
  researchDocument = null,
}) => {
  const [expanded, setExpanded] = useState(false);
  const blocks = dataOnly
    ? getNarrativeSectionsFromWorkspace(researchDocument ?? { blocks: [] })
    : getNarrativeBlocks(analysis);
  const fullText = blocks.map((b) => `${b.title}\n${b.content}`).join('\n\n');
  const preview =
    fullText.length > PREVIEW_MAX_CHARS ? `${fullText.slice(0, PREVIEW_MAX_CHARS)}…` : fullText;

  if (blocks.length === 0) {
    return <div style={{ fontSize: 13, color: '#a3a7c2' }}>No data available.</div>;
  }

  if (!expanded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#a3a7c2' }}>
          {dataOnly
            ? 'Preview — factual data only. Evaluation (thesis, pros/cons) is produced when you generate a report.'
            : 'Preview — full narrative (data + evaluation) for the report PDF.'}
        </div>
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{preview}</div>
        {fullText.length > PREVIEW_MAX_CHARS && (
          <button
            type="button"
            className="button-ghost"
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
            onClick={() => setExpanded(true)}
          >
            {dataOnly ? 'Expand full data overview' : 'Expand full report narrative'}
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
        {dataOnly
          ? 'Full data overview. Collapse to return to preview.'
          : 'Full narrative (source for report PDF). Collapse to return to preview.'}
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
