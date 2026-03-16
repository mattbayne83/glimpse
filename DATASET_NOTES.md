# SaaS Product Usage Dataset

## Quick Start

The dataset is located at:
```
/Users/mattbayne/Documents/SoftwareProjects/glimpse/public/saas_usage.csv
```

### Loading in Glimpse

1. Start the Glimpse dev server:
   ```bash
   cd /Users/mattbayne/Documents/SoftwareProjects/glimpse
   npm run dev
   ```

2. Navigate to `http://localhost:5174` in your browser

3. Upload the CSV file via drag-and-drop or file picker

4. Explore the analysis results across 3 tabs:
   - **Overview**: Dataset summary + correlation matrix
   - **Columns**: Per-column statistics with type filters
   - **Quality**: Missing data analysis + duplicate warnings

### Dataset Highlights

**Size**: 5,000 user accounts × 30 columns (~831 KB)

**Key Correlations** (perfect for testing Glimpse):
- Higher plan tier → Lower churn rate (Free: 23%, Enterprise: 3%)
- Payment failures → 7.7x higher churn risk
- Higher plan tier → Higher usage (Enterprise: 167K API calls vs Free: 923)
- Feature adoption scales with plan tier (Enterprise: 26/32 features)
- NPS score correlates with status (Active: 6.7, Churned: 3.0)

**Quality Issues** (intentional, realistic):
- 13% missing `last_login_date` (71% for churned users)
- 6% missing engagement metrics (`dau_avg`, `sessions_30d`, `api_calls_30d`)
- 5% missing `nps_score` (optional survey)
- Payment-related fields missing for Free tier (31%)
- Extreme outliers in API calls (power users: 800K-1.4M calls)

**Data Types**:
- 11 numeric columns (MRR, DAU, sessions, API calls, storage, features, tickets, NPS, streaks, timing)
- 7 categorical columns (plan, industry, company size, country, feature, payment method, status)
- 5 date columns (signup, last login, renewal, churn, first payment)
- 7 boolean columns (beta flags, payment failed, ticket open, champion, mobile)

### Interesting Analysis Questions

Test Glimpse's capabilities with these queries:

1. **Correlation Matrix**:
   - Does higher usage correlate with lower churn?
   - Do payment failures predict churn?
   - Is NPS score correlated with engagement metrics?

2. **Missing Data Patterns**:
   - Why do churned users have more missing data?
   - Which columns have the most quality issues?
   - Is missing data correlated with user status?

3. **Segmentation**:
   - How do Enterprise customers differ from Free users?
   - Which industries have the highest/lowest churn?
   - Do larger companies use more features?

4. **Outlier Detection**:
   - Who are the power users (extreme API usage)?
   - Are there any unusual patterns in champion users?
   - Which users have the longest login streaks?

5. **Predictive Features**:
   - What metrics best predict churn?
   - Can we identify at-risk users before they churn?
   - What drives champion user behavior?

### Expected Glimpse Results

**Overview Tab**:
- 5,000 rows × 30 columns
- Mix of numeric (11), categorical (7), date (5), boolean (7)
- Correlation matrix showing strong correlations:
  - `mrr` ↔ `dau_avg` (positive)
  - `nps_score` ↔ `login_streak_days` (positive)
  - Payment-related metrics with churn indicators

**Columns Tab**:
- Numeric columns: mean, std, quartiles, histogram
- Categorical columns: value counts, top categories
- Filters available for each data type

**Quality Tab**:
- Missing data table showing 9 columns with gaps
- Completeness percentages and visual bars
- Summary statistics on data quality
- Potential duplicate warnings
- High cardinality warnings (e.g., `user_id`)

### File Locations

- **Dataset**: `/Users/mattbayne/Documents/SoftwareProjects/glimpse/public/saas_usage.csv`
- **Documentation**: `/Users/mattbayne/Documents/SoftwareProjects/glimpse/public/saas_usage_README.txt`
- **This file**: `/Users/mattbayne/Documents/SoftwareProjects/glimpse/DATASET_NOTES.md`

### Verifying Data Quality

Run this command to see dataset insights:
```bash
cd /Users/mattbayne/Documents/SoftwareProjects/glimpse/public
python3 -c "
import csv
rows = list(csv.DictReader(open('saas_usage.csv')))
print(f'✓ {len(rows)} rows loaded')
print(f'✓ {len(rows[0])} columns')
churned = sum(1 for r in rows if r['status'] == 'Churned')
print(f'✓ {churned} churned users ({churned/len(rows)*100:.1f}%)')
missing_login = sum(1 for r in rows if r['last_login_date'] == '')
print(f'✓ {missing_login} missing last_login_date ({missing_login/len(rows)*100:.1f}%)')
"
```

### Performance Notes

- File size: 831 KB (well under Glimpse's 10 MB limit)
- Expected load time: <2 seconds (main thread Pyodide)
- Expected analysis time: ~1-2 seconds for pandas processing
- Memory usage: ~10-15 MB (efficient for 5K rows)

### Next Steps

1. Load the dataset in Glimpse
2. Verify the correlation matrix appears in Overview tab
3. Check missing data patterns in Quality tab
4. Export the analysis report as markdown
5. Test copy-to-clipboard functionality
6. Try filtering columns by type in Columns tab
7. Verify dark mode renders correctly (theme-aware correlation matrix)

---

**Generated**: March 16, 2026
**Tool**: Glimpse v0.4.0 (Privacy-first exploratory data analysis)
**Purpose**: Realistic SaaS dataset for testing data analysis capabilities
