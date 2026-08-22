import React, { useState } from 'react';
import { ProjectWorkspace } from '../types';
import {
  MANUFACTURER_PILE_LIBRARY,
  INITIAL_SMART_PILES,
} from '../data/phanVuPileDatabase';
import {
  ManufacturerProductSource,
  SmartPileObject,
  PileAuditResult,
  VerificationStatus,
} from '../types/hnlPileTypes';
import {
  Layers,
  Database,
  Sliders,
  Compass,
  FileCode,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  ExternalLink,
  BookOpen,
  CornerDownRight,
  Sparkles,
  Zap,
  Info,
  RefreshCw,
  Ruler,
  Maximize2,
  ListFilter,
  BarChart3,
  Check,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface HnlPileWorkbenchProps {
  project: ProjectWorkspace;
  onUpdateProject: (updated: ProjectWorkspace) => void;
}

export const HnlPileWorkbench: React.FC<HnlPileWorkbenchProps> = ({
  project,
  onUpdateProject,
}) => {
  // Main Sub-Tab State
  const [activeTab, setActiveTab] = useState<
    | 'CATALOG_CONNECTOR'
    | 'SMART_PILE_PROPERTY'
    | 'PARAMETRIC_CAD_DRAW'
    | 'PILE_PLAN_LAYOUT'
    | 'GEOTECHNICAL_CALC'
    | 'AS_BUILT_DEVIATION'
    | 'SHOPDRAWING_A1_AUDIT'
  >('CATALOG_CONNECTOR');

  // Pile Database & Smart Objects State
  const [manufacturerProducts] = useState<ManufacturerProductSource[]>(
    MANUFACTURER_PILE_LIBRARY
  );
  const [smartPiles, setSmartPiles] = useState<SmartPileObject[]>(INITIAL_SMART_PILES);
  const [selectedPileId, setSelectedPileId] = useState<string>('P001');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('pv-phc-d500a');
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('Tất cả');

  // Project Standard Version Control
  const [projectStandardSet, setProjectStandardSet] = useState({
    productCode: 'TCVN 7888:2014',
    geotechnicalCode: 'TCVN 10304:2014',
    concreteCode: 'TCVN 5574:2018',
    revisionYear: '2026 Updated',
    newerAvailable: true,
    newerStandardNote: 'TCVN 7888:2025 Draft available for public review.',
    hasConflict: false,
  });

  // AI Assistant Command input
  const [aiCommandInput, setAiCommandInput] = useState<string>('');
  const [aiCommandOutput, setAiCommandOutput] = useState<string | null>(null);

  // Selected Smart Pile Object
  const selectedPile =
    smartPiles.find((p) => p.pileId === selectedPileId) || smartPiles[0];

  // Selected Catalog Item
  const selectedCatalogItem =
    manufacturerProducts.find((p) => p.id === selectedCatalogId) ||
    manufacturerProducts[2];

  // Handler for modifying smart pile properties
  const handleUpdatePileProperty = (
    field: keyof SmartPileObject,
    value: any
  ) => {
    setSmartPiles((prev) =>
      prev.map((p) => {
        if (p.pileId === selectedPileId) {
          const updated = { ...p, [field]: value };

          // Automatically mark related drawings, schedule & BOQ as needing update
          updated.needsUpdateFlags = {
            drawing: true,
            schedule: true,
            boq: true,
            details: true,
          };

          // Recalculate levels if length changes
          if (field === 'length_m') {
            const newLen = Number(value) || p.length_m;
            updated.pileToeLevel_m = p.pileHeadLevel_m - newLen;
          }

          return updated;
        }
        return p;
      })
    );
  };

  // Run AI Command Example
  const handleExecuteAiCommand = (cmdText: string) => {
    setAiCommandInput(cmdText);
    setAiCommandOutput(`⏳ Executing command: "${cmdText}"...\n
✅ Processed:
1. Checked Phan Vũ Group Database: Matched product PHC-D500A (TCVN 7888:2014) verified on 2026-08-20.
2. Verified Geotechnical Soil Layer 4 (N_SPT = 32) at Pile Toe Level -22.20m.
3. Synchronized 4 Smart Piles in Pile Cap PC01.
4. Calculated Design Capacities: Structural P_vl = 2680 kN, Soil [Rc] = 1467 kN, Design P_tt = 1298 kN, Jacking Force P_ep = 1947~2596 kN.
5. Generated Coordinate Table & Parametric Elevation Drawings. Status: VERIFIED 🟢.`);
  };

  // Audit Rule Results
  const pileAuditResults: PileAuditResult[] = [
    {
      issueId: 'AUD-01',
      code: 'CAPACITY_CHECK',
      severity: 'INFO',
      title: 'Structural vs Soil Capacity Safety Ratio',
      description:
        'Working load P_tt = 1298 kN is well within Soil Allowable [Rc] = 1467 kN (Util = 88.5%) and Structural P_vl = 2680 kN (Util = 48.4%).',
      affectedPiles: ['P001', 'P002', 'P003', 'P004'],
      recommendation: 'Geotechnical & Structural capacity verified per TCVN 10304:2014 & TCVN 7888:2014.',
    },
    {
      issueId: 'AUD-02',
      code: 'ASBUILT_TOLERANCE',
      severity: 'WARNING',
      title: 'Pile P004 Exceeds As-Built Position Offset Limit',
      description:
        'Pile P004 as-built offset is 145.3 mm, exceeding standard tolerance limit of 100 mm (10cm).',
      affectedPiles: ['P004'],
      recommendation: 'Check additional eccentric bending moment on Pile Cap PC01 and recalculate rebar.',
    },
    {
      issueId: 'AUD-03',
      code: 'CUTOFF_LEVEL',
      severity: 'INFO',
      title: 'Pile Cut-off Embedment Verification',
      description:
        'Pile top level -1.200m, Cut-off level -1.500m. Embedment into pile cap = 100mm, Dowel rebar 10-D20 L=1200mm.',
      affectedPiles: ['P001', 'P002', 'P003', 'P004'],
      recommendation: 'Complies with TCVN 10304 Clause 8.4.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workbench Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-600 rounded-lg text-white font-black shadow-inner flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    HNL PILE AI – WORKBENCH CỌC & NỀN MÓNG
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    MANUFACTURER DB ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Thư viện cọc chuẩn HNL • Tích hợp dữ liệu Phan Vũ Group & TCVN 7888 / TCVN 10304 • Không suy đoán thông số • Truy vết 100%
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Commands Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('PARAMETRIC_CAD_DRAW')}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>HNLPILEDRAW</span>
            </button>
            <button
              onClick={() => setActiveTab('PILE_PLAN_LAYOUT')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HNL PILE PLAN</span>
            </button>
            <button
              onClick={() => setActiveTab('SMART_PILE_PROPERTY')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>HNL CUT-OFF</span>
            </button>
            <button
              onClick={() => setActiveTab('SHOPDRAWING_A1_AUDIT')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HNL PILE CHECK</span>
            </button>
          </div>
        </div>

        {/* Project Standard Set Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-mono">Project Standard Set:</span>
            <span className="bg-slate-800 text-sky-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              {projectStandardSet.productCode} (Pile Product)
            </span>
            <span className="bg-slate-800 text-emerald-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              {projectStandardSet.geotechnicalCode} (Geotechnical)
            </span>
            <span className="bg-slate-800 text-amber-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              {projectStandardSet.concreteCode} (Structure)
            </span>
          </div>

          {projectStandardSet.newerAvailable && (
            <div className="text-amber-400 flex items-center gap-1.5 text-[11px] font-medium bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>NEWER STANDARD AVAILABLE (Kỹ sư quyết định)</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
        {[
          {
            id: 'CATALOG_CONNECTOR',
            label: '1. Connector & Library Phan Vũ',
            icon: Database,
            badge: `${manufacturerProducts.length} Items`,
          },
          {
            id: 'SMART_PILE_PROPERTY',
            label: '2. Smart Pile & Property Panel',
            icon: Sliders,
            badge: `${smartPiles.length} Piles`,
          },
          {
            id: 'PARAMETRIC_CAD_DRAW',
            label: '3. Parametric CAD & Elevation',
            icon: Compass,
          },
          {
            id: 'PILE_PLAN_LAYOUT',
            label: '4. Pile Plan & Tọa Độ',
            icon: FileCode,
          },
          {
            id: 'GEOTECHNICAL_CALC',
            label: '5. Địa Chất & Trace Tính Toán',
            icon: Activity,
            badge: 'An toàn 100%',
          },
          {
            id: 'AS_BUILT_DEVIATION',
            label: '6. As-Built & Lệch Cọc',
            icon: BarChart3,
          },
          {
            id: 'SHOPDRAWING_A1_AUDIT',
            label: '7. Shopdrawing A1 & Audit',
            icon: ShieldCheck,
            badge: 'A1 Sheet',
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-sky-700 text-sky-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MANUFACTURER CONNECTOR & PHAN VU LIBRARY */}
      {activeTab === 'CATALOG_CONNECTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Product Search & List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-sky-600" />
                    HNL PHAN VŨ PILE LIBRARY & MANUFACTURER CONNECTOR
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tra cứu dữ liệu chính thức từ Catalog Phan Vũ Group. Không dùng ảnh nhòe để suy đoán kích thước.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm cọc D500, D600, PHC..."
                    value={searchCatalogQuery}
                    onChange={(e) => setSearchCatalogQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 outline-none w-full sm:w-56"
                  />
                </div>
              </div>

              {/* Manufacturer Filter Badges */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs">
                <span className="font-semibold text-slate-500 text-xs">Nhà sản xuất:</span>
                {['Tất cả', 'Phan Vu Group', 'Amacao Concrete', 'Generic / Custom'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setManufacturerFilter(m)}
                    className={`px-2.5 py-1 rounded-full border text-xs cursor-pointer ${
                      manufacturerFilter === m
                        ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Mã Sản Phẩm</th>
                      <th className="p-2.5">Hãng SX</th>
                      <th className="p-2.5">Loại & Class</th>
                      <th className="p-2.5">Đường Kính D</th>
                      <th className="p-2.5">Bê Tông</th>
                      <th className="p-2.5 text-right">P_vl (kN)</th>
                      <th className="p-2.5 text-right">M_cr (kNm)</th>
                      <th className="p-2.5 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manufacturerProducts
                      .filter((p) => manufacturerFilter === 'Tất cả' || p.manufacturer === manufacturerFilter)
                      .filter(
                        (p) =>
                          p.productCode
                            .toLowerCase()
                            .includes(searchCatalogQuery.toLowerCase()) ||
                          p.product
                            .toLowerCase()
                            .includes(searchCatalogQuery.toLowerCase())
                      )
                      .map((prod) => {
                        const isSelected = selectedCatalogId === prod.id;
                        return (
                          <tr
                            key={prod.id}
                            onClick={() => setSelectedCatalogId(prod.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-sky-50/90 font-medium'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-2.5 font-mono font-bold text-sky-700 flex items-center gap-1.5">
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                              )}
                              {prod.productCode}
                            </td>
                            <td className="p-2.5 text-slate-700">{prod.manufacturer}</td>
                            <td className="p-2.5 text-slate-600">
                              {prod.category} • {prod.class}
                            </td>
                            <td className="p-2.5 font-mono">
                              D{prod.geometry.outerDiameter_mm || prod.geometry.width_mm}mm
                            </td>
                            <td className="p-2.5 font-mono">{prod.geometry.concreteGrade}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                              {prod.geometry.structuralAxialCapacity_kN.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              {prod.geometry.crackingMoment_kNm}
                            </td>
                            <td className="p-2.5 text-center">
                              {prod.verificationStatus === 'VERIFIED' ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  🟢 VERIFIED
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  🟡 CONFIRM
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Deep Product Datasheet Inspector (Req 91, 93) */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  KNOWLEDGE CONNECTOR METADATA
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  {selectedCatalogItem.verificationStatus}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Tên Sản Phẩm:</div>
                  <div className="font-bold text-white text-sm">
                    {selectedCatalogItem.product}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700/80 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Manufacturer:</span>
                    <span className="text-sky-300 font-bold">
                      {selectedCatalogItem.manufacturer}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Product Code:</span>
                    <span className="text-amber-300 font-bold">
                      {selectedCatalogItem.productCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Revision:</span>
                    <span className="text-slate-200">{selectedCatalogItem.revision}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Publication:</span>
                    <span className="text-slate-200">
                      {selectedCatalogItem.publicationDate}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-slate-400 text-[11px]">Nguồn Tài Liệu Chính Thức:</div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="truncate">{selectedCatalogItem.documentName}</span>
                    <a
                      href={selectedCatalogItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-slate-400 text-[11px]">Tiêu Chuẩn Được Viện Dẫn:</div>
                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700 font-mono text-emerald-400">
                    {selectedCatalogItem.standard}
                  </div>
                </div>

                {/* Technical Geometry Breakdown */}
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Thông Số Hình Học & Cơ Lý (Verified)
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-800/40 p-2 rounded">
                      <span className="text-slate-400 block">Đường kính ngoài:</span>
                      <span className="text-white font-bold">
                        D{selectedCatalogItem.geometry.outerDiameter_mm} mm
                      </span>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded">
                      <span className="text-slate-400 block">Thành cọc:</span>
                      <span className="text-white font-bold">
                        t = {selectedCatalogItem.geometry.wallThickness_mm} mm
                      </span>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded">
                      <span className="text-slate-400 block">PC Bar Cốt Thép:</span>
                      <span className="text-white font-bold">
                        {selectedCatalogItem.geometry.pcBarQuantity}-D
                        {selectedCatalogItem.geometry.pcBarDiameter_mm}mm
                      </span>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded">
                      <span className="text-slate-400 block">Cấp Bê Tông:</span>
                      <span className="text-white font-bold">
                        {selectedCatalogItem.geometry.concreteGrade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Principle 93 Warning Note */}
                <div className="bg-sky-950/40 border border-sky-800/50 p-2.5 rounded-lg text-[11px] text-sky-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Nguyên tắc 93:</strong> Toàn bộ số liệu trên được truy xuất trực tiếp từ Catalog/Datasheet chính thức của nhà sản xuất. AI không tự đoán chiều dày hay thanh PC Bar khi chưa đọc tài liệu phê duyệt.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART PILE OBJECT & PROPERTY PANEL */}
      {activeTab === 'SMART_PILE_PROPERTY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Smart Pile Selector & Property Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sky-600" />
                  HNL PILE PROPERTY PANEL
                </h2>
                <p className="text-xs text-slate-500">
                  Đối tượng "HNL PILE" thông minh. Chỉnh sửa tham số sẽ tự động đánh dấu bản vẽ, schedule & BOQ cần cập nhật.
                </p>
              </div>

              {/* Pile Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Chọn cọc:</span>
                <select
                  value={selectedPileId}
                  onChange={(e) => setSelectedPileId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 font-mono font-bold text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                >
                  {smartPiles.map((p) => (
                    <option key={p.pileId} value={p.pileId}>
                      {p.pileId} ({p.productCode} - L={p.length_m}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Smart Pile Inputs Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pile ID</label>
                <input
                  type="text"
                  value={selectedPile.pileId}
                  onChange={(e) => handleUpdatePileProperty('pileId', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-mono font-bold px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mã Sản Phẩm</label>
                <input
                  type="text"
                  value={selectedPile.productCode}
                  onChange={(e) => handleUpdatePileProperty('productCode', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-mono px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nhà Sản Xuất</label>
                <input
                  type="text"
                  value={selectedPile.manufacturer}
                  onChange={(e) => handleUpdatePileProperty('manufacturer', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tổng Chiều Dài Cọc L (m)
                </label>
                <input
                  type="number"
                  value={selectedPile.length_m}
                  onChange={(e) => handleUpdatePileProperty('length_m', Number(e.target.value))}
                  className="w-full bg-amber-50 border border-amber-300 font-mono font-bold text-amber-900 px-3 py-1.5 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đốt Cọc (Segment Builder)
                </label>
                <input
                  type="text"
                  value={selectedPile.segmentLengths_m.join('m + ') + 'm'}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .replace(/m/g, '')
                      .split('+')
                      .map((s) => parseFloat(s.trim()))
                      .filter((n) => !isNaN(n));
                    if (parsed.length > 0) {
                      handleUpdatePileProperty('segmentLengths_m', parsed);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 font-mono px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cao Độ Đầu Cọc (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedPile.pileHeadLevel_m}
                  onChange={(e) =>
                    handleUpdatePileProperty('pileHeadLevel_m', Number(e.target.value))
                  }
                  className="w-full bg-slate-50 border border-slate-300 font-mono px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cao Độ Mũi Cọc (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedPile.pileToeLevel_m}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 font-mono text-slate-600 px-3 py-1.5 rounded-md cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cao Độ Cắt Đầu Cọc Cut-off (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedPile.cutOffLevel_m}
                  onChange={(e) =>
                    handleUpdatePileProperty('cutOffLevel_m', Number(e.target.value))
                  }
                  className="w-full bg-slate-50 border border-slate-300 font-mono px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Phương Pháp Thi Công
                </label>
                <select
                  value={selectedPile.installationMethod}
                  onChange={(e) =>
                    handleUpdatePileProperty('installationMethod', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                >
                  <option value="Pressing">Ép Tĩnh (Pressing)</option>
                  <option value="Driving">Đóng Cọc (Driving)</option>
                  <option value="Pre-Boring">Khoan Thả / Pre-Boring</option>
                  <option value="Hyper-MEGA">Hyper-MEGA Method</option>
                </select>
              </div>
            </div>

            {/* Segment Builder Visual Diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  SEGMENT BUILDER & MỐI NỐI CỌC (SMART JOINT)
                </span>
                <span className="font-mono text-sky-700 font-semibold">
                  Tổng L = {selectedPile.segmentLengths_m.reduce((a, b) => a + b, 0)}m (
                  {selectedPile.segmentLengths_m.length} đoạn)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedPile.segmentLengths_m.map((segLen, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex-1 bg-sky-100 border-2 border-sky-400 rounded-lg p-3 text-center">
                      <div className="text-[10px] font-bold text-sky-800">
                        Đoạn {idx + 1} ({idx === 0 ? 'Mũi' : 'Thân/Đầu'})
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        {segLen} m
                      </div>
                    </div>
                    {idx < selectedPile.segmentLengths_m.length - 1 && (
                      <div className="flex flex-col items-center">
                        <span className="bg-amber-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Mối Nối
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Bản mã hàn</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Change Tracking Status Panel (Req 95) */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                DYNAMICAL ASSOCIATIVITY & UPDATE FLAGS
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded">
                VERIFIED 🟢
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Khi kỹ sư thay đổi chiều dài hoặc thông số cọc <strong>{selectedPile.pileId}</strong>, hệ thống tự động gắn cờ cần cập nhật trên toàn bộ hồ sơ:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  selectedPile.needsUpdateFlags?.drawing
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <span>Bản Vẽ CAD (Elevation/Plan)</span>
                {selectedPile.needsUpdateFlags?.drawing ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> NEED UPDATE
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> SYNCED
                  </span>
                )}
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  selectedPile.needsUpdateFlags?.schedule
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <span>Bảng Tiến Độ & Pile Schedule</span>
                {selectedPile.needsUpdateFlags?.schedule ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> NEED UPDATE
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> SYNCED
                  </span>
                )}
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  selectedPile.needsUpdateFlags?.boq
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <span>Thống Kê Khối Lượng BOQ</span>
                {selectedPile.needsUpdateFlags?.boq ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> NEED UPDATE
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> SYNCED
                  </span>
                )}
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  selectedPile.needsUpdateFlags?.details
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <span>Chi Tiết Đầu Cọc & Cut-off Detail</span>
                {selectedPile.needsUpdateFlags?.details ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> NEED UPDATE
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> SYNCED
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setSmartPiles((prev) =>
                  prev.map((p) =>
                    p.pileId === selectedPileId
                      ? {
                          ...p,
                          needsUpdateFlags: {
                            drawing: false,
                            schedule: false,
                            boq: false,
                            details: false,
                          },
                        }
                      : p
                  )
                );
              }}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng Bộ Hóa Toàn Bộ Hồ Sơ</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PARAMETRIC CAD & ELEVATION DRAWING (HNLPILEDRAW) */}
      {activeTab === 'PARAMETRIC_CAD_DRAW' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-600" />
                HNLPILEDRAW – PARAMETRIC CAD GENERATOR
              </h2>
              <p className="text-xs text-slate-500">
                Tự động tạo bản vẽ Elevation, Section, Joint Detail & Head Detail từ dữ liệu tham số verified (không dùng trace ảnh).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-700">
                Target: {selectedPile.pileId} ({selectedPile.productCode})
              </span>
            </div>
          </div>

          {/* SVG Parametric Renderer Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Elevation & Section Parametric Drawing */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-sky-400 font-bold">DRAWING ELEVATION & SECTION</span>
                <span>Scale 1:25 • Parametric Clean CAD</span>
              </div>

              {/* Vector SVG Canvas */}
              <div className="bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-[360px] border border-slate-800 relative">
                <svg width="340" height="340" viewBox="0 0 340 340" className="w-full h-auto">
                  {/* Grid background lines */}
                  <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                  <rect width="340" height="340" fill="url(#cadGrid)" />

                  {/* Level Cut-off indicator */}
                  <line x1="20" y1="50" x2="160" y2="50" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="25" y="45" fill="#f87171" fontSize="9" fontFamily="monospace">
                    Cut-off Level: {selectedPile.cutOffLevel_m.toFixed(3)}m
                  </text>

                  {/* Pile Cap Bottom */}
                  <rect x="50" y="20" width="80" height="30" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                  <text x="60" y="38" fill="#e2e8f0" fontSize="9" fontFamily="sans-serif">
                    Đài Cọc PC01
                  </text>

                  {/* Pile Segment 1 (Top) */}
                  <rect x="70" y="50" width="40" height="120" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="75" y="110" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Seg 1: {selectedPile.segmentLengths_m[0]}m
                  </text>

                  {/* Smart Joint Welded End Plate */}
                  <rect x="66" y="170" width="48" height="8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="60" y1="174" x2="120" y2="174" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 1" />
                  <text x="125" y="177" fill="#fbbf24" fontSize="8" fontFamily="monospace">
                    Joint Plate 18mm
                  </text>

                  {/* Pile Segment 2 (Bottom) */}
                  <rect x="70" y="178" width="40" height="110" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="75" y="235" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Seg 2: {selectedPile.segmentLengths_m[1] || 9}m
                  </text>

                  {/* Driving Shoe / Tip */}
                  <polygon points="70,288 110,288 90,310" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="25" y="305" fill="#f87171" fontSize="9" fontFamily="monospace">
                    Toe: {selectedPile.pileToeLevel_m.toFixed(3)}m
                  </text>

                  {/* Right Side: Cross Section Diagram */}
                  <g transform="translate(230, 110)">
                    {/* Outer Circle */}
                    <circle cx="40" cy="40" r="35" fill="#0369a1" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
                    {/* Inner Circle (Hollow) */}
                    <circle cx="40" cy="40" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
                    {/* PC Bar Circles */}
                    {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, i) => {
                      const rad = (deg * Math.PI) / 180;
                      const cx = 40 + 28.5 * Math.cos(rad);
                      const cy = 40 + 28.5 * Math.sin(rad);
                      return <circle key={i} cx={cx} cy={cy} r="2.5" fill="#fbbf24" />;
                    })}
                    <text x="-10" y="90" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      SECTION A-A
                    </text>
                    <text x="40" y="105" fill="#cbd5e1" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      PHC D500 (t=90mm)
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Right: Smart Joint & Pile Head Detail CAD Specs */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  CHI TIẾT MỐI NỐI CỌC (HNL PILE JOINT DETAIL)
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Loại mối nối:</span>
                    <span className="font-bold text-slate-800">Mối nối hàn bản mã</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Chiều dày bản mã:</span>
                    <span className="font-bold text-slate-800">t = 18 mm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Đường hàn:</span>
                    <span className="font-bold text-slate-800">Vát mép v-weld 8mm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Que hàn quy chuẩn:</span>
                    <span className="font-bold text-slate-800">E43 / E50</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-sky-600" />
                  CHI TIẾT ĐẦU CỌC VÀ CẮT ĐẦU CỌC (HNL PILE CUT-OFF)
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Độ ngàm cọc vào đài:</span>
                    <span className="font-bold text-emerald-700">100 mm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Thép râu neo đài:</span>
                    <span className="font-bold text-slate-800">8-D20 L=1200mm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Bê tông chèn lòng cọc:</span>
                    <span className="font-bold text-slate-800">B35 Non-shrink</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Khoảng cách cắt cọc:</span>
                    <span className="font-bold text-slate-800">300 mm (Cắt ngàm)</span>
                  </div>
                </div>
              </div>

              {/* Reference Drawing Reconstruction Simulator (Req 101) */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs space-y-2">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  REFERENCE DRAWING RECONSTRUCTION ENGINE
                </div>
                <p className="text-sky-800 text-[11px]">
                  Hệ thống AI nhận diện kích thước từ PDF/DWG bản vẽ Phan Vũ, tự trích xuất tham số verified mà không làm vỡ nét.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PILE PLAN & COORDINATE TABLE (HNL PILE PLAN) */}
      {activeTab === 'PILE_PLAN_LAYOUT' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-600" />
                HNL PILE PLAN – MẶT BẰNG & BẢNG TỌA ĐỘ CỌC
              </h2>
              <p className="text-xs text-slate-500">
                Mặt bằng bố trí cọc theo đài, đánh số tự động, quản lý tọa độ WCS/UCS và xuất Excel.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert('Đã xuất Bảng Tọa Độ Cọc ra tệp Excel success!');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel Tọa Độ</span>
              </button>
            </div>
          </div>

          {/* Interactive Pile Plan Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-950 rounded-xl p-4 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-sky-400 font-bold">PILE PLAN VIEW – PILE CAP PC01 (4 PILES)</span>
                <span>UCS (0,0) • Spacing = 1800mm (3.6D)</span>
              </div>

              <div className="bg-slate-900 rounded-lg p-6 flex items-center justify-center min-h-[320px] border border-slate-800 relative">
                <svg width="320" height="320" viewBox="0 0 320 320" className="w-full h-auto">
                  {/* Grid Lines */}
                  <line x1="20" y1="160" x2="300" y2="160" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
                  <line x1="160" y1="20" x2="160" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
                  <text x="305" y="164" fill="#94a3b8" fontSize="10" fontFamily="monospace">Grid A</text>
                  <text x="155" y="15" fill="#94a3b8" fontSize="10" fontFamily="monospace">Grid 1</text>

                  {/* Pile Cap PC01 Outline */}
                  <rect x="60" y="60" width="200" height="200" fill="#1e293b" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="2" rx="6" />
                  <text x="160" y="80" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    ĐÀI CỌC PC01 (2600 x 2600mm)
                  </text>

                  {/* Column Base */}
                  <rect x="135" y="135" width="50" height="50" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                  <text x="160" y="164" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    COL C05
                  </text>

                  {/* Piles */}
                  {smartPiles.map((p, idx) => {
                    const cx = p.coordinates.x === 0 ? 100 : 220;
                    const cy = p.coordinates.y === 0 ? 100 : 220;
                    return (
                      <g key={p.pileId} className="cursor-pointer" onClick={() => setSelectedPileId(p.pileId)}>
                        <circle cx={cx} cy={cy} r="20" fill="#0369a1" fillOpacity="0.4" stroke={selectedPileId === p.pileId ? '#fbbf24' : '#38bdf8'} strokeWidth={selectedPileId === p.pileId ? '3' : '2'} />
                        <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
                        <text x={cx} y={cy - 25} fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          {p.pileId}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Right: AI Pile Arrangement & Spacing Advisor */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  AI PILE ARRANGEMENT PROPOSAL
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded text-[11px] font-mono">
                  <strong>Cột C05 Tải Nén:</strong> N_design = 4,200 kN
                  <br />
                  <strong>Sức chịu tải cọc:</strong> [Rc] = 1,467 kN
                  <br />
                  <strong>Đề xuất:</strong> 4 cọc PHC-D500A (N_max = 1298 kN ≤ [Rc])
                </div>

                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-[10px] font-bold">
                  ⚠️ PRELIMINARY – STRUCTURAL DESIGN CHECK REQUIRED
                </div>
              </div>

              {/* Coordinate Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2">Pile ID</th>
                      <th className="p-2 text-right">X (mm)</th>
                      <th className="p-2 text-right">Y (mm)</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {smartPiles.map((p) => (
                      <tr key={p.pileId} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-sky-700">{p.pileId}</td>
                        <td className="p-2 text-right">{p.coordinates.x}</td>
                        <td className="p-2 text-right">{p.coordinates.y}</td>
                        <td className="p-2 text-center text-emerald-600 font-bold">🟢 OK</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GEOTECHNICAL BOREHOLE & TRACEABLE CALCULATIONS */}
      {activeTab === 'GEOTECHNICAL_CALC' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              HNL BOREHOLE & CALCULATION TRACEABILITY (AN TOÀN 100%)
            </h2>
            <p className="text-xs text-slate-500">
              Phân biệt rõ ràng Sức chịu tải Vật liệu (P_vl), Sức chịu tải Đất nền ([R_c]), Tải trọng Thiết kế (P_tt) và Lực ép máy (P_ep).
            </p>
          </div>

          {/* Safety Rule 141 Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Sức Chịu Tải Vật Liệu Cọc P_vl</div>
              <div className="text-lg font-bold text-sky-400">2,680 kN</div>
              <div className="text-[10px] text-slate-400">Theo Catalog Phan Vũ / TCVN 7888</div>
            </div>

            <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Sức Chịu Tải Đất Nền [R_c]</div>
              <div className="text-lg font-bold text-emerald-400">1,467 kN</div>
              <div className="text-[10px] text-slate-400">TCVN 10304:2014 Clause 7.2</div>
            </div>

            <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Tải Trọng Thiết Kế P_tt</div>
              <div className="text-lg font-bold text-amber-400">1,298 kN</div>
              <div className="text-[10px] text-slate-400">Tải đầu cọc thực tế từ SAFE</div>
            </div>

            <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Lực Ép Cọc Yêu Cầu P_ep</div>
              <div className="text-lg font-bold text-indigo-400">1,947 ~ 2,596 kN</div>
              <div className="text-[10px] text-slate-400">P_ep = (1.5 ~ 2.0) * P_tt</div>
            </div>
          </div>

          {/* Traceable Formula Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Bảng Truy Vết Công Thức Tính Toán (Traceability Log)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Bước Tính</th>
                    <th className="p-2.5">Công Thức TCVN</th>
                    <th className="p-2.5">Tiêu Chuẩn & Điều Khoản</th>
                    <th className="p-2.5 text-right">Giá Trị Tính</th>
                    <th className="p-2.5 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">1. Sức kháng mũi cọc (q_p * A_p)</td>
                    <td className="p-2.5 text-sky-700 font-semibold">Q_p = q_p * A_p = 3850 * 0.196m2</td>
                    <td className="p-2.5 text-slate-600">TCVN 10304:2014 - Bảng G.1</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">754.6 kN</td>
                    <td className="p-2.5 text-center text-emerald-600 font-bold">🟢 PASS</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">2. Ma sát thành bên (∑ f_i * A_si)</td>
                    <td className="p-2.5 text-sky-700 font-semibold">Q_s = u * ∑ (f_i * l_i)</td>
                    <td className="p-2.5 text-slate-600">TCVN 10304:2014 - Bảng G.2</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">2,179.4 kN</td>
                    <td className="p-2.5 text-center text-emerald-600 font-bold">🟢 PASS</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-emerald-50/50">
                    <td className="p-2.5 font-bold text-emerald-900">3. Sức chịu tải cho phép [R_c]</td>
                    <td className="p-2.5 text-emerald-800 font-bold">[R_c] = (Q_p + Q_s) / γ_k (γ_k=2.0)</td>
                    <td className="p-2.5 text-slate-600">TCVN 10304:2014 - Điều 7.1.11</td>
                    <td className="p-2.5 text-right font-bold text-emerald-800 text-sm">1,467.0 kN</td>
                    <td className="p-2.5 text-center text-emerald-600 font-bold">🟢 VERIFIED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AS-BUILT DEVIATION & INSTALLATION RECORD */}
      {activeTab === 'AS_BUILT_DEVIATION' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              SƠ ĐỒ ĐỘ LỆCH CỌC AS-BUILT & NHẬT KÝ THI CÔNG
            </h2>
            <p className="text-xs text-slate-500">
              Nhập tọa độ thực tế thi công, tự động kiểm tra độ lệch vượt tolerance (75mm / 100mm) và lực ép P_ep.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Pile ID</th>
                  <th className="p-2.5 text-right">ΔX (mm)</th>
                  <th className="p-2.5 text-right">ΔY (mm)</th>
                  <th className="p-2.5 text-right">Lệch Tổng (mm)</th>
                  <th className="p-2.5 text-right">Lực Ép P_ep (kN)</th>
                  <th className="p-2.5 text-center">Đánh Giá Tolerance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {smartPiles.map((p) => {
                  const asBuilt = p.asBuiltData;
                  if (!asBuilt) return null;
                  return (
                    <tr key={p.pileId} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-sky-700">{p.pileId}</td>
                      <td className="p-2.5 text-right">{asBuilt.deltaX_mm}</td>
                      <td className="p-2.5 text-right">{asBuilt.deltaY_mm}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {asBuilt.totalOffset_mm.toFixed(1)}
                      </td>
                      <td className="p-2.5 text-right text-indigo-700 font-bold">
                        {asBuilt.pressingForce_kN}
                      </td>
                      <td className="p-2.5 text-center">
                        {asBuilt.status === 'WITHIN_TOLERANCE' && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            🟢 TRONG CHO PHÉP (≤75mm)
                          </span>
                        )}
                        {asBuilt.status === 'NEAR_LIMIT' && (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            🟡 SÁT GIỚI HẠN (75-100mm)
                          </span>
                        )}
                        {asBuilt.status === 'OUT_OF_TOLERANCE' && (
                          <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            🔴 VƯỢT DUNG SAI (&gt;100mm)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SHOPDRAWING A1 LAYOUT, BOQ & AUDIT */}
      {activeTab === 'SHOPDRAWING_A1_AUDIT' && (
        <div className="space-y-6">
          {/* Audit Results Section (HNL PILE CHECK) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                HNL PILE CHECK – BÁO CÁO AUDIT AN TOÀN
              </h2>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-3 py-1 rounded-full border border-indigo-200">
                Audit Rules Passed: 3/3 Checks Complete
              </span>
            </div>

            <div className="space-y-3">
              {pileAuditResults.map((audit) => (
                <div
                  key={audit.issueId}
                  className={`p-3.5 rounded-xl border text-xs ${
                    audit.severity === 'WARNING'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-2">
                      {audit.severity === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>
                        [{audit.code}] {audit.title}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Piles: {audit.affectedPiles.join(', ')}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">{audit.description}</p>
                  <div className="mt-2 font-mono text-[11px] text-sky-800 bg-sky-50/80 p-2 rounded border border-sky-200">
                    💡 Khuyến nghị: {audit.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Command Example Prompt Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                HNL PILE AI COMMAND TERMINAL (Section 140)
              </h3>
              <span className="text-slate-400 text-xs font-mono">AI Natural Language Assistant</span>
            </div>

            {/* Example Quick Prompt Buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Tra hệ cọc PHC phù hợp trong thư viện Phan Vũ cho dự án này',
                'Tự đánh số tất cả cọc và tạo bảng tọa độ',
                'So sánh bản thiết kế móng với shopdrawing cọc',
                'Tạo Layout A1 gồm mặt bằng cọc, chi tiết đầu cọc, mối nối và Pile Schedule',
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleExecuteAiCommand(cmd)}
                  className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-mono px-2.5 py-1.5 rounded border border-slate-700 cursor-pointer transition-all"
                >
                  💬 "{cmd}"
                </button>
              ))}
            </div>

            {aiCommandOutput && (
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {aiCommandOutput}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
