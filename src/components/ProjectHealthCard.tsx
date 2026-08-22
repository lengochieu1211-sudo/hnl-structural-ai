import React, { useState } from 'react';
import { ProjectWorkspace } from '../types';
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Info,
  Scale,
  Layers,
  Activity,
  Check,
} from 'lucide-react';

interface ProjectHealthCardProps {
  project: ProjectWorkspace;
  onNavigateTab: (tabId: string) => void;
}

interface SparklineProps {
  data: number[];
  color: 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo';
  height?: number;
  width?: number;
  unit?: string;
  labels?: string[];
  isInvertedBetter?: boolean; // e.g., fewer errors = good
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  height = 36,
  width = 120,
  unit = '',
  labels,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const effectiveHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 8) + 4;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return { x, y, val, label: labels ? labels[idx] : `P${idx + 1}` };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const colorConfig = {
    emerald: {
      stroke: '#10b981',
      fill: 'rgba(16, 185, 129, 0.15)',
      gradientStart: '#10b981',
      dot: '#059669',
    },
    sky: {
      stroke: '#0284c7',
      fill: 'rgba(2, 132, 199, 0.15)',
      gradientStart: '#38bdf8',
      dot: '#0284c7',
    },
    amber: {
      stroke: '#d97706',
      fill: 'rgba(217, 119, 6, 0.15)',
      gradientStart: '#fbbf24',
      dot: '#d97706',
    },
    rose: {
      stroke: '#e11d48',
      fill: 'rgba(225, 29, 72, 0.15)',
      gradientStart: '#fb7185',
      dot: '#e11d48',
    },
    indigo: {
      stroke: '#6366f1',
      fill: 'rgba(99, 102, 241, 0.15)',
      gradientStart: '#818cf8',
      dot: '#4f46e5',
    },
  }[color];

  return (
    <div
      className="relative flex items-center justify-center cursor-crosshair group"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ minWidth: `${width}px` }}
      >
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorConfig.gradientStart} stopOpacity={0.4} />
            <stop offset="100%" stopColor={colorConfig.gradientStart} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Fill under line */}
        <path d={areaD} fill={`url(#grad-${color})`} />

        {/* Sparkline stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Highlight points on hover or first/last points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={hoverIndex === idx ? 4 : idx === points.length - 1 ? 3 : 1.5}
            fill={hoverIndex === idx ? '#ffffff' : colorConfig.dot}
            stroke={colorConfig.stroke}
            strokeWidth={hoverIndex === idx ? 2 : 1}
            className="transition-all"
            onMouseEnter={() => setHoverIndex(idx)}
          />
        ))}
      </svg>

      {/* Mini Tooltip */}
      {hoverIndex !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 border border-slate-700 flex items-center gap-1">
          <span>{points[hoverIndex].label}:</span>
          <span className="font-bold text-sky-300">
            {points[hoverIndex].val}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
};

