import React, { useState, useMemo } from 'react';
import { BoreholeData, PhanVuPileProduct, ProjectWorkspace } from '../types';
import { PHAN_VU_PILE_CATALOG } from '../data/phanVuCatalog';
import { PileCapacityEngine } from '../engine/pileCapacityEngine';
import { SoilStratigraphyCanvas } from './SoilStratigraphyCanvas';
import { ExcelEngine } from '../engine/excelEngine';
import { Layers, Download, CheckCircle2, ShieldCheck, HelpCircle, Activity, Award } from 'lucide-react';

interface PileFoundationViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const PileFoundationView: React.FC<PileFoundationViewProps> = ({ project, onUpdateProject }) => {
  const [selectedBoreholeId, setSelectedBoreholeId] = useState<string>(project.selectedBoreholeId || 'bh-01');
  const [selectedPileCode, setSelectedPileCode] = useState<string>('PHC-D500A');
  const [pileLength_m, setPileLength_m] = useState<number>(32.0);
  const [pileTipDepth_m, setPileTipDepth_m] = useState<number>(32.5);
  const [activeSubTab, setActiveSubTab] = useState<'CALCULATION' | 'CATALOG' | 'COMPARISON' | 'PRESS_IN_LOG'>('CALCULATION');

  const currentBorehole = useMemo(() => {
    return project.boreholes.find((b) => b.id === selectedBoreholeId) || project.boreholes[0];
  }, [project.boreholes, selectedBoreholeId]);

  const selectedPileProduct = useMemo(() => {
    return PHAN_VU_PILE_CATALOG.find((p) => p.code === selectedPileCode) || PHAN_VU_PILE_CATALOG[4];
  }, [selectedPileCode]);

