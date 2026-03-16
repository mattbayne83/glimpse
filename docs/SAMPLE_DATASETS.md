# Sample Datasets Reference

All datasets are located in `/public/*.csv` and loaded on-demand to keep bundle size small.

## Dataset Overview

| Dataset | Rows | Columns | Size | Missing Data | Key Features |
|---------|------|---------|------|--------------|--------------|
| **E-Commerce Customers** | 3,000 | 28 | 565 KB | 8-12% | Revenue analysis, customer segmentation, engagement metrics |
| **SaaS Product Usage** | 5,000 | 32 | 831 KB | 13% | Retention analysis, churn prediction, plan tier comparisons |
| **Healthcare Patient Visits** | 4,000 | 31 | 630 KB | 9.5% | Medical correlations, vital signs, risk factors |
| **Employee HR Analytics** | 2,500 | 33 | 477 KB | 5.3% | Compensation analysis, attrition patterns, performance |
| **Iris Flowers** | 150 | 5 | embedded | 0% | Instant demo (no network request) |

---

## 1. E-Commerce Customers (3,000 × 28)

**File:** `/public/ecommerce_customers.csv`

### What It Demonstrates

- **Correlation Analysis**: Strong relationships between customer tier and revenue, engagement metrics and retention
- **Customer Segmentation**: Bronze/Silver/Gold/Platinum tiers with exponential revenue growth
- **Missing Data Patterns**: Phone numbers (10%), middle initials (12%), acquisition channel (7%)
- **Outliers**: Whale customers with 10x+ normal spend
- **Data Quality**: 3 duplicate email addresses intentionally included

### Key Columns

- **Identifiers**: customer_id, email, first_name, middle_initial, last_name, phone
- **Revenue**: total_revenue, avg_order_value, total_orders
- **Engagement**: site_visits_30d, emails_opened_30d, cart_abandons, items_in_wishlist
- **Demographics**: customer_tier, region, gender, age_bracket
- **Lifecycle**: signup_date, last_purchase_date, last_login_date, customer_lifetime_days, recency_days
- **Marketing**: acquisition_channel, top_category, email_subscribed, sms_subscribed
- **Status**: premium_member, at_risk_churn

### Realistic Correlations

- **Tier → Revenue**: Platinum customers avg $17,733 vs Bronze $881
- **Premium → Engagement**: 50% higher site visits and email opens
- **Recency → Churn**: 14% of customers flagged as at-risk (>60 days since purchase)

---

## 2. SaaS Product Usage (5,000 × 32)

**File:** `/public/saas_usage.csv`

### What It Demonstrates

- **Retention Analysis**: Clear correlation between plan tier and churn rate
- **Feature Adoption**: Higher tiers use more features (Enterprise: 26/32, Free: 4/32)
- **Power Users**: Outliers with 800K-1.4M API calls (showcase outlier detection)
- **Payment Risk**: 53.5% churn rate when payment failures occur
- **Champion Users**: 77 high-engagement, high-NPS users driving $132K MRR

### Key Columns

- **Account**: user_id, status (Active/Churned/Paused/Trial), plan_tier, company_size, industry, country
- **Revenue**: mrr (monthly recurring revenue), payment_method, payment_failed
- **Engagement**: dau_avg, sessions_30d, api_calls_30d, storage_gb, feature_count_used, login_streak_days
- **Product**: primary_feature, beta features (analytics, AI), mobile_app_user
- **Support**: support_tickets_30d, nps_score (0-10), support_ticket_open
- **Lifecycle**: signup_date, last_login_date, subscription_renewal_date, churn_date, first_payment_date
- **Performance**: time_to_first_value_days, avg_session_minutes, champion_user

### Realistic Correlations

- **Plan → Churn**: Free 23.3% vs Enterprise 2.9%
- **Payment Failure → Churn**: 7.7x multiplier
- **Engagement → NPS**: Active users 6.7/10 vs Churned 3.0/10

---

## 3. Healthcare Patient Visits (4,000 × 31)

**File:** `/public/healthcare_patient_visits.csv`

**Note:** Fully anonymized, HIPAA-safe synthetic data.

### What It Demonstrates

