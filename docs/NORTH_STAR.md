# Glimpse North Star

**Last Updated:** March 21, 2026

---

## Vision Statement

**Make professional data analysis instant, accessible, and completely private — transforming CSVs into compelling stories without ever uploading your data.**

Glimpse bridges the gap between Excel's accessibility and Python's power, giving anyone the ability to explore data deeply and communicate findings beautifully — all in the browser, with zero setup and absolute privacy.

---

## Core Beliefs

### 1. Privacy is Non-Negotiable
Your data never leaves your machine. No cloud uploads, no API calls, no tracking, no exceptions. This isn't a feature — it's our foundation.

**Why it matters:** Healthcare researchers, financial analysts, HR teams, and journalists work with sensitive data daily. They need powerful analysis tools but can't risk data exposure.

### 2. Insights Should Be Immediate
From CSV drop to actionable insights in under 10 seconds. No installation, no configuration, no learning curve. Drag, drop, understand.

**Why it matters:** Most analysis tools require hours of setup and learning. By the time you're ready to analyze, you've lost momentum and context.

### 3. Analysis Should Be Professional-Grade
We don't dumb down statistics. Normality tests, correlation significance, FFT seasonality detection, distribution fitting — these aren't "advanced features," they're table stakes for real analysis.

**Why it matters:** Business users and students deserve the same statistical rigor that data scientists get from Python. Accessibility doesn't mean sacrificing quality.

### 4. Data Has Stories to Tell
Raw statistics don't persuade. Stories do. Every dataset has a narrative — our job is to surface it automatically and help users share it compellingly.

**Why it matters:** Finding insights is only half the battle. Communicating them effectively is what drives decisions, secures funding, and changes minds.

---

## Target Users

### Primary: **The Curious Analyst** 🎯
- **Who:** Business analysts, product managers, operations leads, marketing analysts
- **Context:** Non-technical, data-curious, time-constrained, frustrated with existing tools
- **Need:** Understand what their data is telling them without learning Tableau or writing Python
- **Pain:** Tableau requires training + $$$, Excel requires manual work, cloud tools require risky uploads
- **Jobs to Be Done:**
  - "Show me what's interesting in this dataset"
  - "Find correlations I wouldn't have spotted manually"
  - "Help me explain these findings to my team"
- **Win Condition:** "I uploaded my sales data and immediately saw patterns I'd missed after weeks in Excel. The tool did the analysis for me."

### Secondary: **The Data Storyteller**
- **Who:** Consultants, internal analysts, academics, data journalists
- **Need:** Transform analysis into presentations that persuade stakeholders
- **Pain:** Switching between analysis tools (Python/R) and presentation tools (PowerPoint/Tableau)
- **Win Condition:** "I went from CSV to compelling presentation in 5 minutes, and it looked professional"

### Tertiary: **The Privacy-Conscious User**
- **Who:** Healthcare researchers, HR analysts, financial teams, legal investigators
- **Need:** Analyze sensitive data without compliance risks
- **Pain:** Can't use cloud tools due to HIPAA/GDPR/internal policies
- **Win Condition:** "I can finally use modern analysis tools on patient data without violating privacy laws"

---

## Product Pillars

### 1. Instant Exploration
**Goal:** From upload to insights in <10 seconds

**Key Features:**
- ✅ One-click CSV/Excel upload (current: 50MB max)
- ✅ Auto-generated statistics (mean, median, quartiles, correlation)
- ✅ Smart visualizations (histograms, box plots, time series)
- ✅ Quality warnings (missing data, duplicates, outliers)
- 🔲 Multi-file comparison (side-by-side datasets)
- 🔲 Column transformations (normalize, bin, encode)
- 🔲 Suggested next analyses (auto-detect patterns → recommend tests)

### 2. Professional Statistics
**Goal:** Match or exceed Python/R statistical capabilities

**Key Features:**
- ✅ Normality testing (Shapiro-Wilk)
- ✅ Correlation significance (p-values)
- ✅ Time series analysis (FFT seasonality, trends)
- ✅ Distribution fitting (overlay normal curves)
- 🔲 Hypothesis testing (t-test, chi-square, ANOVA)
- 🔲 Anomaly detection (isolation forests, z-scores)
- 🔲 Clustering visualization (k-means, hierarchical)
- 🔲 Regression analysis (linear, logistic with diagnostics)

### 3. Compelling Communication
**Goal:** Auto-generate presentation-ready stories from raw data

**Key Features:**
- ✅ Markdown export (comprehensive reports)
- ✅ Copy-to-clipboard (quick stats sharing)
- 🔲 **Immersive Story Mode** (full-screen narrative presentations) ⭐ NEXT
- 🔲 PDF reports with embedded charts
- 🔲 Shareable URLs (compressed results in hash, no backend)
- 🔲 Customizable slide decks (reorder/edit auto-generated slides)
- 🔲 Embed code snippets (iframe for blogs/documentation)

