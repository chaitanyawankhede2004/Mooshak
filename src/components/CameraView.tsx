import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface CameraViewProps {
  onFrameScanned: (qrText: string) => void;
  isActive: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onFrameScanned, isActive }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let stream: MediaStream | null = null;
    let animFrameId: number;

    const startCamera = async () => {
      try {
        setError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanLoop();
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError('Camera permission denied or camera not available. Please allow camera access to scan QR frames.');
      }
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanLoop = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animFrameId = requestAnimationFrame(scanLoop);
        return;
      }

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          onFrameScanned(code.data);
        }
      }

      animFrameId = requestAnimationFrame(scanLoop);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, onFrameScanned]);

  return (
    <div className="scanner-wrapper">
      {error ? (
        <div style={{ padding: '24px', color: '#FFFFFF', textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: 'var(--status-error)', marginBottom: '12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Camera Access Required</div>
          <div style={{ fontSize: '13px', color: '#CCCCCC', marginBottom: '16px' }}>{error}</div>
          <PrimaryButton variant="secondary" icon={<RefreshCw size={16} />} onClick={() => window.location.reload()}>
            Retry Camera Access
          </PrimaryButton>
        </div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className="scanner-video" />
          <div className="scan-target-box">
            <div className="scan-target-line" />
          </div>
        </>
      )}
    </div>
  );
};
