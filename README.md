# NLA Revenue Monitoring System - Frontend

## 🎨 Overview
React-based dashboard interface for Liberia's National Lottery Authority featuring:
- **Executive Dashboard** - High-level revenue and operator metrics
- **Anomaly Detection Dashboard** - AI-powered fraud and compliance monitoring
- **Liberian Color Scheme** - National colors (Blue #002868, Red #BF0A30)
- **Professional Charts** - Interactive data visualization with Recharts
- **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+) installed
- Backend API running on `http://localhost:3001`

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies** (2-3 minutes)
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open browser**
The app will automatically open at `http://localhost:3000`

If it doesn't open automatically, manually navigate to: **http://localhost:3000**

---

## ✅ Verification Steps

Once the app loads, you should see:

### Navigation Bar
- ✅ "NLA Revenue Monitoring System" logo
- ✅ Two navigation tabs: "Executive Dashboard" and "Anomaly Detection"

### Executive Dashboard (Default View)
- ✅ 4 KPI cards showing:
  - Total Revenue (December)
  - Tax Collected
  - Active Operators
  - Active Alerts
- ✅ Revenue trend line chart (6 months)
- ✅ Top operators table
- ✅ Recent alerts panel
- ✅ Summary statistics at bottom

### Anomaly Detection Dashboard
- ✅ Total anomalies counter in header
- ✅ Search and filter controls
- ✅ Confidence score bar chart
- ✅ Expandable anomaly cards showing:
  - Operator name and status
  - Anomaly type badge
  - Financial details
  - AI confidence score

---

## 🎯 Testing the Dashboards

### Test 1: Executive Dashboard
1. Page should load with revenue data
2. Click on different KPI cards (no action, just visual)
3. Hover over the revenue trend chart - tooltip should appear
4. Scroll through the top operators table
5. Check the recent alerts panel shows 3+ anomalies

### Test 2: Anomaly Detection Dashboard
1. Click "Anomaly Detection" tab in navigation
2. You should see 3+ anomaly cards
3. **Test Search**: Type "Lucky" in search box → should filter to "Lucky Star Casino"
4. **Test Filter**: Select "Revenue Drop" from dropdown → should show only revenue drop anomalies
5. **Test Expand**: Click on any anomaly card → should expand to show detailed information
6. Look for the three planted anomalies:
   - **Lucky Star Casino** - Revenue Drop (92% confidence)
   - **Monrovia Bet** - Round Numbers Pattern (78% confidence)
   - **Safe Play Liberia** - Late Submission Pattern (65% confidence)

### Test 3: Navigation
1. Switch between Executive and Anomaly Detection tabs
2. Both should load smoothly without errors
3. Data should persist (no re-fetching when switching)

---

## 📱 Responsive Design Test

### Desktop (Recommended)
- Best experience on screens 1280px+ wide
- All charts and tables fully visible

### Tablet
- Resize browser to ~768px width
- Layout should adapt to 2-column grid
- Navigation should remain functional

### Mobile
- Resize to ~375px width
- Should stack into single column
- All features still accessible

---

## 🎨 Color Scheme

The dashboard uses Liberian national colors:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Liberian Blue** | `#002868` | Primary buttons, Executive Dashboard header |
| **Liberian Red** | `#BF0A30` | Secondary buttons, Anomaly Dashboard header, alerts |
| **White** | `#FFFFFF` | Cards, backgrounds |
| **Success Green** | `#10b981` | Active status, positive trends |
| **Warning Yellow** | `#f59e0b` | Under review status, warnings |
| **Danger Red** | `#ef4444` | Suspended status, critical alerts |

---

## 🛠️ Troubleshooting

### Issue: "Failed to load dashboard data"
**Cause:** Backend API is not running  
**Solution:** 
```bash
# In backend directory
npm start
# Verify at http://localhost:3001/health
```

### Issue: Blank screen or errors in console
**Cause:** Missing dependencies or build issues  
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: Charts not displaying
**Cause:** Recharts library not installed properly  
**Solution:**
```bash
npm install recharts --save
npm start
```

