import { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Search } from 'lucide-react';
import type { AnalysisResult, ColumnAnalysis } from '../types/analysis';
import { TabNavigation } from './TabNavigation';
import { ColumnMap } from './ColumnMap';
import { MissingDataTable } from './MissingDataTable';
import { ConfirmModal } from './ConfirmModal';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ColumnDetailModal } from './ColumnDetailModal';
import { ColumnPreviewCard } from './ColumnPreviewCard';

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
  const [columnSearch, setColumnSearch] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Esc: Close modal (if open) or show clear confirmation
      if (e.key === 'Escape' && !selectedColumn) {
        setShowClearModal(true);
      }

      // Arrow keys: Navigate tabs (only when no modal open)
      if (!selectedColumn) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (activeTab === 'columns') setActiveTab('overview');
          else if (activeTab === 'quality') setActiveTab('columns');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (activeTab === 'overview') setActiveTab('columns');
          else if (activeTab === 'columns') setActiveTab('quality');
        }
      }

      // Number keys: Jump to tab (1=Overview, 2=Columns, 3=Quality)
      if (!selectedColumn) {
        if (e.key === '1') setActiveTab('overview');
        else if (e.key === '2') setActiveTab('columns');
        else if (e.key === '3') setActiveTab('quality');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedColumn]);

  // Export analysis as JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${datasetName.replace(/\.[^/.]+$/, '')}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard with feedback
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Filter columns by type and search query
  const filteredColumns = columns.filter((col) => {
    // Type filter
    const matchesType = columnFilter === 'all' || col.analysis.type === columnFilter;
    // Search filter (case-insensitive)
    const matchesSearch = columnSearch === '' || col.name.toLowerCase().includes(columnSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Count quality issues
  const qualityIssueCount =
    (quality.duplicateRows > 0 ? 1 : 0) +
    quality.highMissingColumns.length +
    quality.highCardinalityColumns.length;

  // Build tabs array
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
          <h1 className="text-4xl font-bold leading-snug text-text-primary">{datasetName}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {overview.rows.toLocaleString()} rows × {overview.columns} columns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors duration-150"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors duration-150"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            overview={overview}
            columns={columns}
            correlation={result.correlation}
            datasetName={datasetName}
            onCopy={copyToClipboard}
            copiedId={copiedId}
            onColumnClick={setSelectedColumn}
          />
        )}
        {activeTab === 'columns' && (
          <ColumnsTab
            columns={filteredColumns}
            filter={columnFilter}
            onFilterChange={setColumnFilter}
            searchQuery={columnSearch}
            onSearchChange={setColumnSearch}
            onColumnClick={setSelectedColumn}
            totalRows={overview.rows}
          />
        )}
        {activeTab === 'quality' && (
          <QualityTab quality={quality} columns={columns} totalRows={overview.rows} onColumnClick={setSelectedColumn} />
        )}
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Analysis?"
        message="This will remove all analysis results. You'll need to upload your CSV file again to see the analysis."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowClearModal(false);
          onClear();
        }}
        onCancel={() => setShowClearModal(false)}
      />

      {/* Column Detail Modal */}
      {selectedColumn && (
        <ColumnDetailModal
          columnName={selectedColumn}
          result={result}
          onClose={() => setSelectedColumn(null)}
        />
      )}
    </div>
  );
}

// Overview Tab
interface OverviewTabProps {
  overview: AnalysisResult['overview'];
  columns: ColumnAnalysis[];
  correlation?: AnalysisResult['correlation'];
  datasetName: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onColumnClick: (columnName: string) => void;
}

