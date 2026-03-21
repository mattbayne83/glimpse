import { useState, useEffect, useCallback } from 'react';
import { X, Search, Hash, CaseSensitive, CalendarClock, BookOpen } from 'lucide-react';
import type { AnalysisResult, ColumnAnalysis } from '../types/analysis';
import { TabNavigation } from './TabNavigation';
import { ColumnMap } from './ColumnMap';
import { MissingDataTable } from './MissingDataTable';
import { ConfirmModal } from './ConfirmModal';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ColumnDetailModal } from './ColumnDetailModal';
import { ColumnPreviewCard } from './ColumnPreviewCard';
import StoryMode from './story/StoryMode';
import { generateStory } from '../utils/story/storyGenerator';

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
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showStory, setShowStory] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Removed Escape key mapping for 'Clear Analysis' as it conflicts with closing modals.

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


  // Filter columns by type and search query
  const filteredColumns = columns.filter((col) => {
    // Type filter
    const matchesType = columnFilter === 'all' || col.analysis.type === columnFilter;
    // Search filter (case-insensitive)
    const matchesSearch = columnSearch === '' || col.name.toLowerCase().includes(columnSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Handle column navigation (arrow keys in detail modal)
  const handleColumnNavigation = useCallback((direction: 'prev' | 'next') => {
    if (!selectedColumn) return;

    const currentIndex = filteredColumns.findIndex((col) => col.name === selectedColumn);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'prev') {
      // Wrap to end if at start
      newIndex = currentIndex === 0 ? filteredColumns.length - 1 : currentIndex - 1;
    } else {
      // Wrap to start if at end
      newIndex = currentIndex === filteredColumns.length - 1 ? 0 : currentIndex + 1;
    }

    setSelectedColumn(filteredColumns[newIndex].name);
  }, [selectedColumn, filteredColumns]);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold leading-snug text-text-primary truncate">{datasetName}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {overview.rows.toLocaleString()} rows × {overview.columns} columns
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowStory(true)}
            className="group relative overflow-hidden flex items-center gap-1.5 px-5 py-2.5 text-sm bg-[linear-gradient(135deg,#0066CC_0%,#0D9488_100%)] text-white hover:shadow-lg rounded-full transition-all duration-300 font-medium shadow-sm whitespace-nowrap active:scale-95 animate-shine"
          >
            <BookOpen className="w-4 h-4 relative z-10 text-white" />
            <span className="hidden sm:inline relative z-10 text-white font-semibold">Tell the Story</span>
            <span className="sm:hidden relative z-10 text-white font-semibold">Story</span>
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="p-2 text-text-tertiary hover:text-error hover:bg-error-bg rounded-full transition-colors duration-150"
            title="Clear analysis and start over"
          >
            <X className="w-5 h-5" />
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
            correlationSignificance={result.correlationSignificance}
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

      {/* Story Mode */}
      {showStory && (
        <StoryMode
          slides={generateStory(result, datasetName)}
          onClose={() => {
            setShowStory(false);
            setActiveTab('overview');
          }}
        />
      )}

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
          columnIndex={filteredColumns.findIndex((col) => col.name === selectedColumn)}
          totalColumns={filteredColumns.length}
          onNavigate={handleColumnNavigation}
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
  correlationSignificance?: AnalysisResult['correlationSignificance'];
  onColumnClick: (columnName: string) => void;
}

function OverviewTab({ overview, columns, correlation, correlationSignificance, onColumnClick }: OverviewTabProps) {
  return (
    <div className="min-w-0">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Dataset Statistics</h2>
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
        <p className="text-sm font-medium text-text-primary mb-3">Column Types</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-secondary/10 rounded-md text-secondary">
              <Hash className="w-4 h-4" />
            </div>
            <span className="text-text-secondary">
              Numeric: <span className="font-medium text-text-primary">{overview.columnTypes.numeric}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
              <CaseSensitive className="w-4 h-4" />
            </div>
            <span className="text-text-secondary">
              Categorical:{' '}
              <span className="font-medium text-text-primary">{overview.columnTypes.categorical}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-text-secondary/10 rounded-md text-text-secondary">
              <CalendarClock className="w-4 h-4" />
            </div>
            <span className="text-text-secondary">
              DateTime: <span className="font-medium text-text-primary">{overview.columnTypes.datetime}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Correlation Matrix Section */}
      {correlation && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Correlation Analysis</h2>
          <p className="text-sm text-text-secondary mb-4">
            Shows relationships between {correlation.columns.length} numeric columns
          </p>
          <CorrelationMatrix
            data={correlation}
            significance={correlationSignificance}
          />
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

  const getFilterIcon = (type: ColumnFilter) => {
    switch (type) {
      case 'numeric': return <Hash className="w-3.5 h-3.5" />;
      case 'categorical': return <CaseSensitive className="w-3.5 h-3.5" />;
      case 'datetime': return <CalendarClock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

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

      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors duration-150
              ${
                filter === f.value
                  ? 'bg-primary-light text-primary font-medium'
                  : 'bg-bg-hover text-text-secondary hover:bg-border-default'
              }
            `}
          >
            {getFilterIcon(f.value)}
            {f.label}
          </button>
        ))}
      </div>

      {/* Column Preview Cards - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      className="px-2 py-1 bg-bg-surface text-primary text-xs rounded font-mono border border-primary/20"
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
    <div className="p-4 bg-bg-surface border border-border-default rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default">
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
