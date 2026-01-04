const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Starting NLA Database Seeding...\n');

db.serialize(() => {
  // Drop existing tables if they exist
  console.log('📋 Dropping existing tables...');
  db.run('DROP TABLE IF EXISTS transactions');
  db.run('DROP TABLE IF EXISTS revenue_reports');
  db.run('DROP TABLE IF EXISTS operators');

  // Create Operators table
  console.log('📋 Creating operators table...');
  db.run(`
    CREATE TABLE operators (
      operator_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      license_type TEXT NOT NULL,
      status TEXT NOT NULL,
      risk_score INTEGER,
      contact_email TEXT,
      license_issue_date TEXT,
      last_report_date TEXT
    )
  `);

  // Create Revenue Reports table
  console.log('📋 Creating revenue_reports table...');
  db.run(`
    CREATE TABLE revenue_reports (
      report_id INTEGER PRIMARY KEY AUTOINCREMENT,
      operator_id INTEGER,
      report_date TEXT NOT NULL,
      gross_revenue REAL,
      total_bets REAL,
      total_payouts REAL,
      number_of_transactions INTEGER,
      declared_tax REAL,
      submission_timestamp TEXT,
      is_late BOOLEAN,
      anomaly_flag BOOLEAN,
      anomaly_type TEXT,
      anomaly_confidence REAL,
      FOREIGN KEY (operator_id) REFERENCES operators(operator_id)
    )
  `);

  // Create Transactions table
  console.log('📋 Creating transactions table...');
  db.run(`
    CREATE TABLE transactions (
      transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
      operator_id INTEGER,
      transaction_date TEXT,
      transaction_hour INTEGER,
      bet_amount REAL,
      payout_amount REAL,
      game_type TEXT,
      player_id TEXT,
      ip_address TEXT,
      suspicious_flag BOOLEAN,
      FOREIGN KEY (operator_id) REFERENCES operators(operator_id)
    )
  `);

  // Insert operators
  console.log('\n👥 Inserting operators...');
  const operators = [
    [1, 'Bet360 Liberia', 'Sports Betting', 'Active', 25, 'ops@bet360.lr', '2022-06-01', '2024-12-26'],
    [2, 'Lucky Star Casino', 'Online Casino', 'Active', 78, 'ops@luckystar.lr', '2023-01-15', '2024-12-14'],
    [3, 'Premier Lotto', 'Lottery', 'Active', 40, 'info@premierlotto.lr', '2021-03-10', '2024-12-28'],
    [4, 'Monrovia Bet', 'Sports Betting', 'Under Review', 85, 'contact@monroviabt.lr', '2022-11-20', '2024-12-27'],
    [5, 'Galaxy Gaming', 'Online Casino', 'Suspended', 95, 'support@galaxygaming.lr', '2023-05-01', '2024-11-30'],
    [6, 'Safe Play Liberia', 'Lottery', 'Active', 15, 'hello@safeplay.lr', '2020-08-15', '2024-12-29']
  ];

  const insertOperator = db.prepare(`
    INSERT INTO operators VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  operators.forEach(op => {
    insertOperator.run(op);
    console.log(`   ✓ ${op[1]} (${op[2]}) - Status: ${op[3]}`);
  });
  insertOperator.finalize();

  // Generate revenue reports for past 6 months
  console.log('\n💰 Generating revenue reports (6 months)...');
  
  const insertReport = db.prepare(`
    INSERT INTO revenue_reports (
      operator_id, report_date, gross_revenue, total_bets, total_payouts,
      number_of_transactions, declared_tax, submission_timestamp,
      is_late, anomaly_flag, anomaly_type, anomaly_confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const months = [
    '2024-07-01', '2024-08-01', '2024-09-01', 
    '2024-10-01', '2024-11-01', '2024-12-01'
  ];

  // Operator 1: Bet360 Liberia (Normal pattern)
  console.log('   Generating for Bet360 Liberia...');
  [8500000, 9200000, 8800000, 9500000, 9100000, 9300000].forEach((revenue, idx) => {
    const bets = revenue / 0.12; // ~12% margin
    const payouts = bets * 0.88;
    const tax = revenue * 0.20; // 20% tax
    insertReport.run(
      1, months[idx], revenue, bets, payouts, 
      Math.floor(revenue / 150), tax, 
      `${months[idx]} 09:15:00`, 0, 0, null, null
    );
  });

  // Operator 2: Lucky Star Casino (Has ANOMALY in December - Revenue Drop)
  console.log('   Generating for Lucky Star Casino (⚠️  ANOMALY in Dec)...');
  [12100000, 12800000, 11900000, 12500000, 12300000, 6900000].forEach((revenue, idx) => {
    const isAnomaly = idx === 5; // December anomaly
    const bets = revenue / 0.12;
    const payouts = bets * 0.88;
    const tax = revenue * 0.20;
    const late = isAnomaly ? 1 : 0;
    insertReport.run(
      2, months[idx], revenue, bets, payouts,
      Math.floor(revenue / 180), tax,
      isAnomaly ? '2024-12-14 18:23:00' : `${months[idx]} 10:20:00`,
      late, isAnomaly ? 1 : 0,
      isAnomaly ? 'Revenue Drop' : null,
      isAnomaly ? 92 : null
    );
  });

  // Operator 3: Premier Lotto (Normal)
  console.log('   Generating for Premier Lotto...');
  [5200000, 5400000, 5100000, 5600000, 5300000, 5500000].forEach((revenue, idx) => {
    const bets = revenue / 0.15;
    const payouts = bets * 0.85;
    const tax = revenue * 0.20;
    insertReport.run(
      3, months[idx], revenue, bets, payouts,
      Math.floor(revenue / 100), tax,
      `${months[idx]} 08:45:00`, 0, 0, null, null
    );
  });

  // Operator 4: Monrovia Bet (Has ANOMALY - Round Numbers Pattern)
  console.log('   Generating for Monrovia Bet (⚠️  ANOMALY - Round Numbers)...');
  [7200000, 7500000, 8000000, 8500000, 9000000, 9500000].forEach((revenue, idx) => {
    const isAnomaly = idx >= 2; // Last 4 months show round numbers
    const bets = revenue / 0.12;
    const payouts = bets * 0.88;
    const tax = revenue * 0.20;
    insertReport.run(
      4, months[idx], revenue, bets, payouts,
      Math.floor(revenue / 160), tax,
      `${months[idx]} 11:30:00`, 0,
      isAnomaly ? 1 : 0,
      isAnomaly ? 'Round Numbers Pattern' : null,
      isAnomaly ? 78 : null
    );
  });

  // Operator 5: Galaxy Gaming (Suspended - No recent reports)
  console.log('   Generating for Galaxy Gaming (Suspended)...');
  [15000000, 14500000, 14800000, 0, 0, 0].forEach((revenue, idx) => {
    if (revenue === 0) return; // No reports after suspension
    const bets = revenue / 0.10;
    const payouts = bets * 0.90;
    const tax = revenue * 0.20;
    insertReport.run(
      5, months[idx], revenue, bets, payouts,
      Math.floor(revenue / 200), tax,
      `${months[idx]} 14:20:00`, 0, 0, null, null
    );
  });

  // Operator 6: Safe Play Liberia (Has ANOMALY - Late submissions)
  console.log('   Generating for Safe Play Liberia (⚠️  ANOMALY - Late Submissions)...');
  [3200000, 3400000, 3300000, 3500000, 3600000, 3800000].forEach((revenue, idx) => {
    const isLate = idx >= 3; // Last 3 months submitted late
    const bets = revenue / 0.15;
    const payouts = bets * 0.85;
    const tax = revenue * 0.20;
    const submissionDay = isLate ? Math.floor(Math.random() * 10) + 10 : 2; // Late by 8-17 days
    insertReport.run(
      6, months[idx], revenue, bets, payouts,
      Math.floor(revenue / 90), tax,
      `2024-${String(idx + 7).padStart(2, '0')}-${String(submissionDay).padStart(2, '0')} 16:45:00`,
      isLate ? 1 : 0,
      isLate ? 1 : 0,
      isLate ? 'Late Submission Pattern' : null,
      isLate ? 65 : null
    );
  });

  insertReport.finalize();

  // Generate sample transactions (last 30 days for active operators)
  console.log('\n🎰 Generating sample transactions (last 30 days)...');
  
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (
      operator_id, transaction_date, transaction_hour, bet_amount,
      payout_amount, game_type, player_id, ip_address, suspicious_flag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const gameTypes = {
    1: ['Football', 'Basketball', 'Tennis'],
    2: ['Slots', 'Blackjack', 'Roulette', 'Poker'],
    3: ['Daily Draw', 'Mega Jackpot', 'Quick Pick'],
    4: ['Football', 'Basketball'],
    6: ['Daily Draw', 'Evening Draw']
  };

  const activeOperators = [1, 2, 3, 4, 6]; // Exclude suspended Galaxy Gaming
  
  activeOperators.forEach(opId => {
    const numTransactions = Math.floor(Math.random() * 200) + 100; // 100-300 transactions
    const games = gameTypes[opId];
    
    for (let i = 0; i < numTransactions; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];
      
      const hour = Math.floor(Math.random() * 24);
      const betAmount = Math.random() * 5000 + 100; // 100-5100 LRD
      const won = Math.random() > 0.55; // 45% win rate
      const payoutAmount = won ? betAmount * (Math.random() * 3 + 1) : 0;
      const gameType = games[Math.floor(Math.random() * games.length)];
      const playerId = `PLAYER_${Math.floor(Math.random() * 10000)}`;
      const ip = `41.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const suspicious = Math.random() > 0.97 ? 1 : 0; // 3% suspicious
      
      insertTransaction.run(
        opId, dateStr, hour, betAmount, payoutAmount,
        gameType, playerId, ip, suspicious
      );
    }
    console.log(`   ✓ Generated ${numTransactions} transactions for operator ${opId}`);
  });

  insertTransaction.finalize();

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 6 operators created');
  console.log('   - 6 months of revenue reports');
  console.log('   - ~1000 sample transactions');
  console.log('   - 3 operators with anomalies flagged');
  console.log('\n🎯 Anomalies planted:');
  console.log('   1. Lucky Star Casino: 44% revenue drop in December');
  console.log('   2. Monrovia Bet: Suspicious round number pattern');
  console.log('   3. Safe Play Liberia: Consistent late submissions\n');
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err.message);
  } else {
    console.log('✅ Database connection closed.\n');
  }
});
