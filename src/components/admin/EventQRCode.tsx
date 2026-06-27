import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
}

export function EventQRCode({ eventId, eventName }: EventQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shortCode, setShortCode] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_events')
      .select('qr_short_code')
      .eq('id', eventId)
      .maybeSingle();
    setShortCode(data?.qr_short_code ?? '');
    setLoading(false);
  };

  useEffect(() => { fetchCode(); }, [eventId]);

  const eventCode = shortCode ? `AMORA-${shortCode}` : '';

  useEffect(() => {
    if (!canvasRef.current || !eventCode) return;
    QRCode.toCanvas(canvasRef.current, eventCode, {
      width: 200, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' },
    }).then(() => {
      setQrDataUrl(canvasRef.current?.toDataURL('image/png') ?? '');
    });
  }, [eventCode]);

  const regenerate = async () => {
    const { data } = await supabase.rpc('gen_hex_qr_code' as any);
    if (!data) { toast.error('Could not regenerate'); return; }
    const { error } = await supabase
      .from('admin_events')
      .update({ qr_short_code: data })
      .eq('id', eventId);
    if (error) { toast.error('Could not save new code'); return; }
    toast.success('New QR code generated');
    fetchCode();
  };

  const handleDownload = () => {
    if (!eventCode) return;
    const printCanvas = document.createElement('canvas');
    QRCode.toCanvas(printCanvas, eventCode, {
      width: 600, margin: 3, color: { dark: '#1a1a1a', light: '#ffffff' },
    }).then(() => {
      const link = document.createElement('a');
      link.download = `amora-event-qr-${eventName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = printCanvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <QrCode className="w-4 h-4 text-primary" />
        Event Check-In QR
      </div>
      {loading ? (
        <div className="w-[200px] h-[200px] bg-muted rounded-xl animate-pulse" />
      ) : eventCode ? (
        <>
          <canvas ref={canvasRef} className="rounded-xl" />
          <p className="text-xs font-mono text-muted-foreground tracking-wider">{eventCode}</p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">No code yet</p>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handleDownload} disabled={!eventCode}>
          <Download className="w-4 h-4" /> Download
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 rounded-xl" onClick={regenerate}>
          <RefreshCw className="w-4 h-4" /> Regenerate
        </Button>
      </div>
    </div>
  );
}
