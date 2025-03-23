import React from 'react';

const ModelCard = ({ model }) => {
  const renderRating = (value, label) => {
    return (
      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">{label}:</span>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`h-5 w-5 ${
                i < value ? 'text-yellow-400' : 'text-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg card-hover">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
            <p className="text-sm text-gray-500">
              {model.provider} • {model.type}
            </p>
          </div>
          <img
            className="h-12 w-12 rounded-md object-cover"
            src={model.imageUrl}
            alt={model.name}
          />
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{model.description}</p>
        
        <div className="space-y-2 mb-4">
          {renderRating(model.accuracy, 'Accuracy')}
          {renderRating(model.speed, 'Speed')}
          {renderRating(6 - model.cost, 'Cost Efficiency')}
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Best For:</h4>
          <div className="flex flex-wrap gap-2">
            {model.useCase.slice(0, 3).map((useCase) => (
              <span
                key={useCase}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {useCase}
              </span>
            ))}
            {model.useCase.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{model.useCase.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Limitations:</h4>
          <p className="text-sm text-gray-600">{model.limitations}</p>
        </div>
        
        <div className="mt-5 text-center">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard; 