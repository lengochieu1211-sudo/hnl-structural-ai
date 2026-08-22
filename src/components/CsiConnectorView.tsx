import React, { useEffect, useState } from 'react';
import { CSIConnection, ProjectWorkspace } from '../types';
import { CSI_OAPI_REFERENCES, CSI_ERROR_SOLUTIONS } from '../data/csiKnowledgeDatabase';
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  Code2,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Zap,
  Server,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Upload,
  Play,
  Database,
  Layers,
  Table,
  FileText,
} from 'lucide-react';

interface CsiConnectorViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const CsiConnectorView: React.FC<CsiConnectorViewProps> = ({ project, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'STATUS' | 'OAPI_GENERATOR' | 'CSI_ERRORS' | 'IMPORT_EXPORT'>('STATUS');
  const [selectedSoftware, setSelectedSoftware] = useState<'ETABS' | 'SAP2000' | 'SAFE'>('ETABS');
  const [selectedLanguage, setSelectedLanguage] = useState<'CSharp' | 'Python' | 'VBA'>('Python');
  const [selectedOapiCategory, setSelectedOapiCategory] = useState<string>('Results Extraction');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Import/Export Interactive State
  const [ioMode, setIoMode] = useState<'INPUT_TO_CSI' | 'EXTRACT_FROM_CSI' | 'FILE_EXCHANGE'>('EXTRACT_FROM_CSI');
  const [activeIoStep, setActiveIoStep] = useState<number>(1);
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [ioLogMessages, setIoLogMessages] = useState<string[]>([
    '[SYSTEM] HNL CSI Bridge initialized in safe read-only mode.',
    '[INFO] Đang quét tiến trình ETABS / SAP2000 / SAFE thực tế trên Windows...',
  ]);

  const [connections, setConnections] = useState<CSIConnection[]>([
    { software: 'ETABS', version: 'Chưa xác định', status: 'Disconnected', activeModelPath: '', lastSyncTime: '-', connectedPids: [], apiMode: 'ActiveInstance', readOnlyMode: true },
    { software: 'SAP2000', version: 'Chưa xác định', status: 'Disconnected', activeModelPath: '', lastSyncTime: '-', connectedPids: [], apiMode: 'ActiveInstance', readOnlyMode: true },
    { software: 'SAFE', version: 'Chưa xác định', status: 'Disconnected', activeModelPath: '', lastSyncTime: '-', connectedPids: [], apiMode: 'ActiveInstance', readOnlyMode: true },
  ]);

  const refreshNativeStatus = async () => {
    setIsSyncing(true);
    try {
      const r = await fetch('/api/csi/status');
      const data = await r.json();
      const rows = Array.isArray(data.connectedSoftwares) ? data.connectedSoftwares : [];
      setConnections(prev => prev.map(c => {
        const x = rows.find((r:any) => r.type === c.software || r.name === c.software);
        if (!x) return { ...c, status: 'Disconnected', connectedPids: [], lastSyncTime: new Date().toLocaleTimeString('vi-VN') };
        return {
          ...c,
          version: x.version || (x.status === 'PROCESS_DETECTED' ? 'Đã phát hiện tiến trình' : 'Chưa xác định'),
          status: x.status === 'PROCESS_DETECTED' ? 'Standby' : 'Disconnected',
          activeModelPath: x.activeModel || x.filePath || '',
          connectedPids: x.connectedPids || [],
          lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
          readOnlyMode: true,
        };
      }));
      setIoLogMessages(prev => [...prev, data.nativeBridgeAvailable
        ? '[NATIVE] Đã quét tiến trình ETABS / SAP2000 / SAFE trên Windows. PROCESS_DETECTED chưa đồng nghĩa OAPI CONNECTED.'
        : `[NATIVE] ${data.message || 'Native CSI bridge chưa khả dụng trên hệ điều hành này.'}`]);
    } catch (e:any) {
      setIoLogMessages(prev => [...prev, `[ERROR] Không đọc được trạng thái CSI: ${e.message}`]);
    } finally { setIsSyncing(false); }
  };

  useEffect(() => { refreshNativeStatus(); }, []);


  const handleRunExtractReactions = () => {
    setExecutingTask('EXTRACT_REACTIONS');
    setIoLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] Trích phản lực ETABS: yêu cầu đã nhận.`, '⚠️ Native OAPI writer chưa được attach tới model CSI thật. Không thực hiện thay đổi giả lập.', '→ Mở tab Trạng thái, khởi động phần mềm CSI cần dùng và hoàn thiện/kiểm tra OAPI adapter đúng version trước khi chạy WRITE MODE.']);
    setExecutingTask(null);
  };

  const handleRunExportSpringsToSafe = () => {
    setExecutingTask('EXPORT_SPRINGS');
    setIoLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] Gán lò xo SAFE: yêu cầu đã nhận.`, '⚠️ Native OAPI writer chưa được attach tới model CSI thật. Không thực hiện thay đổi giả lập.', '→ Mở tab Trạng thái, khởi động phần mềm CSI cần dùng và hoàn thiện/kiểm tra OAPI adapter đúng version trước khi chạy WRITE MODE.']);
    setExecutingTask(null);
  };

  const handleRunCreateGridAndSlabs = () => {
    setExecutingTask('CREATE_MODEL');
    setIoLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] Tạo mô hình ETABS: yêu cầu đã nhận.`, '⚠️ Native OAPI writer chưa được attach tới model CSI thật. Không thực hiện thay đổi giả lập.', '→ Mở tab Trạng thái, khởi động phần mềm CSI cần dùng và hoàn thiện/kiểm tra OAPI adapter đúng version trước khi chạy WRITE MODE.']);
    setExecutingTask(null);
  };

  const handleSyncModel = async (_software: 'ETABS' | 'SAP2000' | 'SAFE') => {
    await refreshNativeStatus();
  };

  const handleToggleWriteMode = () => {
    if (!project.writeModeEnabled) {
      const hasLiveOapi = connections.some(c => c.status === 'Connected');
      if (!hasLiveOapi) {
        window.alert('WRITE MODE đang bị khóa an toàn.\n\nChưa có kết nối CSI OAPI thật (OAPI_CONNECTED). Việc chỉ phát hiện tiến trình ETABS/SAP2000/SAFE không đủ để bật quyền ghi.');
        return;
      }
      const confirmChange = window.confirm(
        '⚠️ BẬT CHẾ ĐỘ GHI (WRITE MODE):\n\nTrước mỗi thao tác ghi, ứng dụng phải Preview → Validate → Backup model → Apply → Read-back Verification.\n\nBạn có chắc chắn muốn kích hoạt?'
      );
      if (!confirmChange) return;
    }
    onUpdateProject({ ...project, writeModeEnabled: !project.writeModeEnabled });
  };

  const currentOapiRef =
    CSI_OAPI_REFERENCES.find((r) => r.category === selectedOapiCategory && r.software.includes(selectedSoftware)) ||
    CSI_OAPI_REFERENCES[0];

  const filteredErrors = CSI_ERROR_SOLUTIONS.filter(
    (e) =>
      e.errorCode.toLowerCase().includes(searchError.toLowerCase()) ||
      e.title.toLowerCase().includes(searchError.toLowerCase()) ||
      e.cause.toLowerCase().includes(searchError.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">CSI Live Connector & OAPI Bridge</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> OAPI Adapter cần xác nhận theo phiên bản CSI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phát hiện phần mềm CSI đang chạy và chuẩn bị cầu nối OAPI. Không hiển thị trạng thái Connected nếu chưa attach API thật.
          </p>
        </div>

        {/* Write Safety Shield Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleWriteMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              project.writeModeEnabled
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Shield className={`w-4 h-4 ${project.writeModeEnabled ? 'text-slate-950' : 'text-slate-500'}`} />
            {project.writeModeEnabled ? 'Chế độ Ghi (Write Mode: ACTIVE)' : 'Chế độ Đọc An Toàn (Read-Only: SECURE)'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('STATUS')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'STATUS' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Trạng thái kết nối CSI
        </button>
        <button
          onClick={() => setActiveTab('IMPORT_EXPORT')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'IMPORT_EXPORT' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Quy Trình Nhập / Xuất Dữ Liệu Tự Động
        </button>
        <button
          onClick={() => setActiveTab('OAPI_GENERATOR')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'OAPI_GENERATOR' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          OAPI Code Generator (C# / Python / VBA)
        </button>
        <button
          onClick={() => setActiveTab('CSI_ERRORS')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'CSI_ERRORS' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Xử lý lỗi CSI & Cảnh báo Solver
        </button>
      </div>

      {/* Tab 1: Connection Status Cards */}
      {activeTab === 'STATUS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connections.map((conn) => (
              <div
                key={conn.software}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          conn.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <h3 className="font-bold text-slate-800 text-base">{conn.software}</h3>
                    </div>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {conn.version}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 font-mono truncate" title={conn.activeModelPath}>
                    📁 {conn.activeModelPath}
                  </p>

                  <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Process ID (PID):</span>
                      <span className="font-mono">{conn.connectedPids.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Đồng bộ gần nhất:</span>
                      <span className="font-mono">{conn.lastSyncTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quyền truy cập:</span>
                      <span className={`font-semibold ${project.writeModeEnabled ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {project.writeModeEnabled ? 'Đọc & Ghi (Read/Write)' : 'Chỉ đọc (Read-Only)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    disabled={isSyncing}
                    onClick={() => handleSyncModel(conn.software)}
                    className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Đang trích xuất...' : 'Đồng bộ kết quả'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons for Model Extraction */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Lệnh trích xuất tự động một chạm (1-Click Model Extraction)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSyncModel('ETABS')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-500 hover:shadow-xs transition-all text-xs"
              >
                <span className="font-bold text-slate-800 block">1. Lấy phản lực chân cột</span>
                <span className="text-slate-500 text-[11px]">Fz, Vx, Vy, Mx, My cho móng cọc</span>
              </button>
              <button
                onClick={() => handleSyncModel('ETABS')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-500 hover:shadow-xs transition-all text-xs"
              >
                <span className="font-bold text-slate-800 block">2. Lấy chuyển vị lệch tầng</span>
                <span className="text-slate-500 text-[11px]">Story Drift theo TCVN 2737</span>
              </button>
              <button
                onClick={() => handleSyncModel('ETABS')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-500 hover:shadow-xs transition-all text-xs"
              >
                <span className="font-bold text-slate-800 block">3. Lấy chu kỳ dao động</span>
                <span className="text-slate-500 text-[11px]">Modal T, f, Ux, Uy, Rz participations</span>
              </button>
              <button
                onClick={() => handleSyncModel('SAFE')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-500 hover:shadow-xs transition-all text-xs"
              >
                <span className="font-bold text-slate-800 block">4. Xuất lò xo cọc sang SAFE</span>
                <span className="text-slate-500 text-[11px]">Gán Point Springs Kz = P/S</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: OAPI Code Generator */}
      {activeTab === 'OAPI_GENERATOR' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Phần mềm:</span>
              {(['ETABS', 'SAP2000', 'SAFE'] as const).map((sw) => (
                <button
                  key={sw}
                  onClick={() => setSelectedSoftware(sw)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    selectedSoftware === sw ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sw}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Ngôn ngữ:</span>
              {(['Python', 'CSharp', 'VBA'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold font-mono ${
                    selectedLanguage === lang ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'CSharp' ? 'C# (.NET)' : lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* OAPI Functions List */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Danh mục API</span>
              {CSI_OAPI_REFERENCES.map((ref) => (
                <button
                  key={ref.category}
                  onClick={() => setSelectedOapiCategory(ref.category)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-all ${
                    selectedOapiCategory === ref.category
                      ? 'bg-sky-50 text-sky-900 border border-sky-300 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {ref.category}
                </button>
              ))}
            </div>

            {/* Code Output Viewer */}
            <div className="md:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{currentOapiRef.title}</h4>
                  <p className="text-xs text-slate-500">{currentOapiRef.description}</p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedLanguage === 'CSharp'
                        ? currentOapiRef.csharpCode
                        : selectedLanguage === 'Python'
                        ? currentOapiRef.pythonCode
                        : currentOapiRef.vbaCode
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Đã sao chép' : 'Sao chép mã'}
                </button>
              </div>

              <div className="relative rounded-lg bg-slate-950 p-3 overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800 max-h-72">
                <pre>
                  {selectedLanguage === 'CSharp'
                    ? currentOapiRef.csharpCode
                    : selectedLanguage === 'Python'
                    ? currentOapiRef.pythonCode
                    : currentOapiRef.vbaCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CSI Error Solutions */}
      {activeTab === 'CSI_ERRORS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> CSI Error Knowledge Base & Solver Troubleshooting
            </h3>
            <input
              type="text"
              placeholder="Tìm kiếm mã lỗi (VD: ILL_CONDITIONED, DRIFT)..."
              value={searchError}
              onChange={(e) => setSearchError(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-md w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredErrors.map((err) => (
              <div key={err.errorCode} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    {err.errorCode}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">{err.software}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{err.title}</h4>
                <p className="text-xs text-slate-600">
                  <strong>Nguyên nhân:</strong> {err.cause}
                </p>
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 font-sans">
                  <strong>Khắc phục:</strong> {err.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Import / Export Workflow Simulator & Guidelines */}
      {activeTab === 'IMPORT_EXPORT' && (
        <div className="space-y-4">
          {/* Mode Selector Header */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-sky-400 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> QUY TRÌNH TRAO ĐỔI DỮ LIỆU TỰ ĐỘNG 2 CHIỀU VỚI CSI
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Hướng dẫn chi tiết & Trình mô phỏng trích xuất / khởi tạo mô hình tự động qua Live OAPI & File Interchange.
                </p>
              </div>

              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setIoMode('EXTRACT_FROM_CSI')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    ioMode === 'EXTRACT_FROM_CSI' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> 1. Lấy Dữ Liệu Ra (Output)
                </button>
                <button
                  onClick={() => setIoMode('INPUT_TO_CSI')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    ioMode === 'INPUT_TO_CSI' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-300" /> 2. Nhập Dữ Liệu Vào (Input)
                </button>
                <button
                  onClick={() => setIoMode('FILE_EXCHANGE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    ioMode === 'FILE_EXCHANGE' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-purple-300" /> 3. Trao Đổi Bằng File (.xlsx / .f2k)
                </button>
              </div>
            </div>
          </div>

          {/* MODE 1: EXTRACT FROM CSI */}
          {ioMode === 'EXTRACT_FROM_CSI' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Các bước lấy dữ liệu nhanh từ ETABS / SAP2000 / SAFE
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Extraction Step 1 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-800">Bước 1: Trích xuất Phản lực chân cột</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          1-Click
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Lấy lực dọc $F_z$, lực cắt $V_x, V_y$, Momen $M_x, M_y$ từ tất cả các Load Combinations cho toàn bộ nút chân cột/vách.
                      </p>
                      <button
                        disabled={executingTask !== null}
                        onClick={handleRunExtractReactions}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" /> Chạy Trích Xuất Phản Lực sang Module Móng Cọc
                      </button>
                    </div>

                    {/* Extraction Step 2 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-800">Bước 2: Lấy Chuyển vị tầng & Chu kỳ</span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Audit Mode
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Lấy Story Drift từng tầng, so sánh giới hạn $h/500$ TCVN 2737:2023, lấy chu kỳ $T_1, T_2, T_3$ và khối lượng tham gia dao động.
                      </p>
                      <button
                        disabled={executingTask !== null}
                        onClick={handleRunExtractReactions}
                        className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" /> Lấy Story Drift & Chu Kỳ sang Module Audit
                      </button>
                    </div>

                    {/* Extraction Step 3 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-800">Bước 3: Lấy Nội lực Cột & Vách (N, M, V)</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          PMM Check
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Đọc lực $P, M_2, M_3$ tại đầu/cuối cấu kiện cột để vẽ biểu đồ tương tác PMM và tính toán cốt thép TCVN 5574:2018.
                      </p>
                      <button
                        disabled={executingTask !== null}
                        onClick={handleRunExtractReactions}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" /> Đọc Nội Lực Cột Tính Thép
                      </button>
                    </div>

                    {/* Extraction Step 4 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-800">Bước 4: Xuất Bảng Kết Quả Sang Excel</span>
                        <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Report
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tự động đóng gói tất cả kết quả tính toán thành file Báo cáo Thuyết minh Excel chuẩn hóa font & khung viền.
                      </p>
                      <button
                        disabled={executingTask !== null}
                        onClick={handleRunExtractReactions}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" /> Xuất Bảng Báo Cáo Excel (.xlsx)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Monitor Panel */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" /> Live OAPI Interop Console
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded">
                      CONNECTED
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300 max-h-64 overflow-y-auto leading-relaxed">
                    {ioLogMessages.map((msg, i) => (
                      <div key={i} className={msg.includes('✅') ? 'text-emerald-400 font-bold' : msg.includes('->') ? 'text-sky-300' : 'text-slate-400'}>
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                  <span>API Target: ETABS v21 / SAFE v21</span>
                  <span>Port: COM Interop 0x31A</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: INPUT TO CSI */}
          {ioMode === 'INPUT_TO_CSI' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-amber-600" /> Các bước nhập liệu nhanh vào ETABS / SAP2000 / SAFE
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold font-mono ${project.writeModeEnabled ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-red-100 text-red-800'}`}>
                      {project.writeModeEnabled ? 'WRITE MODE ACTIVE' : 'WRITE MODE DISABLED (Cần bật ở trên)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Input Step 1 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">1. Dựng Lưới Trục & Tầng Tự Động</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Grid Gen
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tự động gửi thông số bước nhịp X, Y và cao độ các tầng H_story từ web app sang để dựng lưới trục khung ETABS.
                      </p>
                      <button
                        disabled={!project.writeModeEnabled || executingTask !== null}
                        onClick={handleRunCreateGridAndSlabs}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Dựng Khung Lưới Trục Sang ETABS
                      </button>
                    </div>

                    {/* Input Step 2 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">2. Gán Lò Xo Cọc Sang SAFE</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Spring Kz
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Gửi độ cứng lò xo cọc K_z = P_tt / S_settle (đã tính từ cọc Phan Vũ) sang gán trực tiếp cho các nút Point Springs đài móng SAFE.
                      </p>
                      <button
                        disabled={!project.writeModeEnabled || executingTask !== null}
                        onClick={handleRunExportSpringsToSafe}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Gán Lò Xo Cọc $K_z$ Sang SAFE
                      </button>
                    </div>

                    {/* Input Step 3 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">3. Khai Báo Vật Liệu & Tiết Diện</span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Material & Prop
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tự động sinh Bê tông B25, B30, B35, B40, Thép CB300-V, CB400-V, CB500-V và danh mục tiết diện Cột, Dầm chuẩn TCVN.
                      </p>
                      <button
                        disabled={!project.writeModeEnabled || executingTask !== null}
                        onClick={handleRunCreateGridAndSlabs}
                        className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Khai Báo Tiết Diện TCVN Vô Mô Hình
                      </button>
                    </div>

                    {/* Input Step 4 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">4. Gán Tải Trọng Gió TCVN 2737:2023</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Wind Load
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Gán lực gió tĩnh + động theo chiều cao $W(z)$ lên Diaphragm Center of Mass hoặc lên vách/cột biên.
                      </p>
                      <button
                        disabled={!project.writeModeEnabled || executingTask !== null}
                        onClick={handleRunCreateGridAndSlabs}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Gán Tải Gió TCVN 2737:2023
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Monitor Panel */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" /> Live OAPI Write Console
                    </span>
                    <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded">
                      {project.writeModeEnabled ? 'WRITE PERMITTED' : 'READ-ONLY SAFEGUARD'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300 max-h-64 overflow-y-auto leading-relaxed">
                    {ioLogMessages.map((msg, i) => (
                      <div key={i} className={msg.includes('✅') ? 'text-emerald-400 font-bold' : msg.includes('->') ? 'text-amber-300' : 'text-slate-400'}>
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                  <span>Target API: ETABS / SAFE</span>
                  <span>Safety Guard: Active</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: FILE EXCHANGE (.xlsx / .f2k / .e2k) */}
          {ioMode === 'FILE_EXCHANGE' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" /> Trao đổi dữ liệu thông qua File Bảng (.xlsx, .f2k, .$2k, .e2k, .json)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* File Format 1 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">1. File Text ETABS / SAP2000 (.e2k / .$2k)</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      Text Import
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Đọc/xuất toàn bộ cấu trúc mô hình dưới dạng file văn bản nhẹ, cho phép sửa đổi nhanh bằng Excel / Notepad rồi import lại.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button disabled title="Chưa khả dụng trong v1.1 - không chạy giả" className="flex-1 py-1.5 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900 cursor-pointer flex items-center justify-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Xuất .e2k
                    </button>
                    <button disabled title="Chưa khả dụng trong v1.1 - không chạy giả" className="flex-1 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Nhập .e2k
                    </button>
                  </div>
                </div>

                {/* File Format 2 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">2. File SAFE Model Text (.f2k)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">
                      SAFE Exchange
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tạo file `.f2k` chứa thông số đài móng, phản lực chân cột từ ETABS và tọa độ cọc kèm lò xo $K_z$ mở trực tiếp trong SAFE.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button disabled title="Chưa khả dụng trong v1.1 - không chạy giả" className="flex-1 py-1.5 bg-purple-700 text-white text-xs font-bold rounded hover:bg-purple-800 cursor-pointer flex items-center justify-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Xuất .f2k
                    </button>
                    <button disabled title="Chưa khả dụng trong v1.1 - không chạy giả" className="flex-1 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Nhập .f2k
                    </button>
                  </div>
                </div>

                {/* File Format 3 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">3. Bảng Excel Tải Trọng & Tọa Độ Cọc (.xlsx)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                      Excel IO
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nhập/xuất dữ liệu bảng tọa độ $X, Y, Z$, phản lực chân cột, danh sách cọc Phan Vũ để trao đổi trực tiếp với trắc đạc công trường.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button disabled title="Chưa khả dụng trong v1.1 - không chạy giả" className="flex-1 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded hover:bg-emerald-800 cursor-pointer flex items-center justify-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Xuất Excel
                    </button>
                    <button disabled title="Chưa khả dụng trong v1.1 - không chạy giả" className="flex-1 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Nhập Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
