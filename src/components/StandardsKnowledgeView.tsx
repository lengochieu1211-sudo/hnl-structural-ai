import React, { useState, useMemo } from 'react';
import { ProjectWorkspace } from '../types';
import { ALL_SUPPORTED_STANDARDS } from '../data/standardsDatabase';
import { WindSeismicEngine } from '../engine/windSeismicEngine';
import { BookOpen, Wind, Activity, Search, ExternalLink, Check, Copy } from 'lucide-react';

interface StandardsKnowledgeViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const StandardsKnowledgeView: React.FC<StandardsKnowledgeViewProps> = ({ project, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'STANDARDS_BROWSER' | 'WIND_CALCULATOR' | 'SEISMIC_SPECTRUM'>('STANDARDS_BROWSER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStdCode, setSelectedStdCode] = useState('TCVN 2737:2023');

  // Wind load interactive state
  const [windZone, setWindZone] = useState<'I' | 'II' | 'III' | 'IV' | 'V'>('II');
  const [terrain, setTerrain] = useState<'A' | 'B' | 'C'>('B');
  const [buildingHeight, setBuildingHeight] = useState<number>(85);
  const [buildingWidth, setBuildingWidth] = useState<number>(30);
  const [buildingLength, setBuildingLength] = useState<number>(40);

  // Dynamic wind calculation
  const windResult = useMemo(() => {
    return WindSeismicEngine.calculateTCVN2737Wind({
      location: project.location,
      windZone,
      terrainCategory: terrain,
      buildingHeight_m: buildingHeight,
      buildingWidthX_m: buildingWidth,
      buildingLengthY_m: buildingLength,
      importanceFactor: 1.0,
    });
  }, [windZone, terrain, buildingHeight, buildingWidth, buildingLength, project.location]);

  // Dynamic seismic spectrum
  const spectrumPoints = useMemo(() => {
    return WindSeismicEngine.getResponseSpectrum('C', 0.082, 3.9);
  }, []);

  const currentStandard = ALL_SUPPORTED_STANDARDS.find((s) => s.code === selectedStdCode) || ALL_SUPPORTED_STANDARDS[0];

  const filteredClauses = currentStandard.clauses.filter(
    (c) =>
      c.clauseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Kho Tri Thức Kỹ Thuật & Tiêu Chuẩn Hiện Hành</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              TCVN / QCVN / ACI / ASCE / Eurocode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu điều khoản, công thức tính toán tải trọng gió TCVN 2737:2023 và phổ phản ứng động đất TCVN 9386.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('STANDARDS_BROWSER')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'STANDARDS_BROWSER' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tra cứu Tiêu chuẩn & Điều khoản
        </button>
        <button
          onClick={() => setActiveTab('WIND_CALCULATOR')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'WIND_CALCULATOR' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tính toán Tải trọng Gió TCVN 2737:2023
        </button>
        <button
          onClick={() => setActiveTab('SEISMIC_SPECTRUM')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'SEISMIC_SPECTRUM' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Phổ phản ứng Kháng chấn TCVN 9386
        </button>
      </div>

      {/* Tab 1: Standards Browser */}
      {activeTab === 'STANDARDS_BROWSER' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left: Standards List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Danh mục Tiêu chuẩn</span>
            {ALL_SUPPORTED_STANDARDS.map((std) => (
              <button
                key={std.code}
                onClick={() => setSelectedStdCode(std.code)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                  selectedStdCode === std.code
                    ? 'bg-sky-50 text-sky-900 border border-sky-300 font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="font-mono text-sky-700 font-bold">{std.code}</div>
                <div className="text-[11px] text-slate-500 font-sans truncate">{std.title}</div>
              </button>
            ))}
          </div>

          {/* Right: Clauses & Search */}
          <div className="md:col-span-3 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{currentStandard.title}</h3>
                <span className="text-xs text-slate-500 font-mono">Phiên bản: {currentStandard.year} ({currentStandard.jurisdiction})</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm điều khoản hoặc từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-md w-56"
                />
              </div>
            </div>

            <div className="space-y-3 mt-3">
              {filteredClauses.map((clause, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {clause.clauseNumber}
                    </span>
                    <span className="font-bold text-slate-800">{clause.title}</span>
                  </div>
                  <p className="text-slate-700 font-sans leading-relaxed">{clause.content}</p>
                  {clause.formula && (
                    <div className="p-2 bg-white rounded border border-slate-200 font-mono text-emerald-800 font-bold">
                      {clause.formula}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Wind Calculator */}
      {activeTab === 'WIND_CALCULATOR' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vùng áp lực gió:</label>
              <select
                value={windZone}
                onChange={(e) => setWindZone(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-white font-mono font-bold"
              >
                <option value="I">Vùng I (W0 = 65 daN/m²)</option>
                <option value="II">Vùng II (W0 = 95 daN/m²)</option>
                <option value="III">Vùng III (W0 = 125 daN/m²)</option>
                <option value="IV">Vùng IV (W0 = 155 daN/m²)</option>
                <option value="V">Vùng V (W0 = 185 daN/m²)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dạng địa hình:</label>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-white font-mono font-bold"
              >
                <option value="A">Dạng A (Trống trải, ven biển)</option>
                <option value="B">Dạng B (Đô thị trung bình)</option>
                <option value="C">Dạng C (Đô thị dày đặc)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Chiều cao toà nhà H (m):</label>
              <input
                type="number"
                value={buildingHeight}
                onChange={(e) => setBuildingHeight(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bề rộng đón gió X (m):</label>
              <input
                type="number"
                value={buildingWidth}
                onChange={(e) => setBuildingWidth(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bề dài đón gió Y (m):</label>
              <input
                type="number"
                value={buildingLength}
                onChange={(e) => setBuildingLength(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
          </div>

          {/* Results Summary & Story-by-story table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-center space-y-1">
              <span className="text-xs text-sky-700 font-semibold uppercase">Tổng lực cắt đáy Gió Phương X (Base Shear Wx)</span>
              <div className="text-2xl font-bold font-mono text-sky-900">{windResult.totalBaseShearWindX_kN.toLocaleString()} kN</div>
              <span className="text-xs text-sky-600 font-mono">Hệ số tin cậy γf = {windResult.gamma_f} (TCVN 2737:2023)</span>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-center space-y-1">
              <span className="text-xs text-sky-700 font-semibold uppercase">Tổng lực cắt đáy Gió Phương Y (Base Shear Wy)</span>
              <div className="text-2xl font-bold font-mono text-sky-900">{windResult.totalBaseShearWindY_kN.toLocaleString()} kN</div>
              <span className="text-xs text-sky-600 font-mono">Hệ số khí động c = 1.3 (0.8 đẩy + 0.5 hút)</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Phân bố tải trọng gió từng tầng (Story Wind Force Table)
            </h4>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2 font-sans font-bold">Tầng</th>
                    <th className="p-2 font-sans font-bold">Cao độ z (m)</th>
                    <th className="p-2 font-sans font-bold">Hệ số k(z)</th>
                    <th className="p-2 font-sans font-bold">Áp lực tiêu chuẩn qk (daN/m²)</th>
                    <th className="p-2 font-sans font-bold">Lực gió tầng Fx (kN)</th>
                    <th className="p-2 font-sans font-bold">Lực gió tầng Fy (kN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {windResult.storyWindForces.map((sw, i) => (
                    <tr key={i} className="hover:bg-sky-50">
                      <td className="p-2 font-bold text-slate-800 font-sans">{sw.story}</td>
                      <td className="p-2 text-slate-600">+{sw.elevation_m.toFixed(1)}m</td>
                      <td className="p-2 text-slate-700">{sw.kz_coeff}</td>
                      <td className="p-2 text-slate-700">{sw.qk_pressure_daN_m2}</td>
                      <td className="p-2 text-sky-900 font-bold">{sw.fx_wind_kN}</td>
                      <td className="p-2 text-sky-900 font-bold">{sw.fy_wind_kN}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Seismic Spectrum */}
      {activeTab === 'SEISMIC_SPECTRUM' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Đường phổ phản ứng thiết kế đàn hồi Sa(T) theo TCVN 9386:2012 (PGA = 0.082g, Nền C, q = 3.9)
          </h3>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2 font-sans font-bold">Chu kỳ T (giây)</th>
                  <th className="p-2 font-sans font-bold">Gia tốc phổ thiết kế Sa (g)</th>
                  <th className="p-2 font-sans font-bold">Gia tốc phổ Sa (m/s²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spectrumPoints.slice(0, 20).map((pt, i) => (
                  <tr key={i} className="hover:bg-sky-50">
                    <td className="p-2 font-bold text-slate-800">{pt.period_s}s</td>
                    <td className="p-2 text-sky-900 font-bold">{pt.sa_g}</td>
                    <td className="p-2 text-slate-700">{(pt.sa_g * 9.81).toFixed(4)} m/s²</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
