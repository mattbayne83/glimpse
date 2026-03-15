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

# Load CSV
csv_data = """${csvData.replace(/"/g, '\\"')}"""
df = pd.read_csv(StringIO(csv_data))

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

    if pd.api.types.is_numeric_dtype(col_data):
        # Numeric column
        desc = col_data.describe()

        # Generate histogram data (exclude NaN values)
        clean_data = col_data.dropna()
        if len(clean_data) > 0:
            counts, bin_edges = np.histogram(clean_data, bins=20)
            # Convert bin edges to bin centers for easier plotting
            bins = [(bin_edges[i] + bin_edges[i+1]) / 2 for i in range(len(bin_edges)-1)]
            histogram = {
                "bins": [float(b) for b in bins],
                "counts": [int(c) for c in counts]
            }
        else:
            histogram = {"bins": [], "counts": []}

        columns_analysis.append({
            "name": col,
            "analysis": {
                "type": "numeric",
                "stats": {
                    "count": int(desc['count']),
                    "mean": float(desc['mean']) if not pd.isna(desc['mean']) else 0,
                    "std": float(desc['std']) if not pd.isna(desc['std']) else 0,
                    "min": float(desc['min']) if not pd.isna(desc['min']) else 0,
                    "max": float(desc['max']) if not pd.isna(desc['max']) else 0,
                    "q25": float(desc['25%']) if not pd.isna(desc['25%']) else 0,
                    "q50": float(desc['50%']) if not pd.isna(desc['50%']) else 0,
                    "q75": float(desc['75%']) if not pd.isna(desc['75%']) else 0,
                    "missing": int(col_data.isnull().sum()),
                    "histogram": histogram
                }
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
