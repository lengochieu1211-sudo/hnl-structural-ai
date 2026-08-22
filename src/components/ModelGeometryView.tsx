import React, { useState } from 'react';
import { ProjectWorkspace, StoryData, MaterialData, SectionData, ModelNode, ModelFrame } from '../types';
import { ExcelDataGrid, ColumnDef } from './ExcelDataGrid';
import { Layers, Plus, Grid, Sliders, Box, Cpu } from 'lucide-react';

interface ModelGeometryViewProps {
  project: ProjectWorkspace;
  onUpdateProject: (p: ProjectWorkspace) => void;
}

export const ModelGeometryView: React.FC<ModelGeometryViewProps> = ({ project, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'STORIES' | 'SECTIONS' | 'MATERIALS' | 'GRIDS' | 'JOINTS' | 'FRAMES'>('STORIES');
  const [quickGridX, setQuickGridX] = useState('3600x5 + 4200x3');
  const [quickGridY, setQuickGridY] = useState('6000x4 + 7500x2');
  const [gridParsedResult, setGridParsedResult] = useState<string>('Tổng chiều dài X: 30.6m (8 nhịp) | Tổng chiều dài Y: 39.0m (6 nhịp)');

  const handleParseQuickGrid = () => {
    // Parse expression like 3600x5 + 4200x3
    const parseDim = (expr: string) => {
      const parts = expr.split('+').map((s) => s.trim());
      let total = 0;
      let count = 0;
      parts.forEach((p) => {
        if (p.includes('x') || p.includes('*')) {
          const [val, n] = p.split(/[x*]/).map((num) => parseFloat(num.trim()));
          total += (val || 0) * (n || 1);
          count += n || 1;
        } else {
          total += parseFloat(p) || 0;
          count += 1;
        }
      });
      return { totalM: total / 1000, count };
    };

    const xRes = parseDim(quickGridX);
    const yRes = parseDim(quickGridY);

    setGridParsedResult(
      `Đã khởi tạo Lưới: Phương X = ${xRes.totalM}m (${xRes.count} nhịp) | Phương Y = ${yRes.totalM}m (${yRes.count} nhịp)`
    );
  };

  // Stories Columns Definition
  const storyColumns: ColumnDef<StoryData>[] = [
    { key: 'name', header: 'Tên Tầng (Story)', editable: true },
    { key: 'elevation_m', header: 'Cao độ Z (m)', type: 'number', editable: true },
    { key: 'height_m', header: 'Chiều cao h (m)', type: 'number', editable: true },
    { key: 'type', header: 'Phân loại', editable: true },
    { key: 'isMasterStory', header: 'Tầng chuẩn (Master)', render: (r) => (r.isMasterStory ? 'YES' : 'NO') },
  ];

  // Sections Columns Definition
  const sectionColumns: ColumnDef<SectionData>[] = [
    { key: 'name', header: 'Tên Tiết Diện', editable: true },
    { key: 'type', header: 'Loại Cấu Kiện', editable: true },
    { key: 'shape', header: 'Hình Dạng', editable: true },
    {
      key: 'dimensions',
      header: 'Kích Thước (mm)',
      render: (r) =>
        r.dimensions.b_mm && r.dimensions.h_mm
          ? `${r.dimensions.b_mm} x ${r.dimensions.h_mm}`
          : `Dày ${r.dimensions.t_mm || 120}mm`,
    },
    { key: 'rebarCover_mm', header: 'Lớp bảo vệ (mm)', type: 'number', editable: true },
  ];

  // Materials Columns Definition
  const materialColumns: ColumnDef<MaterialData>[] = [
    { key: 'name', header: 'Tên Vật Liệu', editable: true },
    { key: 'type', header: 'Loại Vật Liệu', editable: true },
    { key: 'grade', header: 'Mác / Cấp Độ Bền', editable: true },
    { key: 'fc_MPa', header: 'Cường độ nén f_c (MPa)', type: 'number', editable: true },
    { key: 'E_MPa', header: 'Môđun Đàn Hồi E (MPa)', type: 'number', editable: true },
    { key: 'standard', header: 'Tiêu Chuẩn', editable: true },
  ];

  // Joints Columns Definition
  const jointColumns: ColumnDef<ModelNode>[] = [
    { key: 'name', header: 'Tên Nút (Joint)', editable: true },
    { key: 'x', header: 'Tọa độ X (m)', type: 'number', editable: true },
    { key: 'y', header: 'Tọa độ Y (m)', type: 'number', editable: true },
    { key: 'z', header: 'Tọa độ Z (m)', type: 'number', editable: true },
    { key: 'story', header: 'Tầng', editable: true },
    { key: 'restraint', header: 'Liên kết gối (Restraint)', editable: true },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Bảng Dữ Liệu Hình Học & Tiết Diện Mô Hình</h2>
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              Excel-like Interactive Spreadsheet Grid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý cao trình tầng, danh mục tiết diện dầm cột, vật liệu và tạo nhanh lưới trục tự động.
          </p>
        </div>
      </div>

      {/* Quick Grid Generator Card */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider">
          <Grid className="w-4 h-4 text-sky-600" /> Tạo nhanh lưới trục thông minh (Quick Grid Generator)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Chuỗi nhịp phương X (mm):</label>
            <input
              type="text"
              value={quickGridX}
              onChange={(e) => setQuickGridX(e.target.value)}
              placeholder="VD: 3600x5 + 4200x3"
              className="w-full p-2 border border-slate-300 rounded bg-white font-mono text-xs font-bold text-sky-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Chuỗi nhịp phương Y (mm):</label>
            <input
              type="text"
              value={quickGridY}
              onChange={(e) => setQuickGridY(e.target.value)}
              placeholder="VD: 6000x4 + 7500x2"
              className="w-full p-2 border border-slate-300 rounded bg-white font-mono text-xs font-bold text-sky-800"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleParseQuickGrid}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Sinh Lưới & Cập Nhật Mô Hình
            </button>
          </div>
        </div>

        <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono text-[11px]">
          {gridParsedResult}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('STORIES')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'STORIES' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cao trình tầng (Stories - {project.stories.length})
        </button>
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'SECTIONS' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tiết diện (Sections - {project.sections.length})
        </button>
        <button
          onClick={() => setActiveTab('MATERIALS')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'MATERIALS' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Vật liệu (Materials - {project.materials.length})
        </button>
        <button
          onClick={() => setActiveTab('JOINTS')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'JOINTS' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tọa độ Nút (Joints - {project.nodes.length})
        </button>
      </div>

      {/* Spreadsheet Tables */}
      {activeTab === 'STORIES' && (
        <ExcelDataGrid
          title="Bảng dữ liệu Cao trình Tầng (Story Elevations & Heights)"
          columns={storyColumns}
          data={project.stories}
          onDataChange={(newStories) => onUpdateProject({ ...project, stories: newStories })}
          onAddRow={() =>
            onUpdateProject({
              ...project,
              stories: [
                ...project.stories,
                {
                  id: `st-${Date.now()}`,
                  name: `Story ${project.stories.length + 1}`,
                  elevation_m: (project.stories[project.stories.length - 1]?.elevation_m || 0) + 3.4,
                  height_m: 3.4,
                  isMasterStory: false,
                  type: 'Typical',
                },
              ],
            })
          }
          exportFileName="stories_data.csv"
        />
      )}

      {activeTab === 'SECTIONS' && (
        <ExcelDataGrid
          title="Bảng định nghĩa Tiết diện Cột, Dầm, Vách, Sàn"
          columns={sectionColumns}
          data={project.sections}
          onDataChange={(newSecs) => onUpdateProject({ ...project, sections: newSecs })}
          exportFileName="sections_data.csv"
        />
      )}

      {activeTab === 'MATERIALS' && (
        <ExcelDataGrid
          title="Bảng định nghĩa Vật liệu Bê tông, Cốt thép, Cáp DƯL"
          columns={materialColumns}
          data={project.materials}
          onDataChange={(newMats) => onUpdateProject({ ...project, materials: newMats })}
          exportFileName="materials_data.csv"
        />
      )}

      {activeTab === 'JOINTS' && (
        <ExcelDataGrid
          title="Bảng Tọa độ Nút và Điều kiện Biên gối tựa (Joint Coordinates & Restraints)"
          columns={jointColumns}
          data={project.nodes}
          onDataChange={(newNodes) => onUpdateProject({ ...project, nodes: newNodes })}
          exportFileName="joints_data.csv"
        />
      )}
    </div>
  );
};
