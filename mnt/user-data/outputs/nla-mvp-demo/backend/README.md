# NLA Revenue Monitoring System - Backend MVP

## 📋 Overview
Backend API for the National Lottery Authority Revenue Monitoring System MVP. This is a demo system showcasing AI-powered anomaly detection and real-time revenue monitoring capabilities.

---

## 🚀 STAGE 1: Backend Setup & Testing

### Prerequisites
Before starting, ensure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A terminal/command prompt

### Step 1: Navigate to Backend Directory
```bash
cd /path/to/nla-mvp-demo/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `sqlite3` - Database
- `body-parser` - Request parsing

**Expected Output:**
```
added 57 packages, and audited 58 packages in 3s
```

### Step 3: Seed the Database
```bash
npm run seed
```

This creates the database and populates it with:
- 6 gaming operators (Sports Betting, Casino, Lottery)
- 6 months of revenue reports
- ~1000 sample transactions
- 3 intentional anomalies for demo

**Expected Output:**
```
🚀 Starting NLA Database Seeding...

📋 Dropping existing tables...
📋 Creating operators table...
📋 Creating revenue_reports table...
📋 Creating transactions table...

👥 Inserting operators...
   ✓ Bet360 Liberia (Sports Betting) - Status: Active
   ✓ Lucky Star Casino (Online Casino) - Status: Active
   ✓ Premier Lotto (Lottery) - Status: Active
   ✓ Monrovia Bet (Sports Betting) - Status: Under Review
   ✓ Galaxy Gaming (Online Casino) - Status: Suspended
   ✓ Safe Play Liberia (Lottery) - Status: Active

💰 Generating revenue reports (6 months)...
   Generating for Bet360 Liberia...
   Generating for Lucky Star Casino (⚠️  ANOMALY in Dec)...
   Generating for Premier Lotto...
   Generating for Monrovia Bet (⚠️  ANOMALY - Round Numbers)...
   Generating for Galaxy Gaming (Suspended)...
   Generating for Safe Play Liberia (⚠️  ANOMALY - Late Submissions)...

🎰 Generating sample transactions (last 30 days)...
   ✓ Generated 156 transactions for operator 1
   ✓ Generated 234 transactions for operator 2
   ✓ Generated 187 transactions for operator 3
   ✓ Generated 213 transactions for operator 4
   ✓ Generated 198 transactions for operator 6

✅ Database seeding completed successfully!

📊 Summary:
   - 6 operators created
   - 6 months of revenue reports
   - ~1000 sample transactions
   - 3 operators with anomalies flagged

🎯 Anomalies planted:
   1. Lucky Star Casino: 44% revenue drop in December
   2. Monrovia Bet: Suspicious round number pattern
   3. Safe Play Liberia: Consistent late submissions

✅ Database connection closed.
```

### Step 4: Start the API Server
```bash
npm start
```

**Expected Output:**
```
✅ Connected to SQLite database

🚀 ============================================
🚀  NLA Revenue Monitoring API Server
🚀 ============================================
🚀  Server running on: http://localhost:3001
🚀  Health check: http://localhost:3001/health
🚀  API docs: http://localhost:3001/
🚀 ============================================
```

✅ **Your backend is now running!**

---

## 🧪 Testing the API Endpoints

### Method 1: Using Your Web Browser (Easiest)

Open these URLs in your browser:

1. **Health Check**
   ```
   http://localhost:3001/health
   ```
   Should show: `{"status":"healthy","timestamp":"...","database":"connected"}`

2. **API Documentation**
   ```
   http://localhost:3001/
   ```
   Shows all available endpoints

3. **Get All Operators**
   ```
   http://localhost:3001/api/operators
   ```
   Should return 6 operators sorted by risk score

4. **Get Dashboard Statistics**
   ```
   http://localhost:3001/api/stats
   ```
   Shows overview data, revenue trends, and top operators

5. **Get All Anomalies**
   ```
   http://localhost:3001/api/anomalies
   ```
   Should show 3+ flagged anomalies

6. **Get Recent Transactions**
   ```
   http://localhost:3001/api/transactions?limit=20
   ```
   Shows last 20 transactions

### Method 2: Using curl (Command Line)

```bash
# Health check
curl http://localhost:3001/health

# Get all operators
curl http://localhost:3001/api/operators

# Get stats
curl http://localhost:3001/api/stats

# Get anomalies
curl http://localhost:3001/api/anomalies

# Get specific operator (Lucky Star Casino)
curl http://localhost:3001/api/operators/2

# Get revenue reports for December
curl "http://localhost:3001/api/reports?start_date=2024-12-01&end_date=2024-12-31"

# Get suspicious transactions only
curl "http://localhost:3001/api/transactions?suspicious_only=true"
```

### Method 3: Using Postman or Insomnia

Import these endpoints:
- GET `http://localhost:3001/api/operators`
- GET `http://localhost:3001/api/operators/:id`
- GET `http://localhost:3001/api/reports`
- GET `http://localhost:3001/api/anomalies`
- GET `http://localhost:3001/api/transactions`
- GET `http://localhost:3001/api/stats`
- GET `http://localhost:3001/api/anomaly-types`

