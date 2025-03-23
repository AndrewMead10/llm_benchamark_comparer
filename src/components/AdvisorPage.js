import React, { useState } from 'react';
import { aiModels } from '../data/aiModels';
import ModelCard from './ModelCard';
import ComparisonChart from './ComparisonChart';
import ResultsComparison from './ResultsComparison';
import MaestroEvaluation from './MaestroEvaluation';
import { mockOpenRouterFetch } from '../utils/mockOpenRouterAPI';
import { 
  generateTestPrompt, 
  evaluateModelOutputs,
  mockMaestroPromptGeneration,
  mockMaestroEvaluation
} from '../utils/maestroAPI';

// OpenRouter model mapping for a subset of our models
const OPENROUTER_MODEL_MAPPING = {
  1: "openai/gpt-4-turbo", // GPT-4
  2: "anthropic/claude-3-opus", // Claude 3 Opus
  4: "google/gemini-pro", // Gemini Pro
  5: "meta-llama/llama-3-70b-instruct", // Llama 3
  8: "openai/gpt-3.5-turbo", // GPT-3.5 Turbo 
  10: "mistralai/mistral-7b-instruct" // Mistral 7B
};

const OPENROUTER_API_KEY = "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";

const AdvisorPage = () => {
  const [userInput, setUserInput] = useState('');
  const [testPrompt, setTestPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [results, setResults] = useState([]);
  const [evaluation, setEvaluation] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [useMockApi, setUseMockApi] = useState(false);
  const [apiError, setApiError] = useState('');
  const [workflow, setWorkflow] = useState('initial'); // initial, prompt-generated, testing, complete
  
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
    // Clear any previous errors when the input changes
    setApiError('');
  };
  
  const handleTestPromptChange = (e) => {
    setTestPrompt(e.target.value);
  };
  
  const handleModelToggle = (modelId) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };
  
  const handleApiToggle = () => {
    setUseMockApi(prev => !prev);
    // Clear any previous errors when toggling API
    setApiError('');
  };
  
  const handleGeneratePrompt = async (e) => {
    e.preventDefault();
    
    if (userInput.trim() === '') {
      setApiError('Please describe what you want to use AI for');
      return;
    }
    
    setGeneratingPrompt(true);
    setApiError('');
    
    try {
      let generatedPrompt;
      
      if (useMockApi) {
        console.log("Using mock Maestro API for prompt generation");
        generatedPrompt = await mockMaestroPromptGeneration(userInput);
      } else {
        console.log("Using real Maestro API for prompt generation");
        generatedPrompt = await generateTestPrompt(userInput);
      }
      
      setTestPrompt(generatedPrompt);
      setWorkflow('prompt-generated');
    } catch (error) {
      console.error('Error generating test prompt:', error);
      setApiError('Failed to generate a test prompt. Using mock API instead.');
      
      // If real API fails, use mock API as fallback
      try {
        console.log("Falling back to mock API");
        const mockPrompt = await mockMaestroPromptGeneration(userInput);
        setTestPrompt(mockPrompt);
        setWorkflow('prompt-generated');
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
        setApiError('Could not generate prompt. Please try again or enter a prompt manually.');
      }
    } finally {
      setGeneratingPrompt(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (testPrompt.trim() === '') {
      setApiError('Please generate or enter a test prompt');
      return;
    }
    
    if (selectedModels.length === 0) {
      setApiError('Please select at least one AI model to test');
      return;
    }
    
    setLoading(true);
    setApiError('');
    setWorkflow('testing');
    
    try {
      // Filter for only supported models
      const supportedModels = selectedModels.filter(id => OPENROUTER_MODEL_MAPPING[id]);
      
      if (supportedModels.length === 0) {
        setApiError('None of the selected models are supported by OpenRouter. Please select different models.');
        setLoading(false);
        return;
      }
      
      if (supportedModels.length < selectedModels.length) {
        console.warn(`Some selected models are not available through OpenRouter and will be skipped.`);
      }
      
      // Call real OpenRouter API
      const testResults = await Promise.all(
        supportedModels.map(id => callOpenRouterModel(testPrompt, id))
      );
      
      const filteredResults = testResults.filter(result => result !== null);
      setResults(filteredResults);
      
      if (filteredResults.length >= 2) {
        // Start evaluation process
        setEvaluating(true);
        
        try {
          let evaluationResult;
          
          if (useMockApi) {
            console.log("Using mock Maestro API for evaluation");
            evaluationResult = await mockMaestroEvaluation(testPrompt, filteredResults);
          } else {
            console.log("Using real Maestro API for evaluation");
            evaluationResult = await evaluateModelOutputs(testPrompt, filteredResults);
          }
          
          setEvaluation(evaluationResult);
        } catch (error) {
          console.error('Error evaluating model outputs:', error);
          // Try fallback to mock
          try {
            console.log("Falling back to mock API for evaluation");
            const mockEval = await mockMaestroEvaluation(testPrompt, filteredResults);
            setEvaluation(mockEval);
          } catch (fallbackError) {
            setEvaluation('Failed to generate evaluation. Please check the model outputs manually.');
          }
        } finally {
          setEvaluating(false);
        }
      }
      
      setIsSearched(true);
      setWorkflow('complete');
    } catch (error) {
      console.error('Error testing models:', error);
      setApiError('An error occurred while testing the models. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Make a real call to OpenRouter API
  const callOpenRouterModel = async (prompt, modelId) => {
    const model = aiModels.find(m => m.id === modelId);
    const openRouterModel = OPENROUTER_MODEL_MAPPING[modelId];
    
    if (!openRouterModel) {
      return null;
    }
    
    const startTime = Date.now();
    
    try {
      const apiOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Model Advisor'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
        })
      };

      console.log(`Calling model: ${model.name} (${openRouterModel})`);
      
      // Use either the real fetch or mock fetch based on the toggle
      const response = useMockApi 
        ? await mockOpenRouterFetch('https://openrouter.ai/api/v1/chat/completions', apiOptions)
        : await fetch('https://openrouter.ai/api/v1/chat/completions', apiOptions);
      
      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000; // Convert to seconds
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error from OpenRouter (${model.name}):`, errorData);
        return {
          model,
          prompt,
          output: `Error from ${model.name}: ${errorData.error?.message || 'Unknown error'}`,
          metrics: {
            executionTime: executionTime.toFixed(2),
            tokenCount: 0,
            costEstimate: '0.0000',
            quality: 0
          }
        };
      }
      
      const data = await response.json();
      
      return {
        model,
        prompt,
        output: data.choices[0]?.message?.content || 'No response content',
        metrics: {
          executionTime: executionTime.toFixed(2),
          tokenCount: data.usage?.total_tokens || 0,
          costEstimate: ((data.usage?.total_tokens || 0) * 0.00002).toFixed(4), // Rough estimate
          quality: model.accuracy // Using the model's base accuracy as proxy
        }
      };
    } catch (error) {
      console.error(`Error calling ${model.name}:`, error);
      return {
        model,
        prompt,
        output: `Error: Could not get a response from ${model.name}. ${error.message}`,
        metrics: {
          executionTime: '0.00',
          tokenCount: 0,
          costEstimate: '0.0000',
          quality: 0
        }
      };
    }
  };
  
  // Render different sections based on workflow state
  const renderWorkflowStage = () => {
    switch (workflow) {
      case 'initial':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="user-input" className="block text-sm font-medium text-gray-700">
                What would you like to use AI for? (Describe your needs)
              </label>
              <div className="mt-1">
                <textarea
                  id="user-input"
                  name="user-input"
                  rows={4}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., I want to use AI to solve math problems"
                  value={userInput}
                  onChange={handleUserInputChange}
                />
              </div>
            </div>
            
            {apiError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="mock-api"
                  name="mock-api"
                  type="checkbox"
                  checked={useMockApi}
                  onChange={handleApiToggle}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="mock-api" className="ml-2 block text-sm text-gray-700">
                  Use mock API (faster, doesn't use API credits)
                </label>
              </div>
              
              <span className="text-sm text-primary-600">
                Using {useMockApi ? 'mock' : 'real'} APIs
              </span>
            </div>
            
            <div>
              <button
                onClick={handleGeneratePrompt}
                disabled={generatingPrompt}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${generatingPrompt ? 'bg-gray-400' : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                {generatingPrompt ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Test Prompt...
                  </>
                ) : (
                  'Generate Test Prompt with Maestro'
                )}
              </button>
            </div>
          </div>
        );
      
      case 'prompt-generated':
      case 'testing':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="test-prompt" className="block text-sm font-medium text-gray-700">
                  Test Prompt (Generated by Maestro)
                </label>
                <span className="text-xs text-primary-600">
                  You can edit this prompt if needed
                </span>
              </div>
              <div className="mt-1">
                <textarea
                  id="test-prompt"
                  name="test-prompt"
                  rows={4}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={testPrompt}
                  onChange={handleTestPromptChange}
                />
              </div>
            </div>
            
            {apiError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select models to test
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {aiModels.map(model => {
                  const isSupported = OPENROUTER_MODEL_MAPPING[model.id] !== undefined;
                  return (
                    <div key={model.id} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`model-${model.id}`}
                          name={`model-${model.id}`}
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={() => handleModelToggle(model.id)}
                          className={`focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded ${isSupported ? '' : 'opacity-50'}`}
                          disabled={!isSupported}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label 
                          htmlFor={`model-${model.id}`} 
                          className={`font-medium ${isSupported ? 'text-gray-700' : 'text-gray-400'}`}
                        >
                          {model.name} {!isSupported && '(not available)'}
                        </label>
                        <p className={`${isSupported ? 'text-gray-500' : 'text-gray-400'}`}>
                          {model.provider} • {model.type}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Using OpenRouter API to access these models. Some models may not be available.
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing Models...
                  </>
                ) : (
                  'Test Selected Models'
                )}
              </button>
            </div>
            
            {workflow === 'prompt-generated' && (
              <div className="pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setWorkflow('initial')}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  ← Back to Use Case Description
                </button>
              </div>
            )}
          </form>
        );
      
      case 'complete':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Test Summary</h3>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700"><strong>Use Case:</strong> {userInput}</p>
                <p className="text-sm text-gray-700 mt-2"><strong>Test Prompt:</strong> {testPrompt}</p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Models Tested:</strong> {results.map(r => r.model.name).join(', ')}
                </p>
              </div>
            </div>
            
            {apiError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setWorkflow('prompt-generated')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit Test Prompt
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setUserInput('');
                  setTestPrompt('');
                  setSelectedModels([]);
                  setResults([]);
                  setEvaluation('');
                  setIsSearched(false);
                  setApiError('');
                  setWorkflow('initial');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                New Comparison
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          AI Model Comparison
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Use Maestro to generate optimal test prompts and evaluate model performance objectively.
        </p>
      </div>
      
      <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-12">
        <div className="px-4 py-5 sm:p-6">
          {renderWorkflowStage()}
        </div>
      </div>
      
      {isSearched && !loading && (
        <div className="space-y-12">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparison Results</h2>
              
              {results.length > 0 ? (
                <>
                  <p className="text-gray-500 mb-6">
                    Here are the results from testing {results.length} AI models with the Maestro-generated prompt.
                  </p>
                  
                  {/* Maestro Evaluation */}
                  <MaestroEvaluation evaluation={evaluation} isLoading={evaluating} />
                  
                  {/* Performance Metrics Comparison */}
                  {results.length >= 2 && <ComparisonChart models={results.map(r => ({
                    ...r.model,
                    accuracy: r.metrics.quality,
                    executionTime: parseFloat(r.metrics.executionTime),
                    costEstimate: parseFloat(r.metrics.costEstimate) * 1000 // Convert to millicents for display
                  }))} />}
                  
                  {/* Detailed Output Comparison */}
                  <ResultsComparison results={results} prompt={testPrompt} />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No results available. Please try testing with different models.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorPage; 