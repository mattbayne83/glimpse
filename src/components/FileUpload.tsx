import { Upload, FileSpreadsheet, Sparkles, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { SampleDataset } from '../data/sampleDatasets';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onExampleSelect?: (dataset: SampleDataset) => void;
  sampleDatasets?: SampleDataset[];
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({ onFileSelect, onExampleSelect, sampleDatasets = [], isLoading = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith('.csv')) {
      return 'Please upload a CSV file';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File exceeds 10MB limit. For larger datasets, try sampling or filtering your data first.';
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSampleMenu(false);
      }
    };

    if (showSampleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSampleMenu]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12
          transition-all duration-200 cursor-pointer shadow
          ${isDragging ? 'border-primary bg-primary-light' : 'border-border-hover bg-bg-surface hover:border-text-tertiary'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          {isLoading ? (
            <>
              <FileSpreadsheet className="w-16 h-16 text-primary animate-pulse" />
              <div>
                <p className="text-lg font-medium text-text-primary">Analyzing your data...</p>
                <p className="text-sm text-text-secondary mt-1">This may take a moment</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-text-tertiary" />
              <div>
                <p className="text-lg font-medium text-text-primary">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  or click to browse (max 10MB)
                </p>
              </div>
              <div className="mt-2 px-4 py-2 bg-bg-hover rounded text-xs text-text-secondary">
                <p className="font-medium">🔒 Privacy First</p>
                <p className="mt-1 text-text-secondary">All analysis runs locally in your browser</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-error-bg border border-error-border rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      {onExampleSelect && sampleDatasets.length > 0 && !isLoading && (
        <div className="mt-4 text-center relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSampleMenu(!showSampleMenu);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary-hover hover:bg-primary-light rounded-md transition-colors duration-150"
          >
            <Sparkles className="w-4 h-4" />
            Try Example Dataset
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showSampleMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-bg-surface border border-border-default rounded-lg shadow-lg z-50 min-w-[280px] max-h-[320px] overflow-y-auto">
              {sampleDatasets.map((dataset) => (
                <button
                  key={dataset.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSampleMenu(false);
                    onExampleSelect(dataset);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-bg-page transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-bg-hover last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm">{dataset.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{dataset.description}</p>
                    </div>
                    {(dataset.rows || dataset.columns) && (
                      <div className="flex-shrink-0 text-xs text-text-tertiary font-mono">
                        {dataset.rows && dataset.columns && `${dataset.rows.toLocaleString()}×${dataset.columns}`}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
