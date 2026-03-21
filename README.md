# Glimpse 🔍

**Privacy-first exploratory data analysis in your browser**

Get instant insights from CSV files with beautiful visualizations and comprehensive statistics — all processed locally. No data ever leaves your machine.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)

## Features

### 📊 Comprehensive Analysis
- **Dataset Overview** - Rows, columns, memory usage, missing data %
- **Column Statistics** - Mean, median, std dev, quartiles for numeric data
- **Distribution Histograms** - Visual representation of numeric columns
- **Categorical Analysis** - Unique values, top frequencies with bar charts
- **DateTime Support** - Date ranges and frequency analysis
- **Data Quality Checks** - Duplicate detection, missing data warnings, cardinality alerts
- **Excel Support** - Full .xlsx file analysis via Pyodide openpyxl

### 🎨 Visual Insights
- **Column Map** - Visual representation of dataset structure
  - Color-coded by data type (Numeric, Categorical, DateTime)
  - Height shows data completeness
  - Hover for column details
- **Interactive Histograms** - Distribution charts for every numeric column
- **Frequency Bars** - Top values visualization for categorical data

### 🔒 Privacy First
- **100% Client-Side** - No backend, no API calls, no data collection
- **Local Processing** - All analysis runs in your browser via Pyodide
- **Zero Tracking** - Your data never leaves your machine
- **Open Source** - Transparent, auditable code

### 🎯 Smart Organization
- **Tabbed Interface**
  - Overview: High-level dataset summary
  - Columns: Detailed per-column analysis with filters
  - Quality: Data quality issues and recommendations
- **Keyboard Shortcuts** - Power user navigation
  - `ESC` to close modals, `←`/`→` to navigate tabs, `1`/`2`/`3` to jump to tabs
  - Press `?` to see all shortcuts
- **Column Filtering** - Filter by type (All/Numeric/Categorical/DateTime)
- **Persistent Results** - Analysis cached in localStorage

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/glimpse.git
cd glimpse

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5174/` and upload a CSV file to get started!

### Usage

1. **Upload a CSV** - Drag and drop or click to browse
2. **Wait for Analysis** - Pyodide loads on first use (~10-15MB, one-time)
3. **Explore Your Data**
   - Overview tab: See dataset shape and quality
   - Columns tab: Dive into individual column stats
   - Quality tab: Review data quality warnings

### Sample Data

Try Glimpse with the built-in example dataset (Iris - 150 rows × 5 columns):
- Click "Try Example Dataset" to load instantly
- Or upload your own CSV file (max 10MB)

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4
- **State**: Zustand 5 (with persist middleware)
- **Icons**: Lucide React
- **Python Runtime**: Pyodide 0.29.3 (Python + pandas/numpy in WebAssembly)
- **Font**: Inter (Google Fonts)

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## How It Works

1. **File Upload** - User drops CSV file
2. **Pyodide Initialization** - Loads Python runtime + pandas/numpy (first time only)
3. **Analysis** - Python script runs in browser:
   - Loads CSV into pandas DataFrame
   - Calculates statistics (describe, value_counts, histograms)
   - Detects data quality issues
   - Returns JSON results
4. **Visualization** - React components render analysis results
5. **Caching** - Results persisted to localStorage for instant reload

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements:**
- WebAssembly support
- Modern JavaScript (ES2020+)
- ~100MB free memory for Pyodide runtime

## Roadmap

See [BACKLOG.md](BACKLOG.md) for full feature list.

**Recently Shipped:**
- ✅ Story Mode dark theme - All slides respect light/dark theme selection
- ✅ Immersive Story Mode - Auto-generated visual narratives with cinematic presentation
- ✅ Advanced statistical analysis - Normality tests, correlation significance, FFT seasonality
- ✅ Excel file support (.xlsx) - Full openpyxl integration
- ✅ Responsive mobile design - Touch-optimized layouts
- ✅ Keyboard shortcuts - Power user navigation

**Coming Soon:**
- Multi-sheet Excel support
- Standalone HTML story export
- Custom column transformations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Privacy & Security

- **No data collection** - Glimpse doesn't track, store, or transmit your data
- **No analytics** - No Google Analytics, no third-party scripts
- **No backend** - Pure client-side application
- **Open source** - Code is fully auditable

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- **Pyodide** - Python in the browser
- **pandas** - Data analysis library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon set

---

Built with ❤️ for data privacy and exploration