### 4. Zero Friction
**Goal:** No barriers between user and insights

**Key Features:**
- ✅ No installation (pure web app)
- ✅ No login/signup (privacy-first = no accounts)
- ✅ No configuration (smart defaults)
- ✅ Sample datasets (instant demos)
- ✅ Keyboard shortcuts (power users)
- 🔲 URL-based state (bookmark analysis, share links)
- 🔲 Progressive Web App (offline usage, install prompt)
- 🔲 Mobile-optimized (full touch navigation)

---

## Strategic Bets

### Bet #1: Storytelling as Killer Feature
**Hypothesis:** Auto-generated data narratives will differentiate Glimpse from all competitors and unlock the "data storyteller" user segment.

**Why it's bold:** Most tools stop at analysis. We're betting that extending into communication creates a complete workflow that's 10x better than status quo.

**Success Metrics:**
- 30%+ of users who complete analysis enter Story Mode
- 50%+ of Story Mode users export presentations
- User feedback mentions "storytelling" as primary value prop

**If we're wrong:** We still have best-in-class privacy-first analysis. Story Mode becomes optional power feature.

### Bet #2: Client-Side is Sustainable
**Hypothesis:** Browser performance (WebAssembly, multi-threading) will continue improving faster than dataset sizes grow, keeping client-side viable.

**Why it's bold:** Current 50MB limit works for most users, but enterprise datasets can be GB-scale. We're betting edge cases stay edge cases.

**Mitigation:** If proven wrong, add optional cloud processing with explicit user consent (upload → process → delete).

### Bet #3: Privacy is a Moat
**Hypothesis:** Privacy-conscious users will choose Glimpse even if competitors have more features, because trust >> features for sensitive data.

**Why it's bold:** Privacy is hard to monetize and easy to compromise. We're betting long-term brand value outweighs short-term revenue from data collection.

**Validation:** Track user segments — if healthcare/finance/HR users dominate, we've found our moat.

---

## Non-Goals (What We're NOT Building)

- ❌ **Not a BI tool** - No SQL queries, no database connections, no live dashboards
- ❌ **Not a data warehouse** - No persistent storage, no multi-user collaboration (privacy = single-user)
- ❌ **Not a notebook** - No code cells, no custom scripts (that's Jupyter's job)
- ❌ **Not a data cleaning tool** - We suggest fixes, but won't build complex ETL pipelines
- ❌ **Not a machine learning platform** - We visualize patterns but don't train models (maybe someday)

---

## Strategic Decisions ✅

### Product Strategy
1. **Monetization Path** → **Free Forever**
   - No paywalls, no subscriptions, no "pro" features
   - Optional "Buy Me a Coffee" for sustainability
   - Privacy-first = no accounts = no paywall enforcement mechanism
   - Build audience first, monetize later only if absolutely necessary

2. **Target User Priority** → **Curious Analyst (Business User)**
   - Primary: Business analysts who want to understand their data without learning Tableau
   - Secondary: Data storytellers who need to present findings
   - Persona: Non-technical user with important questions, limited time, zero tolerance for friction

3. **Competitive Positioning** → **Tableau Replacement (Zero Friction)**
   - "All the power of Tableau, none of the friction"
   - No installation, no signup, no learning curve
   - Messaging: "Drop your CSV, get insights in 10 seconds"
   - Differentiator: Auto-discovery + Beautiful visuals + Absolute privacy

### Storytelling Feature Scope
4. **Narrative Style** → **Hybrid (Auto-Generate + Customize)**
   - AI automatically detects patterns and creates slide deck
   - User can reorder, edit, or remove slides
   - Fast first draft (automated) + professional polish (customization)

5. **Wow Moment** → **Auto-Discovery of Hidden Insights**
   - Primary: Tool surfaces correlations/patterns user would have missed
   - Secondary: Beautiful visual narratives (not just numbers)
   - Table stakes: Smooth animations, full-screen presentation mode
   - **Visual storytelling > correlation coefficients** - show scatter plots, not "r=0.87"

6. **Export Priority** → **Standalone HTML First**
   - Phase 1: Standalone HTML (privacy-preserved, works everywhere)
   - Phase 2: PDF (printable reports)
   - Phase 3: PowerPoint (only if users demand it)

### Technical Depth
7. **Analysis Breadth vs Depth** → **Deeper on Statistics**
   - Focus: More statistical tests, more rigor, better insight detection
   - Accept: CSV and Excel only (no JSON, Parquet, SQL, APIs)
   - Philosophy: Better to do less brilliantly than more mediocrely

