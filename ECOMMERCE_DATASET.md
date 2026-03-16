# E-Commerce Customer Analytics Dataset

## Overview

A realistic, production-quality dataset simulating 3,000 customer records from an e-commerce platform. Designed specifically to showcase Glimpse's analytical capabilities with realistic correlations, data quality issues, and business-relevant metrics.

## Quick Stats

- **File:** `public/ecommerce_customers.csv`
- **Rows:** 3,000 customers
- **Columns:** 28 fields
- **Size:** 565 KB (well under 10MB limit)
- **Date Range:** 2020-01-01 to 2024-03-01
- **Generated:** March 2026 using Python (reproducible with seed=42)

## What Makes This Dataset Special

### 1. Realistic Business Correlations

Unlike random data, this dataset includes meaningful relationships:

- **Tier ↔ Revenue:** Exponential growth from Bronze ($881 avg) to Platinum ($17,733 avg)
- **Premium ↔ Engagement:** Premium members show 50% higher site visits and email opens
- **Recency ↔ Churn:** Customers with >60 days since purchase flagged as at-risk (14%)
- **Lifetime ↔ Orders:** Account age proportionally affects total order count
- **Engagement ↔ Abandons:** Inverse correlation (active users abandon less)

### 2. Built-in Data Quality Issues

Perfect for demonstrating data cleaning workflows:

- **3 duplicate emails** across the dataset
- **8-12% missing data** in optional fields (phone, middle_initial, acquisition_channel)
- **221 outliers** (whale customers with >3x average revenue)
- **High cardinality** in email and ID fields

### 3. Rich Column Types

Demonstrates Glimpse's ability to handle diverse data:

- **Numeric:** revenue, orders, engagement metrics (9 columns)
- **Categorical:** tier, region, channel, gender, age, category (6 columns)
- **Dates:** signup, last purchase, last login (3 columns)
- **Boolean:** email subscribed, SMS subscribed, premium, at-risk (4 columns)
- **Text:** customer_id, email, name fields (6 columns)

## Column Reference

### Customer Information
| Column | Type | Missing | Description |
|--------|------|---------|-------------|
| customer_id | Text | 0% | Unique ID (C0001-C3000) |
| email | Text | 0% | Email (3 duplicates) |
| first_name | Text | 0% | First name |
| middle_initial | Text | 11.7% | Middle initial |
| last_name | Text | 0% | Last name |
| phone | Text | 10.0% | Phone number |

### Dates
| Column | Type | Missing | Description |
|--------|------|---------|-------------|
| signup_date | Date | 0% | Account creation |
| last_purchase_date | Date | 0% | Most recent order |
| last_login_date | Date | 0% | Most recent login |

### Demographics
| Column | Type | Values | Description |
|--------|------|--------|-------------|
| customer_tier | Categorical | Bronze, Silver, Gold, Platinum | Customer segment |
| region | Categorical | Northeast, Southeast, Midwest, Southwest, West | Geographic region |
| acquisition_channel | Categorical | Organic, Paid Search, Social, Email, Referral, Direct | How acquired (7% missing) |
| gender | Categorical | M, F, Other, Prefer not to say | Gender identity |
| age_bracket | Categorical | 18-24, 25-34, 35-44, 45-54, 55-64, 65+ | Age range |
| top_category | Categorical | Electronics, Clothing, Home, Beauty, Sports, Books | Favorite category |

### Revenue & Orders
| Column | Type | Range | Description |
|--------|------|-------|-------------|
| total_revenue | Numeric | $70-$75,925 | Lifetime value |
| avg_order_value | Numeric | Calculated | Average order size |
| total_orders | Numeric | 1-70 | Total orders |

### Engagement (Last 30 Days)
| Column | Type | Range | Description |
|--------|------|-------|-------------|
| site_visits_30d | Numeric | 15-87 | Site visits |
| emails_opened_30d | Numeric | 0-54 | Email opens |
| cart_abandons | Numeric | 0-9 | Abandoned carts |
| items_in_wishlist | Numeric | 0-21 | Wishlist size |

### Lifecycle Metrics
| Column | Type | Description |
|--------|------|-------------|
| customer_lifetime_days | Numeric | Days since signup |
| recency_days | Numeric | Days since last purchase |
| email_subscribed | Boolean | Email opt-in status |
| sms_subscribed | Boolean | SMS opt-in status |
| premium_member | Boolean | Paid membership (21% of customers) |
| at_risk_churn | Boolean | Churn risk flag (14% at risk) |

## Data Quality Summary

### Duplicate Emails (3 pairs)
- `karen.nelson11@email.com` - rows 12, 1502
- `carol.wilson26@email.com` - rows 27, 1752
- `donna.baker43@email.com` - rows 44, 2202

