import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Clock,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { apiService, formatCurrency, formatDate, getAnomalyColor } from '../utils/api';

const AnomalyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [anomalies, filterType, searchTerm]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnomalies();
      
      if (response.success) {
        setAnomalies(response.data);
      }
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      setError('Failed to load anomalies. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...anomalies];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.anomaly_type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.operator_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAnomalies(filtered);
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'Revenue Drop':
        return TrendingDown;
      case 'Late Submission Pattern':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#ef4444'; // red
    if (confidence >= 60) return '#f59e0b'; // orange
    return '#10b981'; // green
  };

  // Prepare data for confidence chart
  const confidenceData = filteredAnomalies.map((a, idx) => ({
    name: a.operator_name.substring(0, 15),
    confidence: a.anomaly_confidence,
    fullName: a.operator_name,
  }));

  const uniqueTypes = [...new Set(anomalies.map(a => a.anomaly_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading anomalies...</p>
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
          <button onClick={fetchAnomalies} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Anomaly Detection Dashboard</h1>
              <p className="text-red-200 mt-1">AI-Powered Revenue Monitoring & Fraud Detection</p>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <p className="text-sm text-red-200">Total Anomalies</p>
                <p className="text-2xl font-bold">{anomalies.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search operator name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span>Showing {filteredAnomalies.length} of {anomalies.length} anomalies</span>
          </div>
        </div>

        {/* Confidence Score Chart */}
        {filteredAnomalies.length > 0 && (
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Anomaly Confidence Scores
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Confidence %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-semibold">{payload[0].payload.fullName}</p>
                          <p className="text-sm">Confidence: {payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getConfidenceColor(entry.confidence)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Anomalies List */}
        <div className="space-y-4">
          {filteredAnomalies.length === 0 ? (
            <div className="card p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Anomalies Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'All operators are reporting normally'}
              </p>
            </div>
          ) : (
            filteredAnomalies.map((anomaly, index) => {
              const Icon = getAnomalyIcon(anomaly.anomaly_type);
              const isExpanded = selectedAnomaly?.report_id === anomaly.report_id;

              return (
                <div key={index} className="card">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedAnomaly(isExpanded ? null : anomaly)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-red-100">
                          <Icon className="w-6 h-6 text-red-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {anomaly.operator_name}
                            </h3>
                            <span className={`badge ${getAnomalyColor(anomaly.anomaly_type)}`}>
                              {anomaly.anomaly_type}
                            </span>
                            <span className={`badge ${
                              anomaly.operator_status === 'Active' ? 'badge-success' :
                              anomaly.operator_status === 'Suspended' ? 'badge-danger' :
                              'badge-warning'
                            }`}>
                              {anomaly.operator_status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Report Date</p>
                              <p className="font-medium text-gray-900">{formatDate(anomaly.report_date)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Gross Revenue</p>
                              <p className="font-medium text-gray-900">{formatCurrency(anomaly.gross_revenue)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">License Type</p>
                              <p className="font-medium text-gray-900">{anomaly.license_type}</p>
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">AI Confidence</span>
                              <span className="text-sm font-bold text-gray-900">
                                {anomaly.anomaly_confidence}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full"
                                style={{
                                  width: `${anomaly.anomaly_confidence}%`,
                                  backgroundColor: getConfidenceColor(anomaly.anomaly_confidence),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4">Detailed Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Financial Details</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Bets:</span>
                              <span className="text-sm font-medium">{formatCurrency(anomaly.total_bets)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Payouts:</span>
                              <span className="text-sm font-medium">{formatCurrency(anomaly.total_payouts)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Declared Tax:</span>
                              <span className="text-sm font-medium text-secondary">
                                {formatCurrency(anomaly.declared_tax)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Transactions:</span>
                              <span className="text-sm font-medium">{anomaly.number_of_transactions?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Submission Details</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Submitted:</span>
                              <span className="text-sm font-medium">{formatDate(anomaly.submission_timestamp)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Status:</span>
                              <span className={`badge text-xs ${
                                anomaly.is_late ? 'badge-warning' : 'badge-success'
                              }`}>
                                {anomaly.is_late ? 'Late' : 'On Time'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                            <p className="text-sm font-semibold text-red-900 mb-1">
                              ⚠️ Anomaly Detected
                            </p>
                            <p className="text-sm text-gray-700">
                              {anomaly.anomaly_type === 'Revenue Drop' && 
                                'Significant revenue decrease compared to historical patterns. Requires investigation.'}
                              {anomaly.anomaly_type === 'Round Numbers Pattern' && 
                                'Suspicious pattern of round numbers detected. May indicate data manipulation.'}
                              {anomaly.anomaly_type === 'Late Submission Pattern' && 
                                'Consistent pattern of late report submissions. Compliance issue detected.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button className="btn-secondary">
                          Send Alert to NLA
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                          View Full Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDashboard;
