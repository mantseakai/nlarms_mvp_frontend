import React from 'react';
import { formatCurrency, getRiskLevel } from '../utils/api';

const TopOperatorsTable = ({ operators }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Operators by Revenue (December 2024)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Operator</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">License Type</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gross Revenue</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tax Collected</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((operator, index) => {
              const risk = getRiskLevel(operator.risk_score);
              return (
                <tr 
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{operator.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{operator.license_type}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(operator.gross_revenue)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-secondary">
                      {formatCurrency(operator.declared_tax)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge ${risk.color}`}>
                      {risk.level}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopOperatorsTable;
