/**
 * Sample datasets for quick demos and testing
 */

export interface SampleDataset {
  name: string;
  description: string;
  csv?: string;  // For small embedded datasets
  filePath?: string;  // For larger datasets loaded from /public
  rows?: number;  // Optional metadata for display
  columns?: number;  // Optional metadata for display
}

/**
 * E-Commerce Customer Analytics - 3,000 customers with revenue, engagement, and demographic data
 * Showcases: correlations, missing data patterns, customer segmentation, outliers
 */
export const ECOMMERCE_DATASET: SampleDataset = {
  name: 'E-Commerce Customers',
  description: 'Customer revenue, engagement & demographics',
  filePath: '/ecommerce_customers.csv.gz',
  rows: 3000,
  columns: 28,
};

/**
 * SaaS Product Usage - 5,000 user accounts with engagement, billing, and churn data
 * Showcases: retention analysis, plan tier comparisons, feature adoption, power users
 */
export const SAAS_DATASET: SampleDataset = {
  name: 'SaaS Product Usage',
  description: 'User retention, churn prediction & feature adoption',
  filePath: '/saas_usage.csv.gz',
  rows: 5000,
  columns: 32,
};

/**
 * Healthcare Patient Visits - 4,000 anonymized encounters with vitals, labs, and diagnoses
 * Showcases: medical correlations, missing lab results, risk factors, length of stay
 */
export const HEALTHCARE_DATASET: SampleDataset = {
  name: 'Healthcare Patient Visits',
  description: '4,000 patient encounters with vitals, labs & diagnoses',
  filePath: '/healthcare_patient_visits.csv.gz',
  rows: 4000,
  columns: 31,
};

/**
 * Employee HR Analytics - 2,500 employees with salary, performance, and attrition data
 * Showcases: compensation analysis, attrition patterns, performance correlations
 */
export const HR_DATASET: SampleDataset = {
  name: 'Employee HR Analytics',
  description: '2,500 employees with salary, performance & attrition data',
  filePath: '/hr_analytics.csv.gz',
  rows: 2500,
  columns: 33,
};

/**
 * Daily Retail Sales - 2 years of daily sales data with time series patterns
 * Showcases: weekly/annual seasonality, trend analysis, revenue correlations
 */
export const RETAIL_SALES_DATASET: SampleDataset = {
  name: 'Retail Sales (Daily)',
  description: '2 years of daily sales with seasonality & trends',
  filePath: '/retail_sales_daily.csv.gz',
  rows: 731,
  columns: 9,
};

export const SAMPLE_DATASETS = [
  RETAIL_SALES_DATASET,  // First: time series with seasonality for FFT testing
  ECOMMERCE_DATASET,
  SAAS_DATASET,
];
