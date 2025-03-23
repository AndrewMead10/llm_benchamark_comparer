import React, { useState } from 'react';

const ResultsComparison = ({ results, prompt }) => {
  const [activeTab, setActiveTab] = useState('outputs');
  
  const renderMetricsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Execution Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token Count
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost Estimate
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quality Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {result.model.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {result.metrics.executionTime}s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {result.metrics.tokenCount} tokens
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${result.metrics.costEstimate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < result.metrics.quality ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  const renderOutputComparison = () => (
    <div className="grid grid-cols-1 gap-6 mt-4">
      {results.map((result, index) => (
        <div key={index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{result.model.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {result.model.type}
              </span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-700">Prompt:</h4>
              <p className="mt-1 text-sm text-gray-600 bg-gray-100 p-2 rounded">{result.prompt}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Output:</h4>
              <div className="mt-1 text-sm text-gray-800 bg-white p-3 border border-gray-200 rounded whitespace-pre-wrap">
                {result.output}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Time: {result.metrics.executionTime}s
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Cost: ${result.metrics.costEstimate}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Tokens: {result.metrics.tokenCount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="mt-8">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select a tab</label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="outputs">Model Outputs</option>
          <option value="metrics">Performance Metrics</option>
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('outputs')}
              className={`${
                activeTab === 'outputs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Model Outputs
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`${
                activeTab === 'metrics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Performance Metrics
            </button>
          </nav>
        </div>
      </div>
      
      <div className="py-4">
        {activeTab === 'outputs' ? renderOutputComparison() : renderMetricsTable()}
      </div>
    </div>
  );
};

export default ResultsComparison; 