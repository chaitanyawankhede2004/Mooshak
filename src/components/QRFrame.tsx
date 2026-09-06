import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRFrameProps {
  data: string;
  size?: number;
}

export const QRFrame: React.FC<QRFrameProps> = ({ data, size = 240 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    QRCode.toCanvas(
      canvasRef.current,
      data,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'L',
      },
      (error) => {
        if (error) {
          console.error('QR rendering error:', error);
        }
      }
    );
  }, [data, size]);

  return (
    <div className="qr-canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};
