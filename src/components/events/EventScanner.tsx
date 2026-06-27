import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, FlashlightOff, Flashlight, X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EventScannerProps {
  onScanSuccess: (code: string) => void;
  onClose: () => void;
  isScanning: boolean;
}

export function EventScanner({ onScanSuccess, onClose, isScanning }: EventScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isScanning || showManualInput) return;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          () => {
            // Ignore scan errors (no QR found in frame)
          }
        );
        setHasPermission(true);
      } catch (err) {
        console.error('Camera error:', err);
        setHasPermission(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, showManualInput, onScanSuccess]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim().toUpperCase());
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current) {
      try {
        const newState = !torchOn;
        await scannerRef.current.applyVideoConstraints({
          // @ts-ignore - torch is a valid constraint
          advanced: [{ torch: newState }],
        });
        setTorchOn(newState);
      } catch (err) {
        console.error('Torch not supported:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top bg-background/95 backdrop-blur-lg">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="font-serif text-lg font-semibold text-foreground">
          Event Check-In
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Scanner content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {showManualInput ? (
          <div className="w-full max-w-sm space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Keyboard className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Enter Event Code
              </h2>
              <p className="text-muted-foreground">
                Type the code shown at the event
              </p>
            </div>

            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter event code"
              className="h-14 text-lg text-center bg-card border-border rounded-2xl tracking-widest font-mono"
              autoFocus
            />

            <Button
              variant="sunset"
              size="xl"
              className="w-full"
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
            >
              Check In
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowManualInput(false)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera Instead
            </Button>
          </div>
        ) : (
          <>
            {/* Scanner area */}
            <div className="relative w-full max-w-sm aspect-square mb-8">
              {/* Scanner container */}
              <div
                id="qr-reader"
                ref={containerRef}
                className="w-full h-full rounded-3xl overflow-hidden bg-muted"
              />

              {/* Overlay corners */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-3xl" />
              </div>

              {/* Scanning line animation */}
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-primary/50 animate-pulse" />

              {/* Permission denied overlay */}
              {hasPermission === false && (
                <div className="absolute inset-0 bg-muted rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Camera access needed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please allow camera access to scan event QR codes
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center mb-8">
              <p className="text-foreground font-medium mb-1">
                Scan the Amora stamp
              </p>
              <p className="text-sm text-muted-foreground">
                Point your camera at the event QR code
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                variant="soft"
                size="icon"
                onClick={toggleTorch}
                className="h-14 w-14"
              >
                {torchOn ? (
                  <Flashlight className="w-6 h-6" />
                ) : (
                  <FlashlightOff className="w-6 h-6" />
                )}
              </Button>
              <Button
                variant="blush"
                size="lg"
                onClick={() => setShowManualInput(true)}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Enter Code Manually
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Demo hint */}
      <div className="p-6 safe-bottom">
        <p className="text-center text-xs text-muted-foreground">
          Scan the QR code at the event venue, or enter the code manually
        </p>
      </div>
    </div>
  );
}
