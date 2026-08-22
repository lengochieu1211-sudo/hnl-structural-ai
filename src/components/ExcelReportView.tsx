import React, { useState } from 'react';
import { ProjectWorkspace } from '../types';
import { ExcelEngine } from '../engine/excelEngine';
import { ReportEngine } from '../engine/reportEngine';
import { FileSpreadsheet, FileText, Download, Printer, Eye, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';

interface ExcelReportViewProps {
  project: ProjectWorkspace;
}

export const ExcelReportView: React.FC<ExcelReportViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'EXCEL_WORKBOOKS' | 'THUYET_MINH_PREVIEW'>('EXCEL_WORKBOOKS');
  const [copiedHtml, setCopiedHtml] = useState(false);

  const hasStructuralData = project.analysisResults.columnReactions.length > 0 || project.analysisResults.beamForces.length > 0 || project.analysisResults.storyDrifts.length > 0;
  const hasPileData = project.pileDesigns.length > 0 && project.boreholes.length > 0;
  const canGenerateReport = hasStructuralData || hasPileData;

  const reportHtml = ReportEngine.generateComprehensiveReportHtml(project);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(reportHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Xuất Bảng Tính Excel & Tự Lập Thuyết Minh 19 Mục</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Công thức sống (Live Formulas)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xuất file Excel đầy đủ công thức giải tích, tiêu chuẩn, địa chất, phản lực ETABS và hồ sơ thuyết minh kỹ thuật.
          </p>
        </div>
      </div>

      {!canGenerateReport && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <strong>Chưa có dữ liệu tính toán thật.</strong> Hãy kết nối CSI/nhập dữ liệu hoặc mở DEMO. Xuất Excel và thuyết minh được khóa để tránh tạo báo cáo chứa số mẫu.
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('EXCEL_WORKBOOKS')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'EXCEL_WORKBOOKS' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hồ sơ Bảng tính Excel (.xlsx)
        </button>
        <button
          onClick={() => setActiveTab('THUYET_MINH_PREVIEW')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'THUYET_MINH_PREVIEW' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Xem trước Thuyết minh Tính toán (19 Mục)
        </button>
      </div>

      {/* Tab 1: Excel Workbooks Export */}
      {activeTab === 'EXCEL_WORKBOOKS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pile Foundation Workbook Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg font-mono text-xs font-bold">
                  13 SHEETS CHUẨN
                </span>
                <span className="text-xs text-slate-500 font-mono">TCVN 10304:2014 & Phan Vũ</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                1. Sổ tay Tính toán Móng Cọc Toàn diện (Pile Foundation Workbook)
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Bao gồm 13 Sheet: <code>01_INPUT</code>, <code>02_BOREHOLE</code>, <code>03_PILE_CATALOG</code>,{' '}
                <code>04_SKIN_FRICTION</code>, <code>05_TIP_RESISTANCE</code>, <code>06_CAPACITY</code>,{' '}
                <code>07_ETABS_REACTION</code>, <code>08_PILE_GROUP</code>, <code>09_PILE_CAP</code>,{' '}
                <code>10_SETTLEMENT</code>, <code>11_LOAD_TEST</code>, <code>12_COMPARISON</code>, <code>13_REFERENCES</code>.
              </p>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                <div>• Cọc: <strong>PHC-D500A (B80, L=32m)</strong></div>
                <div>• Phản lực: <strong>Tổ hợp COMB_ULS_ENVELOPE từ ETABS</strong></div>
                <div>• Tính năng: <strong>Công thức sống, Freeze Header, Auto Filter</strong></div>
              </div>
            </div>

            <button
              onClick={() => hasPileData && ExcelEngine.exportPileFoundationWorkbook(project)}
              disabled={!hasPileData}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Tải về File Excel Móng Cọc (.xlsx)
            </button>
          </div>

          {/* Structural Design Workbook Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-sky-50 text-sky-700 rounded-lg font-mono text-xs font-bold">
                  MULTI-SHEET STR
                </span>
                <span className="text-xs text-slate-500 font-mono">TCVN 5574:2018 & ETABS</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                2. Sổ tay Thiết kế Kết cấu Thân (Structural Design Workbook)
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Bao gồm các Sheet: <code>INPUT</code>, <code>STANDARD</code>, <code>ETABS_DATA</code> (Drift & Modal),{' '}
                <code>BEAM_DESIGN</code> (As gối/nhịp, cốt đai), <code>COLUMN_DESIGN</code> (P-M-M interaction),{' '}
                <code>CHECK</code>, <code>SUMMARY</code>.
              </p>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                <div>• Công trình: <strong>25 Tầng nổi, 2 Tầng hầm</strong></div>
                <div>• Kiểm tra: <strong>Story Drift &le; H/500, Modal T1 &ne; Torsion</strong></div>
                <div>• Thiết kế: <strong>Thép dầm D20/D22, Thép cột D22 (μ=1.85%)</strong></div>
              </div>
            </div>

            <button
              onClick={() => hasStructuralData && ExcelEngine.exportStructuralWorkbook(project)}
              disabled={!hasStructuralData}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Tải về File Excel Kết Cấu (.xlsx)
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Thuyết Minh HTML Preview & Print */}
      {activeTab === 'THUYET_MINH_PREVIEW' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Hồ sơ Thuyết minh Kết cấu & Móng cọc hoàn chỉnh theo quy chuẩn Xây dựng
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyHtml}
                disabled={!canGenerateReport}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHtml ? 'Đã sao chép HTML' : 'Sao chép mã HTML'}
              </button>

              <button
                onClick={handlePrint}
                disabled={!canGenerateReport}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> In / Xuất PDF Thuyết Minh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-h-[600px] overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
          </div>
        </div>
      )}
    </div>
  );
};
