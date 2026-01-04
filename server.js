const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Helper function to promisify database queries
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ==================== API ENDPOINTS ====================

// 1. GET /api/operators - List all operators
app.get('/api/operators', async (req, res) => {
  try {
    const operators = await dbAll(`
      SELECT * FROM operators
      ORDER BY risk_score DESC
    `);
    res.json({
      success: true,
      count: operators.length,
      data: operators
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/operators/:id - Get single operator with details
app.get('/api/operators/:id', async (req, res) => {
  try {
    const operator = await dbGet(`
      SELECT * FROM operators WHERE operator_id = ?
    `, [req.params.id]);

    if (!operator) {
      return res.status(404).json({ success: false, error: 'Operator not found' });
    }

    // Get recent reports for this operator
    const reports = await dbAll(`
      SELECT * FROM revenue_reports 
      WHERE operator_id = ?
      ORDER BY report_date DESC
      LIMIT 6
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...operator,
        recent_reports: reports
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/reports - Get all revenue reports with optional filters
app.get('/api/reports', async (req, res) => {
  try {
    const { operator_id, start_date, end_date, has_anomaly } = req.query;
    
    let query = `
      SELECT r.*, o.name as operator_name, o.license_type
      FROM revenue_reports r
      JOIN operators o ON r.operator_id = o.operator_id
      WHERE 1=1
    `;
    const params = [];

    if (operator_id) {
      query += ` AND r.operator_id = ?`;
      params.push(operator_id);
    }

    if (start_date) {
      query += ` AND r.report_date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND r.report_date <= ?`;
      params.push(end_date);
    }

    if (has_anomaly === 'true') {
      query += ` AND r.anomaly_flag = 1`;
    }

    query += ` ORDER BY r.report_date DESC`;

    const reports = await dbAll(query, params);
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /api/reports/:id - Get single report
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await dbGet(`
      SELECT r.*, o.name as operator_name, o.license_type
      FROM revenue_reports r
      JOIN operators o ON r.operator_id = o.operator_id
      WHERE r.report_id = ?
    `, [req.params.id]);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /api/anomalies - Get all flagged anomalies
app.get('/api/anomalies', async (req, res) => {
  try {
    const { anomaly_type, min_confidence } = req.query;
    
    let query = `
      SELECT r.*, o.name as operator_name, o.license_type, o.status as operator_status
      FROM revenue_reports r
      JOIN operators o ON r.operator_id = o.operator_id
      WHERE r.anomaly_flag = 1
    `;
    const params = [];

    if (anomaly_type) {
      query += ` AND r.anomaly_type = ?`;
      params.push(anomaly_type);
    }

    if (min_confidence) {
      query += ` AND r.anomaly_confidence >= ?`;
      params.push(parseFloat(min_confidence));
    }

    query += ` ORDER BY r.anomaly_confidence DESC, r.report_date DESC`;

    const anomalies = await dbAll(query, params);
    res.json({
      success: true,
      count: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. GET /api/transactions - Get recent transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { operator_id, suspicious_only, limit = 100 } = req.query;
    
    let query = `
      SELECT t.*, o.name as operator_name
      FROM transactions t
      JOIN operators o ON t.operator_id = o.operator_id
      WHERE 1=1
    `;
    const params = [];

    if (operator_id) {
      query += ` AND t.operator_id = ?`;
      params.push(operator_id);
    }

    if (suspicious_only === 'true') {
      query += ` AND t.suspicious_flag = 1`;
    }

    query += ` ORDER BY t.transaction_date DESC, t.transaction_hour DESC LIMIT ?`;
    params.push(parseInt(limit));

    const transactions = await dbAll(query, params);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. GET /api/stats - Get overview statistics for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    // Total operators
    const totalOperators = await dbGet(`SELECT COUNT(*) as count FROM operators`);
    
    // Active operators
    const activeOperators = await dbGet(`
      SELECT COUNT(*) as count FROM operators WHERE status = 'Active'
    `);

    // Operators under review or suspended
    const problematicOperators = await dbGet(`
      SELECT COUNT(*) as count FROM operators 
      WHERE status IN ('Under Review', 'Suspended')
    `);

    // Current month total revenue
    const currentMonthRevenue = await dbGet(`
      SELECT SUM(gross_revenue) as total 
      FROM revenue_reports 
      WHERE report_date = '2024-12-01'
    `);

    // Previous month revenue (for comparison)
    const previousMonthRevenue = await dbGet(`
      SELECT SUM(gross_revenue) as total 
      FROM revenue_reports 
      WHERE report_date = '2024-11-01'
    `);

    // Total tax collected (current month)
    const currentMonthTax = await dbGet(`
      SELECT SUM(declared_tax) as total 
      FROM revenue_reports 
      WHERE report_date = '2024-12-01'
    `);

    // Active anomalies count
    const activeAnomalies = await dbGet(`
      SELECT COUNT(*) as count 
      FROM revenue_reports 
      WHERE anomaly_flag = 1 AND report_date = '2024-12-01'
    `);

    // High risk operators (risk_score > 70)
    const highRiskOperators = await dbGet(`
      SELECT COUNT(*) as count 
      FROM operators 
      WHERE risk_score > 70
    `);

    // Late submissions this month
    const lateSubmissions = await dbGet(`
      SELECT COUNT(*) as count 
      FROM revenue_reports 
      WHERE is_late = 1 AND report_date = '2024-12-01'
    `);

    // Revenue trend (last 6 months)
    const revenueTrend = await dbAll(`
      SELECT 
        report_date,
        SUM(gross_revenue) as total_revenue,
        SUM(declared_tax) as total_tax,
        COUNT(*) as num_operators
      FROM revenue_reports
      GROUP BY report_date
      ORDER BY report_date ASC
    `);

    // Top operators by revenue (current month)
    const topOperators = await dbAll(`
      SELECT 
        o.name,
        o.license_type,
        r.gross_revenue,
        r.declared_tax,
        o.risk_score
      FROM revenue_reports r
      JOIN operators o ON r.operator_id = o.operator_id
      WHERE r.report_date = '2024-12-01'
      ORDER BY r.gross_revenue DESC
    `);

    // Calculate month-over-month change
    const currentRev = currentMonthRevenue.total || 0;
    const previousRev = previousMonthRevenue.total || 0;
    const revenueChange = previousRev > 0 
      ? ((currentRev - previousRev) / previousRev * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          total_operators: totalOperators.count,
          active_operators: activeOperators.count,
          problematic_operators: problematicOperators.count,
          high_risk_operators: highRiskOperators.count,
          current_month_revenue: currentRev,
          previous_month_revenue: previousRev,
          revenue_change_percent: parseFloat(revenueChange),
          current_month_tax: currentMonthTax.total || 0,
          active_anomalies: activeAnomalies.count,
          late_submissions: lateSubmissions.count
        },
        revenue_trend: revenueTrend,
        top_operators: topOperators
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. GET /api/anomaly-types - Get list of all anomaly types
app.get('/api/anomaly-types', async (req, res) => {
  try {
    const types = await dbAll(`
      SELECT DISTINCT anomaly_type, COUNT(*) as count
      FROM revenue_reports
      WHERE anomaly_flag = 1 AND anomaly_type IS NOT NULL
      GROUP BY anomaly_type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NLA Revenue Monitoring System API',
    version: '1.0.0',
    endpoints: {
      operators: '/api/operators',
      reports: '/api/reports',
      anomalies: '/api/anomalies',
      transactions: '/api/transactions',
      stats: '/api/stats',
      anomaly_types: '/api/anomaly-types'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ============================================');
  console.log('🚀  NLA Revenue Monitoring API Server');
  console.log('🚀 ============================================');
  console.log(`🚀  Server running on: http://localhost:${PORT}`);
  console.log(`🚀  Health check: http://localhost:${PORT}/health`);
  console.log(`🚀  API docs: http://localhost:${PORT}/`);
  console.log('🚀 ============================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
