import React from 'react';

export type WidgetLoadingProps = {
  label: string;
  estimatedSeconds?: number;
};

export const WidgetLoading: React.FC<WidgetLoadingProps> = ({
  label,
  estimatedSeconds,
}) => (
  <div className="widget-loading">
    <div className="spinner-dot-row">
      <span className="spinner-dot" />
      <span className="spinner-dot" />
      <span className="spinner-dot" />
    </div>
    <div style={{ fontSize: 12 }}>{label}</div>
    {estimatedSeconds != null && (
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
        Estimated: ~{estimatedSeconds < 1 ? '<1s' : `${Math.round(estimatedSeconds)}s`}
      </div>
    )}
    <div style={{ fontSize: 11, color: '#7075a0', marginTop: 2 }}>Processing…</div>
    {estimatedSeconds != null && (
      <div
        className="widget-loading-progress-outer"
        style={{ ['--widget-load-duration' as string]: `${estimatedSeconds}s` }}
      >
        <div className="widget-loading-progress-inner" />
      </div>
    )}
  </div>
);
