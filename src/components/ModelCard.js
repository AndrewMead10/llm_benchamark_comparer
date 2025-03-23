import React from 'react';

const ModelCard = ({ model, selected, onToggle }) => {
  return (
    <div 
      className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{model.name}</h3>
        {selected && (
          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>{model.provider} • {model.version}</p>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-200">
        <button 
          className={`w-full py-1 rounded-md ${
            selected 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
};

export default ModelCard; 