import React, { useState } from 'react';
import { AuditIssue, ProjectWorkspace } from '../types';
import { ModelViewer2D3D } from './ModelViewer2D3D';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Activity, ArrowUpRight, Shield } from 'lucide-react';

interface ModelAuditViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const ModelAuditView: React.FC<ModelAuditViewProps> = ({ project, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'AUDIT_ISSUES' | 'STORY_DRIFT' | 'MODAL_TORSION' | 'BASE_SHEAR'>('AUDIT_ISSUES');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'OK'>('ALL');

  const filteredIssues = project.auditIssues.filter((issue) => {
    if (severityFilter === 'ALL') return true;
    return issue.severity === severityFilter;
  });

  const criticalCount = project.auditIssues.filter((i) => i.severity === 'CRITICAL').length;
  const warningCount = project.auditIssues.filter((i) => i.severity === 'WARNING').length;
  const okCount = project.auditIssues.filter((i) => i.severity === 'OK').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Kiểm Tra Mô Hình (Model Audit) & Kết Quả Phân Tích</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              Automated Integrity Checker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rà soát lỗi hình học, xoắn tầng Mode 1, chuyển vị lệch tầng (Story Drift), phân bổ khối lượng và liên kết chân cột.
          </p>
        </div>

        {/* Audit Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-md font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {criticalCount} Lỗi nghiêm trọng
          </span>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {warningCount} Cảnh báo
          </span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {okCount} Đạt chuẩn
          </span>
        </div>
      </div>

      {/* 3D/2D Visualizer Component */}
      <ModelViewer2D3D stories={project.stories} analysisResults={project.analysisResults} />

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('AUDIT_ISSUES')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'AUDIT_ISSUES' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Danh sách vấn đề rà soát ({project.auditIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('STORY_DRIFT')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'STORY_DRIFT' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chuyển vị lệch tầng (Story Drift)
        </button>
        <button
          onClick={() => setActiveTab('MODAL_TORSION')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'MODAL_TORSION' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chu kỳ & Khối lượng tham gia dao động (Modal)
        </button>
        <button
          onClick={() => setActiveTab('BASE_SHEAR')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'BASE_SHEAR' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lực cắt đáy (Base Shear)
        </button>
      </div>

      {/* Tab 1: Audit Issues List */}
      {activeTab === 'AUDIT_ISSUES' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Lọc mức độ:</span>
            {(['ALL', 'CRITICAL', 'WARNING', 'OK'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  severityFilter === sev ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  issue.severity === 'CRITICAL'
                    ? 'bg-red-50/60 border-red-200'
                    : issue.severity === 'WARNING'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          issue.severity === 'CRITICAL'
                            ? 'bg-red-200 text-red-900'
                            : issue.severity === 'WARNING'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-500">[{issue.category}]</span>
                      <h4 className="text-xs font-bold text-slate-900">{issue.title}</h4>
                    </div>

                    <p className="text-xs text-slate-700">{issue.description}</p>

                    <div className="text-xs text-slate-600 mt-1">
                      <strong>Khuyến nghị giải quyết:</strong> {issue.recommendation}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      📖 Căn cứ tiêu chuẩn: {issue.csiRuleReference}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Story Drift Table */}
      {activeTab === 'STORY_DRIFT' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Bảng kiểm tra chuyển vị lệch tầng (Story Drift Limit = 1/500 = 0.00200)
          </h3>
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2 font-sans font-bold">Tầng (Story)</th>
                <th className="p-2 font-sans font-bold">Tổ hợp tải trọng</th>
                <th className="p-2 font-sans font-bold">Drift Phương X</th>
                <th className="p-2 font-sans font-bold">Drift Phương Y</th>
                <th className="p-2 font-sans font-bold">Giới hạn [Drift]</th>
                <th className="p-2 font-sans font-bold">Kết luận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.analysisResults.storyDrifts.map((d, i) => (
                <tr key={i} className="hover:bg-sky-50">
                  <td className="p-2 font-bold text-slate-800 font-sans">{d.story}</td>
                  <td className="p-2 text-slate-600">{d.loadComb}</td>
                  <td className="p-2 text-sky-900 font-bold">{d.driftX.toFixed(5)}</td>
                  <td className="p-2 text-slate-700">{d.driftY.toFixed(5)}</td>
                  <td className="p-2 text-slate-500">{d.limit.toFixed(5)}</td>
                  <td className="p-2">
                    <span className="text-emerald-700 font-bold font-sans bg-emerald-50 px-2 py-0.5 rounded">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Modal Results Table */}
      {activeTab === 'MODAL_TORSION' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Bảng tổng hợp chu kỳ dao động riêng & Tỷ lệ tham gia khối lượng (Modal Participation)
          </h3>
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2 font-sans font-bold">Mode No.</th>
                <th className="p-2 font-sans font-bold">Chu kỳ T (s)</th>
                <th className="p-2 font-sans font-bold">Tần số f (Hz)</th>
                <th className="p-2 font-sans font-bold">Ux (%)</th>
                <th className="p-2 font-sans font-bold">Uy (%)</th>
                <th className="p-2 font-sans font-bold">Rz (%)</th>
                <th className="p-2 font-sans font-bold">Tổng ∑Ux / ∑Uy</th>
                <th className="p-2 font-sans font-bold">Dạng dao động chính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.analysisResults.modalResults.map((m) => (
                <tr key={m.mode} className="hover:bg-sky-50">
                  <td className="p-2 font-bold text-slate-900 font-sans">Mode {m.mode}</td>
                  <td className="p-2 text-sky-900 font-bold">{m.period_sec}s</td>
                  <td className="p-2 text-slate-600">{m.frequency_hz} Hz</td>
                  <td className="p-2 text-slate-700">{m.ux_pct}%</td>
                  <td className="p-2 text-slate-700">{m.uy_pct}%</td>
                  <td className="p-2 text-slate-700">{m.rz_pct}%</td>
                  <td className="p-2 text-slate-500 font-mono">{m.sum_ux_pct}% / {m.sum_uy_pct}%</td>
                  <td className="p-2 font-sans font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        m.isDominant === 'TRANS_X'
                          ? 'bg-sky-100 text-sky-800'
                          : m.isDominant === 'TRANS_Y'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.isDominant === 'TRANS_X' ? 'Tịnh tiến X' : m.isDominant === 'TRANS_Y' ? 'Tịnh tiến Y' : 'Xoắn (Torsion)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Base Shear */}
      {activeTab === 'BASE_SHEAR' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Tổng phản lực và lực cắt đáy công trình (Base Reaction)</h3>
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2 font-sans font-bold">Trường hợp tải (Load Case)</th>
                <th className="p-2 font-sans font-bold">Lực cắt Vx (kN)</th>
                <th className="p-2 font-sans font-bold">Lực cắt Vy (kN)</th>
                <th className="p-2 font-sans font-bold">Lực nén Fz (kN)</th>
                <th className="p-2 font-sans font-bold">Momen lật Mx (kNm)</th>
                <th className="p-2 font-sans font-bold">Momen lật My (kNm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.analysisResults.baseShear.map((b, i) => (
                <tr key={i} className="hover:bg-sky-50">
                  <td className="p-2 font-bold text-slate-900 font-sans">{b.loadCase}</td>
                  <td className="p-2 text-slate-700">{b.vx_kN.toLocaleString()}</td>
                  <td className="p-2 text-slate-700">{b.vy_kN.toLocaleString()}</td>
                  <td className="p-2 text-sky-900 font-bold">{b.fz_kN.toLocaleString()}</td>
                  <td className="p-2 text-slate-600">{b.mx_kNm.toLocaleString()}</td>
                  <td className="p-2 text-slate-600">{b.my_kNm.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
