import React from 'react';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { formatDate, getAnomalyColor } from '../utils/api';

const RecentAlerts = ({ anomalies }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'Revenue Drop':
        return TrendingDown;
      case 'Late Submission Pattern':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <span className="badge badge-danger">{anomalies.length} Active</span>
      </div>
      
      <div className="space-y-3">
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No active alerts</p>
          </div>
        ) : (
          anomalies.map((anomaly, index) => {
            const Icon = getIcon(anomaly.anomaly_type);
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="p-2 rounded-lg bg-red-100">
                  <Icon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {anomaly.operator_name}
                    </p>
                    <span className={`badge text-xs ${getAnomalyColor(anomaly.anomaly_type)}`}>
                      {anomaly.anomaly_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Detected on {formatDate(anomaly.report_date)}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${anomaly.anomaly_confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {anomaly.anomaly_confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
