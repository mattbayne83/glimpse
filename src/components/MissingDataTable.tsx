import { useMemo, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { ColumnAnalysis } from '../types/analysis';
import { Tooltip } from './Tooltip';

// Statistical term definitions for inline help tooltips
const TERM_DEFINITIONS = {
  completeness: {
    term: 'Completeness',
    content: 'The percentage of non-missing values in a column. Higher is better.',
    example: 'A column with 950 filled values out of 1,000 rows has 95% completeness.',
  },
} as const;

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
    if (missingPercent >= 75) return 'bg-[var(--color-quality-poor)]'; // Red
    if (missingPercent >= 50) return 'bg-[var(--color-quality-fair)]'; // Orange
    if (missingPercent >= 25) return 'bg-[var(--color-quality-good)]'; // Yellow
    return 'bg-[var(--color-quality-excellent)]'; // Green
  };

  if (columnsWithMissing.length === 0) {
    return (
      <div className="p-4 bg-success-bg border border-success-border rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-medium text-success-text mb-1">No Missing Data</h3>
            <p className="text-sm text-success">All columns are 100% complete!</p>
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
        <div className="p-3 bg-bg-surface border border-border-default rounded-lg">
          <p className="text-xs text-text-secondary mb-1">Columns with Missing Data</p>
          <p className="text-xl font-bold text-text-primary">
            {columnsWithMissing.length} of {columns.length}
          </p>
        </div>
        <div className="p-3 bg-bg-surface border border-border-default rounded-lg">
          <p className="text-xs text-text-secondary mb-1 inline-flex items-center gap-1.5">
            Avg Completeness
            <Tooltip {...TERM_DEFINITIONS.completeness}>
              <HelpCircle className="w-4 h-4 text-text-secondary hover:text-text-primary cursor-help transition-colors" />
            </Tooltip>
          </p>
          <p className="text-xl font-bold text-text-primary">{avgCompleteness.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-bg-surface border border-border-default rounded-lg">
          <p className="text-xs text-text-secondary mb-1">Most Complete</p>
          <p className="text-sm font-medium text-text-primary truncate" title={mostComplete.name}>
            {mostComplete.name} ({mostComplete.populatedPercent.toFixed(1)}%)
          </p>
        </div>
        <div className="p-3 bg-bg-surface border border-border-default rounded-lg">
          <p className="text-xs text-text-secondary mb-1">Least Complete</p>
          <p className="text-sm font-medium text-text-primary truncate" title={leastComplete.name}>
            {leastComplete.name} ({leastComplete.populatedPercent.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <span className="font-medium text-text-primary">Color Guide:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--color-quality-excellent)]" />
          <span>&gt;75% complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--color-quality-good)]" />
          <span>50-75% complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--color-quality-fair)]" />
          <span>25-50% complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--color-quality-poor)]" />
          <span>&lt;25% complete</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-page border-b border-border-default">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-text-primary cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Column Name
                    {sortField === 'name' && (
                      <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-primary">Type</th>
                <th className="px-4 py-3 text-right font-medium text-text-primary">Total</th>
                <th
                  className="px-4 py-3 text-right font-medium text-text-primary cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => handleSort('populated')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Populated
                    {sortField === 'populated' && (
                      <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right font-medium text-text-primary cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => handleSort('missing')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Missing
                    {sortField === 'missing' && (
                      <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-primary min-w-[200px]">
                  <span className="inline-flex items-center gap-1.5">
                    Completeness
                    <Tooltip {...TERM_DEFINITIONS.completeness}>
                      <HelpCircle className="w-4 h-4 text-text-secondary hover:text-text-primary cursor-help transition-colors" />
                    </Tooltip>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {sortedData.map((col) => (
                <tr key={col.name} className="hover:bg-bg-page transition-colors">
                  <td
                    className="px-4 py-3 font-mono text-text-primary max-w-xs truncate cursor-pointer hover:text-primary hover:underline"
                    title={col.name}
                    onClick={() => onColumnClick?.(col.name)}
                  >
                    {col.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${
                        col.type === 'numeric'
                          ? 'bg-secondary-light text-secondary'
                          : col.type === 'categorical'
                          ? 'bg-primary-light text-primary'
                          : 'bg-bg-hover text-text-secondary'
                      }`}
                    >
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-secondary">
                    {col.totalRows.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {col.populated.toLocaleString()}{' '}
                    <span className="text-text-secondary text-xs">({col.populatedPercent.toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {col.missing.toLocaleString()}{' '}
                    <span className="text-text-secondary text-xs">({col.missingPercent.toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-border-default rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${getColorClasses(col.missingPercent)}`}
                          style={{ width: `${col.populatedPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-secondary w-12 text-right">
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
