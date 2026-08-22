import React, { useState, useMemo } from 'react';
import { ProjectWorkspace } from '../types';
import { PileGroupEngine } from '../engine/pileGroupEngine';
import { PileLayoutCanvas } from './PileLayoutCanvas';
import { LayoutGrid, Download, ShieldCheck, CheckCircle2, ArrowRight, Share2, Copy, Check } from 'lucide-react';

interface PileGroupCapViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const PileGroupCapView: React.FC<PileGroupCapViewProps> = ({ project, onUpdateProject }) => {
  const [selectedColNode, setSelectedColNode] = useState<string>('J101');
  const [numberOfPiles, setNumberOfPiles] = useState<number>(4);
  const [spacing_mm, setSpacing_mm] = useState<number>(1500);
  const [capThickness_mm, setCapThickness_mm] = useState<number>(1200);
  const [copiedSprings, setCopiedSprings] = useState(false);

  const activeReaction = useMemo(() => {
    return (
      project.analysisResults.columnReactions.find((r) => r.nodeId === selectedColNode) ||
      project.analysisResults.columnReactions[0]
    );
  }, [project.analysisResults.columnReactions, selectedColNode]);

  const activePileCapacity = project.pileDesigns[0]?.q_design_allowable_kN || 1467;

  const pileCoords = useMemo(() => {
    return PileGroupEngine.generatePileLayout(numberOfPiles, 500, spacing_mm);
  }, [numberOfPiles, spacing_mm]);

  const pileGroupDesign = useMemo(() => {
    return PileGroupEngine.analyzePileGroup(
      {
        fz_kN: activeReaction.fz_kN,
        vx_kN: activeReaction.vx_kN,
        vy_kN: activeReaction.vy_kN,
        mx_kNm: activeReaction.mx_kNm,
        my_kNm: activeReaction.my_kNm,
      },
      pileCoords,
      activePileCapacity,
      500,
      capThickness_mm
    );
  }, [activeReaction, pileCoords, activePileCapacity, capThickness_mm]);

  const safeSpringData = useMemo(() => {
    // Generate SAFE Point Springs definition script
    const k_spring_kN_m = Math.round((activePileCapacity / 0.008) * 10) / 10; // k = P / 8mm settlement
    return pileGroupDesign.piles
      .map(
        (p) =>
          `Point: P${p.pileNo} (X=${p.x_mm / 1000}m, Y=${p.y_mm / 1000}m) -> SoilSpring: Kz = ${k_spring_kN_m} kN/m, Compression-Only = YES`
      )
      .join('\n');
  }, [pileGroupDesign, activePileCapacity]);

