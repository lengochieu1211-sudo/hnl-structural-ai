import React, { useMemo, useState } from 'react';
import { EMPTY_PROJECT, SAMPLE_PROJECT } from './data/sampleProjects';
import { ProjectWorkspace } from './types';
import { DashboardOverview } from './components/DashboardOverview';
import { ModelGeometryView } from './components/ModelGeometryView';
import { ModelAuditView } from './components/ModelAuditView';
import { MemberDesignView } from './components/MemberDesignView';
import { PileFoundationView } from './components/PileFoundationView';
import { HnlPileWorkbench } from './components/HnlPileWorkbench';
import { PileGroupCapView } from './components/PileGroupCapView';
import { CsiConnectorView } from './components/CsiConnectorView';
import { StandardsKnowledgeView } from './components/StandardsKnowledgeView';
import { ExcelReportView } from './components/ExcelReportView';
import { AiAssistantView } from './components/AiAssistantView';
import {
  Activity, BookOpen, Bot, Building2, CheckCircle2, ChevronLeft, ChevronRight,
  CircleDot, FileSpreadsheet, Layers, LayoutGrid, Menu, Server, ShieldCheck,
  FolderOpen, Save, FilePlus2, Wifi, WifiOff,
} from 'lucide-react';

type NavItem = { id: string; label: string; shortLabel: string; icon: React.ElementType; badge?: string; group: string; highlight?: boolean };

