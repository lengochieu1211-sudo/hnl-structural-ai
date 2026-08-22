import React from 'react';
import { ProjectWorkspace } from '../types';
import { Building2, Layers, Server, Activity, ShieldCheck, FileSpreadsheet, Bot, ArrowRight, Award, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { ExcelEngine } from '../engine/excelEngine';
import { ProjectHealthCard } from './ProjectHealthCard';

interface DashboardOverviewProps {
  project: ProjectWorkspace;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ project, onNavigateTab }) => {
  const criticalCount = project.auditIssues.filter((i) => i.severity === 'CRITICAL').length;
  const warningCount = project.auditIssues.filter((i) => i.severity === 'WARNING').length;
  const pileCapacity = project.pileDesigns[0]?.q_design_allowable_kN || 1467;

  return (
    <div className="space-y-4">
      {/* Hero Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-300 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border border-sky-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              STRUCTURAL AI WORKSTATION v2026.1
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {project.projectCode}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            {project.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {project.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => onNavigateTab('PILE_FOUNDATION')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Layers className="w-4 h-4" /> Tính Móng Cọc Phan Vũ <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => ExcelEngine.exportPileFoundationWorkbook(project)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" /> Xuất Bảng Tính Excel (13 Sheet)
            </button>

            <button
              onClick={() => onNavigateTab('CSI_CONNECTOR')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <Server className="w-4 h-4 text-sky-400" /> Trạng thái CSI Live OAPI
            </button>
          </div>
        </div>

        {/* Decorative Grid Effect in background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1: Building Height & Stories */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Quy mô công trình</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-slate-900">25F + 2 Hầm</div>
            <div className="text-[11px] text-slate-500">Cao độ đỉnh H = 85.0m</div>
          </div>
        </div>

        {/* KPI 2: Modal Period */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Chu kỳ cơ bản T1</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-emerald-700">T1 = 1.84s</div>
            <div className="text-[11px] text-slate-500">Tịnh tiến X (Ux = 68.2%)</div>
          </div>
        </div>

        {/* KPI 3: Story Drift Check */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Chuyển vị lệch tầng</span>
            <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-sky-900">0.00168</div>
            <div className="text-[11px] text-emerald-600 font-semibold">&le; Limit 0.00200 (PASS)</div>
          </div>
        </div>

        {/* KPI 4: Pile Capacity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Cọc Phan Vũ D500A</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-sky-900">[Rc] = {pileCapacity} kN</div>
            <div className="text-[11px] text-slate-500">L=32m, Cát chặt N=35</div>
          </div>
        </div>
      </div>

      {/* Project Health Summary Card with Sparklines */}
      <ProjectHealthCard project={project} onNavigateTab={onNavigateTab} />

      {/* Modules Quick Launch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Module 0: HNL PILE AI Workbench */}
        <div
          onClick={() => onNavigateTab('HNL_PILE_AI')}
          className="bg-slate-900 text-white p-4 rounded-xl border border-sky-500/50 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer group space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-sky-600 rounded-lg text-white group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold font-mono px-2 py-0.5 rounded border border-sky-400/30">
              NEW WORKBENCH
            </span>
          </div>
          <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
            HNL PILE AI – Cọc & Móng
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tra cứu Phan Vũ Group DB, Smart Pile Object, HNLPILEDRAW CAD, Tọa độ WCS/UCS, As-built & A1 Shopdrawing.
          </p>
        </div>

        {/* Module 1: Geotechnical & Piles */}
        <div
          onClick={() => onNavigateTab('PILE_FOUNDATION')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-mono">TCVN 10304:2014</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
            Địa Chất & Sức Chịu Tải Cọc Phan Vũ
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Biểu đồ địa tầng mặt cắt đất nền, tính toán ma sát thân $Q_s$, mũi cọc $Q_p$, và so sánh 6 phương pháp.
          </p>
        </div>

        {/* Module 2: Pile Group & Cap */}
        <div
          onClick={() => onNavigateTab('PILE_GROUP_CAP')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-mono">ETABS 3D Reactions</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
            Đài Cọc & Lực Nén Từng Cọc 3D
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Phân bố lực nén cọc theo tải 3D, kiểm tra N_max &le; [Rc], chọc thủng đài và xuất độ cứng lò xo SAFE.
          </p>
        </div>

        {/* Module 3: Model Audit & Structural Design */}
        <div
          onClick={() => onNavigateTab('ANALYSIS_AUDIT')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs text-red-600 font-bold font-mono">
              {criticalCount > 0 ? `${criticalCount} Cảnh báo` : 'Tất cả đạt'}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
            Rà Soát Mô Hình & Kiểm Tra Cấu Kiện
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Phát hiện xoắn tầng, kiểm tra dầm cột (P-M-M interaction), và đối chiếu chọc thủng độc lập với SAFE.
          </p>
        </div>
      </div>
    </div>
  );
};
