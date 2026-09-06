import React from 'react';

interface ProgressIndicatorProps {
  percent: number;
  label?: string;
  sublabel?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percent,
  label,
  sublabel,
}) => {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="progress-container">
      {(label || percent !== undefined) && (
        <div className="progress-header">
          <span>{label || 'Progress'}</span>
          <span>{safePercent}%</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${safePercent}%` }} />
      </div>
      {sublabel && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {sublabel}
        </div>
      )}
    </div>
  );
};