export default function App() {
  const [project, setProject] = useState<ProjectWorkspace>(EMPTY_PROJECT);
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveState, setSaveState] = useState<'SAVED' | 'DIRTY'>('SAVED');
  const [csiStatus, setCsiStatus] = useState<Record<string, string>>({ ETABS: 'NOT_RUNNING', SAP2000: 'NOT_RUNNING', SAFE: 'NOT_RUNNING' });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem('hnl.autosave.project', JSON.stringify(project)); localStorage.setItem('hnl.autosave.time', new Date().toISOString()); } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [project]);

  React.useEffect(() => {
    const loadStatus = async () => {
      try {
        const r = await fetch('/api/csi/status', { cache: 'no-store' }); const d = await r.json();
        const next: Record<string,string> = { ETABS: 'NOT_RUNNING', SAP2000: 'NOT_RUNNING', SAFE: 'NOT_RUNNING' };
        for (const x of (d.connectedSoftwares || [])) next[x.name || x.type] = x.status || 'NOT_RUNNING';
        setCsiStatus(next);
      } catch {}
    };
    loadStatus(); const id = setInterval(loadStatus, 5000); return () => clearInterval(id);
  }, []);

  const updateProject = (next: ProjectWorkspace) => { setProject(next); setSaveState('DIRTY'); };

  const newProject = () => {
    if (saveState === 'DIRTY' && !window.confirm('Dự án hiện có thay đổi chưa lưu. Tạo dự án mới?')) return;
    setProject(structuredClone(EMPTY_PROJECT)); setSaveState('SAVED'); setActiveTab('OVERVIEW');
  };

  const saveProject = async () => {
    const api = (window as any).hnlDesktop;
    if (api?.saveProject) { const r = await api.saveProject(project); if (!r?.canceled) setSaveState('SAVED'); return; }
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${project.projectCode || 'HNL_Project'}.hnl.json`; a.click(); URL.revokeObjectURL(a.href); setSaveState('SAVED');
  };

  const openProject = async () => {
    if (saveState === 'DIRTY' && !window.confirm('Dự án hiện có thay đổi chưa lưu. Vẫn mở dự án khác?')) return;
    const api = (window as any).hnlDesktop;
    if (api?.openProject) {
      const r = await api.openProject(); if (!r?.canceled && r?.data) { setProject(r.data); setSaveState('SAVED'); setActiveTab('OVERVIEW'); } return;
    }
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.hnl.json';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; try { setProject(JSON.parse(await f.text())); setSaveState('SAVED'); setActiveTab('OVERVIEW'); } catch { alert('File dự án không hợp lệ.'); } }; input.click();
  };

  const statusDot = (name: string) => csiStatus[name] === 'PROCESS_DETECTED' ? 'bg-amber-500' : csiStatus[name] === 'OAPI_CONNECTED' ? 'bg-emerald-500' : 'bg-slate-400';

  const navItems: NavItem[] = useMemo(() => [
    { id: 'OVERVIEW', label: 'Tổng quan dự án', shortLabel: 'Tổng quan', icon: Building2, group: 'PROJECT' },
    { id: 'MODEL_GEOMETRY', label: 'Hình học & lưới trục', shortLabel: 'Mô hình', icon: LayoutGrid, group: 'MODEL & CSI' },
    { id: 'ANALYSIS_AUDIT', label: 'Rà soát mô hình', shortLabel: 'Audit', icon: Activity, group: 'MODEL & CSI', badge: 'Audit' },
    { id: 'MEMBER_DESIGN', label: 'Thiết kế cấu kiện & SAFE', shortLabel: 'Thiết kế', icon: ShieldCheck, group: 'ANALYSIS & DESIGN' },
    { id: 'HNL_PILE_AI', label: 'HNL Pile AI', shortLabel: 'Pile AI', icon: Layers, group: 'FOUNDATION', badge: 'Phan Vũ', highlight: true },
    { id: 'PILE_FOUNDATION', label: 'Móng cọc & địa chất', shortLabel: 'Móng cọc', icon: Layers, group: 'FOUNDATION', badge: '10304' },
    { id: 'PILE_GROUP_CAP', label: 'Đài cọc & lò xo SAFE', shortLabel: 'Đài cọc', icon: CircleDot, group: 'FOUNDATION' },
    { id: 'CSI_CONNECTOR', label: 'Kết nối ETABS / SAP / SAFE', shortLabel: 'CSI OAPI', icon: Server, group: 'MODEL & CSI', badge: 'OAPI' },
    { id: 'STANDARDS_KNOWLEDGE', label: 'Tiêu chuẩn & Knowledge', shortLabel: 'Tiêu chuẩn', icon: BookOpen, group: 'KNOWLEDGE & AI' },
    { id: 'REPORTS_EXCEL', label: 'Excel & thuyết minh', shortLabel: 'Báo cáo', icon: FileSpreadsheet, group: 'OUTPUT', badge: '.xlsx' },
    { id: 'AI_RESEARCH', label: 'AI Structural Assistant', shortLabel: 'AI Assistant', icon: Bot, group: 'KNOWLEDGE & AI', highlight: true },
  ], []);

  const current = navItems.find(x => x.id === activeTab) || navItems[0];
  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item); return acc;
  }, {});

  const renderNav = () => (
    <nav className="px-2 py-3 space-y-4 overflow-y-auto h-full">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          {!sidebarCollapsed && <div className="px-2 mb-1 text-[10px] font-bold tracking-[0.18em] text-slate-500">{group}</div>}
          <div className="space-y-1">
            {items.map(item => {
              const Icon = item.icon; const active = item.id === activeTab;
              return <button key={item.id} title={sidebarCollapsed ? item.label : undefined}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full rounded-lg flex items-center transition-all ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'} ${active ? 'bg-sky-600 text-white shadow-sm' : item.highlight ? 'bg-sky-950/50 text-sky-300 hover:bg-sky-900/60' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <><span className="text-xs font-semibold text-left flex-1">{item.label}</span>{item.badge && <span className={`text-[9px] px-1.5 py-0.5 rounded ${active ? 'bg-white/15' : 'bg-slate-800'}`}>{item.badge}</span>}</>}
              </button>;
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="h-screen bg-slate-100 text-slate-900 flex overflow-hidden font-sans">
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-[68px]' : 'w-[278px]'} bg-slate-950 text-white border-r border-slate-800 flex-col shrink-0 transition-all duration-200`}>
        <div className="h-[72px] px-3 border-b border-slate-800 flex items-center gap-3">
          <img src="/hnl-logo.png" alt="HNL" className="w-10 h-10 rounded-xl object-cover bg-white shadow" />
          {!sidebarCollapsed && <div className="min-w-0"><div className="font-black tracking-tight">HNL STRUCTURAL AI</div><div className="text-[10px] text-slate-400">Engineering Workstation • v1.3 Desktop</div></div>}
        </div>
        <div className="flex-1 min-h-0">{renderNav()}</div>
        <button onClick={() => setSidebarCollapsed(v => !v)} className="h-11 border-t border-slate-800 text-slate-400 hover:text-white flex items-center justify-center gap-2">
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4"/> : <><ChevronLeft className="w-4 h-4"/><span className="text-xs">Thu gọn menu</span></>}
        </button>
      </aside>

      {mobileMenuOpen && <div className="fixed inset-0 z-50 md:hidden flex"><div className="w-[290px] bg-slate-950 text-white h-full"><div className="h-16 px-4 border-b border-slate-800 flex items-center gap-3"><img src="/hnl-logo.png" className="w-9 h-9 rounded-lg"/><div className="font-bold">HNL STRUCTURAL AI</div></div>{renderNav()}</div><button className="flex-1 bg-black/40" onClick={() => setMobileMenuOpen(false)} /></div>}

      <section className="flex-1 min-w-0 flex flex-col">
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-5 shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100"><Menu className="w-5 h-5"/></button>
            <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="font-bold text-sm sm:text-base truncate">{current.label}</h1><span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">HNL v1.3.0</span></div><p className="text-[11px] text-slate-500 truncate">{project.name} • {project.location} • {project.currentStandardProfile.name}</p></div>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[10px]">
            <button onClick={newProject} className="border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 flex items-center gap-1"><FilePlus2 className="w-3.5 h-3.5"/>Mới</button>
            <button onClick={openProject} className="border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 flex items-center gap-1"><FolderOpen className="w-3.5 h-3.5"/>Mở</button>
            <button onClick={saveProject} className={`border rounded-lg px-2.5 py-1.5 flex items-center gap-1 ${saveState === 'DIRTY' ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 hover:bg-slate-50'}`}><Save className="w-3.5 h-3.5"/>{saveState === 'DIRTY' ? 'Lưu*' : 'Lưu'}</button>
            <button onClick={() => { setProject(structuredClone(SAMPLE_PROJECT)); setSaveState('DIRTY'); }} className="border border-amber-200 bg-amber-50 text-amber-700 rounded-lg px-2.5 py-1.5 hover:bg-amber-100" title="Chỉ nạp dữ liệu minh họa, không phải dữ liệu CSI thật">DEMO</button>
            {['ETABS','SAP2000','SAFE'].map(name => <button key={name} onClick={() => setActiveTab('CSI_CONNECTOR')} className="border border-slate-200 rounded-lg px-2 py-1.5 hover:bg-slate-50" title={`${name}: ${csiStatus[name]}`}><span className={`inline-block w-2 h-2 rounded-full ${statusDot(name)} mr-1.5`}/>{name}</button>)}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-5">
          <div className="max-w-[1680px] mx-auto">
            {activeTab === 'OVERVIEW' && <DashboardOverview project={project} onNavigateTab={setActiveTab} />}
            {activeTab === 'MODEL_GEOMETRY' && <ModelGeometryView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'ANALYSIS_AUDIT' && <ModelAuditView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'MEMBER_DESIGN' && <MemberDesignView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'HNL_PILE_AI' && <HnlPileWorkbench project={project} onUpdateProject={updateProject} />}
            {activeTab === 'PILE_FOUNDATION' && <PileFoundationView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'PILE_GROUP_CAP' && <PileGroupCapView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'CSI_CONNECTOR' && <CsiConnectorView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'STANDARDS_KNOWLEDGE' && <StandardsKnowledgeView project={project} onUpdateProject={updateProject} />}
            {activeTab === 'REPORTS_EXCEL' && <ExcelReportView project={project} />}
            {activeTab === 'AI_RESEARCH' && <AiAssistantView project={project} />}
          </div>
        </main>

        <footer className="h-8 px-4 bg-white border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Desktop local-first • server nội bộ chỉ 127.0.0.1 • DEMO ≠ CSI LIVE</span>
          <span className="hidden sm:inline">HNL Structural AI Workstation</span>
        </footer>
      </section>
    </div>
  );
}
