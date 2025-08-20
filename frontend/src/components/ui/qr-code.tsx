'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  className?: string;
  title?: string;
}

export function QRCodeComponent({ value, size = 128, className = '', title }: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setError(null);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error('QR Code generation error:', err);
      }
    };

    generateQR();
  }, [value, size]);

  if (error) {
    return (
      <div className={`flex items-center justify-center border border-dashed border-gray-300 ${className}`} style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500 text-center">{error}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <p className="text-sm font-medium mb-2 text-center">{title}</p>}
      <canvas 
        ref={canvasRef} 
        className="border border-gray-200 rounded"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export async function generateQRCodeDataURL(value: string, size: number = 128): Promise<string> {
  try {
    return await QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}