---

## 📊 Key Endpoints Explained

### 1. `/api/stats` - Dashboard Overview
Returns comprehensive statistics including:
- Total/active/problematic operators count
- Current vs previous month revenue
- Revenue change percentage
- Tax collected
- Active anomalies count
- Revenue trend (6 months)
- Top operators by revenue

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_operators": 6,
      "active_operators": 3,
      "current_month_revenue": 43900000,
      "revenue_change_percent": -5.67,
      "active_anomalies": 3
    },
    "revenue_trend": [...],
    "top_operators": [...]
  }
}
```

### 2. `/api/anomalies` - Flagged Issues
Returns all reports with anomaly flags including:
- Anomaly type (Revenue Drop, Round Numbers, Late Submission)
- Confidence score (0-100%)
- Operator details
- Report data

**Query Parameters:**
- `anomaly_type`: Filter by specific type
- `min_confidence`: Minimum confidence score (e.g., 80)

### 3. `/api/operators` - Operator Management
Lists all registered operators with risk scores.

**Sample Operator:**
```json
{
  "operator_id": 2,
  "name": "Lucky Star Casino",
  "license_type": "Online Casino",
  "status": "Active",
  "risk_score": 78,
  "contact_email": "ops@luckystar.lr",
  "last_report_date": "2024-12-14"
}
```

---

## 🎯 Testing the Anomalies

The system has 3 intentional anomalies planted for demo:

### Anomaly 1: Lucky Star Casino - Revenue Drop
```bash
curl http://localhost:3001/api/operators/2
```
Look for December report showing:
- **Expected:** ~₹12M revenue (consistent with previous months)
- **Actual:** ₹6.9M (44% drop)
- **Anomaly Confidence:** 92%

### Anomaly 2: Monrovia Bet - Round Numbers Pattern
```bash
curl "http://localhost:3001/api/reports?operator_id=4"
```
Look for reports showing perfectly round numbers:
- ₹8,000,000
- ₹8,500,000
- ₹9,000,000
- ₹9,500,000

This suggests data manipulation.

### Anomaly 3: Safe Play Liberia - Late Submissions
```bash
curl "http://localhost:3001/api/reports?operator_id=6&has_anomaly=true"
```
Shows consistent pattern of late report submissions (8-17 days late).

---

## 🗂️ Database Structure

The `database.db` file contains:

### Tables:
1. **operators** - Gaming operators registry
2. **revenue_reports** - Monthly revenue submissions
3. **transactions** - Sample betting transactions (last 30 days)

### Viewing Database Directly:
```bash
# Install sqlite3 if not already installed
# Then:
sqlite3 database.db

# Inside sqlite3 prompt:
.tables                          # List tables
.schema operators                # See table structure
SELECT * FROM operators;         # Query data
.exit                            # Exit sqlite3
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install` again

### Issue: "Port 3001 already in use"
**Solution:** 
1. Find and kill the process: 
   ```bash
   # On Mac/Linux:
   lsof -ti:3001 | xargs kill -9
   
   # On Windows:
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```
2. Or change the port in `server.js`:
   ```javascript
   const PORT = 3002; // Change to any available port
   ```

### Issue: "Database locked" or "SQLITE_BUSY"
**Solution:** Close any other programs accessing `database.db`, then restart server

### Issue: Empty data returned
**Solution:** Run `npm run seed` again to repopulate database

---

## ✅ Verification Checklist

Before moving to frontend, verify:

- [ ] Server starts without errors
- [ ] `/health` endpoint returns "healthy"
- [ ] `/api/operators` returns 6 operators
- [ ] `/api/stats` shows current month revenue
- [ ] `/api/anomalies` returns 3+ anomalies
- [ ] Lucky Star Casino (ID=2) shows December revenue drop
- [ ] Monrovia Bet (ID=4) shows round number pattern
- [ ] All endpoints return valid JSON

---

## 📁 Files Created in Stage 1

```
backend/
├── package.json          # Dependencies and scripts
├── seed.js              # Database seeding script
├── server.js            # Express API server
├── database.db          # SQLite database (auto-created)
└── README.md            # This file
```

---

## 🎉 Stage 1 Complete!

Your backend is fully functional with:
- ✅ 8 REST API endpoints
- ✅ SQLite database with realistic data
- ✅ 3 demo anomalies for presentation
- ✅ Revenue trends and statistics

**Next Steps:**
- Type "continue" to proceed to **Stage 2: Frontend Development**
- Or test the backend further using the endpoints above

---

## 📞 Quick Reference

| Endpoint | Purpose |
|----------|---------|
| `/health` | Check if server is running |
| `/api/operators` | List all gaming operators |
| `/api/stats` | Dashboard overview statistics |
| `/api/anomalies` | Get flagged anomalies |
| `/api/reports` | Revenue reports with filters |
| `/api/transactions` | Recent betting transactions |

**Default Port:** 3001  
**Database:** SQLite (`database.db`)  
**Data Period:** July 2024 - December 2024

---

*Built by XI Consult Corp for Liberia's National Lottery Authority*
