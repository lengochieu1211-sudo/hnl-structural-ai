import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResults, StoryData } from '../types';
import { Eye, RotateCw, Layers, ShieldCheck, Activity } from 'lucide-react';

interface ModelViewerProps {
  stories: StoryData[];
  analysisResults: AnalysisResults;
}

export const ModelViewer2D3D: React.FC<ModelViewerProps> = ({ stories, analysisResults }) => {
  const [viewMode, setViewMode] = useState<'3D_ISOMETRIC' | 'ELEVATION_XZ' | 'PLAN_XY' | 'DEFORMED_SHAPE'>('3D_ISOMETRIC');
  const [selectedStory, setSelectedStory] = useState<string>('Story 12');
  const [activeMode, setActiveMode] = useState<number>(1);
  const [animTime, setAnimTime] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation loop for dynamic modal deformed shape
  useEffect(() => {
    let animId: number;
    if (viewMode === 'DEFORMED_SHAPE') {
      const loop = () => {
        setAnimTime((t) => t + 0.05);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [viewMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = '#0f172a'; // dark theme for engineering CAD viewport
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const centerX = width / 2;
    const numStories = stories.length || 10;
    const storyH = Math.min(22, (height - 100) / numStories);
    const frameW = 200;

    if (viewMode === '3D_ISOMETRIC' || viewMode === 'DEFORMED_SHAPE') {
      const modeData = analysisResults.modalResults.find((m) => m.mode === activeMode) || analysisResults.modalResults[0];
      const amp = viewMode === 'DEFORMED_SHAPE' ? Math.sin(animTime * 3) * 25 : 0;

      // Draw isometric 3D tower
      const isoX = 0.866;
      const isoY = 0.5;

      for (let s = 0; s < numStories; s++) {
        const elev = (numStories - 1 - s) * storyH;
        const currentStoryName = stories[s]?.name || `Story ${numStories - s}`;
        const isSelected = currentStoryName === selectedStory;
        const driftFactor = (s / numStories);
        const modalDispX = modeData.isDominant === 'TRANS_X' ? amp * (1 - driftFactor) : 0;
        const modalDispY = modeData.isDominant === 'TRANS_Y' ? (amp * 0.7) * (1 - driftFactor) : 0;

        const p1 = { x: centerX - 80 + modalDispX, y: 80 + elev + modalDispY };
        const p2 = { x: centerX + 80 + modalDispX, y: 80 + elev + modalDispY };
        const p3 = { x: centerX + 140 + modalDispX, y: 80 + elev - 35 + modalDispY };
        const p4 = { x: centerX - 20 + modalDispX, y: 80 + elev - 35 + modalDispY };

        // Floor slab fill
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.4)' : 'rgba(30, 41, 59, 0.6)';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();

        // Floor slab edges
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#64748b';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Columns connecting to floor below
        if (s < numStories - 1) {
          const nextElev = (numStories - 1 - (s + 1)) * storyH;
          const nextDriftFactor = ((s + 1) / numStories);
          const nextDispX = modeData.isDominant === 'TRANS_X' ? amp * (1 - nextDriftFactor) : 0;

          // 4 corner columns
          const colPoints = [
            { x: p1.x, y: p1.y, nx: centerX - 80 + nextDispX, ny: 80 + nextElev },
            { x: p2.x, y: p2.y, nx: centerX + 80 + nextDispX, ny: 80 + nextElev },
            { x: p3.x, y: p3.y, nx: centerX + 140 + nextDispX, ny: 80 + nextElev - 35 },
            { x: p4.x, y: p4.y, nx: centerX - 20 + nextDispX, ny: 80 + nextElev - 35 },
          ];

          colPoints.forEach((col) => {
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(col.x, col.y);
            ctx.lineTo(col.nx, col.ny);
            ctx.stroke();
          });

          // Shear wall in center core
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(centerX + modalDispX, 80 + elev - 15 + modalDispY);
          ctx.lineTo(centerX + 40 + modalDispX, 80 + elev - 25 + modalDispY);
          ctx.lineTo(centerX + 40 + nextDispX, 80 + nextElev - 25);
          ctx.lineTo(centerX + nextDispX, 80 + nextElev - 15);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Story label on left
        if (s % 2 === 0 || isSelected) {
          ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
          ctx.font = isSelected ? 'bold 11px system-ui' : '10px system-ui';
          ctx.textAlign = 'right';
          ctx.fillText(currentStoryName, p1.x - 15, p1.y + 4);
        }
      }

      // Base Foundation Slab
      const baseElev = (numStories) * storyH;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 100, 80 + baseElev);
      ctx.lineTo(centerX + 100, 80 + baseElev);
      ctx.lineTo(centerX + 160, 80 + baseElev - 35);
      ctx.lineTo(centerX - 40, 80 + baseElev - 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Piles under mat foundation
      for (let px = -80; px <= 80; px += 40) {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX + px, 80 + baseElev);
        ctx.lineTo(centerX + px, 80 + baseElev + 35);
        ctx.stroke();
      }
    } else if (viewMode === 'ELEVATION_XZ') {
      // 2D Elevation View
      const startY = 80;
      for (let s = 0; s < numStories; s++) {
        const y = startY + s * storyH;
        const currentStoryName = stories[s]?.name || `Story ${numStories - s}`;
        const isSelected = currentStoryName === selectedStory;

        // Beams
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#64748b';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX - frameW / 2, y);
        ctx.lineTo(centerX + frameW / 2, y);
        ctx.stroke();

        // Columns
        if (s < numStories - 1) {
          const nextY = startY + (s + 1) * storyH;
          [-frameW / 2, -frameW / 6, frameW / 6, frameW / 2].forEach((xOffset) => {
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX + xOffset, y);
            ctx.lineTo(centerX + xOffset, nextY);
            ctx.stroke();
          });
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(currentStoryName, centerX - frameW / 2 - 12, y + 4);
      }
    } else if (viewMode === 'PLAN_XY') {
      // Floor Plan View
      const planW = 280;
      const planH = 220;
      const topX = centerX - planW / 2;
      const topY = height / 2 - planH / 2;

      // Slab outline
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.fillRect(topX, topY, planW, planH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(topX, topY, planW, planH);

      // Grid lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let x = topX + 40; x < topX + planW; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, topY - 15);
        ctx.lineTo(x, topY + planH + 15);
        ctx.stroke();
      }
      for (let y = topY + 40; y < topY + planH; y += 45) {
        ctx.beginPath();
        ctx.moveTo(topX - 15, y);
        ctx.lineTo(topX + planW + 15, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Columns (Rectangles)
      ctx.fillStyle = '#38bdf8';
      for (let x = topX + 40; x < topX + planW; x += 50) {
        for (let y = topY + 40; y < topY + planH; y += 45) {
          ctx.fillRect(x - 6, y - 6, 12, 12);
        }
      }

      // Core Shear Wall
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(centerX - 35, height / 2 - 25, 70, 50);
      ctx.strokeRect(centerX - 35, height / 2 - 25, 70, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('CORE WALL W1', centerX, height / 2 + 4);
    }

    // Viewport HUD Info
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`CSI ETABS 3D VIEWPORT [${viewMode}]`, 16, 26);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.fillText(`Stories: ${stories.length} | Nodes: 1420 | Frames: 2840 | Shells: 1120`, 16, 42);

    if (viewMode === 'DEFORMED_SHAPE') {
      const mode = analysisResults.modalResults.find((m) => m.mode === activeMode) || analysisResults.modalResults[0];
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(`Mode ${mode.mode}: T = ${mode.period_sec}s, f = ${mode.frequency_hz}Hz (${mode.isDominant}) - Ux=${mode.ux_pct}%, Uy=${mode.uy_pct}%`, 16, height - 16);
    }
  }, [viewMode, selectedStory, activeMode, animTime, stories, analysisResults]);

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-800 p-3 shadow-lg flex flex-col text-slate-100">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('3D_ISOMETRIC')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === '3D_ISOMETRIC' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> 3D Isometric
          </button>
          <button
            onClick={() => setViewMode('DEFORMED_SHAPE')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'DEFORMED_SHAPE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Mode Shape
          </button>
          <button
            onClick={() => setViewMode('ELEVATION_XZ')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'ELEVATION_XZ' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Elevation (X-Z)
          </button>
          <button
            onClick={() => setViewMode('PLAN_XY')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'PLAN_XY' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Plan (X-Y)
          </button>
        </div>

        {viewMode === 'DEFORMED_SHAPE' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Select Mode:</span>
            {[1, 2, 3, 4].map((m) => (
              <button
                key={m}
                onClick={() => setActiveMode(m)}
                className={`px-2 py-0.5 rounded text-xs font-mono ${
                  activeMode === m ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                M{m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full overflow-hidden rounded-lg bg-slate-950">
        <canvas ref={canvasRef} width={640} height={420} className="w-full h-auto block" />
      </div>
    </div>
  );
};
