import React from 'react';
import { CheckCircle2, Download, Send, Home as HomeIcon, ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { FileCard } from '../components/FileCard';
import type { FileMetadata } from '../core/TransferTypes';

interface SuccessProps {
  blob: Blob;
  metadata: FileMetadata;
  sha256: string;
  onSendAnother: () => void;
  onHome: () => void;
}

export const Success: React.FC<SuccessProps> = ({
  blob,
  metadata,
  sha256,
  onSendAnother,
  onHome,
}) => {
  const handleOpenFile = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = metadata.fileName || 'transferred_file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div className="app-container">
      <div style={{ marginTop: '24px', textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--status-success)',
          }}
        >
          <CheckCircle2 size={36} />
        </div>

        <h1 className="title-large" style={{ fontSize: '28px', marginBottom: '4px' }}>
          Transfer Complete
        </h1>
        <div style={{ fontSize: '14px', color: 'var(--status-success)', fontWeight: 600 }}>
          ✓ File verified via SHA-256
        </div>
      </div>

      <FileCard
        fileName={metadata.fileName}
        fileSize={metadata.fileSize || blob.size}
        fileType={metadata.fileType}
        sha256={sha256}
        isVerified={true}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', marginBottom: '24px' }}>
        <PrimaryButton variant="primary" icon={<Download size={18} />} onClick={handleOpenFile}>
          Save / Open File
        </PrimaryButton>

        <PrimaryButton variant="secondary" icon={<Send size={18} />} onClick={onSendAnother}>
          Send Another File
        </PrimaryButton>

        <PrimaryButton variant="secondary" icon={<HomeIcon size={18} />} onClick={onHome}>
          Return Home
        </PrimaryButton>
      </div>

      <div className="mt-auto text-center">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: 'var(--status-success)' }} />
          <span>Transferred without Internet or device pairing.</span>
        </div>
      </div>
    </div>
  );
};
