import React from 'react';

type ErrorCalloutProps = {
  message: string;
  /** Optional action (e.g. Retry). */
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Lightweight error surface consistent with existing muted/red alert styling.
 */
export const ErrorCallout: React.FC<ErrorCalloutProps> = ({
  message,
  actionLabel,
  onAction,
}) => (
  <div
    role="alert"
    style={{
      marginTop: 14,
      padding: '12px 14px',
      borderRadius: 8,
      background: 'rgba(220, 80, 80, 0.12)',
      border: '1px solid rgba(220, 80, 80, 0.35)',
      color: '#e8a0a0',
      fontSize: 13,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      justifyContent: 'space-between',
    }}
  >
    <span>{message}</span>
    {actionLabel && onAction && (
      <button type="button" className="button-ghost" style={{ fontSize: 12 }} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);