- **Medical Correlations**: Age → conditions, BMI → vitals, smoking → cardiovascular metrics
- **Strategic Missing Data**: 30% of outpatient visits missing lab values (routine checkups don't need full labs)
- **Risk Stratification**: Readmission risk flags based on vitals and chronic conditions
- **Visit Severity**: Emergency visits show elevated vitals (HR +15 bpm, BP +30%)
- **Lifestyle Impact**: Smokers have +8 mmHg BP, +15 mg/dL cholesterol

### Key Columns

- **Identifiers**: patient_id
- **Demographics**: patient_age, gender, insurance_type
- **Visit**: visit_type (Emergency/Inpatient/Outpatient/Urgent/Telemedicine), department, primary_diagnosis_category
- **Vitals**: bmi, systolic_bp, diastolic_bp, heart_rate, temperature_f, o2_saturation
- **Labs**: glucose_mg_dl, cholesterol_total, hdl, ldl, hemoglobin
- **History**: chronic_conditions_count, medications_count, prior_visits_12mo, last_visit_date
- **Lifestyle**: smoking_status, exercise_frequency
- **Dates**: admission_date, discharge_date, length_of_stay_days
- **Risk**: readmission_risk, medication_adherence, chronic_condition_flag, critical_care

### Realistic Correlations

- **Age → Vitals**: Older patients have higher BP (+1 mmHg per year)
- **BMI → Cholesterol**: Higher BMI correlates with higher total cholesterol
- **Emergency → Severity**: Emergency visits have 30% higher BP, 15 bpm higher heart rate

---

## 4. Employee HR Analytics (2,500 × 33)

**File:** `/public/hr_analytics.csv`

### What It Demonstrates

- **Compensation Drivers**: Job level (r≈0.85), tenure (+3%/year), performance (+22.5% for top rated)
- **Attrition Patterns**: Low performers 70.4% risk vs high performers 22.4%
- **Promotion Cycles**: High performers promoted every 2-3 years, average every 3-4 years
- **Location Adjustments**: SF +35% salary premium, remote -5%
- **Strategic Missing**: Exit data only for exited employees (80% missing), promotion dates for new hires (48% missing)

### Key Columns

- **Identifiers**: employee_id
- **Demographics**: employee_age, gender, education, location
- **Employment**: department, job_level, employment_type, hire_source
- **Compensation**: salary, bonus_pct, benefits_tier, stock_options
- **Performance**: performance_rating (1-5), top_performer, training_hours_annual
- **Tenure**: tenure_years, years_since_promotion, last_promotion_date
- **Workload**: remote_work_pct, overtime_hours_annual, projects_count, direct_reports
- **Time Off**: sick_days_annual, vacation_days_annual
- **Dates**: hire_date, exit_date, last_review_date, next_review_date
- **Risk**: attrition_risk, promotion_eligible, manager_flag, remote_eligible

### Realistic Correlations

- **Tenure → Salary**: +3% per year on average
- **Performance → Attrition**: Rating 1 = 70% risk, Rating 5 = 22% risk
- **Job Level → Salary**: Clear hierarchical tiers (IC → C-Level)

---

## 5. Iris Flowers (150 × 5) - Quick Demo

**Location:** Embedded in `sampleDatasets.ts` (no network request)

### What It Demonstrates

- **Instant Loading**: No HTTP request, perfect for quick demos
- **Clean Data**: No missing values, no outliers - baseline for comparison
- **Classic ML Dataset**: Widely recognized, perfect for simple correlation demos

### Key Columns

- sepal_length, sepal_width, petal_length, petal_width, species (setosa/versicolor/virginica)

---

## Usage in Glimpse

1. Click **"Try Example Dataset"** button
2. Select from dropdown (shows row×column dimensions)
3. Dataset loads via fetch (or instantly for Iris)
4. Analysis runs automatically (2-5 seconds for 3K-5K rows)

## Bundle Impact

- **Before**: 400+ lines of embedded CSV data (~100 KB)
- **After**: 4 datasets lazy-loaded from `/public`, <1 KB metadata
- **Iris**: Kept embedded for instant demo (no network latency)

## Generation Scripts

All datasets were generated programmatically using Python with realistic correlations:

- `scripts/generate_ecommerce_data.py` (seed=42, reproducible)
- SaaS, Healthcare, HR datasets generated by parallel agents with documented specifications

See agent outputs in original task for complete generation details.
