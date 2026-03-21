export interface DatasetOverview {
  rows: number;
  columns: number;
  memoryBytes: number;
  columnTypes: {
    numeric: number;
    categorical: number;
    datetime: number;
  };
  totalMissing: number;
  missingPercentage: number;
}

export interface NumericColumnStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  q25: number;
  q50: number; // median
  q75: number;
  missing: number;
  histogram?: {
    bins: number[];
    counts: number[];
  };
  boxPlot?: {
    iqr: number;           // Interquartile range (Q3 - Q1)
    lowerWhisker: number;  // Q1 - 1.5*IQR
    upperWhisker: number;  // Q3 + 1.5*IQR
    outliers: number[];    // Values beyond whiskers
  };
  normalityTest?: {
    test: 'Shapiro-Wilk';
    statistic: number;
    pValue: number;
    isNormal: boolean; // true if p > 0.05
  };
}

export interface CategoricalColumnStats {
  uniqueCount: number;
  missing: number;
  topValues: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
}

export interface DateTimeColumnStats {
  missing: number;
  minDate: string;
  maxDate: string;
  uniqueCount: number;
}

export type ColumnStats =
  | { type: 'numeric'; stats: NumericColumnStats }
  | { type: 'categorical'; stats: CategoricalColumnStats }
  | { type: 'datetime'; stats: DateTimeColumnStats };

export interface ColumnAnalysis {
  name: string;
  analysis: ColumnStats;
}

export interface DataQuality {
  duplicateRows: number;
  duplicatePercentage: number;
  highMissingColumns: string[]; // >50% missing
  highCardinalityColumns: string[]; // >100 unique values
}

export interface CorrelationMatrix {
  columns: string[]; // column names
  matrix: number[][]; // correlation values (-1 to 1)
}

export interface CorrelationSignificance {
  column1: string;
  column2: string;
  r: number;
  pValue: number;
  significant: boolean; // true if p < 0.05
}

export interface TimeSeriesAnalysis {
  dateColumn: string;
  valueColumn: string;
  seasonalityDetected: boolean;
  estimatedPeriod?: number;
  confidence: 'low' | 'medium' | 'high';
  dates: string[];  // ISO date strings (sampled, max 200 points)
  values: number[];  // Corresponding values
}

export interface AnalysisResult {
  overview: DatasetOverview;
  columns: ColumnAnalysis[];
  quality: DataQuality;
  correlation?: CorrelationMatrix; // only present if 2+ numeric columns
  correlationSignificance?: CorrelationSignificance[]; // p-values for correlations
  timeSeriesAnalysis?: TimeSeriesAnalysis[]; // seasonality detection results
}
