import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, X, ArrowLeft } from 'lucide-react';
import { QRFrame } from '../components/QRFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import type { FileMetadata } from '../core/TransferTypes';
import { FrameEncoder } from '../core/FrameEncoder';

interface SenderTransferProps {
  metadata: FileMetadata;
  chunks: Uint8Array[];
  onCancel: () => void;
}

export const SenderTransfer: React.FC<SenderTransferProps> = ({ metadata, chunks, onCancel }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0); // 0 = Header, 1..N = Data
  const [fps, setFps] = useState<number>(10); // Default 10 FPS

  // Generate all QR string frames upfront for ultra-fast smooth slideshow
  const framesRef = useRef<string[]>([]);

  useEffect(() => {
    const list: string[] = [];
    // Frame 0: Header frame
    list.push(FrameEncoder.encodeHeaderFrame(metadata));
    // Frames 1..N: Data frames
    chunks.forEach((chunk, idx) => {
      list.push(
        FrameEncoder.encodeDataFrame(metadata.transferId, idx + 1, metadata.totalFrames, chunk)
      );
    });
    framesRef.current = list;
  }, [metadata, chunks]);

  useEffect(() => {
    if (!isPlaying || framesRef.current.length === 0) return;

    const intervalMs = 1000 / fps;
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % framesRef.current.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, fps]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const totalFramesCount = metadata.totalFrames;
  const isHeaderFrame = currentFrameIndex === 0;
  const currentDataNum = isHeaderFrame ? 0 : currentFrameIndex;
  const percent = totalFramesCount > 0 ? Math.floor((currentDataNum / totalFramesCount) * 100) : 0;

  const currentQrString = framesRef.current[currentFrameIndex] || '';

  return (
    <div className="app-container">
      <div className="header-nav">
        <button className="back-button" onClick={onCancel}>
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </button>
        <span className="brand-badge">Sender</span>
      </div>

      <div className="text-center" style={{ marginBottom: '16px' }}>
        <h1 className="title-large" style={{ fontSize: '22px' }}>Show this screen to the receiver</h1>
        <p className="subtitle" style={{ marginBottom: '8px', fontSize: '14px' }}>
          Keep the receiver camera pointed at the screen.
        </p>
        <div style={{ fontSize: '12px', fontWeight: 600, color: isPlaying ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
          {isPlaying ? 'Transmitting optical frames...' : 'Transmission Paused'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <QRFrame data={currentQrString} size={250} />
      </div>

      <div className="text-center" style={{ margin: '16px 0' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
          {isHeaderFrame ? 'Header Frame (0)' : `Frame ${currentFrameIndex} / ${totalFramesCount}`}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {percent}%
        </div>
      </div>

      {/* Speed controller */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Frame Rate Speed:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[5, 10, 15].map((speed) => (
              <button
                key={speed}
                onClick={() => setFps(speed)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: fps === speed ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  backgroundColor: fps === speed ? 'var(--accent-blue-light)' : '#FFFFFF',
                  color: fps === speed ? 'var(--accent-blue)' : 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {speed} FPS
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="controls-group mt-auto">
        <PrimaryButton
          variant="secondary"
          icon={isPlaying ? <Pause size={18} /> : <Play size={18} />}
          onClick={togglePlay}
          className="flex-1"
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </PrimaryButton>

        <PrimaryButton
          variant="secondary"
          icon={<X size={18} />}
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </PrimaryButton>
      </div>
    </div>
  );
};
