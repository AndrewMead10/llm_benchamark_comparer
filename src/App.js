import React from 'react';
import './App.css';
import AdvisorPage from './components/AdvisorPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                AI Model Advisor
              </span>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-900 border-b-2 border-primary-600 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/documentation" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Documentation
              </a>
              <a href="/about" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main>
        <AdvisorPage />
      </main>
      
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025 AI Model Advisor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 