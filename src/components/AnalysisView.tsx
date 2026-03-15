import { useState } from 'react';
import { X } from 'lucide-react';
import type { AnalysisResult, ColumnAnalysis } from '../types/analysis';
import { TabNavigation } from './TabNavigation';
import { Histogram } from './Histogram';
import { ColumnMap } from './ColumnMap';

interface AnalysisViewProps {
  datasetName: string;
  result: AnalysisResult;
  onClear: () => void;
}

type TabId = 'overview' | 'columns' | 'quality';
type ColumnFilter = 'all' | 'numeric' | 'categorical' | 'datetime';

export function AnalysisView({ datasetName, result, onClear }: AnalysisViewProps) {
  const { overview, columns, quality } = result;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>('all');

  // Filter columns by type
  const filteredColumns = columns.filter((col) => {
    if (columnFilter === 'all') return true;
    return col.analysis.type === columnFilter;
  });

  // Count quality issues
  const qualityIssueCount =
    (quality.duplicateRows > 0 ? 1 : 0) +
    quality.highMissingColumns.length +
    quality.highCardinalityColumns.length;

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'columns' as const, label: 'Columns', count: columns.length },
    { id: 'quality' as const, label: 'Quality', count: qualityIssueCount },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold leading-snug text-[#0F172A]">{datasetName}</h1>
          <p className="text-sm text-[#64748B] mt-1">
            {overview.rows.toLocaleString()} rows × {overview.columns} columns
          </p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md transition-colors duration-150"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab overview={overview} columns={columns} />}
        {activeTab === 'columns' && (
          <ColumnsTab
            columns={filteredColumns}
            filter={columnFilter}
            onFilterChange={setColumnFilter}
          />
        )}
        {activeTab === 'quality' && <QualityTab quality={quality} />}
      </div>
    </div>
  );
}

// Overview Tab
interface OverviewTabProps {
  overview: AnalysisResult['overview'];
  columns: ColumnAnalysis[];
}

function OverviewTab({ overview, columns }: OverviewTabProps) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Rows" value={overview.rows.toLocaleString()} />
        <StatCard label="Columns" value={overview.columns} />
        <StatCard
          label="Memory"
          value={`${(overview.memoryBytes / 1024 / 1024).toFixed(2)} MB`}
        />
        <StatCard
          label="Missing Values"
          value={`${overview.missingPercentage.toFixed(1)}%`}
          color={overview.missingPercentage > 10 ? 'red' : 'gray'}
        />
      </div>

      {/* Visual Representation */}
      <div className="mb-6">
        <ColumnMap columns={columns} totalRows={overview.rows} />
      </div>

      <div className="p-4 bg-[#F1F5F9] rounded-lg">
        <p className="text-sm font-medium text-[#334155] mb-2">Column Types</p>
        <div className="flex gap-4 text-sm">
          <span className="text-[#64748B]">
            Numeric: <span className="font-medium text-[#0F172A]">{overview.columnTypes.numeric}</span>
          </span>
          <span className="text-[#64748B]">
            Categorical:{' '}
            <span className="font-medium text-[#0F172A]">{overview.columnTypes.categorical}</span>
          </span>
          <span className="text-[#64748B]">
            DateTime: <span className="font-medium text-[#0F172A]">{overview.columnTypes.datetime}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Columns Tab
interface ColumnsTabProps {
  columns: ColumnAnalysis[];
  filter: ColumnFilter;
  onFilterChange: (filter: ColumnFilter) => void;
}