8. **Performance Trade-offs** → **Keep 50MB, Optimize Aggressively**
   - 50MB covers 95%+ of use cases (business datasets are rarely larger)
   - Invest in speed optimization, not file size increases
   - If enterprise users need more: they can sample/aggregate first

---

## Success Metrics

### Phase 1: Adoption (Current)
- ✅ 1,000+ analysis sessions
- ✅ Zero privacy incidents (by design)
- ✅ <10s load time for 10MB datasets
- 🔲 50%+ mobile traffic (responsive design)

### Phase 2: Retention (Next 3 Months)
- 🔲 30%+ repeat usage (bookmark, return within 7 days)
- 🔲 Story Mode adoption: 30%+ of analysis sessions
- 🔲 Export rate: 50%+ of Story Mode users export presentations
- 🔲 NPS >50 (survey after 3rd analysis)

### Phase 3: Advocacy (6-12 Months)
- 🔲 50%+ of new users via referral/word-of-mouth
- 🔲 Featured in data analysis tool roundups (blogs, YouTube)
- 🔲 Case studies from enterprise users (healthcare, finance, HR)
- 🔲 Community-created sample datasets (user contributions)

---

## Roadmap Themes

### Q1 2026: Foundation ✅
- Core analysis engine (pandas/numpy/scipy)
- Professional visualizations (histograms, box plots, time series)
- Dark mode, keyboard shortcuts, mobile responsiveness
- Sample datasets, error handling, Excel support

### Q2 2026: Communication 🎯 CURRENT FOCUS
- **Immersive Story Mode** (full-screen narrative presentations)
- Auto-insight detection (correlation, trends, outliers, anomalies)
- Shareable exports (HTML, PDF)
- Customizable narratives (edit/reorder slides)

### Q3 2026: Depth
- Hypothesis testing (t-test, chi-square, ANOVA)
- Anomaly detection (isolation forests, z-scores)
- Clustering visualization (k-means, DBSCAN)
- Regression analysis (linear, logistic with diagnostics)

### Q4 2026: Scale
- Performance optimization (50MB → 200MB datasets)
- Multi-file comparison (side-by-side analysis)
- Progressive Web App (offline usage, install prompt)
- Column transformations (normalize, bin, one-hot encode)

---

## Decision Framework

When evaluating new features, ask:

1. **Does it preserve privacy?** (If no, reject immediately)
2. **Does it serve our target users?** (Curious Analyst or Data Storyteller)
3. **Does it advance a Product Pillar?** (Exploration, Statistics, Communication, Friction)
4. **Does it align with a Strategic Bet?** (Storytelling, Client-Side, Privacy as Moat)
5. **Can we build it without backend?** (Client-side constraint)
6. **Does it create compounding value?** (Features that make other features better)

**Example:**
- **Feature:** Multi-file comparison (side-by-side datasets)
- **Privacy?** ✅ Yes (all client-side)
- **Target User?** ✅ Curious Analyst (compare before/after, test/control)
- **Pillar?** ✅ Instant Exploration
- **Bet?** ⚠️ Neutral (doesn't advance storytelling or privacy moat)
- **Client-Side?** ✅ Yes (load both in memory)
- **Compounding?** ✅ Yes (enables A/B test analysis, time-based comparisons)
- **Verdict:** Build, but after Story Mode (alignment with bet #1)

---

## Inspirations

**Tools We Admire:**
- **Observable** - Notebooks done right (reactive, visual, shareable)
- **Datasette** - Privacy-first data publishing (CSV → queryable site)
- **Datawrapper** - Chart creation for non-technical users (simplicity)
- **Flourish** - Data storytelling with animations (narrative focus)
- **Tableau Public** - Discoverability and community (sans privacy issues)

**What We'd Steal:**
- Observable's reactive execution model (instant feedback)
- Datasette's URL-based queries (bookmarkable analysis)
- Datawrapper's opinionated simplicity (smart defaults)
- Flourish's animated narratives (compelling stories)
- Tableau's "Show Me" feature (suggested chart types)

---

## Conclusion

Glimpse isn't just another data tool — it's a bet that privacy, speed, and storytelling can coexist in a way that unlocks a new category of users who've been underserved by existing solutions.

**Our unfair advantage:** We're the only tool that combines professional-grade statistics with absolute privacy AND auto-generated storytelling. Excel can't tell stories. Python can't run in-browser. Tableau can't guarantee privacy. We can do all three.

**Next milestone:** Ship Immersive Story Mode and prove that automated narratives transform how people communicate data insights.

---

**Questions? Feedback? Let's align on the vision before diving into implementation.**
