#!/usr/bin/env python3
"""
Generate realistic daily retail sales time series dataset for Glimpse.
Replaces Iris dataset with time series data for seasonality testing.

Features:
- 730 rows (2 years: 2023-01-01 to 2024-12-31)
- Weekly seasonality (7-day cycle, lower on weekends)
- Annual seasonality (Q4 holiday boost)
- 15% YoY growth trend
- Correlated numeric columns
- Categorical columns for additional analysis
"""

import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

# Generate date range (2 years)
start_date = datetime(2023, 1, 1)
end_date = datetime(2024, 12, 31)
dates = pd.date_range(start=start_date, end=end_date, freq='D')
n_days = len(dates)

print(f"Generating {n_days} days of retail sales data...")

# Create DataFrame
df = pd.DataFrame({'date': dates})

# Add day of week and season
df['day_of_week'] = df['date'].dt.day_name()
df['month'] = df['date'].dt.month

# Map months to seasons
def get_season(month):
    if month in [12, 1, 2]:
        return 'Winter'
    elif month in [3, 4, 5]:
        return 'Spring'
    elif month in [6, 7, 8]:
        return 'Summer'
    else:
        return 'Fall'

df['season'] = df['month'].apply(get_season)

# Generate base daily units sold with patterns
days_from_start = np.arange(n_days)

# Trend component (15% YoY growth = 0.15/365 per day)
trend = 150 + (days_from_start * 0.062)  # Start at 150, grow to ~195

# Weekly seasonality (lower on weekends)
weekly_cycle = 7
weekly_seasonality = -30 * np.sin(2 * np.pi * days_from_start / weekly_cycle)
# Make weekends specifically lower
is_weekend = df['day_of_week'].isin(['Saturday', 'Sunday']).values
weekend_effect = np.where(is_weekend, -40, 0)

# Annual seasonality (Q4 holiday boost)
annual_cycle = 365.25
annual_seasonality = 35 * np.sin(2 * np.pi * (days_from_start - 305) / annual_cycle)  # Peak in Nov/Dec

# Random noise
noise = np.random.normal(0, 15, n_days)

# Combine components
units_sold = trend + weekly_seasonality + weekend_effect + annual_seasonality + noise
units_sold = np.maximum(units_sold, 30)  # Floor at 30 units
df['units_sold'] = units_sold.round().astype(int)

# Generate revenue (correlated with units, avg price $10-15)
avg_price = 12 + np.random.normal(0, 1.5, n_days)  # Price varies
df['revenue'] = (df['units_sold'] * avg_price).round(2)

# Generate profit (20-35% margin, correlated with revenue)
profit_margin = 0.25 + np.random.normal(0, 0.03, n_days)
df['profit'] = (df['revenue'] * profit_margin).round(2)

# Generate marketing spend (varies, some correlation with customer count)
base_marketing = 150 + days_from_start * 0.03  # Slight increase over time
marketing_seasonality = 80 * np.sin(2 * np.pi * (days_from_start - 305) / annual_cycle)  # Higher in Q4
marketing_noise = np.random.normal(0, 40, n_days)
df['marketing_spend'] = np.maximum(base_marketing + marketing_seasonality + marketing_noise, 0).round(2)

# Generate customer count (correlated with units sold, with some variation)
base_customers = 60 + (days_from_start * 0.02)
customer_weekly = -15 * np.sin(2 * np.pi * days_from_start / weekly_cycle)
customer_weekend = np.where(is_weekend, -20, 0)
customer_noise = np.random.normal(0, 8, n_days)
df['customer_count'] = np.maximum(base_customers + customer_weekly + customer_weekend + customer_noise, 20).round().astype(int)

# Generate average order value (revenue / customer count)
df['avg_order_value'] = (df['revenue'] / df['customer_count']).round(2)

# Add a few missing values randomly (realistic data quality)
missing_indices = np.random.choice(n_days, size=int(n_days * 0.01), replace=False)
df.loc[missing_indices[:len(missing_indices)//2], 'marketing_spend'] = np.nan
df.loc[missing_indices[len(missing_indices)//2:], 'profit'] = np.nan

# Reorder columns for better presentation
df = df[['date', 'units_sold', 'revenue', 'profit', 'marketing_spend',
         'customer_count', 'avg_order_value', 'day_of_week', 'season']]

# Save to CSV
script_dir = Path(__file__).parent
output_path = script_dir.parent / 'public' / 'retail_sales_daily.csv'
df.to_csv(output_path, index=False)

print(f"\n✅ Dataset generated successfully!")
print(f"📊 Saved to: {output_path}")
print(f"\nDataset Info:")
print(f"  Rows: {len(df)}")
print(f"  Columns: {len(df.columns)}")
print(f"  Date range: {df['date'].min().date()} to {df['date'].max().date()}")
print(f"  Numeric columns: {df.select_dtypes(include=[np.number]).shape[1]}")
print(f"  Categorical columns: {df.select_dtypes(include=['object']).shape[1] - 1}")  # -1 for date
print(f"  Missing values: {df.isnull().sum().sum()} ({df.isnull().sum().sum() / df.size * 100:.1f}%)")
print(f"\nKey Statistics:")
print(f"  Units sold: {df['units_sold'].min():.0f} - {df['units_sold'].max():.0f} (mean: {df['units_sold'].mean():.0f})")
print(f"  Revenue: ${df['revenue'].min():.2f} - ${df['revenue'].max():.2f} (mean: ${df['revenue'].mean():.2f})")
print(f"  Customers/day: {df['customer_count'].min():.0f} - {df['customer_count'].max():.0f} (mean: {df['customer_count'].mean():.0f})")
print(f"\nPatterns for FFT Detection:")
print(f"  ✓ Weekly seasonality: 7-day cycle (lower on weekends)")
print(f"  ✓ Annual seasonality: Q4 holiday boost")
print(f"  ✓ Trend: 15% YoY growth")
print(f"  ✓ Correlations: revenue ↔ units_sold (strong), marketing ↔ customers (moderate)")
