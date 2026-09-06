import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface StatusMessageProps {
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, title, message }) => {
  const alertClass = type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info';
  const Icon = type === 'error' ? AlertTriangle : type === 'success' ? CheckCircle : Info;

  return (
    <div className={`alert ${alertClass}`}>
      <Icon size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        {title && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</div>}
        <div style={{ wordBreak: 'break-word' }}>{message}</div>
      </div>
    </div>
  );
};
