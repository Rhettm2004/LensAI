import React from 'react';

export type ProgressIndicatorProps = {
  completedCount: number;
  totalCount: number;
  message: string;
  /** When set, replaces the "N of M widgets complete · message" line */
  statusText?: string;
  ctaCopy?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  ctaDisabled?: boolean;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completedCount,
  totalCount,
  message,
  statusText,
  ctaCopy,
  ctaLabel,
  onCtaClick,
  ctaDisabled = false,
}) => (
  <div className="progress-indicator progress-indicator-stacked">
    <div className="progress-indicator-row">
      <span className="progress-indicator-label">
        {statusText ?? `${completedCount} of ${totalCount} widgets complete · ${message}`}
      </span>
      <div className="progress-bar-outer">
        <div
          className="progress-bar-inner"
          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
        />
      </div>
    </div>
    <div className="progress-indicator-cta">
      {ctaCopy && <p className="progress-indicator-microcopy">{ctaCopy}</p>}
      <button
        type="button"
        className={`button-primary ${ctaDisabled ? 'button-disabled' : ''}`}
        disabled={ctaDisabled}
        onClick={onCtaClick}
      >
        {ctaLabel}
      </button>
    </div>
  </div>
);
