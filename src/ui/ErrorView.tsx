import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusMessage } from '../components/StatusMessage';

interface ErrorViewProps {
  title?: string;
  errorMessage: string;
  onRetry: () => void;
  onHome: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Transfer Interrupted',
  errorMessage,
  onRetry,
  onHome,
}) => {
  return (
    <div className="app-container">
      <div style={{ marginTop: '32px', textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--status-error)',
          }}
        >
          <AlertTriangle size={36} />
        </div>

        <h1 className="title-large" style={{ fontSize: '26px', marginBottom: '8px' }}>
          {title}
        </h1>
      </div>

      <StatusMessage type="error" message={errorMessage} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', marginBottom: '24px' }}>
        <PrimaryButton variant="primary" icon={<RefreshCw size={18} />} onClick={onRetry}>
          Restart Transfer
        </PrimaryButton>

        <PrimaryButton variant="secondary" icon={<Home size={18} />} onClick={onHome}>
          Return Home
        </PrimaryButton>
      </div>

      <div className="mt-auto text-center">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Check camera alignment and screen brightness before retrying.
        </div>
      </div>
    </div>
  );
};
