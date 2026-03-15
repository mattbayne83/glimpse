import { Upload, FileSpreadsheet, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onExampleClick?: () => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({ onFileSelect, onExampleClick, isLoading = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12
          transition-all duration-200 cursor-pointer shadow
          ${isDragging ? 'border-[#0066CC] bg-[#E6F2FF]' : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'}
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
              <FileSpreadsheet className="w-16 h-16 text-[#0066CC] animate-pulse" />
              <div>
                <p className="text-lg font-medium text-[#334155]">Analyzing your data...</p>
                <p className="text-sm text-[#64748B] mt-1">This may take a moment</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-[#94A3B8]" />
              <div>
                <p className="text-lg font-medium text-[#334155]">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  or click to browse (max 10MB)
                </p>
              </div>
              <div className="mt-2 px-4 py-2 bg-[#F1F5F9] rounded text-xs text-[#475569]">
                <p className="font-medium">🔒 Privacy First</p>
                <p className="mt-1 text-[#64748B]">All analysis runs locally in your browser</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg text-sm text-[#991B1B]">
          {error}
        </div>
      )}

      {onExampleClick && !isLoading && (
        <div className="mt-4 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExampleClick();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#0066CC] hover:text-[#0052A3] hover:bg-[#E6F2FF] rounded-md transition-colors duration-150"
          >
            <Sparkles className="w-4 h-4" />
            Try Example Dataset
          </button>
        </div>
      )}
    </div>
  );
}
