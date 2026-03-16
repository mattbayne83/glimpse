import { runPython } from './pyodide';
import type { AnalysisResult } from '../types/analysis';

/**
 * Analyze a CSV dataset using Python/pandas.
 * Returns comprehensive statistics and quality metrics.
 */
export async function analyzeData(csvData: string): Promise<AnalysisResult> {
  // Python analysis script
  const pythonCode = `
import pandas as pd
import numpy as np
from io import StringIO
import json
import sys

# Load CSV with better error handling
csv_data = """${csvData.replace(/"/g, '\\"')}"""

try:
    df = pd.read_csv(StringIO(csv_data))
except pd.errors.EmptyDataError:
    raise ValueError("CSV file is empty or contains no data")
except pd.errors.ParserError as e:
    raise ValueError(f"CSV parsing failed: {str(e)}. Check that your file uses comma delimiters and proper quoting.")
except UnicodeDecodeError as e:
    raise ValueError(f"File encoding error: {str(e)}. Save your CSV with UTF-8 encoding.")
except Exception as e:
    raise ValueError(f"Failed to read CSV: {str(e)}")

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
numeric_df = df.select_dtypes(include=[np.number])
if numeric_df.shape[1] >= 2:
    corr_matrix = numeric_df.corr()
    correlation = {
        "columns": list(corr_matrix.columns),
        "matrix": [[float(val) if not pd.isna(val) else 0 for val in row] for row in corr_matrix.values]
    }

# Combine results
result = {
    "overview": overview,
    "columns": columns_analysis,
    "quality": quality
}

# Only add correlation if it exists
if correlation is not None:
    result["correlation"] = correlation

json.dumps(result)
`;

  const resultJson = await runPython<string>(pythonCode);
  const result = JSON.parse(resultJson) as AnalysisResult;
  return result;
}
