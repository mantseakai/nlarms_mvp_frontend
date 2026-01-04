import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Building2, 
  AlertTriangle, 
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import KPICard from './KPICard';
import RevenueTrendChart from './RevenueTrendChart';
import TopOperatorsTable from './TopOperatorsTable';
import RecentAlerts from './RecentAlerts';
import { apiService, formatCurrency, formatPercent } from '../utils/api';

const ExecutiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and anomalies in parallel
      const [statsResponse, anomaliesResponse] = await Promise.all([
        apiService.getStats(),
        apiService.getAnomalies({ min_confidence: 60 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (anomaliesResponse.success) {
        setAnomalies(anomaliesResponse.data.slice(0, 5)); // Show top 5
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { overview, revenue_trend, top_operators } = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Executive Dashboard</h1>
              <p className="text-blue-200 mt-1">National Lottery Authority - Revenue Monitoring System</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Last Updated</p>
              <p className="text-lg font-semibold">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Revenue (December)"
            value={formatCurrency(overview.current_month_revenue)}
            subtitle="Current month"
            trend={overview.revenue_change_percent >= 0 ? 'up' : 'down'}
            trendValue={`${formatPercent(Math.abs(overview.revenue_change_percent))} vs last month`}
            icon={DollarSign}
            color="blue"
          />
          
          <KPICard
            title="Tax Collected"
            value={formatCurrency(overview.current_month_tax)}
            subtitle="20% of gross revenue"
            icon={FileText}
            color="green"
          />
          
          <KPICard
            title="Active Operators"
            value={overview.active_operators}
            subtitle={`${overview.total_operators} total operators`}
            icon={Building2}
            color="purple"
          />
          
          <KPICard
            title="Active Alerts"
            value={overview.active_anomalies}
            subtitle={`${overview.high_risk_operators} high-risk operators`}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Revenue Trend Chart */}
        <div className="mb-8">
          <RevenueTrendChart data={revenue_trend} />
        </div>

        {/* Grid: Top Operators and Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TopOperatorsTable operators={top_operators} />
          </div>
          <div>
            <RecentAlerts anomalies={anomalies} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{overview.total_operators}</p>
            <p className="text-sm text-gray-600">Total Operators</p>
          </div>
          
          <div className="card p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{overview.problematic_operators}</p>
            <p className="text-sm text-gray-600">Under Review/Suspended</p>
          </div>
          
          <div className="card p-6 text-center">
            <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {formatPercent(Math.abs(overview.revenue_change_percent))}
            </p>
            <p className="text-sm text-gray-600">Revenue Change vs Last Month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