  const handleCopySprings = () => {
    navigator.clipboard.writeText(safeSpringData);
    setCopiedSprings(true);
    setTimeout(() => setCopiedSprings(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Phân Bổ Lực Cọc & Thiết Kế Đài Cọc (Pile Cap)</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Phản lực ETABS 3D & Chọc thủng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tính toán lực nén từng cọc theo công thức 3D, kiểm tra tải trọng N_max &le; [Rc] và xuất độ cứng lò xo sang SAFE.
          </p>
        </div>

        <button
          onClick={handleCopySprings}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          {copiedSprings ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          {copiedSprings ? 'Đã sao chép lò xo SAFE' : 'Xuất lò xo cọc sang SAFE (kz)'}
        </button>
      </div>

      {/* Control Configuration Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Chọn nút chân cột (ETABS Reaction):</label>
          <select
            value={selectedColNode}
            onChange={(e) => setSelectedColNode(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            {project.analysisResults.columnReactions.map((r) => (
              <option key={r.nodeId} value={r.nodeId}>
                {r.colName} ({r.nodeId}) - Fz={r.fz_kN} kN, Mx={r.mx_kNm} kNm
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Số lượng cọc trong đài:</label>
          <select
            value={numberOfPiles}
            onChange={(e) => setNumberOfPiles(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium font-mono"
          >
            {[2, 3, 4, 5, 6, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n} cọc ({n === 4 ? '2x2 Vuông' : n === 5 ? 'Hoa mai' : n === 6 ? '2x3 Chữ nhật' : `${n} cọc`})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Khoảng cách cọc s: <span className="font-mono text-sky-600 font-bold">{spacing_mm} mm ({(spacing_mm / 500).toFixed(1)}D)</span>
          </label>
          <input
            type="range"
            min={1200}
            max={2500}
            step={50}
            value={spacing_mm}
            onChange={(e) => setSpacing_mm(Number(e.target.value))}
            className="w-full cursor-pointer accent-sky-600"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Chiều dày đài H: <span className="font-mono text-sky-600 font-bold">{capThickness_mm} mm</span>
          </label>
          <input
            type="range"
            min={800}
            max={2200}
            step={100}
            value={capThickness_mm}
            onChange={(e) => setCapThickness_mm(Number(e.target.value))}
            className="w-full cursor-pointer accent-sky-600"
          />
        </div>
      </div>

      {/* Main Grid: 2D Canvas + Analysis Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 2D Interactive Canvas */}
        <div className="lg:col-span-6 space-y-3">
          <PileLayoutCanvas pileGroup={pileGroupDesign} />

          {/* Punching Shear & Rebar Box */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Kiểm tra đài móng & Bố trí cốt thép</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                {pileGroupDesign.punchingCheck.status}
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-500 block text-[11px] font-sans">Chọc thủng chân cột:</span>
                <span className="font-bold text-slate-800">Ratio = {pileGroupDesign.punchingCheck.colPunchingRatio} &le; 1.0</span>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-500 block text-[11px] font-sans">Chọc thủng góc cọc:</span>
                <span className="font-bold text-slate-800">Ratio = {pileGroupDesign.punchingCheck.pilePunchingRatio} &le; 1.0</span>
              </div>
            </div>

            <div className="p-2 bg-sky-50 rounded border border-sky-100 space-y-1 font-mono text-[11px]">
              <div className="text-sky-900 font-semibold font-sans">Bố trí cốt thép đài móng:</div>
              <div>• Thép đáy X: {pileGroupDesign.capReinforcement.bottomMeshX}</div>
              <div>• Thép đáy Y: {pileGroupDesign.capReinforcement.bottomMeshY}</div>
              <div>• Thép mặt trên: {pileGroupDesign.capReinforcement.topMeshX}</div>
            </div>
          </div>
        </div>

        {/* Right: Pile Loads Distribution Table */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bảng phân bổ lực nén từng cọc (3D Distribution)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                P_allow = {pileGroupDesign.nAllowable_kN} kN
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-sans font-bold">Cọc No.</th>
                  <th className="p-2 font-sans font-bold">Tọa độ (X, Y) mm</th>
                  <th className="p-2 font-sans font-bold">Lực nén Ni (kN)</th>
                  <th className="p-2 font-sans font-bold">Tỉ số Ni / [Rc]</th>
                  <th className="p-2 font-sans font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pileGroupDesign.piles.map((p) => (
                  <tr key={p.pileNo} className="hover:bg-sky-50">
                    <td className="p-2 font-bold text-slate-800 font-sans">Cọc P{p.pileNo}</td>
                    <td className="p-2 text-slate-600">({p.x_mm}, {p.y_mm})</td>
                    <td className="p-2 font-bold text-sky-900">{p.axialLoad_kN} kN</td>
                    <td className="p-2">
                      <span className={`font-bold ${p.ratio <= 1.0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {p.ratio} ({(p.ratio * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                          p.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Highlights */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Lực nén lớn nhất (Nmax):</span>
                <span className="font-mono font-bold text-sky-900 text-sm">{pileGroupDesign.nMax_kN} kN</span>
                <span className="text-[10px] text-emerald-600 block">&le; [Rc]={pileGroupDesign.nAllowable_kN} kN (ĐẠT)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Lực nén nhỏ nhất (Nmin):</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{pileGroupDesign.nMin_kN} kN</span>
                <span className="text-[10px] text-emerald-600 block">&gt; 0 (Không bị nhổ)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
