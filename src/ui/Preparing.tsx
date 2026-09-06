import React from 'react';
import { ProgressIndicator } from '../components/ProgressIndicator';

interface PreparingProps {
  stageText: string;
  percent: number;
}

export const Preparing: React.FC<PreparingProps> = ({ stageText, percent }) => {
  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <h1 className="title-large" style={{ fontSize: '24px', marginBottom: '8px' }}>
          Preparing transfer
        </h1>
        <p className="subtitle" style={{ marginBottom: '32px' }}>
          Encoding file into optical visual frames...
        </p>

        <ProgressIndicator percent={percent} label={stageText} />

        <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Please keep Mooshak open. Generates optical payload frames locally.
        </div>
      </div>
    </div>
  );
};
