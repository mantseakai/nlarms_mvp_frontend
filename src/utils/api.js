import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const apiService = {
  // Get all operators
  getOperators: async () => {
    const response = await api.get('/operators');
    return response.data;
  },

  // Get single operator
  getOperator: async (id) => {
    const response = await api.get(`/operators/${id}`);
    return response.data;
  },

  // Get all revenue reports
  getReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  // Get single report
  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Get all anomalies
  getAnomalies: async (params = {}) => {
    const response = await api.get('/anomalies', { params });
    return response.data;
  },

  // Get transactions
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Get anomaly types
  getAnomalyTypes: async () => {
    const response = await api.get('/anomaly-types');
    return response.data;
  },
};

// Format currency (Liberian Dollar)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'L$0';
  return new Intl.NumberFormat('en-LR', {
    style: 'currency',
    currency: 'LRD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('LRD', 'L$');
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

// Format percentage
export const formatPercent = (num, decimals = 1) => {
  if (num === null || num === undefined) return '0%';
  return `${num.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date and time
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    'Active': 'text-green-700 bg-green-100',
    'Suspended': 'text-red-700 bg-red-100',
    'Under Review': 'text-yellow-700 bg-yellow-100',
    'Inactive': 'text-gray-700 bg-gray-100',
  };
  return colors[status] || 'text-gray-700 bg-gray-100';
};

// Get risk level and color
export const getRiskLevel = (score) => {
  if (score >= 80) return { level: 'High', color: 'text-red-700 bg-red-100' };
  if (score >= 50) return { level: 'Medium', color: 'text-yellow-700 bg-yellow-100' };
  return { level: 'Low', color: 'text-green-700 bg-green-100' };
};

// Get anomaly type color
export const getAnomalyColor = (type) => {
  const colors = {
    'Revenue Drop': 'text-red-700 bg-red-100',
    'Round Numbers Pattern': 'text-orange-700 bg-orange-100',
    'Late Submission Pattern': 'text-yellow-700 bg-yellow-100',
    'Suspicious Activity': 'text-purple-700 bg-purple-100',
  };
  return colors[type] || 'text-blue-700 bg-blue-100';
};

// Calculate percentage change
export const calculatePercentChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Shorten large numbers
export const shortenNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default api;
