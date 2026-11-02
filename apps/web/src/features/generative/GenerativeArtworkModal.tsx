import React, { useRef, useEffect, useState } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { Sparkles, Download, X, RefreshCw, Palette } from 'lucide-react';

interface GenerativeArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerativeArtworkModal: React.FC<GenerativeArtworkModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { events, categories } = useEventStore();
  const [styleMode, setStyleMode] = useState<'orbitals' | 'harmonics' | 'crystallography'>('harmonics');

  // Compute deterministic seed from event IDs and durations
  const seed = events.reduce((acc, ev) => {
    const dur = (new Date(ev.endAt).getTime() - new Date(ev.startAt).getTime()) / 60000;
    return (acc * 31 + ev.title.length + dur) % 1000000;
  }, 1337);

  const drawArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Reset & Deep background
    ctx.fillStyle = '#0B0C0F';
    ctx.fillRect(0, 0, width, height);

    // Pseudorandom generator based on seed
    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Draw background fine grid
    ctx.strokeStyle = 'rgba(41, 45, 53, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render generative motifs based on styleMode
    events.forEach((ev, idx) => {
      const cat = categories.find(c => c.id === ev.categoryId);
      const color = cat?.color || '#D6A66D';
      const dur = Math.max(30, (new Date(ev.endAt).getTime() - new Date(ev.startAt).getTime()) / 60000);
      const radius = (dur / 180) * (width * 0.38);

      ctx.save();
      ctx.translate(cx, cy);

      if (styleMode === 'harmonics') {
        const rings = Math.floor(dur / 20);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;

        for (let r = 0; r < rings; r++) {
          ctx.beginPath();
          const stepRadius = (radius * (r + 1)) / rings;
          for (let theta = 0; theta < Math.PI * 2; theta += 0.05) {
            const wave = Math.sin(theta * (idx + 3) + random() * 2) * 6;
            const x = (stepRadius + wave) * Math.cos(theta);
            const y = (stepRadius + wave) * Math.sin(theta);
            if (theta === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      } else if (styleMode === 'orbitals') {
        const angle = (idx / events.length) * Math.PI * 2;
        const orbRadius = (idx + 1) * 24;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
        ctx.stroke();

        const px = orbRadius * Math.cos(angle);
        const py = orbRadius * Math.sin(angle);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(px, py, (dur / 40) + 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Crystallography
        const sides = 3 + (idx % 6);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = (i / sides) * Math.PI * 2 + (idx * 0.4);
          const px = radius * Math.cos(a);
          const py = radius * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();
    });

    // Central luminous core
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    grad.addColorStop(0, 'rgba(214, 166, 109, 0.4)');
    grad.addColorStop(1, 'rgba(11, 12, 15, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawArtwork, 50);
    }
  }, [isOpen, styleMode, events]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `momentum-artwork-${styleMode}-${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-surface-raised border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent text-xs font-mono font-semibold">
            <Sparkles size={16} />
            <span>GENERATIVE ACTIVITY ARTWORK ENGINE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Canvas Body */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#0B0C0F]">
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="rounded-xl border border-border shadow-2xl"
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
          {/* Style Selector */}
          <div className="flex items-center gap-2">
            {(['harmonics', 'orbitals', 'crystallography'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setStyleMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                  styleMode === mode
                    ? 'bg-surface-raised text-accent border border-accent/40 font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Export PNG */}
          <button
            onClick={handleDownloadPng}
            className="px-4 py-2 rounded-lg bg-accent text-black font-semibold text-xs flex items-center gap-2 hover:bg-[#e4b57e] transition-colors shadow-glow"
          >
            <Download size={14} />
            <span>Export 512×512 PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