function ColumnsTab({ columns, filter, onFilterChange }: ColumnsTabProps) {
  const filters: { value: ColumnFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'categorical', label: 'Categorical' },
    { value: 'datetime', label: 'DateTime' },
  ];

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`
              px-3 py-1.5 text-sm rounded-md transition-colors duration-150
              ${
                filter === f.value
                  ? 'bg-[#E6F2FF] text-[#0066CC] font-medium'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Column Cards */}
      <div className="space-y-4">
        {columns.map((col) => (
          <div key={col.name} className="p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
            <h3 className="font-semibold text-[#334155] mb-3 flex items-center gap-2">
              <span className="font-mono">{col.name}</span>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  col.analysis.type === 'numeric'
                    ? 'bg-[#CCFBF1] text-[#0D9488]'
                    : col.analysis.type === 'categorical'
                    ? 'bg-[#E6F2FF] text-[#0066CC]'
                    : 'bg-[#F1F5F9] text-[#475569]'
                }`}
              >
                {col.analysis.type}
              </span>
            </h3>

            {col.analysis.type === 'numeric' && (
              <div>
                {/* Histogram */}
                {col.analysis.stats.histogram && (
                  <div className="mb-4">
                    <Histogram
                      bins={col.analysis.stats.histogram.bins}
                      counts={col.analysis.stats.histogram.counts}
                      width={400}
                      height={100}
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-[#64748B]">Mean:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">
                      {col.analysis.stats.mean.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Std:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.std.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Min:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.min.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Max:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.max.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Median:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.q50.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Q1:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.q25.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Q3:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.q75.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Missing:</span>{' '}
                    <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.missing}</span>
                  </div>
                </div>
              </div>
            )}

            {col.analysis.type === 'categorical' && (
              <div>
                <div className="text-sm mb-3">
                  <span className="text-[#64748B]">Unique values:</span>{' '}
                  <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.uniqueCount}</span>
                  {' · '}
                  <span className="text-[#64748B]">Missing:</span>{' '}
                  <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.missing}</span>
                </div>
                <div className="space-y-1.5">
                  {col.analysis.stats.topValues.slice(0, 10).map((item) => (
                    <div key={item.value} className="flex items-center gap-2 text-xs">
                      <span className="text-[#334155] font-mono w-32 truncate">
                        {item.value}
                      </span>
                      <div className="flex-1 bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#0066CC] h-full transition-all duration-200"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-[#64748B] font-mono w-20 text-right">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {col.analysis.type === 'datetime' && (
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-[#64748B]">Range:</span>{' '}
                  <span className="font-medium font-mono text-[#0F172A]">
                    {col.analysis.stats.minDate} → {col.analysis.stats.maxDate}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B]">Unique:</span>{' '}
                  <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.uniqueCount}</span>
                  {' · '}
                  <span className="text-[#64748B]">Missing:</span>{' '}
                  <span className="font-medium font-mono text-[#0F172A]">{col.analysis.stats.missing}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Quality Tab
function QualityTab({ quality }: { quality: AnalysisResult['quality'] }) {
  const hasIssues =
    quality.duplicateRows > 0 ||
    quality.highMissingColumns.length > 0 ||
    quality.highCardinalityColumns.length > 0;

  if (!hasIssues) {
    return (
      <div className="p-4 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="text-xl font-semibold text-[#065F46] mb-2">No issues found!</h3>
            <p className="text-[#047857]">Your dataset looks clean and ready to use.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quality.duplicateRows > 0 && (
        <div className="p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-medium text-[#92400E] mb-1">Duplicate Rows</h3>
              <p className="text-sm text-[#B45309]">
                Found {quality.duplicateRows.toLocaleString()} duplicate rows (
                {quality.duplicatePercentage.toFixed(1)}% of dataset)
              </p>
              <p className="text-xs text-[#92400E] mt-2">
                Consider removing duplicates if they're unintentional.
              </p>
            </div>
          </div>
        </div>
      )}

      {quality.highMissingColumns.length > 0 && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <h3 className="font-medium text-[#991B1B] mb-1">
                High Missing Data ({quality.highMissingColumns.length} columns)
              </h3>
              <p className="text-sm text-[#DC2626] mb-2">
                These columns have more than 50% missing values:
              </p>
              <div className="flex flex-wrap gap-1">
                {quality.highMissingColumns.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-1 bg-[#FCA5A5] text-[#991B1B] text-xs rounded font-mono"
                  >
                    {col}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#991B1B] mt-2">
                Consider dropping these columns or investigating why data is missing.
              </p>
            </div>
          </div>
        </div>
      )}

      {quality.highCardinalityColumns.length > 0 && (
        <div className="p-4 bg-[#DBEAFE] border border-[#93C5FD] rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-medium text-[#1E40AF] mb-1">
                High Cardinality ({quality.highCardinalityColumns.length} columns)
              </h3>
              <p className="text-sm text-[#2563EB] mb-2">
                These categorical columns have more than 100 unique values:
              </p>
              <div className="flex flex-wrap gap-1">
                {quality.highCardinalityColumns.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-1 bg-[#93C5FD] text-[#1E40AF] text-xs rounded font-mono"
                  >
                    {col}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#1E40AF] mt-2">
                High cardinality may indicate these should be treated as IDs, not categories.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'gray' | 'red';
}

function StatCard({ label, value, color = 'gray' }: StatCardProps) {
  return (
    <div className="p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
      <p className="text-sm text-[#64748B] mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          color === 'red' ? 'text-[#EF4444]' : 'text-[#0F172A]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
