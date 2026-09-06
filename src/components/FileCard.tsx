import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface FileCardProps {
  fileName: string;
  fileSize: number;
  fileType?: string;
  sha256?: string;
  isVerified?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  fileName,
  fileSize,
  fileType,
  sha256,
  isVerified,
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-info-box">
      <div className="file-icon-wrapper">
        <FileText size={20} />
      </div>
      <div className="file-details">
        <div className="file-name" title={fileName}>
          {fileName}
        </div>
        <div className="file-meta">
          {formatSize(fileSize)} {fileType ? `• ${fileType}` : ''}
        </div>
        {sha256 && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
            SHA-256: {sha256.substring(0, 16)}...
          </div>
        )}
      </div>
      {isVerified && (
        <div style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>Verified</span>
        </div>
      )}
    </div>
  );
};
