import { runPython } from './pyodide';
import type { AnalysisResult } from '../types/analysis';

/**
 * Analyze a CSV or Excel dataset using Python/pandas.
 * Returns comprehensive statistics and quality metrics.
 *
 * @param data - CSV text or base64-encoded Excel data
 * @param fileType - File type ('csv' or 'xlsx')
 * @param sheetName - Optional sheet name for multi-sheet Excel files (uses first sheet if omitted)
 */
export async function analyzeData(
  data: string,
  fileType: 'csv' | 'xlsx' = 'csv',
  sheetName?: string
): Promise<AnalysisResult> {
  // Python analysis script
  const pythonCode = `
import pandas as pd
import numpy as np
from io import StringIO, BytesIO
import json
import sys
import base64
from scipy import stats

# Load data with better error handling
file_type = "${fileType}"

try:
    if file_type == "xlsx":
        # Excel file - decode base64 and read with pandas
        excel_data = """${data}"""
        excel_bytes = base64.b64decode(excel_data)
        ${sheetName ? `# Read specific sheet: ${sheetName}
        df = pd.read_excel(BytesIO(excel_bytes), sheet_name="${sheetName}", engine='openpyxl')` : `# Read first sheet (default)
        df = pd.read_excel(BytesIO(excel_bytes), engine='openpyxl')`}
    else:
        # CSV file - read from string
        csv_data = """${data.replace(/"/g, '\\"')}"""
        df = pd.read_csv(StringIO(csv_data))

        # Try to auto-detect and convert datetime columns
        # pandas doesn't auto-detect datetime in CSV, so we do it manually
        for col in df.columns:
            # Only try to convert object (string) columns
            if df[col].dtype == 'object':
                try:
                    # Attempt to convert to datetime
                    converted = pd.to_datetime(df[col], errors='coerce')
                    # If >50% of non-null values converted successfully, use it
                    if converted.notna().sum() > len(df) * 0.5:
                        df[col] = converted
                except Exception:
                    pass  # Keep as object if conversion fails
except pd.errors.EmptyDataError:
    raise ValueError("File is empty or contains no data")
except pd.errors.ParserError as e:
    raise ValueError(f"File parsing failed: {str(e)}. Check that your file uses comma delimiters and proper quoting.")
except UnicodeDecodeError as e:
    raise ValueError(f"File encoding error: {str(e)}. Save your file with UTF-8 encoding.")
except ValueError as e:
    # Handle Excel-specific errors
    if "Excel" in str(e) or "openpyxl" in str(e):
        raise ValueError(f"Excel file could not be read: {str(e)}. File may be corrupted or not a valid Excel file.")
    raise
except Exception as e:
    error_msg = str(e).lower()
    if "no default engine" in error_msg or "openpyxl" in error_msg:
        raise ValueError("Excel file could not be read. openpyxl package is required but not loaded.")
    elif "worksheet" in error_msg and "not found" in error_msg:
        raise ValueError("Excel file has no data sheets or sheets are empty.")
    raise ValueError(f"Failed to read file: {str(e)}")

# Validate we have data
if df.empty:
    raise ValueError("CSV file contains no data rows")

if df.shape[1] == 0:
    raise ValueError("CSV file contains no columns")

# Dataset overview
overview = {
    "rows": int(df.shape[0]),
    "columns": int(df.shape[1]),
    "memoryBytes": int(df.memory_usage(deep=True).sum()),
    "columnTypes": {
        "numeric": int(df.select_dtypes(include=[np.number]).shape[1]),
        "categorical": int(df.select_dtypes(include=['object', 'category']).shape[1]),
        "datetime": int(df.select_dtypes(include=['datetime64']).shape[1])
    },
    "totalMissing": int(df.isnull().sum().sum()),
    "missingPercentage": float(df.isnull().sum().sum() / (df.shape[0] * df.shape[1]) * 100)
}

# Column-level analysis
columns_analysis = []

for col in df.columns:
    col_data = df[col]

    # Check if it's a boolean column (treat as categorical instead of numeric)
    if pd.api.types.is_bool_dtype(col_data):
        # Boolean column - treat as categorical
        value_counts = col_data.value_counts()
        top_values = [
            {
                "value": str(val),
                "count": int(count),
                "percentage": float(count / len(col_data) * 100)
            }
            for val, count in value_counts.items()
        ]

        columns_analysis.append({
            "name": col,
            "analysis": {
                "type": "categorical",
                "stats": {
                    "uniqueCount": int(col_data.nunique()),
                    "missing": int(col_data.isnull().sum()),
                    "topValues": top_values
                }
            }
        })

    elif pd.api.types.is_numeric_dtype(col_data):
        # Numeric column - calculate stats manually to handle edge cases
        clean_data = col_data.dropna()

        if len(clean_data) > 0:
            q25 = float(clean_data.quantile(0.25))
            q50 = float(clean_data.quantile(0.50))
            q75 = float(clean_data.quantile(0.75))

            stats = {
                "count": int(len(clean_data)),
                "mean": float(clean_data.mean()),
                "std": float(clean_data.std()) if len(clean_data) > 1 else 0,
                "min": float(clean_data.min()),
                "max": float(clean_data.max()),
                "q25": q25,
                "q50": q50,
                "q75": q75,
                "missing": int(col_data.isnull().sum())
            }

            # Calculate box plot statistics
            iqr = q75 - q25
            lower_whisker = q25 - (1.5 * iqr)
            upper_whisker = q75 + (1.5 * iqr)

            # Find outliers (values beyond whiskers)
            if iqr > 0:
                outliers = clean_data[(clean_data < lower_whisker) | (clean_data > upper_whisker)].tolist()
                outliers = [float(o) for o in outliers[:100]]  # Limit to 100 outliers max
            else:
                # No spread (constant column), no outliers
                outliers = []

            stats["boxPlot"] = {
                "iqr": float(iqr),
                "lowerWhisker": float(lower_whisker),
                "upperWhisker": float(upper_whisker),
                "outliers": outliers
            }
        else:
            # All values are missing
            stats = {
                "count": 0,
                "mean": 0,
                "std": 0,
                "min": 0,
                "max": 0,
                "q25": 0,
                "q50": 0,
                "q75": 0,
                "missing": int(col_data.isnull().sum()),
                "boxPlot": {
                    "iqr": 0,
                    "lowerWhisker": 0,
                    "upperWhisker": 0,
                    "outliers": []
                }
            }

        # Generate histogram data (exclude NaN values)
        clean_data = col_data.dropna()
        if len(clean_data) > 0:
            counts, bin_edges = np.histogram(clean_data, bins=20)
            # Convert bin edges to bin centers for easier plotting
            bins = [(bin_edges[i] + bin_edges[i+1]) / 2 for i in range(len(bin_edges)-1)]
            stats["histogram"] = {
                "bins": [float(b) for b in bins],
                "counts": [int(c) for c in counts]
            }
        else:
            stats["histogram"] = {"bins": [], "counts": []}

        # Normality test (Shapiro-Wilk for sample sizes 3 to 5000)
        clean_data = col_data.dropna()
        if 3 <= len(clean_data) <= 5000:
            try:
                shapiro_stat, shapiro_p = stats.shapiro(clean_data)
                stats["normalityTest"] = {
                    "test": "Shapiro-Wilk",
                    "statistic": float(shapiro_stat),
                    "pValue": float(shapiro_p),
                    "isNormal": shapiro_p > 0.05
                }
            except Exception:
                # If Shapiro-Wilk fails (e.g., constant data), skip normality test
                pass

        columns_analysis.append({
            "name": col,
            "analysis": {
                "type": "numeric",
                "stats": stats
            }
        })

    elif pd.api.types.is_datetime64_any_dtype(col_data):
        # DateTime column
        columns_analysis.append({
            "name": col,
            "analysis": {
                "type": "datetime",
                "stats": {
                    "missing": int(col_data.isnull().sum()),
                    "minDate": str(col_data.min()) if not pd.isna(col_data.min()) else "",
                    "maxDate": str(col_data.max()) if not pd.isna(col_data.max()) else "",
                    "uniqueCount": int(col_data.nunique())
                }
            }
        })

    else:
        # Categorical column
        value_counts = col_data.value_counts().head(10)
        top_values = [
            {
                "value": str(val),
                "count": int(count),
                "percentage": float(count / len(col_data) * 100)
            }
            for val, count in value_counts.items()
        ]

        columns_analysis.append({
            "name": col,
            "analysis": {
                "type": "categorical",
                "stats": {
                    "uniqueCount": int(col_data.nunique()),
                    "missing": int(col_data.isnull().sum()),
                    "topValues": top_values
                }
            }
        })

# Data quality
duplicate_rows = int(df.duplicated().sum())
high_missing_cols = [
    col for col in df.columns
    if (df[col].isnull().sum() / len(df) * 100) > 50
]
high_cardinality_cols = [
    col for col in df.select_dtypes(include=['object', 'category']).columns
    if df[col].nunique() > 100
]

quality = {
    "duplicateRows": duplicate_rows,
    "duplicatePercentage": float(duplicate_rows / df.shape[0] * 100) if df.shape[0] > 0 else 0,
    "highMissingColumns": high_missing_cols,
    "highCardinalityColumns": high_cardinality_cols
}

# Correlation matrix (only for numeric columns with 2+ columns)
correlation = None
correlation_significance = []
numeric_df = df.select_dtypes(include=[np.number])
if numeric_df.shape[1] >= 2:
    corr_matrix = numeric_df.corr()
    correlation = {
        "columns": list(corr_matrix.columns),
        "matrix": [[float(val) if not pd.isna(val) else 0 for val in row] for row in corr_matrix.values]
    }

    # Calculate correlation significance (p-values)
    for i, col1 in enumerate(numeric_df.columns):
        for j, col2 in enumerate(numeric_df.columns):
            if i < j:  # Upper triangle only (avoid duplicates and diagonal)
                # Get clean data (drop NaN values pairwise)
                clean_df = numeric_df[[col1, col2]].dropna()

                if len(clean_df) > 2:  # Need at least 3 points for correlation
                    try:
                        r, p_value = stats.pearsonr(clean_df[col1], clean_df[col2])
                        correlation_significance.append({
                            "column1": col1,
                            "column2": col2,
                            "r": float(r),
                            "pValue": float(p_value),
                            "significant": p_value < 0.05
                        })
                    except Exception:
                        # If pearsonr fails (e.g., constant columns), skip
                        pass

# Time series analysis (FFT seasonality detection)
time_series_analyses = []
datetime_cols = df.select_dtypes(include=['datetime64']).columns

if len(datetime_cols) > 0 and len(numeric_df.columns) > 0:
    # For each datetime column, analyze with numeric columns
    for date_col in datetime_cols:
        # Sort by date to ensure proper time series
        df_sorted = df[[date_col] + list(numeric_df.columns)].sort_values(by=date_col).dropna(subset=[date_col])

        for value_col in numeric_df.columns:
            # Get clean time series (no missing values in either column)
            ts_df = df_sorted[[date_col, value_col]].dropna()

            if len(ts_df) < 14:  # Need at least 2 weeks of data for meaningful FFT
                continue

            try:
                # Check if data is evenly spaced (required for FFT)
                time_diff = ts_df[date_col].diff().dropna()
                is_evenly_spaced = time_diff.nunique() <= 2  # Allow some tolerance

                if not is_evenly_spaced:
                    continue  # Skip unevenly spaced data

                # Get the time series values
                values = ts_df[value_col].values
                n = len(values)

                # Detrend the data (remove linear trend)
                from scipy import signal
                detrended = signal.detrend(values)

                # Apply FFT
                from scipy.fft import fft, fftfreq
                fft_vals = fft(detrended)
                freqs = fftfreq(n)

                # Only look at positive frequencies
                pos_mask = freqs > 0
                freqs_pos = freqs[pos_mask]
                fft_pos = np.abs(fft_vals[pos_mask])

                # Find the dominant frequency (excluding DC component)
                if len(fft_pos) > 0:
                    # Get the strongest peak
                    peak_idx = np.argmax(fft_pos)
                    peak_freq = freqs_pos[peak_idx]
                    peak_power = fft_pos[peak_idx]

                    # Convert frequency to period (in samples)
                    if peak_freq > 0:
                        period_samples = 1.0 / peak_freq

                        # Calculate confidence based on peak prominence
                        mean_power = np.mean(fft_pos)
                        peak_prominence = peak_power / mean_power if mean_power > 0 else 0

                        # Sample data points for visualization (max 200 points)
                        max_points = 200
                        if n <= max_points:
                            sample_dates = ts_df[date_col].astype(str).tolist()
                            sample_values = ts_df[value_col].tolist()
                        else:
                            # Evenly sample points across the time range
                            indices = np.linspace(0, n - 1, max_points, dtype=int)
                            sample_dates = ts_df[date_col].iloc[indices].astype(str).tolist()
                            sample_values = ts_df[value_col].iloc[indices].tolist()

                        # Only report if there's a clear peak
                        if peak_prominence > 2.0:  # Peak must be 2x stronger than average
                            # Determine confidence level
                            if peak_prominence > 5.0:
                                confidence = "high"
                            elif peak_prominence > 3.0:
                                confidence = "medium"
                            else:
                                confidence = "low"

                            time_series_analyses.append({
                                "dateColumn": date_col,
                                "valueColumn": value_col,
                                "seasonalityDetected": True,
                                "estimatedPeriod": int(round(period_samples)),
                                "confidence": confidence,
                                "dates": sample_dates,
                                "values": sample_values
                            })
                        else:
                            # No clear seasonality detected, still include data for visualization
                            time_series_analyses.append({
                                "dateColumn": date_col,
                                "valueColumn": value_col,
                                "seasonalityDetected": False,
                                "confidence": "low",
                                "dates": sample_dates,
                                "values": sample_values
                            })
            except Exception:
                # If FFT fails, skip this combination
                pass

# Combine results
result = {
    "overview": overview,
    "columns": columns_analysis,
    "quality": quality
}

# Only add correlation if it exists
if correlation is not None:
    result["correlation"] = correlation

# Only add correlation significance if there are significant correlations
if len(correlation_significance) > 0:
    result["correlationSignificance"] = correlation_significance

# Only add time series analysis if detected
if len(time_series_analyses) > 0:
    result["timeSeriesAnalysis"] = time_series_analyses

json.dumps(result)
`;

  const resultJson = await runPython<string>(pythonCode);
  const result = JSON.parse(resultJson) as AnalysisResult;
  return result;
}