### Missing Data Breakdown
- `middle_initial`: 350 missing (11.7%)
- `phone`: 301 missing (10.0%)
- `acquisition_channel`: 211 missing (7.0%)

### Outliers (Whale Customers)
- 221 customers (7.4%) with revenue >$13,828 (3x average)
- Maximum revenue: $75,925.68
- Mean revenue: $4,609.32
- Median revenue: $2,694.14

## Tier Distribution & Revenue

| Tier | Count | % | Avg Revenue | Median Revenue |
|------|-------|---|-------------|----------------|
| Bronze | 1,159 | 38.6% | $881 | $769 |
| Silver | 913 | 30.4% | $3,503 | $3,666 |
| Gold | 657 | 21.9% | $7,310 | $7,425 |
| Platinum | 271 | 9.0% | $17,733 | $18,530 |

## Engagement Statistics

| Metric | Mean | Median | Min | Max |
|--------|------|--------|-----|-----|
| Site Visits (30d) | 34.2 | 33.0 | 15 | 87 |
| Email Opens (30d) | 17.3 | 17.0 | 0 | 54 |
| Cart Abandons | 2.4 | 2.0 | 0 | 9 |
| Wishlist Items | 6.8 | 7.0 | 0 | 21 |
| Total Orders | 21.3 | 18.0 | 1 | 70 |

## How to Use in Glimpse

1. **Start Glimpse dev server:**
   ```bash
   cd /Users/mattbayne/Documents/SoftwareProjects/glimpse
   npm run dev
   ```

2. **Open in browser:** http://localhost:5174

3. **Load dataset:** Drag `public/ecommerce_customers.csv` into the upload area

4. **Explore results:**
   - **Overview tab:** See correlation matrix showing tier-revenue relationship
   - **Columns tab:** Examine distributions (revenue is right-skewed, engagement is normal)
   - **Quality tab:** View missing data table and duplicate warnings

## Expected Analysis Results

When you analyze this dataset in Glimpse, you should see:

### Overview Tab
- Dataset size: 3,000 rows × 28 columns
- Memory usage: ~565 KB
- Column types: 9 numeric, 6 categorical, 3 date, 4 boolean, 6 text
- **Correlation matrix** showing:
  - Strong positive correlation: `total_revenue` ↔ `total_orders` (~0.85)
  - Moderate positive: `site_visits_30d` ↔ `emails_opened_30d` (~0.65)
  - Weak negative: `cart_abandons` ↔ `site_visits_30d` (~-0.3)

### Columns Tab
- **total_revenue:** Right-skewed distribution (median < mean), shows 221 outliers
- **customer_tier:** Bronze dominant (39%), Platinum rare (9%)
- **site_visits_30d:** Normal distribution centered around 34 visits
- **at_risk_churn:** 13.7% flagged TRUE

### Quality Tab
- **Missing Data:** 3 columns affected (middle_initial 11.7%, phone 10%, acquisition_channel 7%)
- **Duplicates:** Warning about 3 duplicate emails
- **High Cardinality:** customer_id and email fields (near-unique)

## Regenerating the Dataset

To create a fresh version with different random values but same structure:

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/glimpse
python3 scripts/generate_ecommerce_data.py
```

The script uses `random.seed(42)` for reproducibility. Change the seed value to get different random data.

## Use Cases

This dataset is perfect for demonstrating:

1. **Correlation Analysis** - Multiple meaningful relationships to discover
2. **Data Quality Checks** - Duplicates, missing values, outliers
3. **Segmentation** - Customer tiers, demographics, behavior patterns
4. **Business Intelligence** - Revenue analysis, engagement metrics, churn prediction
5. **Distribution Analysis** - Normal (engagement), skewed (revenue), categorical (tier)
6. **Outlier Detection** - Whale customers with extreme revenue

## Generation Method

- **Language:** Python 3
- **Libraries:** stdlib only (csv, random, datetime, typing)
- **Approach:**
  - Demographic data randomly sampled from realistic name/category lists
  - Revenue/orders calculated based on tier with variance
  - Engagement metrics use multipliers based on premium status and tier
  - At-risk flag based on recency threshold (>60 days)
  - Dates randomly distributed within 2020-2024 range
  - Duplicates injected post-generation at specific row indices
- **Reproducibility:** Fixed random seed (42) ensures identical output

## File Locations

- **Dataset:** `/Users/mattbayne/Documents/SoftwareProjects/glimpse/public/ecommerce_customers.csv`
- **Generator Script:** `/Users/mattbayne/Documents/SoftwareProjects/glimpse/scripts/generate_ecommerce_data.py`
- **Documentation:** `/Users/mattbayne/Documents/SoftwareProjects/glimpse/public/README.md`
- **This Guide:** `/Users/mattbayne/Documents/SoftwareProjects/glimpse/ECOMMERCE_DATASET.md`
