import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, X, FileText } from 'lucide-react';
import { CameraView } from '../components/CameraView';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { FrameAssembler } from '../core/FrameAssembler';
import { FileReconstructor } from '../core/FileReconstructor';
import type { FileMetadata, TransferProgress } from '../core/TransferTypes';

interface ReceiverScannerProps {
  onBack: () => void;
  onSuccess: (blob: Blob, metadata: FileMetadata, sha256: string) => void;
  onError: (errorMsg: string) => void;
}

export const ReceiverScanner: React.FC<ReceiverScannerProps> = ({ onBack, onSuccess, onError }) => {
  const assemblerRef = useRef<FrameAssembler>(new FrameAssembler());
  const [transferDetected, setTransferDetected] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('Waiting for transfer...');
  const [lastNotice, setLastNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<TransferProgress>({
    totalFrames: 0,
    receivedFramesCount: 0,
    percent: 0,
    receivedBytes: 0,
    totalBytes: 0,
    missingFrameNumbers: [],
    duplicateCount: 0,
    corruptedCount: 0,
  });
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleFrameScanned = useCallback(async (qrText: string) => {
    if (isVerifying) return;

    const assembler = assemblerRef.current;
    const res = assembler.addFrame(qrText);

    if (res.accepted || res.duplicate) {
      if (!transferDetected) {
        setTransferDetected(true);
        setStatusMsg('Transfer detected! Receiving frames...');
      }

      const meta = assembler.getMetadata();
      if (meta) {
        setMetadata(meta);
      }

      const currentProgress = assembler.getProgress();
      setProgress(currentProgress);

      if (res.duplicate) {
        setLastNotice('Duplicate frame scanned — ignored.');
      } else {
        setLastNotice(null);
      }

      // Check if complete!
      if (assembler.isComplete()) {
        setIsVerifying(true);
        setStatusMsg('All frames received! Reconstructing file and verifying SHA-256...');

        try {
          // Reconstruct and SHA-256 verify
          const verifiedResult = await FileReconstructor.reconstructAndVerify(assembler);
          onSuccess(verifiedResult.blob, verifiedResult.metadata, verifiedResult.sha256);
        } catch (err: any) {
          console.error('Verification failed:', err);
          onError(err.message || 'File verification failed. The received file does not match the original file.');
        }
      }
    } else if (res.error) {
      setLastNotice('Invalid frame detected — scanning again');
    }
  }, [transferDetected, isVerifying, onSuccess, onError]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app-container">
      <div className="header-nav">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>
        <span className="brand-badge">Receiver</span>
      </div>

      <h1 className="title-large">Receive a file</h1>
      <p className="subtitle" style={{ marginBottom: '12px' }}>
        Point your camera at the sender's screen.
      </p>

      {/* Live Camera Scanner */}
      <CameraView onFrameScanned={handleFrameScanned} isActive={!isVerifying} />

      {!transferDetected ? (
        <div className="card text-center" style={{ padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            Waiting for transfer...
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Align the optical QR display inside the camera frame guide.
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <FileText size={20} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                {metadata?.fileName || 'Incoming File'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatBytes(progress.receivedBytes)} / {formatBytes(progress.totalBytes)}
              </div>
            </div>
          </div>

          <ProgressIndicator
            percent={progress.percent}
            label={`Frames received: ${progress.receivedFramesCount} / ${progress.totalFrames}`}
            sublabel={statusMsg}
          />

          {lastNotice && (
            <div style={{ fontSize: '12px', color: '#888888', marginTop: '6px', fontStyle: 'italic' }}>
              • {lastNotice}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-24">
        <PrimaryButton variant="secondary" icon={<X size={18} />} onClick={onBack}>
          Cancel Transfer
        </PrimaryButton>
      </div>
    </div>
  );
};
