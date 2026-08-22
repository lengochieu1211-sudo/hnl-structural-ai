import React, { useState, useMemo } from 'react';
import { ProjectWorkspace } from '../types';
import { BeamDesignEngine, BeamDesignInput } from '../engine/beamDesignEngine';
import { ColumnDesignEngine, ColumnDesignInput } from '../engine/columnDesignEngine';
import { PunchingEngine, PunchingInput } from '../engine/punchingEngine';
import { PMMInteractionCanvas } from './PMMInteractionCanvas';
import { ShieldCheck, AlertTriangle, CheckCircle2, Sliders, FileText, Check } from 'lucide-react';

interface MemberDesignViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const MemberDesignView: React.FC<MemberDesignViewProps> = ({ project, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'COLUMN' | 'BEAM' | 'PUNCHING_SAFE_CHECK'>('COLUMN');

  // Column Design Interactive State
  const [colB_mm, setColB_mm] = useState<number>(600);
  const [colH_mm, setColH_mm] = useState<number>(600);
  const [colP_kN, setColP_kN] = useState<number>(4850);
  const [colMx_kNm, setColMx_kNm] = useState<number>(240);
  const [colMy_kNm, setColMy_kNm] = useState<number>(185);

  // Beam Design Interactive State
  const [beamB_mm, setBeamB_mm] = useState<number>(300);
  const [beamH_mm, setBeamH_mm] = useState<number>(600);
  const [beamMNeg_kNm, setBeamMNeg_kNm] = useState<number>(245);
  const [beamMPos_kNm, setBeamMPos_kNm] = useState<number>(170);
  const [beamV_kN, setBeamV_kN] = useState<number>(185);

  // Punching Interactive State
  const [punchingColName, setPunchingColName] = useState<string>('C25');
  const [slabThickness_mm, setSlabThickness_mm] = useState<number>(250);
  const [punchingForce_kN, setPunchingForce_kN] = useState<number>(1250);
  const [safeRatio, setSafeRatio] = useState<number>(0.72);

  // Calculate results dynamically
  const colDesignOutput = useMemo(() => {
    return ColumnDesignEngine.designColumn({
      b_mm: colB_mm,
      h_mm: colH_mm,
      length_m: 3.4,
      p_kN: colP_kN,
      mx_kNm: colMx_kNm,
      my_kNm: colMy_kNm,
      concreteGrade: 'B35',
      steelGrade: 'CB500',
    });
  }, [colB_mm, colH_mm, colP_kN, colMx_kNm, colMy_kNm]);

  const beamDesignOutput = useMemo(() => {
    return BeamDesignEngine.designRectangularBeam({
      b_mm: beamB_mm,
      h_mm: beamH_mm,
      cover_mm: 30,
      mNeg_kNm: beamMNeg_kNm,
      mPos_kNm: beamMPos_kNm,
      vMax_kN: beamV_kN,
      torsion_kNm: 20,
      concreteGrade: 'B30',
      steelGrade: 'CB400',
    });
  }, [beamB_mm, beamH_mm, beamMNeg_kNm, beamMPos_kNm, beamV_kN]);

  const punchingOutput = useMemo(() => {
    return PunchingEngine.checkPunchingShear({
      columnLabel: punchingColName,
      story: 'Story 2 (Podium)',
      colWidth_mm: 600,
      colHeight_mm: 600,
      slabThickness_mm,
      cover_mm: 25,
      axialPunchingForce_kN: punchingForce_kN,
      unbalancedMoment_kNm: 45,
      columnLocation: 'Interior',
      concreteGrade: 'B30',
      safeCalculatedRatio: safeRatio,
    });
  }, [punchingColName, slabThickness_mm, punchingForce_kN, safeRatio]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Thiết Kế Cấu Kiện BTCT & Kiểm Tra Độc Lập</h2>
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              TCVN 5574:2018 & ACI 318-19
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thiết kế dầm, cột (P-M-M Diagram) và cơ chế Double-Check đối chiếu độc lập với kết quả SAFE.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('COLUMN')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'COLUMN' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cột & Biểu đồ tương tác P-M-M
        </button>
        <button
          onClick={() => setActiveTab('BEAM')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'BEAM' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dầm & Cốt thép uốn/cắt
        </button>
        <button
          onClick={() => setActiveTab('PUNCHING_SAFE_CHECK')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'PUNCHING_SAFE_CHECK' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kiểm tra Chọc thủng (SAFE vs Tính độc lập)
        </button>
      </div>

      {/* Tab 1: Column Design */}
      {activeTab === 'COLUMN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-600" /> Thông số thiết kế cột
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bề rộng b (mm):</label>
                  <input
                    type="number"
                    value={colB_mm}
                    onChange={(e) => setColB_mm(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chiều cao h (mm):</label>
                  <input
                    type="number"
                    value={colH_mm}
                    onChange={(e) => setColH_mm(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Lực nén dọc trục P (kN): <span className="font-mono text-sky-600 font-bold">{colP_kN} kN</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={100}
                  value={colP_kN}
                  onChange={(e) => setColP_kN(Number(e.target.value))}
                  className="w-full cursor-pointer accent-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Momen Mx (kNm):</label>
                  <input
                    type="number"
                    value={colMx_kNm}
                    onChange={(e) => setColMx_kNm(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Momen My (kNm):</label>
                  <input
                    type="number"
                    value={colMy_kNm}
                    onChange={(e) => setColMy_kNm(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Tỉ số tương tác P-M-M:</span>
                <span
                  className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                    colDesignOutput.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {colDesignOutput.pmm_interaction_ratio} ({colDesignOutput.status})
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 font-mono">
                <div>• Cốt thép yêu cầu: <strong>{colDesignOutput.totalAs_cm2} cm²</strong> (μ = {colDesignOutput.mu_pct}%)</div>
                <div>• Phương án bố trí: <strong className="text-sky-700">{colDesignOutput.rebarConfig}</strong></div>
                <div>• Độ mảnh λ = {colDesignOutput.slenderness_lambda} (Hệ số uốn dọc η = {colDesignOutput.eta_bucklingCoeff})</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PMMInteractionCanvas
              columnDesign={colDesignOutput}
              appliedP_kN={colP_kN}
              appliedM_kNm={Math.sqrt(colMx_kNm * colMx_kNm + colMy_kNm * colMy_kNm)}
              colName={`Cột ${colB_mm}x${colH_mm} (B35 / CB500)`}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Beam Design */}
      {activeTab === 'BEAM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">Thông số nội lực dầm</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rộng b (mm):</label>
                <input
                  type="number"
                  value={beamB_mm}
                  onChange={(e) => setBeamB_mm(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cao h (mm):</label>
                <input
                  type="number"
                  value={beamH_mm}
                  onChange={(e) => setBeamH_mm(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">M gối (kNm):</label>
                <input
                  type="number"
                  value={beamMNeg_kNm}
                  onChange={(e) => setBeamMNeg_kNm(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">M nhịp (kNm):</label>
                <input
                  type="number"
                  value={beamMPos_kNm}
                  onChange={(e) => setBeamMPos_kNm(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lực cắt V (kN):</label>
                <input
                  type="number"
                  value={beamV_kN}
                  onChange={(e) => setBeamV_kN(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Kết quả tính toán cốt thép dầm</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                {beamDesignOutput.status}
              </span>
            </h3>

            <div className="space-y-2 font-mono">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 font-sans block text-[11px]">Thép gối (As Top):</span>
                <span className="font-bold text-slate-900">{beamDesignOutput.asTop_cm2} cm²</span> &rarr;{' '}
                <span className="text-sky-700 font-bold">{beamDesignOutput.asTopRebarText}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 font-sans block text-[11px]">Thép nhịp (As Bottom):</span>
                <span className="font-bold text-slate-900">{beamDesignOutput.asBot_cm2} cm²</span> &rarr;{' '}
                <span className="text-sky-700 font-bold">{beamDesignOutput.asBotRebarText}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 font-sans block text-[11px]">Cốt đai chịu cắt:</span>
                <span className="text-emerald-700 font-bold">{beamDesignOutput.stirrupText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SAFE Punching Double Check */}
      {activeTab === 'PUNCHING_SAFE_CHECK' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Hệ thống kiểm tra độc lập (Double Check Engine: SAFE vs TCVN)
            </h3>
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold ${
                punchingOutput.doubleCheckStatus === 'PASS_MATCH'
                  ? 'bg-emerald-100 text-emerald-800'
                  : punchingOutput.doubleCheckStatus === 'CHECK_REQUIRED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              STATUS: {punchingOutput.doubleCheckStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cột kiểm tra:</label>
              <input
                type="text"
                value={punchingColName}
                onChange={(e) => setPunchingColName(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Chiều dày sàn (mm):</label>
              <input
                type="number"
                value={slabThickness_mm}
                onChange={(e) => setSlabThickness_mm(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lực chọc thủng Vu (kN):</label>
              <input
                type="number"
                value={punchingForce_kN}
                onChange={(e) => setPunchingForce_kN(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SAFE Ratio đã xuất:</label>
              <input
                type="number"
                step="0.01"
                value={safeRatio}
                onChange={(e) => setSafeRatio(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Tỉ số trong SAFE (FDB)</span>
              <span className="text-2xl font-bold font-mono text-slate-800">{punchingOutput.safeRatio}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Computers & Structures Inc.</span>
            </div>

            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <span className="text-[11px] text-sky-700 font-semibold block">Tỉ số Tính toán Độc lập</span>
              <span className="text-2xl font-bold font-mono text-sky-900">{punchingOutput.independentRatio}</span>
              <span className="text-[10px] text-sky-600 block mt-1">TCVN 5574:2018 Formula</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Độ lệch sai số</span>
              <span className="text-2xl font-bold font-mono text-slate-800">{punchingOutput.variancePercentage}%</span>
              <span className="text-[10px] text-emerald-600 block mt-1">&lt; 15% (Chấp nhận được)</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs">
            <strong>Đánh giá khuyến nghị:</strong> {punchingOutput.recommendation}
          </div>
        </div>
      )}
    </div>
  );
};
