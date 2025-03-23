import React from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                AI Model Advisor
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/documentation" className="text-gray-900 border-b-2 border-primary-600 px-3 py-2 text-sm font-medium">
                Documentation
              </Link>
              <Link to="/about" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6">Documentation</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <p className="text-gray-700 mb-4">
                AI Model Advisor helps you find the best AI models for your specific use case by comparing
                different models based on performance, cost, and other relevant factors.
              </p>
              
              <div className="pl-4 border-l-4 border-blue-500">
                <h3 className="text-xl font-medium text-gray-800 mb-2">Step 1: Describe Your Use Case</h3>
                <p className="text-gray-600 mb-4">
                  Start by describing what you want to use AI for in the input field. Be as specific as possible
                  about your requirements to get the most accurate test prompt and recommendations.
                </p>
                
                <h3 className="text-xl font-medium text-gray-800 mb-2">Step 2: Generate Test Prompt</h3>
                <p className="text-gray-600 mb-4">
                  The system will use AI21's Maestro model to generate an effective test prompt based on your description.
                  You can review and edit this prompt if needed to better match your specific needs.
                </p>
                
                <h3 className="text-xl font-medium text-gray-800 mb-2">Step 3: Select Models to Compare</h3>
                <p className="text-gray-600 mb-4">
                  Choose up to three AI models to compare from the available options. Each model has different
                  strengths and capabilities, so select models that might be suitable for your use case.
                </p>
                
                <h3 className="text-xl font-medium text-gray-800 mb-2">Step 4: Run Comparison Test</h3>
                <p className="text-gray-600 mb-4">
                  Click the "Run Comparison Test" button to test the selected models with your prompt. The system
                  will send your prompt to each model through the OpenRouter API and collect their responses.
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Understanding Results</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Performance Metrics</h3>
                  <p className="text-gray-600">
                    The results include important performance metrics like response time, token usage, and cost.
                    These metrics are visualized in charts to make comparison easier.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Model Responses</h3>
                  <p className="text-gray-600">
                    You can view the full responses from each model to compare their output quality, formatting,
                    and how well they addressed your prompt.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">AI-Powered Evaluation</h3>
                  <p className="text-gray-600">
                    Our system uses Maestro to provide an objective evaluation of each model's response, ranking
                    them based on various factors like accuracy, completeness, and relevance.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">API Integration</h2>
              <p className="text-gray-700 mb-4">
                AI Model Advisor uses the following APIs:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>OpenRouter API</strong> - To access various AI models through a single interface
                </li>
                <li>
                  <strong>AI21 Maestro API</strong> - For generating test prompts and evaluating model responses
                </li>
              </ul>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-yellow-700">
                  <strong>Note:</strong> You need to add your API keys to the .env file for the application to work properly:
                </p>
                <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                  REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key
                  REACT_APP_MAESTRO_API_KEY=your_maestro_api_key
                </pre>
              </div>
            </section>
          </div>
        </div>
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
};

export default Documentation; 