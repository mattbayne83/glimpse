# Sample Datasets for Glimpse

This directory contains pre-generated sample datasets for testing Glimpse's analysis capabilities.

## E-Commerce Customer Analytics

**File:** `ecommerce_customers.csv`

A realistic dataset simulating 3,000 customer records from an e-commerce platform, designed to showcase Glimpse's ability to handle larger datasets with complex correlations and data quality issues.

### Dataset Specifications

- **Rows:** 3,000 customer records
- **Columns:** 28 fields (mix of numeric, categorical, dates, and boolean)
- **Date Range:** January 2020 - March 2024
- **Missing Data:** 8-12% across optional fields (phone, middle_initial, acquisition_channel)
- **File Size:** ~650 KB

### Column Reference

#### Customer Information
- `customer_id` - Unique identifier (C0001-C3000)
- `email` - Email address (includes 3 duplicate emails for quality testing)
- `first_name`, `middle_initial`, `last_name` - Name components
- `phone` - Phone number (10% missing)
- `signup_date` - Account creation date
- `last_purchase_date` - Most recent order date
- `last_login_date` - Most recent login date

#### Demographics & Segmentation
- `customer_tier` - Bronze/Silver/Gold/Platinum (39%/30%/22%/9% distribution)
- `region` - Northeast/Southeast/Midwest/Southwest/West
- `acquisition_channel` - Organic/Paid Search/Social/Email/Referral/Direct (7% missing)
- `gender` - M/F/Other/Prefer not to say
- `age_bracket` - 18-24/25-34/35-44/45-54/55-64/65+
- `top_category` - Electronics/Clothing/Home/Beauty/Sports/Books

#### Revenue & Orders
- `total_revenue` - Lifetime customer value ($422-$75,925, avg ~$4,300)
- `avg_order_value` - Average order size
- `total_orders` - Total completed orders
- **Correlation:** Revenue strongly correlates with customer tier (Bronze avg $881, Platinum avg $17,733)

#### Engagement Metrics
- `site_visits_30d` - Site visits in last 30 days
- `emails_opened_30d` - Email opens in last 30 days
- `cart_abandons` - Abandoned shopping carts
- `items_in_wishlist` - Saved wishlist items
- **Correlation:** Premium members and higher tiers show 50% higher engagement

#### Customer Lifecycle
- `customer_lifetime_days` - Days since signup
- `recency_days` - Days since last purchase
- `email_subscribed` - Email opt-in status
- `sms_subscribed` - SMS opt-in status
- `premium_member` - Paid membership status (21% of customers)
- `at_risk_churn` - Churn risk flag (14% at risk, recency >60 days)

### Built-in Correlations

The dataset includes realistic correlations for testing analysis tools:

1. **Tier → Revenue** - Higher tiers have exponentially higher revenue
   - Bronze: ~$880 avg
   - Silver: ~$3,500 avg
   - Gold: ~$7,300 avg
   - Platinum: ~$17,700 avg

2. **Premium → Engagement** - Premium members show 50% higher site visits and email opens

3. **Recency → Churn** - Customers with >60 days since last purchase flagged as at-risk

4. **Lifetime → Orders** - Newer customers have proportionally fewer orders

5. **Engagement → Cart Abandons** - Inverse correlation (high engagement = fewer abandons)

### Data Quality Issues

The dataset intentionally includes quality issues for testing data cleaning workflows:

- **Duplicate Emails:** 3 email addresses appear twice
  - `karen.nelson11@email.com` (rows 11, 1501)
  - `carol.wilson26@email.com` (rows 26, 1751)
  - `donna.baker43@email.com` (rows 43, 2201)

- **Missing Data:**
  - `phone`: 301 missing (10%)
  - `middle_initial`: 350 missing (11.7%)
  - `acquisition_channel`: 211 missing (7%)

- **Outliers:**
  - 221 "whale" customers with >3x average revenue
  - Max revenue: $75,925 (vs avg $4,300)

- **High Cardinality:**
  - 3,000 unique customer IDs
  - ~2,997 unique emails (after duplicates)
  - Date fields have high variety

### Use Cases

This dataset is ideal for demonstrating:

1. **Statistical Analysis**
   - Correlation matrix (revenue, engagement, lifetime, recency)
   - Distribution analysis (revenue skew, tier distribution)
   - Outlier detection (whale customers)

2. **Data Quality Checks**
   - Duplicate detection (email field)
   - Missing data visualization (phone, middle_initial, channel)
   - Completeness metrics

3. **Segmentation Analysis**
   - Customer tier breakdown
   - Premium vs. free member comparison
   - At-risk churn identification

4. **Business Intelligence**
   - Customer lifetime value by segment
   - Engagement patterns by demographics
   - Acquisition channel effectiveness

### How to Use

1. Open Glimpse in your browser
2. Drag and drop `ecommerce_customers.csv` into the upload area
3. Wait for analysis (should complete in 2-5 seconds)
4. Explore the three tabs:
   - **Overview:** Dataset summary + correlation matrix
   - **Columns:** Per-column statistics and distributions
   - **Quality:** Missing data, duplicates, cardinality warnings

### Generation Details

- **Generated:** March 2026
- **Method:** Python script with seeded randomness (seed=42)
- **Libraries:** Python stdlib only (csv, random, datetime)
- **Script:** `scripts/generate_ecommerce_data.py`

### Regenerating the Dataset

To create a fresh version with different random data:

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/glimpse
python3 scripts/generate_ecommerce_data.py
```

The script will regenerate `ecommerce_customers.csv` with the same structure but different random values.
