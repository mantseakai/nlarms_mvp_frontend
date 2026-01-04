import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate } from '../utils/api';

const RevenueTrendChart = ({ data }) => {
  // Transform data for chart
  const chartData = data.map(item => ({
    date: formatDate(item.report_date),
    revenue: item.total_revenue / 1000000, // Convert to millions
    tax: item.total_tax / 1000000,
    fullDate: item.report_date,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-primary font-medium">Revenue: </span>
              <span className="text-gray-900">{formatCurrency(payload[0].value * 1000000)}</span>
            </p>
            <p className="text-sm">
              <span className="text-secondary font-medium">Tax: </span>
              <span className="text-gray-900">{formatCurrency(payload[1].value * 1000000)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue Trend (Last 6 Months)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            label={{ value: 'Million LRD', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#002868"
            strokeWidth={3}
            name="Total Revenue"
            dot={{ fill: '#002868', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="tax"
            stroke="#BF0A30"
            strokeWidth={3}
            name="Tax Collected"
            dot={{ fill: '#BF0A30', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;