### Issue: Styling looks broken
**Cause:** Tailwind CSS not compiling  
**Solution:**
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npm start
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or set different port
PORT=3002 npm start
```

---

## 📂 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── ExecutiveDashboard.jsx      # Screen 1: Executive view
│   │   ├── AnomalyDashboard.jsx        # Screen 2: Anomaly detection
│   │   ├── KPICard.jsx                 # Reusable KPI metric card
│   │   ├── RevenueTrendChart.jsx       # Line chart component
│   │   ├── TopOperatorsTable.jsx       # Operators ranking table
│   │   └── RecentAlerts.jsx            # Alerts sidebar
│   ├── utils/
│   │   └── api.js              # API calls & formatting functions
│   ├── App.js                  # Main app with navigation
│   ├── index.js                # React entry point
│   └── index.css               # Tailwind CSS + custom styles
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── postcss.config.js           # PostCSS configuration
```

---

## 🔌 API Endpoints Used

The frontend connects to these backend endpoints:

| Endpoint | Used By | Purpose |
|----------|---------|---------|
| `/api/stats` | Executive Dashboard | Overview statistics & trends |
| `/api/anomalies` | Both Dashboards | Flagged anomalies list |
| `/api/operators` | Executive Dashboard | Operator information |
| `/api/reports` | Anomaly Dashboard | Detailed revenue reports |

**Base URL:** `http://localhost:3001/api`

---

## 🚀 Building for Production

To create an optimized production build:

```bash
npm run build
```

This creates a `build/` directory with optimized static files ready for deployment.

### Deployment Options
- **Vercel** (Recommended for demo): `vercel deploy`
- **Netlify**: Drag and drop `build/` folder
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3**: Upload `build/` contents

---

## 🎯 Demo Walkthrough Script

When presenting to NLA leadership:

### 1. Start with Executive Dashboard (2 minutes)
- "This is your real-time executive overview"
- Point to total revenue and tax collected
- "Notice the revenue trend over 6 months"
- "Here are your top-performing operators"
- "And these are active alerts requiring attention"

### 2. Switch to Anomaly Detection (3 minutes)
- "Now let's look at what the AI has detected"
- "We have 3 anomalies flagged this month"
- Click on Lucky Star Casino
- "44% revenue drop with 92% AI confidence"
- "The system detected this automatically"
- Show the detailed financial breakdown
- "This is the kind of issue that would take weeks to find manually"

### 3. Demonstrate Filtering (1 minute)
- Use search: "You can search for any operator"
- Use filter dropdown: "Filter by anomaly type"
- "The system makes it easy to focus on what matters"

### 4. Close Strong
- "This is just the MVP - imagine this at full scale"
- "Real-time monitoring across all operators"
- "Automated compliance checking"
- "Regional model for West Africa"

---

## 📊 Features Showcase

### Implemented ✅
- [x] Real-time data fetching from API
- [x] Executive dashboard with KPIs
- [x] Anomaly detection dashboard
- [x] Interactive charts (Recharts)
- [x] Search and filtering
- [x] Expandable anomaly details
- [x] Responsive design
- [x] Liberian color scheme
- [x] Loading states
- [x] Error handling
- [x] Professional styling (Tailwind CSS)

### Demo-Only (Non-Functional) ⚠️
- [ ] "Send Alert" button (visual only)
- [ ] "Export" functionality (not implemented)
- [ ] "View Full Report" button (visual only)

---

## 🎓 Learning Resources

If you want to understand the code:
- **React Basics**: https://react.dev/learn
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/en-US/
- **Axios**: https://axios-http.com/docs/intro

---

## ✅ Pre-Demo Checklist

Before presenting to NLA:

- [ ] Backend API is running (`http://localhost:3001`)
- [ ] Frontend loads without errors
- [ ] All 3 anomalies are visible
- [ ] Charts display correctly
- [ ] Search and filter work
- [ ] Clicking anomalies expands them
- [ ] Test on presentation computer/projector
- [ ] Have backup screenshots ready
- [ ] Practice the walkthrough (5-6 minutes total)

---

## 📞 Quick Commands Reference

```bash
# Start development server
npm start

# Build for production
npm run build

# Clean restart
rm -rf node_modules && npm install && npm start

# Check for errors
npm run build
```

---

**Built with ❤️ by XI Consult Corp for the National Lottery Authority of Liberia**
