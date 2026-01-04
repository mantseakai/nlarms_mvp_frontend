import React, { useState } from 'react';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AnomalyDashboard from './components/AnomalyDashboard';
import './index.css';

function App() {
  const [activeView, setActiveView] = useState('executive');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">NLA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Revenue Monitoring System</h1>
                <p className="text-xs text-gray-600">National Lottery Authority of Liberia</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('executive')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'executive'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Executive Dashboard</span>
              </button>

              <button
                onClick={() => setActiveView('anomaly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'anomaly'
                    ? 'bg-secondary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Anomaly Detection</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeView === 'executive' ? <ExecutiveDashboard /> : <AnomalyDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900">XI Consult Corp</p>
              <p>Building the future of gaming regulation in Africa</p>
            </div>
            <div className="text-right">
              <p>© 2024 National Lottery Authority</p>
              <p>Powered by AI-Driven Analytics</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
