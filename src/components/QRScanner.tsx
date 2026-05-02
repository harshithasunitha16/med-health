import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Success
        onScan(decodedText);
        scannerRef.current?.clear();
        onClose();
      },
      (error) => {
        // Silently ignore scan errors (they happen constantly during scanning)
      }
    );

    return () => {
      scannerRef.current?.clear().catch(e => console.warn("Scanner clear failed", e));
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-bold">Scan Patient QR</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div id="qr-reader" className="w-full"></div>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">Center the QR code in the box to scan</p>
        </div>
      </div>
    </div>
  );
};