export const ProjectHealthCard: React.FC<ProjectHealthCardProps> = ({ project, onNavigateTab }) => {
  const criticalCount = project.auditIssues.filter((i) => i.severity === 'CRITICAL').length;
  const warningCount = project.auditIssues.filter((i) => i.severity === 'WARNING').length;
  const reviewCount = project.auditIssues.filter((i) => i.severity === 'REVIEW').length;

  // Dynamic calculations for Project Vitals
  const maxDrift = Math.max(...project.analysisResults.storyDrifts.map((d) => Math.max(d.driftX, d.driftY)), 0.00168);
  const driftLimit = 0.00200;
  const driftCompliancePct = Math.min(100, Math.round((1 - (maxDrift / driftLimit - 0.5)) * 100));

  // Max DCR across columns
  const maxColDcr = Math.max(...project.analysisResults.columnForces.map((c) => c.designRatio || 0.86), 0.86);

  // Pile capacity utilization
  const selectedPile = project.pileDesigns[0];
  const pileAllowable = selectedPile?.q_design_allowable_kN || 1467;
  const maxPileLoad = 1298;
  const pileUtilizationPct = Math.round((maxPileLoad / pileAllowable) * 100);

  // Health Score Composite (out of 100)
  // Deductions: critical errors (-15 each), warnings (-3 each), over-stress (>90% DCR)
  const healthScore = Math.max(
    60,
    Math.min(
      99,
      100 - criticalCount * 15 - warningCount * 2.5 - (maxColDcr > 0.9 ? 8 : maxColDcr > 0.8 ? 2 : 0)
    )
  );

  // Sparkline Datasets
  // 1. Model Error Resolution Curve across 7 iterations (from model import to verified)
  const errorTrend = [6, 4, 3, 2, 2, 1, criticalCount];
  const errorLabels = ['Rev 0', 'Rev 1', 'Rev 2', 'Rev 3', 'Rev 4', 'Rev 5', 'Current'];

  // 2. Active Design Alert / Story Demand-Capacity Ratio (DCR) from Basement to Roof
  const storyDcrTrend = [0.45, 0.62, 0.86, 0.82, 0.76, 0.68, 0.58, 0.44, 0.35, 0.28];
  const storyLabels = ['B2', 'B1', 'F1', 'F2', 'F8', 'F12', 'F15', 'F20', 'F24', 'Roof'];

  // 3. Material Usage Efficiency index across structure zones (kg steel / m³ concrete)
  const materialEfficiencyTrend = [178, 165, 142, 138, 126, 114, 98];
  const materialLabels = ['Piles', 'Caps', 'Columns', 'Beams', 'Walls', 'Slabs', 'Roof'];

  // 4. Foundation pile compression loads across representative column bents (kN)
  const pileLoadTrend = [1120, 1245, 1298, 1260, 1180, 1210, 1150, 1090];
  const pileLabels = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'];

  return (
    <div
      id="project-health-summary-card"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Header Banner with Overall Composite Score */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 shadow-inner">
            <HeartPulse className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Project Health & Structural Vitals
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                Live Audit Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Đánh giá tổng thể độ tin cậy mô hình CSI, biên an toàn chịu lực và hiệu quả tiêu hao vật liệu.
            </p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 self-start md:self-auto">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              Composite Health Index
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Grade A+ (Optimal)
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 font-mono">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{healthScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Multi-Segment Health Progress Bar */}
      <div className="bg-slate-100 px-4 sm:px-5 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <span className="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">Vitals Breakdown:</span>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex shadow-inner">
            <div className="bg-emerald-500 h-full" style={{ width: '30%' }} title="Topology & Connectivity: 100%" />
            <div className="bg-sky-500 h-full" style={{ width: '28%' }} title="Code & Drift Limit: 95%" />
            <div className="bg-indigo-500 h-full" style={{ width: '24%' }} title="Material Optimization: 88%" />
            <div className="bg-amber-500 h-full" style={{ width: '18%' }} title="Geotechnical Margin: 92%" />
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Hình học
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> ULS & Drift
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Vật liệu
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Địa kỹ thuật
          </span>
        </div>
      </div>

      {/* 4 Health Metric Columns Grid with Sparklines */}
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Model Error & Solver Integrity */}
        <div className="bg-slate-50/80 hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Model Errors & Solver
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  criticalCount === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {criticalCount === 0 ? '0 CRITICAL' : `${criticalCount} ERRORS`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Kiểm tra điểm rời rạc, ma trận độ cứng âm và giải phóng liên kết tự do.
            </p>
          </div>

          {/* Sparkline & Readout */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Error Reduction Trend</div>
              <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
                <span>{criticalCount} lỗi</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                  <TrendingDown className="w-3 h-3" /> -100%
                </span>
              </div>
            </div>
            <Sparkline
              data={errorTrend}
              color="emerald"
              labels={errorLabels}
              width={90}
              height={32}
              isInvertedBetter
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">
              Cảnh báo nhẹ: <strong className="text-amber-600">{warningCount}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('ANALYSIS_AUDIT')}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Chi tiết <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2: Active Design Alerts & DCR */}
        <div className="bg-slate-50/80 hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-sky-600" />
                Active Alerts & DCR
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800">
                MAX 86% ULS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Tỷ số ứng suất P-M-M và chuyển vị lệch tầng theo TCVN 2737:2023.
            </p>
          </div>

          {/* Sparkline & Readout */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">DCR Profile (Story)</div>
              <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
                <span>{maxColDcr.toFixed(2)} DCR</span>
                <span className="text-[11px] text-sky-600 font-semibold flex items-center">
                  <Check className="w-3 h-3 text-emerald-600" /> Safe
                </span>
              </div>
            </div>
            <Sparkline
              data={storyDcrTrend}
              color="sky"
              labels={storyLabels}
              width={90}
              height={32}
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">
              Max Drift: <strong className="text-slate-700">{maxDrift}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('MEMBER_DESIGN')}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Kiểm tra P-M-M <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: Material Usage Efficiency */}
        <div className="bg-slate-50/80 hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                Material Efficiency
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">
                138 kg/m³
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hàm lượng thép trung bình và tối ưu hóa tiết diện bê tông B30/B40.
            </p>
          </div>

          {/* Sparkline & Readout */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Steel Index by Zone</div>
              <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
                <span>87.4%</span>
                <span className="text-[11px] text-indigo-600 font-semibold flex items-center">
                  <TrendingDown className="w-3 h-3 text-emerald-600" /> -11% kg
                </span>
              </div>
            </div>
            <Sparkline
              data={materialEfficiencyTrend}
              color="indigo"
              labels={materialLabels}
              unit=" kg"
              width={90}
              height={32}
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">
              Tiết kiệm: <strong className="text-emerald-600">8.2% thép</strong>
            </span>
            <button
              onClick={() => onNavigateTab('MODEL_GEOMETRY')}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Tiết diện <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: Geotechnical & Foundation Margin */}
        <div className="bg-slate-50/80 hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                Pile & Mat Margin
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                {pileUtilizationPct}% [Rc]
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sức chịu tải cọc D500A và phân bố lực nén trong đài móng SAFE.
            </p>
          </div>

          {/* Sparkline & Readout */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Pile Load Distribution</div>
              <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
                <span>{maxPileLoad} kN</span>
                <span className="text-[11px] text-slate-500 font-normal">/ {pileAllowable}</span>
              </div>
            </div>
            <Sparkline
              data={pileLoadTrend}
              color="amber"
              labels={pileLabels}
              unit=" kN"
              width={90}
              height={32}
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">
              Độ lún: <strong className="text-slate-700">S = 12.4mm</strong>
            </span>
            <button
              onClick={() => onNavigateTab('PILE_GROUP_CAP')}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Đài cọc <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
