import { useMemo, useState } from 'react';
import type { ColumnAnalysis } from '../types/analysis';

interface MissingDataTableProps {
  columns: ColumnAnalysis[];
  totalRows: number;
  onColumnClick?: (columnName: string) => void;
}

type SortField = 'name' | 'missing' | 'populated';
type SortDirection = 'asc' | 'desc';

interface ColumnMissingData {
  name: string;
  type: string;
  totalRows: number;
  missing: number;
  missingPercent: number;
  populated: number;
  populatedPercent: number;
}

export function MissingDataTable({ columns, totalRows, onColumnClick }: MissingDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('missing');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Extract missing data for all columns
  const missingData = useMemo<ColumnMissingData[]>(() => {
    return columns.map((col) => {
      const missing = col.analysis.stats.missing;
      const populated = totalRows - missing;
      return {
        name: col.name,
        type: col.analysis.type,
        totalRows,
        missing,
        missingPercent: (missing / totalRows) * 100,
        populated,
        populatedPercent: (populated / totalRows) * 100,
      };
    });
  }, [columns, totalRows]);

  // Filter to only show columns with missing data
  const columnsWithMissing = useMemo(() => {
    return missingData.filter((col) => col.missing > 0);
  }, [missingData]);

  // Sort data
  const sortedData = useMemo(() => {
    const data = [...columnsWithMissing];
    data.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'missing') {
        comparison = a.missing - b.missing;
      } else if (sortField === 'populated') {
        comparison = a.populated - b.populated;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return data;
  }, [columnsWithMissing, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Get color based on missing percentage
  const getColorClasses = (missingPercent: number) => {
    if (missingPercent >= 75) return 'bg-[#FCA5A5] text-[#991B1B]'; // Red
    if (missingPercent >= 50) return 'bg-[#FDE68A] text-[#92400E]'; // Yellow
    if (missingPercent >= 25) return 'bg-[#FED7AA] text-[#9A3412]'; // Orange
    return 'bg-[#D1FAE5] text-[#065F46]'; // Green
  };

  if (columnsWithMissing.length === 0) {
    return (
      <div className="p-4 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-medium text-[#065F46] mb-1">No Missing Data</h3>
            <p className="text-sm text-[#047857]">All columns are 100% complete!</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const mostComplete = sortedData.reduce((max, col) =>
    col.populatedPercent > max.populatedPercent ? col : max
  );
  const leastComplete = sortedData.reduce((min, col) =>
    col.populatedPercent < min.populatedPercent ? col : min
  );
  const avgCompleteness =
    sortedData.reduce((sum, col) => sum + col.populatedPercent, 0) / sortedData.length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
          <p className="text-xs text-[#64748B] mb-1">Columns with Missing Data</p>
          <p className="text-xl font-bold text-[#0F172A]">
            {columnsWithMissing.length} of {columns.length}
          </p>
        </div>
        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
          <p className="text-xs text-[#64748B] mb-1">Avg Completeness</p>
          <p className="text-xl font-bold text-[#0F172A]">{avgCompleteness.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
          <p className="text-xs text-[#64748B] mb-1">Most Complete</p>
          <p className="text-sm font-medium text-[#0F172A] truncate" title={mostComplete.name}>
            {mostComplete.name} ({mostComplete.populatedPercent.toFixed(1)}%)
          </p>
        </div>
        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
          <p className="text-xs text-[#64748B] mb-1">Least Complete</p>
          <p className="text-sm font-medium text-[#0F172A] truncate" title={leastComplete.name}>
            {leastComplete.name} ({leastComplete.populatedPercent.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
        <span className="font-medium text-[#334155]">Color Guide:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#D1FAE5]" />
          <span>&gt;75% complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FED7AA]" />
          <span>50-75% complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FDE68A]" />
          <span>25-50% complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FCA5A5]" />
          <span>&lt;25% complete</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-[#334155] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Column Name
                    {sortField === 'name' && (
                      <span className="text-[#0066CC]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#334155]">Type</th>
                <th className="px-4 py-3 text-right font-medium text-[#334155]">Total</th>
                <th
                  className="px-4 py-3 text-right font-medium text-[#334155] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                  onClick={() => handleSort('populated')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Populated
                    {sortField === 'populated' && (
                      <span className="text-[#0066CC]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right font-medium text-[#334155] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                  onClick={() => handleSort('missing')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Missing
                    {sortField === 'missing' && (
                      <span className="text-[#0066CC]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#334155] min-w-[200px]">
                  Completeness
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {sortedData.map((col) => (
                <tr key={col.name} className="hover:bg-[#F8FAFC] transition-colors">
                  <td
                    className="px-4 py-3 font-mono text-[#0F172A] max-w-xs truncate cursor-pointer hover:text-[#0066CC] hover:underline"
                    title={col.name}
                    onClick={() => onColumnClick?.(col.name)}
                  >
                    {col.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${
                        col.type === 'numeric'
                          ? 'bg-[#CCFBF1] text-[#0D9488]'
                          : col.type === 'categorical'
                          ? 'bg-[#E6F2FF] text-[#0066CC]'
                          : 'bg-[#F1F5F9] text-[#475569]'
                      }`}
                    >
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#64748B]">
                    {col.totalRows.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#0F172A]">
                    {col.populated.toLocaleString()}{' '}
                    <span className="text-[#64748B] text-xs">({col.populatedPercent.toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#0F172A]">
                    {col.missing.toLocaleString()}{' '}
                    <span className="text-[#64748B] text-xs">({col.missingPercent.toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#E2E8F0] rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${getColorClasses(col.missingPercent)}`}
                          style={{ width: `${col.populatedPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[#64748B] w-12 text-right">
                        {col.populatedPercent.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
