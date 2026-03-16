SaaS Product Usage Dataset - README
=====================================

Generated: March 16, 2026
Rows: 5,000 user accounts
Columns: 30 fields
File: saas_usage.csv

PURPOSE
-------
Realistic SaaS product usage dataset designed to test data analysis tools
like Glimpse. Contains authentic correlations, quality issues, and patterns
found in real B2B SaaS businesses.

COLUMNS
-------

User Identity:
  - user_id: Unique identifier (USR0001-USR5000)
  - signup_date: Account creation date (2019-2024)

Plan & Segmentation:
  - plan_tier: Free, Starter ($99), Professional ($499), Enterprise ($1499-$4999)
  - industry: SaaS, Ecommerce, Finance, Healthcare, Education, Media, Other
  - company_size: 1-10, 11-50, 51-200, 201-1000, 1000+
  - country: US, UK, Canada, Germany, France, Australia, India, Other
  - primary_feature: Analytics, Automation, Collaboration, Integration, Reporting

Revenue & Usage:
  - mrr: Monthly recurring revenue in dollars (0 for Free tier)
  - dau_avg: Average daily active users (30-day window)
  - sessions_30d: Total sessions in last 30 days
  - api_calls_30d: Total API calls in last 30 days
  - storage_gb: Storage usage in gigabytes

Engagement:
  - feature_count_used: Number of features activated (out of 32)
  - support_tickets_30d: Support tickets opened in last 30 days
  - nps_score: Net Promoter Score (0-10)
  - login_streak_days: Consecutive days with login
  - time_to_first_value_days: Days from signup to first meaningful action
  - avg_session_minutes: Average session duration

Payment:
  - payment_method: Credit Card, ACH, Invoice, PayPal (empty for Free)
  - first_payment_date: Date of first payment (empty for Free/Trial)
  - subscription_renewal_date: Next renewal date (empty for Churned/Paused)

Status & Dates:
  - status: Active, Churned, Paused, Trial
  - last_login_date: Most recent login
  - churn_date: Date account churned (empty for Active/Paused/Trial)

Boolean Flags:
  - beta_analytics_enabled: Opted into analytics beta (true/false)
  - beta_ai_enabled: Opted into AI beta (true/false)
  - payment_failed: Recent payment failure (true/false)
  - support_ticket_open: Has open support ticket (true/false)
  - champion_user: High engagement + high NPS (true/false)
  - mobile_app_user: Uses mobile app (true/false)

REALISTIC CORRELATIONS
-----------------------

1. Higher plan tier → Lower churn rate
   - Free: 25% churn, Enterprise: 3% churn

2. Higher plan tier → Higher usage
   - Enterprise avg: 55 DAU, 166K API calls
   - Free avg: 3 DAU, 1K API calls

3. Payment failures → Higher churn risk
   - 38% of churned users had payment failures
   - Only 5% of active users have payment failures

4. Engagement → Retention
   - Champion users (high NPS + high usage) are 77 users
   - 43% are Professional, 43% Enterprise, 1% Starter

5. Company size → Plan tier
   - Enterprise plans: mostly 51-200 and 201-1000 employees
   - Free plans: mostly 1-10 employees

QUALITY ISSUES (Intentional)
-----------------------------

Missing Data Patterns:
  - 71% of churned users missing last_login_date
  - 40% of churned users missing recent engagement metrics (dau_avg, sessions, api_calls)
  - 5% random missing on nps_score (optional survey)
  - 31% missing payment_method/first_payment_date (Free tier + some trials)

Data Characteristics:
  - Some extreme outliers in API calls (power users: 800K-1.4M calls)
  - Engagement dropoff for paused accounts
  - Trial users show exploratory behavior (moderate usage)
  - Free tier users have limited feature adoption

INTENDED USE CASES
-------------------

Test these analysis scenarios:
  1. Correlation detection (plan tier ↔ churn, usage ↔ retention)
  2. Missing data handling (churned user gaps)
  3. Outlier detection (power users with extreme API calls)
  4. Segmentation analysis (by plan, industry, company size)
  5. Cohort analysis (by signup date)
  6. Predictive features (payment_failed, low engagement → churn risk)
  7. Distribution analysis (revenue skew toward Enterprise)
  8. Time-series patterns (signup trends, churn timing)

STATISTICS
-----------

Status Distribution:
  - Active: 4,160 (83%)
  - Churned: 721 (14%)
  - Paused: 119 (2%)
  - Trial: 0 (0% - trials convert or churn quickly)

Plan Distribution:
  - Free: 1,552 (31%)
  - Starter: 1,719 (34%)
  - Professional: 1,252 (25%)
  - Enterprise: 477 (10%)

Missing Data: 10-15% overall
  - Most missing: churn_date (86% - expected for non-churned)
  - Payment fields: 31% (Free tier users)
  - Last login: 13% (mostly churned users)
  - Engagement metrics: 6% (churned users)
  - NPS: 5% (optional survey)

Champion Users: 77 (1.5% of all users)
  - Distributed across Professional (43) and Enterprise (33) tiers
  - High NPS (9+) + high engagement

File Size: ~1 MB (976 KB)

GENERATION METHOD
-----------------

Created using Python with realistic probability distributions:
  - Plan tier weighted toward Free/Starter (typical SaaS funnel)
  - Churn probability inverse to plan tier
  - Usage metrics correlated with plan tier and status
  - Company size correlated with plan selection
  - Missing data patterns based on user lifecycle
  - Outliers injected at 2% rate for power users

Random seed: 42 (reproducible)

CONTACT
-------

Generated for Glimpse data analysis tool
https://github.com/mattbayne/glimpse
