import { Upload, FileSpreadsheet, Flower2, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      return 'Please upload a CSV or Excel file (.xlsx)';
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

  // Helper to get icon for dataset
  const getDatasetIcon = (name: string) => {
    if (name.includes('Retail') || name.includes('Sales')) return TrendingUp;
    if (name.includes('Commerce')) return ShoppingCart;
    if (name.includes('SaaS')) return TrendingUp;
    if (name.includes('Iris')) return Flower2;
    return FileSpreadsheet;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative rounded-2xl p-8
          transition-all duration-300 cursor-pointer glass-card
          group hover:scale-[1.02] active:scale-[0.98]
          ${isDragging ? 'border-primary shadow-[0_0_40px_rgba(0,102,204,0.1)] ring-2 ring-primary/20 bg-primary/5' : ''}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Animated background glow on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors rounded-2xl pointer-events-none" />
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-6 text-center relative z-10">
          {isLoading ? (
            <>
              <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center animate-pulse">
                <FileSpreadsheet className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">Analyzing your data...</p>
                <p className="text-sm text-text-secondary mt-1">Sifting through the rows and columns</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-bg-hover group-hover:bg-primary-light flex items-center justify-center transition-colors duration-300 shadow-inner">
                <Upload className="w-10 h-10 text-text-tertiary group-hover:text-primary transition-colors duration-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary tracking-tight">
                  Drop your CSV or Excel file here
                </p>
                <p className="text-text-secondary mt-2">
                  or click to browse your local files
                </p>
              </div>
              
              <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-bg-hover/50 backdrop-blur-sm rounded-full border border-border-default text-xs font-medium text-text-secondary shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-success"></span>
                <span>Privacy First: All processing runs locally</span>
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
        <div className="mt-4">
          {/* Section Header */}
          <div className="text-center mb-4">
            <p className="text-sm text-text-secondary">or try a sample dataset</p>
          </div>

          {/* Sample Dataset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleDatasets.map((dataset) => {
              const Icon = getDatasetIcon(dataset.name);

              return (
                <button
                  key={dataset.name}
                  onClick={() => onExampleSelect(dataset)}
                  className="group relative p-3 bg-bg-page hover:bg-bg-hover border border-border-default hover:border-primary/30 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left flex items-center gap-3"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-light group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-200">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Dataset Name */}
                    <h3 className="font-semibold text-text-primary mb-0.5 truncate">
                      {dataset.name
                        .replace('Retail Sales (Daily)', 'Retail Sales')
                        .replace('E-Commerce Customers', 'E-Commerce')
                        .replace('SaaS Product Usage', 'SaaS Usage')}
                    </h3>

                    {/* Dimensions */}
                    {dataset.rows && dataset.columns && (
                      <p className="text-xs text-text-tertiary font-mono mb-1">
                        {dataset.rows.toLocaleString()} × {dataset.columns}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-xs text-text-secondary leading-snug line-clamp-2">
                      {dataset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
