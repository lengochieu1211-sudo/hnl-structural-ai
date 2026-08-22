import React, { useRef, useEffect } from 'react';
import { ColumnDesignOutput } from '../engine/columnDesignEngine';

interface PMMCanvasProps {
  columnDesign: ColumnDesignOutput;
  appliedP_kN: number;
  appliedM_kNm: number;
  colName: string;
}

export const PMMInteractionCanvas: React.FC<PMMCanvasProps> = ({
  columnDesign,
  appliedP_kN,
  appliedM_kNm,
  colName,
}) => {
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

    const padLeft = 60;
    const padBottom = 45;
    const padTop = 35;
    const padRight = 30;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const maxP = Math.max(...columnDesign.interactionPoints.map((pt) => pt.p_kN), appliedP_kN) * 1.15;
    const maxM = Math.max(...columnDesign.interactionPoints.map((pt) => pt.m_kNm), appliedM_kNm) * 1.2;

    const scaleX = plotW / maxM;
    const scaleY = plotH / maxP;

    // Grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let p = 0; p <= maxP; p += Math.round(maxP / 5)) {
      const y = padTop + plotH - p * scaleY;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${p} kN`, padLeft - 6, y + 3);
    }

    for (let m = 0; m <= maxM; m += Math.round(maxM / 4)) {
      const x = padLeft + m * scaleX;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${m} kNm`, x, padTop + plotH + 15);
    }

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Capacity Envelope Curve
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
    ctx.beginPath();

    columnDesign.interactionPoints.forEach((pt, idx) => {
      const x = padLeft + pt.m_kNm * scaleX;
      const y = padTop + plotH - Math.max(0, pt.p_kN) * scaleY;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(padLeft, padTop + plotH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw interaction points
    columnDesign.interactionPoints.forEach((pt) => {
      const x = padLeft + pt.m_kNm * scaleX;
      const y = padTop + plotH - Math.max(0, pt.p_kN) * scaleY;
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Applied Load Point (Pu, Mu)
    const loadX = padLeft + appliedM_kNm * scaleX;
    const loadY = padTop + plotH - appliedP_kN * scaleY;

    const isInside = columnDesign.pmm_interaction_ratio <= 1.0;
    ctx.fillStyle = isInside ? '#16a34a' : '#dc2626';
    ctx.beginPath();
    ctx.arc(loadX, loadY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text callout
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`(P=${appliedP_kN}kN, M=${appliedM_kNm}kNm) [Ratio=${columnDesign.pmm_interaction_ratio}]`, loadX + 10, loadY - 6);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`BIỂU ĐỒ TƯƠNG TÁC P-M: ${colName}`, padLeft, 20);

    ctx.fillStyle = isInside ? '#16a34a' : '#dc2626';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(isInside ? 'STATUS: PASS (AN TOÀN)' : 'STATUS: OVERSTRESSED', width - padRight, 20);
  }, [columnDesign, appliedP_kN, appliedM_kNm, colName]);

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-2 shadow-xs">
      <canvas ref={canvasRef} width={480} height={320} className="w-full max-w-[480px] mx-auto block" />
    </div>
  );
};
