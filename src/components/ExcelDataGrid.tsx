import React, { useState } from 'react';
import { Plus, Trash2, Download, Search, Table } from 'lucide-react';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  type?: 'text' | 'number' | 'select' | 'badge';
  options?: string[];
  render?: (row: T, index: number) => React.ReactNode;
  editable?: boolean;
}

interface ExcelDataGridProps<T> {
  title: string;
  columns: ColumnDef<T>[];
  data: T[];
  onDataChange?: (newData: T[]) => void;
  onAddRow?: () => void;
  onDeleteRow?: (index: number) => void;
  exportFileName?: string;
}

export function ExcelDataGrid<T extends Record<string, any>>({
  title,
  columns,
  data,
  onDataChange,
  onAddRow,
  onDeleteRow,
  exportFileName = 'export_data.csv',
}: ExcelDataGridProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colKey: string } | null>(null);

  const filteredData = data.filter((row) =>
    Object.values(row).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCellChange = (rowIdx: number, colKey: string, value: any) => {
    if (!onDataChange) return;
    const updated = [...data];
    updated[rowIdx] = {
      ...updated[rowIdx],
      [colKey]: isNaN(Number(value)) || value === '' ? value : Number(value),
    };
    onDataChange(updated);
  };

  const exportCSV = () => {
    const headers = columns.map((c) => `"${c.header}"`).join(',');
    const rows = data.map((r) =>
      columns
        .map((c) => {
          const val = r[c.key as string];
          return `"${val !== undefined ? String(val).replace(/"/g, '""') : ''}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-sky-600" />
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
            {filteredData.length} hàng
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dữ liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 w-40 sm:w-56"
            />
          </div>

          {onAddRow && (
            <button
              onClick={onAddRow}
              className="px-2.5 py-1 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-md flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm hàng
            </button>
          )}

          <button
            onClick={exportCSV}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 transition-colors border border-slate-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="p-2 w-10 text-center font-semibold text-slate-500">#</th>
              {columns.map((col, i) => (
                <th key={i} className={`p-2 font-semibold ${col.width || 'auto'}`}>
                  {col.header}
                </th>
              ))}
              {onDeleteRow && <th className="p-2 w-12 text-center font-semibold">Xóa</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-sky-50/50 transition-colors">
                <td className="p-2 text-center text-slate-400 font-sans">{rowIdx + 1}</td>
                {columns.map((col, colIdx) => {
                  const keyStr = col.key as string;
                  const val = row[keyStr];
                  const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colKey === keyStr;

                  return (
                    <td
                      key={colIdx}
                      className="p-1.5 text-slate-800"
                      onClick={() => col.editable !== false && setEditingCell({ rowIdx, colKey: keyStr })}
                    >
                      {col.render ? (
                        col.render(row, rowIdx)
                      ) : isEditing && onDataChange ? (
                        <input
                          autoFocus
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={val !== undefined ? val : ''}
                          onChange={(e) => handleCellChange(rowIdx, keyStr, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCell(null);
                          }}
                          className="w-full p-1 border border-sky-500 rounded bg-white text-xs font-mono focus:outline-hidden"
                        />
                      ) : (
                        <span className="block px-1 py-0.5 select-all">
                          {val !== undefined ? String(val) : '—'}
                        </span>
                      )}
                    </td>
                  );
                })}

                {onDeleteRow && (
                  <td className="p-1.5 text-center">
                    <button
                      onClick={() => onDeleteRow(rowIdx)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Xóa hàng này"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
