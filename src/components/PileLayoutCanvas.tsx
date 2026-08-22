import React, { useRef, useEffect } from 'react';
import { PileGroupDesign } from '../types';

interface PileLayoutCanvasProps {
  pileGroup: PileGroupDesign;
}

export const PileLayoutCanvas: React.FC<PileLayoutCanvasProps> = ({ pileGroup }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const capW = pileGroup.capDimensions.lengthX_mm;
    const capH = pileGroup.capDimensions.lengthY_mm;
    const maxDim = Math.max(capW, capH, 2000);

    const scale = Math.min(width - 100, height - 100) / maxDim;

    // Draw Cap Outline
    const drawCapW = capW * scale;
    const drawCapH = capH * scale;
    const capTopLeftX = centerX - drawCapW / 2;
    const capTopLeftY = centerY - drawCapH / 2;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(capTopLeftX, capTopLeftY, drawCapW, drawCapH);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(capTopLeftX, capTopLeftY, drawCapW, drawCapH);

    // Dimension text
    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${capW} mm`, centerX, capTopLeftY - 8);
    ctx.fillText(`${capH} mm`, capTopLeftX - 25, centerY);

    // Draw Center Column
    const colW = 600 * scale;
    const colH = 600 * scale;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.fillRect(centerX - colW / 2, centerY - colH / 2, colW, colH);
    ctx.strokeRect(centerX - colW / 2, centerY - colH / 2, colW, colH);
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(pileGroup.columnId || 'C25', centerX, centerY + 3);

    // Draw Individual Piles
    const pileRadius = (pileGroup.pileDiameter_mm * scale) / 2;

    pileGroup.piles.forEach((pile) => {
      const px = centerX + (pile.x_mm * scale);
      const py = centerY - (pile.y_mm * scale); // inverted y for canvas

      // Pile circle
      ctx.beginPath();
      ctx.arc(px, py, Math.max(6, pileRadius), 0, Math.PI * 2);

      // Color by ratio
      if (pile.ratio > 1.0) ctx.fillStyle = '#fecaca'; // red
      else if (pile.ratio > 0.85) ctx.fillStyle = '#fed7aa'; // amber
      else ctx.fillStyle = '#bbf7d0'; // green

      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner spun hole (PHC hollow core)
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2, pileRadius * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Pile info label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`P${pile.pileNo}`, px, py - pileRadius - 4);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${pile.axialLoad_kN}kN`, px, py + pileRadius + 11);
      ctx.fillText(`(${Math.round(pile.ratio * 100)}%)`, px, py + pileRadius + 21);
    });

    // Title HUD
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`MẶT BẰNG ĐÀI CỌC: ${pileGroup.capId} (${pileGroup.numberOfPiles} cọc D${pileGroup.pileDiameter_mm})`, 12, 20);

    ctx.fillStyle = pileGroup.nMax_kN <= pileGroup.nAllowable_kN ? '#16a34a' : '#dc2626';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(
      `Nmax = ${pileGroup.nMax_kN} kN <= [Rc] = ${pileGroup.nAllowable_kN} kN (${pileGroup.nMax_kN <= pileGroup.nAllowable_kN ? 'PASS' : 'FAIL'})`,
      width - 12,
      20
    );
  }, [pileGroup]);

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-2 shadow-xs">
      <canvas ref={canvasRef} width={480} height={340} className="w-full max-w-[480px] mx-auto block" />
    </div>
  );
};
