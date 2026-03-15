import { AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { formatErrorForDisplay } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const { title, message, suggestions } = formatErrorForDisplay(error);

  return (
    <div className="mt-6 max-w-2xl mx-auto bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg shadow-sm overflow-hidden">
      {/* Error Header */}
      <div className="p-4 border-b border-[#FCA5A5]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#991B1B] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#991B1B]">{title}</h3>
            <p className="text-sm text-[#DC2626] mt-1">{message}</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-[#FFF7ED] border-t border-[#FED7AA]">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-[#C2410C] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-[#C2410C] mb-2">Suggestions:</p>
              <ul className="space-y-1.5">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs text-[#9A3412] flex items-start gap-2">
                    <span className="text-[#FB923C] mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (
        <div className="p-4 bg-white border-t border-[#FCA5A5] flex justify-end">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-md transition-colors duration-150 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
