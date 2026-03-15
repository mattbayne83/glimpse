/**
 * Error categorization and user-friendly messaging for Glimpse
 */

export interface ErrorInfo {
  title: string;
  message: string;
  suggestions: string[];
  canRetry: boolean;
}

/**
 * Categorize errors and provide helpful suggestions
 */
export function categorizeError(error: unknown): ErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Pyodide loading errors
  if (errorString.includes('pyodide') || errorString.includes('cdn') || errorString.includes('failed to fetch')) {
    return {
      title: 'Failed to Load Analysis Engine',
      message: 'Could not download the Python runtime from the CDN.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Check if your firewall is blocking cdn.jsdelivr.net',
      ],
      canRetry: true,
    };
  }

  // CSV parsing errors
  if (errorString.includes('csv') || errorString.includes('parse') || errorString.includes('delimiter')) {
    return {
      title: 'CSV Parsing Failed',
      message: 'The file could not be parsed as a valid CSV.',
      suggestions: [
        'Ensure the file uses comma delimiters (not semicolons or tabs)',
        'Check that quotes are properly escaped',
        'Verify the file is not corrupted',
        'Try opening the file in Excel/Numbers and re-saving as CSV',
      ],
      canRetry: false,
    };
  }

  // Encoding errors
  if (errorString.includes('encoding') || errorString.includes('unicode') || errorString.includes('decode')) {
    return {
      title: 'File Encoding Error',
      message: 'The file contains characters that could not be read.',
      suggestions: [
        'Save your CSV with UTF-8 encoding',
        'Remove special characters or emojis',
        'Try re-exporting from your source application',
      ],
      canRetry: false,
    };
  }

  // Memory errors
  if (errorString.includes('memory') || errorString.includes('out of memory')) {
    return {
      title: 'Out of Memory',
      message: 'The dataset is too large for browser memory.',
      suggestions: [
        'Try a smaller file (under 5MB)',
        'Filter or sample your data before uploading',
        'Close other browser tabs to free up memory',
      ],
      canRetry: false,
    };
  }

  // Empty file errors
  if (errorString.includes('empty') || errorString.includes('no columns')) {
    return {
      title: 'Empty Dataset',
      message: 'The CSV file appears to be empty or has no data.',
      suggestions: [
        'Ensure the file contains at least one row of data',
        'Check that the file is not just headers',
        'Verify the file saved correctly from your source',
      ],
      canRetry: false,
    };
  }

  // Missing columns/headers
  if (errorString.includes('column') && errorString.includes('not found')) {
    return {
      title: 'Missing Column Headers',
      message: 'The CSV file may be missing column headers.',
      suggestions: [
        'Ensure the first row contains column names',
        'Check that all columns have headers',
        'Avoid special characters in header names',
      ],
      canRetry: false,
    };
  }

  // Data type errors
  if (errorString.includes('dtype') || errorString.includes('type')) {
    return {
      title: 'Data Type Error',
      message: 'The data contains mixed or incompatible types.',
      suggestions: [
        'Ensure numeric columns contain only numbers',
        'Check for text in numeric columns',
        'Remove or fix inconsistent data',
      ],
      canRetry: false,
    };
  }

  // Network errors
  if (errorString.includes('network') || errorString.includes('timeout')) {
    return {
      title: 'Network Error',
      message: 'A network error occurred while loading resources.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Disable VPN or proxy if active',
      ],
      canRetry: true,
    };
  }

  // Generic fallback
  return {
    title: 'Analysis Error',
    message: errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage,
    suggestions: [
      'Try uploading a different file',
      'Check that your CSV is properly formatted',
      'Refresh the page and try again',
    ],
    canRetry: true,
  };
}

/**
 * Format error for display in the UI
 */
export function formatErrorForDisplay(error: unknown): { title: string; message: string; suggestions: string[] } {
  const errorInfo = categorizeError(error);
  return {
    title: errorInfo.title,
    message: errorInfo.message,
    suggestions: errorInfo.suggestions,
  };
}
