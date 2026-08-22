import React, { useRef, useEffect } from 'react';
import { BoreholeData, PhanVuPileProduct } from '../types';

interface SoilCanvasProps {
  borehole: BoreholeData;
  pileLength_m: number;
  pileTipDepth_m: number;
  selectedPile?: PhanVuPileProduct;
}

export const SoilStratigraphyCanvas: React.FC<SoilCanvasProps> = ({
  borehole,
  pileLength_m,
  pileTipDepth_m,
  selectedPile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getSoilColor = (soilType: string) => {
    if (soilType.includes('Fill')) return '#d6d3d1'; // gray fill
    if (soilType.includes('Clay_Soft')) return '#78716c'; // dark soft clay
    if (soilType.includes('Clay_Stiff')) return '#a8a29e'; // medium clay
    if (soilType.includes('Clay_Hard')) return '#b45309'; // brownish hard clay
    if (soilType.includes('Sand_Medium')) return '#fde047'; // yellowish sand
    if (soilType.includes('Sand_Dense')) return '#eab308'; // golden dense sand
    if (soilType.includes('WeatheredRock')) return '#64748b'; // slate
    return '#cbd5e1';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const maxDepth = Math.max(50, borehole.totalDepth_m || 50);
    const topMargin = 40;
    const bottomMargin = 30;
    const availableHeight = height - topMargin - bottomMargin;
    const scaleY = availableHeight / maxDepth;

    const stratX = 140;
    const stratWidth = 240;
    const sptX = stratX + stratWidth + 20;
    const sptWidth = 140;

    // Background grid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw Title & Borehole Info
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`MẶT CẮT ĐỊA TẦNG - ${borehole.code}`, 15, 24);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Cao độ miệng hố: +${borehole.groundElevation_m}m | Mực nước ngầm: -${borehole.waterTableDepth_m}m`, 240, 24);

    // Draw Soil Layers
    borehole.layers.forEach((layer) => {
      const yTop = topMargin + layer.topDepth_m * scaleY;
      const layerH = layer.thickness_m * scaleY;

      // Soil rectangle
      ctx.fillStyle = getSoilColor(layer.soilType);
      ctx.fillRect(stratX, yTop, stratWidth, layerH);

      // Border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(stratX, yTop, stratWidth, layerH);

      // Depth ticks & labels
      ctx.fillStyle = '#1e293b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`-${layer.bottomDepth_m.toFixed(1)}m`, stratX - 10, yTop + layerH + 3);

      // Soil text inside
      ctx.textAlign = 'left';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`Lớp ${layer.layerNumber}: ${layer.name.substring(0, 22)}...`, stratX + 8, yTop + Math.min(18, layerH / 2 + 4));

      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(`c=${layer.c_kPa} kPa, φ=${layer.phi_deg}°, N-SPT=${layer.spt_N}`, stratX + 8, yTop + Math.min(32, layerH / 2 + 18));

      // Draw SPT Bar on right chart
      const barY = yTop + layerH / 2 - 6;
      const barW = Math.min(sptWidth - 20, (layer.spt_N / 50) * (sptWidth - 30));
      ctx.fillStyle = layer.spt_N >= 30 ? '#16a34a' : layer.spt_N >= 15 ? '#ca8a04' : '#dc2626';
      ctx.fillRect(sptX, barY, Math.max(5, barW), 12);
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`N=${layer.spt_N}`, sptX + Math.max(8, barW) + 6, barY + 10);
    });

    // Groundwater line
    const gwY = topMargin + borehole.waterTableDepth_m * scaleY;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(stratX - 30, gwY);
    ctx.lineTo(stratX + stratWidth + 20, gwY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`▼ Mực nước ngầm (-${borehole.waterTableDepth_m}m)`, stratX + 5, gwY - 4);

    // Draw Overlaid Pile
    const pileTopY = topMargin + (pileTipDepth_m - pileLength_m) * scaleY;
    const pileBottomY = topMargin + pileTipDepth_m * scaleY;
    const pileH = pileBottomY - pileTopY;
    const pileCenter = stratX + stratWidth / 2;
    const pileWidthPx = 16; // representation width

    // Pile body
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(pileCenter - pileWidthPx / 2, pileTopY, pileWidthPx, pileH);
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.strokeRect(pileCenter - pileWidthPx / 2, pileTopY, pileWidthPx, pileH);

    // Pile tip triangle
    ctx.beginPath();
    ctx.moveTo(pileCenter - pileWidthPx / 2, pileBottomY);
    ctx.lineTo(pileCenter + pileWidthPx / 2, pileBottomY);
    ctx.lineTo(pileCenter, pileBottomY + 10);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.stroke();

    // Pile callout label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${selectedPile?.code || 'PHC-D500A'} (L=${pileLength_m}m)`, pileCenter, pileTopY - 8);

    // Tip indicator
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText(`Mũi cọc: -${pileTipDepth_m}m`, pileCenter, pileBottomY + 22);

    // Chart header for SPT
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BIỂU ĐỒ SPT N-VALUE (búa)', sptX, topMargin - 10);
  }, [borehole, pileLength_m, pileTipDepth_m, selectedPile]);

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-2 overflow-x-auto shadow-xs">
      <canvas ref={canvasRef} width={620} height={520} className="w-full max-w-[620px] mx-auto block" />
    </div>
  );
};