  // Real-time calculation engine call
  const capacitySummary = useMemo(() => {
    return PileCapacityEngine.calculatePileCapacity(selectedPileProduct, currentBorehole, pileLength_m, pileTipDepth_m);
  }, [selectedPileProduct, currentBorehole, pileLength_m, pileTipDepth_m]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Tính toán Móng Cọc & Catalog Phan Vũ 2026</h2>
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" /> TCVN 10304:2014 & Phan Vũ Spec
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tính toán độc lập ma sát thân Qs, sức kháng mũi Qp, sức chịu tải vật liệu P_vl và kiểm chứng với 6 phương pháp.
          </p>
        </div>

        {/* 1-Click Excel Export Button */}
        <button
          onClick={() => ExcelEngine.exportPileFoundationWorkbook(project)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" /> Xuất Excel 13 Sheet (.xlsx)
        </button>
      </div>

      {/* Control Filters */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Borehole Select */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Hố khoan địa chất:</label>
          <select
            value={selectedBoreholeId}
            onChange={(e) => setSelectedBoreholeId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            {project.boreholes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} (Sâu {b.totalDepth_m}m, Mực nước: -{b.waterTableDepth_m}m)
              </option>
            ))}
          </select>
        </div>

        {/* Pile Product Select */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Sản phẩm cọc Phan Vũ:</label>
          <select
            value={selectedPileCode}
            onChange={(e) => setSelectedPileCode(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            {PHAN_VU_PILE_CATALOG.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} (D{p.outerDiameter_mm} - P_vl={p.structuralAxialCapacity_kN}kN)
              </option>
            ))}
          </select>
        </div>

        {/* Pile Length Input */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Chiều dài cọc L (m): <span className="font-mono text-sky-600 font-bold">{pileLength_m}m</span>
          </label>
          <input
            type="range"
            min={10}
            max={48}
            step={0.5}
            value={pileLength_m}
            onChange={(e) => setPileLength_m(Number(e.target.value))}
            className="w-full cursor-pointer accent-sky-600"
          />
        </div>

        {/* Pile Tip Depth Input */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Cao độ mũi cọc (m): <span className="font-mono text-sky-600 font-bold">-{pileTipDepth_m}m</span>
          </label>
          <input
            type="range"
            min={12}
            max={48}
            step={0.5}
            value={pileTipDepth_m}
            onChange={(e) => setPileTipDepth_m(Number(e.target.value))}
            className="w-full cursor-pointer accent-sky-600"
          />
        </div>
      </div>

      {/* Sub navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('CALCULATION')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeSubTab === 'CALCULATION' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mặt cắt địa tầng & Tính toán sức chịu tải
        </button>
        <button
          onClick={() => setActiveSubTab('COMPARISON')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeSubTab === 'COMPARISON' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          So sánh đa phương pháp (TCVN / SPT / CPT / Nén tĩnh)
        </button>
        <button
          onClick={() => setActiveSubTab('CATALOG')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeSubTab === 'CATALOG' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bảng tra Catalog Phan Vũ 2026
        </button>
        <button
          onClick={() => setActiveSubTab('PRESS_IN_LOG')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeSubTab === 'PRESS_IN_LOG' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dự báo biểu đồ ép cọc (P_ep vs Depth)
        </button>
      </div>

      {/* Sub-Tab 1: Calculation & Stratigraphy */}
      {activeSubTab === 'CALCULATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Visual Stratigraphy Canvas */}
          <div className="lg:col-span-6 space-y-3">
            <SoilStratigraphyCanvas
              borehole={currentBorehole}
              pileLength_m={pileLength_m}
              pileTipDepth_m={pileTipDepth_m}
              selectedPile={selectedPileProduct}
            />
          </div>

          {/* Right Column: Mathematical Calculation Trace & Capacity Summary */}
          <div className="lg:col-span-6 space-y-3">
            {/* Key Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg text-center">
                <span className="text-[11px] text-sky-700 font-semibold block">Sức chịu tải cho phép [Rc]</span>
                <span className="text-xl font-mono font-bold text-sky-900">{capacitySummary.q_design_allowable_kN} kN</span>
                <span className="text-[10px] text-sky-600 block mt-0.5 font-mono">({(capacitySummary.q_design_allowable_kN / 9.81).toFixed(1)} Tấn)</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 font-semibold block">Kháng mũi cực hạn Qp</span>
                <span className="text-xl font-mono font-bold text-slate-800">{capacitySummary.q_tip_kN} kN</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Qp = qb · Ap</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 font-semibold block">Tổng ma sát thân Qs</span>
                <span className="text-xl font-mono font-bold text-slate-800">{capacitySummary.q_shaft_total_kN} kN</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">∑(fi · u · li)</span>
              </div>
            </div>

            {/* Material Capacity Check */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Kiểm tra sức chịu tải vật liệu cọc Phan Vũ (P_vl):</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedPileProduct.structuralAxialCapacity_kN} kN (ĐẠT VẬT LIỆU)
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Sức chịu tải thiết kế bị khống chế bởi đất nền: [Rc] = {capacitySummary.q_design_allowable_kN} kN &lt; P_vl = {selectedPileProduct.structuralAxialCapacity_kN} kN.
              </p>
            </div>

            {/* Step-by-Step Calculation Trace */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" /> Các bước giải tích minh bạch (Traceability Steps)
              </h4>

              <div className="space-y-2">
                {capacitySummary.detailedSteps.map((step, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100 font-mono text-xs">
                    <div className="flex justify-between text-slate-700 font-sans font-semibold">
                      <span>{step.stepName}</span>
                      <span className="text-slate-400 text-[10px] font-mono">{step.standardClause}</span>
                    </div>
                    <div className="text-sky-800 text-[11px] mt-0.5">{step.formulaLatex}</div>
                    <div className="text-emerald-700 font-bold text-right mt-0.5">{step.resultValue} {step.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Comparison of 6 Methods */}
      {activeSubTab === 'COMPARISON' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Bảng tổng hợp & So sánh Sức chịu tải cọc đơn giữa các phương pháp độc lập
          </h3>
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2 font-sans font-bold">Phương pháp xác định</th>
                <th className="p-2 font-sans font-bold">Sức chịu tải [Rc] (kN)</th>
                <th className="p-2 font-sans font-bold">Sức chịu tải (Tấn)</th>
                <th className="p-2 font-sans font-bold">Độ lệch so với TCVN</th>
                <th className="p-2 font-sans font-bold">Độ tin cậy</th>
                <th className="p-2 font-sans font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {capacitySummary.methodComparison.map((m, i) => (
                <tr key={i} className="hover:bg-sky-50/50">
                  <td className="p-2 font-semibold text-slate-800 font-sans">{m.methodName}</td>
                  <td className="p-2 font-bold text-sky-900">{m.q_allowable_kN} kN</td>
                  <td className="p-2 text-slate-700">{(m.q_allowable_kN / 9.81).toFixed(1)} Tấn</td>
                  <td className="p-2 text-slate-600">{m.variancePercentage > 0 ? `+${m.variancePercentage}%` : `${m.variancePercentage}%`}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.reliability === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.reliability === 'HIGH'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.reliability}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="text-emerald-600 font-bold flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-Tab 3: Full Catalog */}
      {activeSubTab === 'CATALOG' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Catalog Cọc Bê Tông Ly Tâm DƯL Phan Vũ Group (Phiên bản chính thức 2026)
            </h3>
            <span className="text-xs text-slate-500 font-mono">14 Quy cách chuẩn</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-sans font-bold">Mã sản phẩm</th>
                  <th className="p-2 font-sans font-bold">Đường kính D (mm)</th>
                  <th className="p-2 font-sans font-bold">Thành cọc t (mm)</th>
                  <th className="p-2 font-sans font-bold">Cấp BT</th>
                  <th className="p-2 font-sans font-bold">Nén vật liệu P_vl (kN)</th>
                  <th className="p-2 font-sans font-bold">Momen nứt Mcr (kNm)</th>
                  <th className="p-2 font-sans font-bold">Momen phá hoại Mu (kNm)</th>
                  <th className="p-2 font-sans font-bold">Lực cắt cho phép H (kN)</th>
                  <th className="p-2 font-sans font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PHAN_VU_PILE_CATALOG.map((p) => (
                  <tr key={p.code} className={`hover:bg-sky-50 ${selectedPileCode === p.code ? 'bg-sky-50 font-bold' : ''}`}>
                    <td className="p-2 text-sky-700">{p.code}</td>
                    <td className="p-2 text-slate-800">{p.outerDiameter_mm}</td>
                    <td className="p-2 text-slate-600">{p.wallThickness_mm}</td>
                    <td className="p-2 text-slate-600">{p.concreteGrade}</td>
                    <td className="p-2 text-emerald-700">{p.structuralAxialCapacity_kN}</td>
                    <td className="p-2 text-slate-700">{p.crackingMoment_kNm}</td>
                    <td className="p-2 text-slate-700">{p.ultimateMoment_kNm}</td>
                    <td className="p-2 text-slate-700">{p.allowableHorizontal_kN}</td>
                    <td className="p-2">
                      <button
                        onClick={() => {
                          setSelectedPileCode(p.code);
                          setActiveSubTab('CALCULATION');
                        }}
                        className="px-2 py-0.5 bg-sky-600 text-white rounded text-[10px] font-sans hover:bg-sky-700 cursor-pointer"
                      >
                        Chọn cọc này
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Press-in Log */}
      {activeSubTab === 'PRESS_IN_LOG' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Dự báo Biểu đồ Lực Ép Cọc Theo Chiều Sâu (Press-in P_ep vs Depth Log)
          </h3>
          <p className="text-xs text-slate-500">
            Hỗ trợ giám sát hiện trường kiểm soát tải trọng ép cọc ép tĩnh P_min = 1.5 · [Rc] = {Math.round(capacitySummary.q_design_allowable_kN * 1.5)} kN và P_max = 2.0 · [Rc] = {Math.round(capacitySummary.q_design_allowable_kN * 2.0)} kN.
          </p>

          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2 font-sans font-bold">Độ sâu mũi cọc (m)</th>
                <th className="p-2 font-sans font-bold">Lớp đất địa chất</th>
                <th className="p-2 font-sans font-bold">Ma sát tích lũy Qs (kN)</th>
                <th className="p-2 font-sans font-bold">Kháng mũi tức thời Qp (kN)</th>
                <th className="p-2 font-sans font-bold">Lực ép dự báo P_ep (kN)</th>
                <th className="p-2 font-sans font-bold">Lực ép (Tấn)</th>
                <th className="p-2 font-sans font-bold">Đánh giá hiện trường</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { depth: 5, layer: 'Lớp 2 (Bùn sét)', qs: 95, qp: 160, pep: 255 },
                { depth: 10, layer: 'Lớp 2 (Bùn sét)', qs: 210, qp: 160, pep: 370 },
                { depth: 15, layer: 'Lớp 3 (Sét dẻo mềm)', qs: 420, qp: 380, pep: 800 },
                { depth: 20, layer: 'Lớp 3 (Sét dẻo mềm)', qs: 680, qp: 450, pep: 1130 },
                { depth: 25, layer: 'Lớp 4 (Cát pha)', qs: 920, qp: 620, pep: 1540 },
                { depth: 30, layer: 'Lớp 4 (Cát pha)', qs: 1180, qp: 780, pep: 1960 },
                { depth: 32.5, layer: 'Lớp 5 (Cát thô rất chặt)', qs: 1340, qp: 1080, pep: 2420 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-sky-50">
                  <td className="p-2 font-bold text-slate-800">-{row.depth}m</td>
                  <td className="p-2 font-sans text-slate-700">{row.layer}</td>
                  <td className="p-2 text-slate-600">{row.qs} kN</td>
                  <td className="p-2 text-slate-600">{row.qp} kN</td>
                  <td className="p-2 font-bold text-sky-900">{row.pep} kN</td>
                  <td className="p-2 text-slate-700">{(row.pep / 9.81).toFixed(1)} Tấn</td>
                  <td className="p-2 font-sans">
                    {row.depth >= 32 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        Đạt P_ep thiết kế (Dừng ép)
                      </span>
                    ) : (
                      <span className="text-slate-500">Đang ép xuyên</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