function OverviewTab({ overview, columns, correlation, datasetName, onCopy, copiedId, onColumnClick }: OverviewTabProps) {
  // Format overview as markdown
  const formatOverviewMarkdown = () => {
    return `# ${datasetName} - Dataset Overview

## Statistics
- **Rows:** ${overview.rows.toLocaleString()}
- **Columns:** ${overview.columns}
- **Memory:** ${(overview.memoryBytes / 1024 / 1024).toFixed(2)} MB
- **Missing Values:** ${overview.missingPercentage.toFixed(1)}%

## Column Types
- **Numeric:** ${overview.columnTypes.numeric}
- **Categorical:** ${overview.columnTypes.categorical}
- **DateTime:** ${overview.columnTypes.datetime}`;
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Dataset Statistics</h2>
        <button
          onClick={() => onCopy(formatOverviewMarkdown(), 'overview')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors duration-150"
        >
          {copiedId === 'overview' ? (
            <>
              <Check className="w-4 h-4 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Stats
            </>
          )}
        </button>
      </div>
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
        <ColumnMap columns={columns} totalRows={overview.rows} onColumnClick={onColumnClick} />
      </div>

      <div className="p-4 bg-bg-hover rounded-lg">
        <p className="text-sm font-medium text-text-primary mb-2">Column Types</p>
        <div className="flex gap-4 text-sm">
          <span className="text-text-secondary">
            Numeric: <span className="font-medium text-text-primary">{overview.columnTypes.numeric}</span>
          </span>
          <span className="text-text-secondary">
            Categorical:{' '}
            <span className="font-medium text-text-primary">{overview.columnTypes.categorical}</span>
          </span>
          <span className="text-text-secondary">
            DateTime: <span className="font-medium text-text-primary">{overview.columnTypes.datetime}</span>
          </span>
        </div>
      </div>

      {/* Correlation Matrix Section */}
      {correlation && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Correlation Analysis</h2>
          <p className="text-sm text-text-secondary mb-4">
            Shows relationships between {correlation.columns.length} numeric columns
          </p>
          <CorrelationMatrix data={correlation} />
        </div>
      )}
    </div>
  );
}

// Columns Tab
interface ColumnsTabProps {
  columns: ColumnAnalysis[];
  filter: ColumnFilter;
  onFilterChange: (filter: ColumnFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onColumnClick: (columnName: string) => void;
  totalRows: number;
}

function ColumnsTab({ columns, filter, onFilterChange, searchQuery, onSearchChange, onColumnClick, totalRows }: ColumnsTabProps) {
  const filters: { value: ColumnFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'categorical', label: 'Categorical' },
    { value: 'datetime', label: 'DateTime' },
  ];

  return (
    <div className="min-w-0">
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search columns..."
          className="w-full pl-10 pr-10 py-2 text-sm bg-bg-surface text-text-primary placeholder:text-text-tertiary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
                  ? 'bg-primary-light text-primary font-medium'
                  : 'bg-bg-hover text-text-secondary hover:bg-border-default'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Column Preview Cards */}
      <div className="space-y-3">
        {columns.map((col) => (
          <ColumnPreviewCard
            key={col.name}
            column={col}
            totalRows={totalRows}
            onClick={() => onColumnClick(col.name)}
          />
        ))}
      </div>
    </div>
  );
}

// Quality Tab
interface QualityTabProps {
  quality: AnalysisResult['quality'];
  columns: ColumnAnalysis[];
  totalRows: number;
  onColumnClick: (columnName: string) => void;
}

function QualityTab({ quality, columns, totalRows, onColumnClick }: QualityTabProps) {
  const hasIssues =
    quality.duplicateRows > 0 ||
    quality.highMissingColumns.length > 0 ||
    quality.highCardinalityColumns.length > 0;

  if (!hasIssues) {
    return (
      <div className="min-w-0">
        <div className="p-4 bg-success-bg border border-success-border rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="text-xl font-semibold text-success-text mb-2">No issues found!</h3>
              <p className="text-success">Your dataset looks clean and ready to use.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Missing Data Section */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-3">Missing Data Analysis</h2>
        <MissingDataTable columns={columns} totalRows={totalRows} onColumnClick={onColumnClick} />
      </div>

      {/* Duplicate Rows */}
      {quality.duplicateRows > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Duplicate Rows</h2>
          <div className="p-4 bg-warning-bg border border-warning-border rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-medium text-warning-text mb-1">Found Duplicate Rows</h3>
                <p className="text-sm text-warning">
                  {quality.duplicateRows.toLocaleString()} duplicate rows (
                  {quality.duplicatePercentage.toFixed(1)}% of dataset)
                </p>
                <p className="text-xs text-warning-text mt-2">
                  Consider removing duplicates if they're unintentional.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High Cardinality */}
      {quality.highCardinalityColumns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">High Cardinality Columns</h2>
          <div className="p-4 bg-primary-light border border-primary-border rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="font-medium text-primary mb-1">
                  {quality.highCardinalityColumns.length} columns with &gt;100 unique values
                </h3>
                <p className="text-sm text-primary mb-2">
                  These categorical columns have high cardinality:
                </p>
                <div className="flex flex-wrap gap-1">
                  {quality.highCardinalityColumns.map((col) => (
                    <span
                      key={col}
                      className="px-2 py-1 bg-primary-border text-primary text-xs rounded font-mono"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-primary mt-2">
                  High cardinality may indicate these should be treated as IDs, not categories.
                </p>
              </div>
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
    <div className="p-4 bg-bg-surface border border-border-default rounded-lg shadow-sm">
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          color === 'red' ? 'text-error' : 'text-text-primary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
