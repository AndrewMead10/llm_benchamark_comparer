import React, { useState, useEffect } from 'react';
import ModelCard from './ModelCard';
import ComparisonChart from './ComparisonChart';
import MaestroEvaluation from './MaestroEvaluation';
import { generateTestPrompt, evaluateModelOutputs } from '../utils/maestroAPI';

// Models data
const models = [
  { 
    id: 1, 
    name: "GPT-3.5 Turbo", 
    provider: "OpenAI", 
    version: "1106",
    modelId: "openai/gpt-3.5-turbo"
  },
  { 
    id: 2, 
    name: "GPT-4", 
    provider: "OpenAI", 
    version: "1106-Preview",
    modelId: "openai/gpt-4-turbo-preview"
  },
  { 
    id: 3, 
    name: "Claude 3 Opus", 
    provider: "Anthropic", 
    version: "20240229",
    modelId: "anthropic/claude-3-opus"
  },
  { 
    id: 4, 
    name: "Claude 3 Sonnet", 
    provider: "Anthropic", 
    version: "20240229",
    modelId: "anthropic/claude-3-sonnet"
  },
  { 
    id: 5, 
    name: "Gemini Pro", 
    provider: "Google", 
    version: "latest",
    modelId: "google/gemini-pro"
  },
  { 
    id: 6, 
    name: "Llama 3 70B", 
    provider: "Meta", 
    version: "latest",
    modelId: "meta-llama/llama-3-70b-instruct"
  },
];

// Get API keys from environment variables
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || "";

const AdvisorPage = () => {
  const [selectedModels, setSelectedModels] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [testPrompt, setTestPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [evaluationResults, setEvaluationResults] = useState({});
  const [evaluationLoading, setEvaluationLoading] = useState({});
  const [promptCount, setPromptCount] = useState(5);
  const [expandedPrompts, setExpandedPrompts] = useState({});
  const [expandedModels, setExpandedModels] = useState({});
  const [generationDetails, setGenerationDetails] = useState({});

  // Toggle functions for expandable sections
  const togglePrompt = (promptIndex) => {
    setExpandedPrompts(prev => ({
      ...prev,
      [promptIndex]: !prev[promptIndex]
    }));
  };
  
  const toggleModel = (promptIndex, modelIndex) => {
    const key = `${promptIndex}-${modelIndex}`;
    setExpandedModels(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if we have API keys from environment variables
  useEffect(() => {
    // Check for missing environment variables and set error messages
    if (!OPENROUTER_API_KEY) {
      setApiError("OpenRouter API key not found in environment variables. Please add it to your .env file as REACT_APP_OPENROUTER_API_KEY.");
    }
    
    if (!process.env.REACT_APP_MAESTRO_API_KEY) {
      setApiError(prevError => {
        if (prevError) {
          return prevError + " Maestro API key not found in environment variables. Please add it to your .env file as REACT_APP_MAESTRO_API_KEY.";
        }
        return "Maestro API key not found in environment variables. Please add it to your .env file as REACT_APP_MAESTRO_API_KEY.";
      });
    }
  }, []);

  // Handle toggle button for model selection
  const handleToggleModel = (model) => {
    if (selectedModels.some(m => m.id === model.id)) {
      setSelectedModels(selectedModels.filter(m => m.id !== model.id));
    } else {
      if (selectedModels.length < 3) {
        setSelectedModels([...selectedModels, model]);
      } else {
        alert("You can only select up to 3 models for comparison");
      }
    }
  };

  // Handle user input changes
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
    setApiError(""); // Clear previous errors
  };

  // Handle generating a test prompt using Maestro
  const handleGeneratePrompt = async () => {
    if (!userInput.trim()) {
      setApiError("Please enter a description of your use case first.");
      return;
    }
  
    if (!process.env.REACT_APP_MAESTRO_API_KEY) {
      setApiError("Maestro API key not found in environment variables. Please add it to your .env file as REACT_APP_MAESTRO_API_KEY.");
      return;
    }
  
    setPromptLoading(true);
    setApiError("");
    
    try {
      console.log(`Generating ${promptCount} test prompts with Maestro API...`);
      
      // Create requirements object for JSON array output
      const requirements = [
        {
          name: "json_array_output",
          description: `Generate ${promptCount} distinct test prompts and return them as a JSON array of strings`,
          is_mandatory: true
        }
      ];
      
      // Get array of prompts from the API
      const prompts = await generateTestPrompt(userInput, requirements);
      
      // Join prompts with double newline for display
      setTestPrompt(prompts.join('\n\n'));
    } catch (error) {
      console.error("Error generating test prompts:", error);
      setApiError(`Error generating test prompts: ${error.message}`);
    } finally {
      setPromptLoading(false);
    }
  };
  
  // Fetch generation details from OpenRouter API
  const fetchGenerationDetails = async (generationId) => {
    if (!generationId || !OPENROUTER_API_KEY) return null;
    
    try {
      console.log(`Fetching generation details for ID: ${generationId}`);
      
      const response = await fetch(`https://openrouter.ai/api/v1/generation?id=${generationId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error fetching generation details: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error fetching generation details:`, error);
      return null;
    }
  };

  // Handle form submission - test the selected models
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedModels.length === 0) {
      alert("Please select at least one model for testing");
      return;
    }
    
    if (!testPrompt.trim()) {
      setApiError("Please generate or enter a test prompt first");
      return;
    }

    if (!OPENROUTER_API_KEY) {
      setApiError("OpenRouter API key not found in environment variables. Please add it to your .env file as REACT_APP_OPENROUTER_API_KEY.");
      return;
    }
    
    setLoading(true);
    setResults([]);
    setEvaluationResults({});
    setGenerationDetails({});
    setApiError("");
    
    // Split the prompt text into individual prompts
    const promptArray = testPrompt.split('\n\n').filter(p => p.trim());
    
    // Function to call a model for a specific prompt
    const callModel = async (model, prompt, promptIndex) => {
      try {
        console.log(`Testing model: ${model.name} with prompt ${promptIndex + 1}`);
        
        // Make API call to OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Model Advisor"
          },
          body: JSON.stringify({
            model: model.modelId,
            messages: [
              { role: "user", content: prompt }
            ],
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error from ${model.name}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        const output = data.choices[0].message.content;
        
        // Add metrics
        const metrics = {
          tokensUsed: data.usage.total_tokens,
          responseTime: data.response_ms / 1000, // Convert to seconds
          cost: data.usage.cost,
        };
        
        return {
          model,
          output,
          metrics,
          prompt,
          promptIndex: promptIndex + 1
        };
      } catch (error) {
        console.error(`Error testing model ${model.name} with prompt ${promptIndex + 1}:`, error);
        setApiError(prevError => {
          if (prevError) {
            return `${prevError}; ${error.message}`;
          }
          return error.message;
        });
        
        return {
          model,
          output: `Error: ${error.message}`,
          metrics: {
            tokensUsed: 0,
            responseTime: 0,
            cost: 0,
          },
          prompt,
          promptIndex: promptIndex + 1
        };
      }
    };
    
    try {
      // Create an array of all model-prompt combinations
      const allPromises = [];
      
      // Generate all combinations of models and prompts
      for (let promptIndex = 0; promptIndex < promptArray.length; promptIndex++) {
        const currentPrompt = promptArray[promptIndex];
        
        // Add promises for all models for this prompt
        selectedModels.forEach(model => {
          allPromises.push(callModel(model, currentPrompt, promptIndex));
        });
      }
      
      // Run all API calls in parallel
      const allResults = await Promise.all(allPromises);
      
      setResults(allResults);
      
      // If we have results, evaluate them using Maestro
      if (allResults.length > 0 && allResults.some(r => !r.output.startsWith('Error'))) {
        // Group by promptIndex
        const resultsByPrompt = {};
        allResults.forEach(result => {
          if (!resultsByPrompt[result.promptIndex]) {
            resultsByPrompt[result.promptIndex] = [];
          }
          resultsByPrompt[result.promptIndex].push(result);
        });
        
        // Start all evaluations (potentially in parallel)
        const evaluationPromises = [];
        
        for (const [promptIndex, promptResults] of Object.entries(resultsByPrompt)) {
          if (promptResults.length > 0) {
            evaluationPromises.push(handleEvaluateResults(promptResults[0].prompt, promptResults));
          }
        }
        
        // Wait for all evaluations to complete
        await Promise.all(evaluationPromises);
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmit:", error);
      setApiError(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Evaluate model outputs using Maestro
  const handleEvaluateResults = async (prompt, modelResults) => {
    if (!process.env.REACT_APP_MAESTRO_API_KEY) {
      setApiError(prevError => {
        if (prevError) {
          return `${prevError}; Maestro API key not found in environment variables. Please add it to your .env file as REACT_APP_MAESTRO_API_KEY.`;
        }
        return "Maestro API key not found in environment variables. Please add it to your .env file as REACT_APP_MAESTRO_API_KEY.";
      });
      return Promise.resolve(); // Ensure we return a resolved promise
    }
    
    if (!modelResults || !modelResults.length || !modelResults[0]) {
      console.error("Invalid model results for evaluation");
      return Promise.resolve(); // Ensure we return a resolved promise
    }
    
    const promptIndex = modelResults[0].promptIndex;
    
    // Set this prompt's evaluation as loading
    setEvaluationLoading(prev => ({
      ...prev,
      [promptIndex]: true
    }));
    
    try {
      console.log(`Evaluating model outputs for prompt ${promptIndex} with Maestro API...`);
      const evaluation = await evaluateModelOutputs(prompt, modelResults);
      
      // Add the evaluation result for this prompt
      setEvaluationResults(prev => ({
        ...prev,
        [promptIndex]: evaluation
      }));
      
      return evaluation; // Return the evaluation result
    } catch (error) {
      console.error(`Error evaluating model outputs for prompt ${promptIndex}:`, error);
      setApiError(prevError => {
        if (prevError) {
          return `${prevError}; ${error.message}`;
        }
        return error.message;
      });
      return Promise.resolve(); // Ensure we return a resolved promise even on error
    } finally {
      // Set this prompt's evaluation as no longer loading
      setEvaluationLoading(prev => ({
        ...prev,
        [promptIndex]: false
      }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Model Advisor</h1>
      
      {/* Display API error messages */}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {apiError}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 1: Describe your use case</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            What do you plan to use AI for? Be as specific as possible:
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            value={userInput}
            onChange={handleUserInputChange}
            placeholder="E.g., I need an AI chatbot that can answer customer questions about our software products..."
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Number of prompts to generate: {promptCount}
          </label>
          <div className="flex items-center">
            <span className="mr-2">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={promptCount}
              onChange={(e) => setPromptCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-2">10</span>
          </div>
        </div>

        <button 
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${promptLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          onClick={handleGeneratePrompt}
          disabled={promptLoading || !userInput.trim()}
        >
          {promptLoading ? 'Generating...' : 'Generate Test Prompt'}
        </button>
      </div>
      
      {testPrompt && (
  <div className="bg-white shadow rounded-lg p-6 mb-8">
    <h2 className="text-2xl font-semibold mb-4">Step 2: Review the test prompts</h2>
    <div className="bg-gray-100 p-4 rounded-md mb-4">
      {testPrompt.split('\n\n').map((prompt, index) => (
        <div key={index} className="mb-4">
          <h3 className="font-semibold mb-2">Prompt {index + 1}:</h3>
          <p className="font-mono whitespace-pre-wrap">{prompt}</p>
        </div>
      ))}
    </div>
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">
        Edit the prompts if needed:
      </label>
      <textarea
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="8"
        value={testPrompt}
        onChange={(e) => setTestPrompt(e.target.value)}
      ></textarea>
    </div>
  </div>
)}

      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 3: Select models to compare (max 3)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => (
            <ModelCard 
              key={model.id} 
              model={model} 
              selected={selectedModels.some(m => m.id === model.id)}
              onToggle={() => handleToggleModel(model)}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 4: Run the test</h2>
        <button 
          className={`px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={loading || selectedModels.length === 0 || !testPrompt.trim()}
        >
          {loading ? 'Testing Models...' : 'Run Comparison Test'}
        </button>
      </div>
      
      {/* Results Section */}
      {results.length > 0 && (
        <>
          {/* MOVED: Comprehensive Model Comparison Summary (now at the top) */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Comprehensive Model Comparison</h2>
            </div>
            
            <p className="text-gray-600 mb-8">
              This summary compares model performance across <span className="font-semibold">{results && results.length > 0 ? Object.keys(results.reduce((acc, r) => ({...acc, [r.promptIndex]: true}), {})).length : 0} prompts</span> with aggregated metrics.
            </p>
            
            {/* Aggregated Performance Chart */}
            <div className="mb-12">
              {(() => {
                // Calculate aggregated metrics per model across all prompts
                const modelPerformance = {};
                results.forEach(result => {
                  if (!result || !result.model || !result.model.id) return;
                  
                  const modelId = result.model.id;
                  if (!modelPerformance[modelId]) {
                    modelPerformance[modelId] = {
                      model: result.model,
                      promptCount: 0,
                      totalResponseTime: 0,
                      totalCost: 0,
                      totalTokens: 0,
                      // Initialize any other metrics you want to track
                    };
                  }
                  
                  // Skip if there was an error or metrics are undefined
                  if (!result.output?.startsWith('Error') && result.metrics) {
                    modelPerformance[modelId].promptCount++;
                    modelPerformance[modelId].totalResponseTime += result.metrics.responseTime || 0;
                    console.log(`Model ${result.model.name} cost: ${result.metrics.cost} (raw value)`);
                    modelPerformance[modelId].totalCost += result.metrics.cost || 0;
                    modelPerformance[modelId].totalTokens += result.metrics.tokensUsed || 0;
                  }
                });
                
                // Calculate averages for each model
                const aggregatedResults = Object.values(modelPerformance).map(perf => ({
                  model: perf.model,
                  metrics: {
                    responseTime: perf.promptCount ? perf.totalResponseTime / perf.promptCount : 0,
                    cost: perf.promptCount ? perf.totalCost / perf.promptCount : 0,
                    tokensUsed: perf.promptCount ? perf.totalTokens / perf.promptCount : 0,
                  },
                  totalMetrics: {
                    responseTime: perf.totalResponseTime,
                    cost: perf.totalCost,
                    tokensUsed: perf.totalTokens,
                  },
                  promptCount: perf.promptCount,
                }));
                
                return (
                  <>
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">Aggregated Performance Metrics</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                      <ComparisonChart results={aggregatedResults} />
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Detailed Metrics Table */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Performance Summary</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Response Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Token Usage
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      // Same calculation as above to avoid repetition
                      const modelPerformance = {};
                      results.forEach(result => {
                        if (!result || !result.model || !result.model.id) return;
                        
                        const modelId = result.model.id;
                        if (!modelPerformance[modelId]) {
                          modelPerformance[modelId] = {
                            model: result.model,
                            promptCount: 0,
                            totalResponseTime: 0,
                            totalCost: 0,
                            totalTokens: 0,
                          };
                        }
                        
                        if (!result.output?.startsWith('Error') && result.metrics) {
                          modelPerformance[modelId].promptCount++;
                          modelPerformance[modelId].totalResponseTime += result.metrics.responseTime || 0;
                          console.log(`Model ${result.model.name} cost: ${result.metrics.cost} (raw value)`);
                          modelPerformance[modelId].totalCost += result.metrics.cost || 0;
                          modelPerformance[modelId].totalTokens += result.metrics.tokensUsed || 0;
                        }
                      });
                      
                      return Object.values(modelPerformance).map((perf, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-800 font-medium">{perf.model.name.substring(0, 2)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{perf.model.name}</div>
                                <div className="text-sm text-gray-500">{perf.model.provider}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {perf.promptCount ? (perf.totalResponseTime / perf.promptCount).toFixed(2) : '0.00'}s
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${perf.promptCount ? Math.min(100, (perf.totalResponseTime / perf.promptCount) * 10) : 0}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {perf.promptCount ? Math.round(perf.totalTokens / perf.promptCount) : 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${perf.promptCount ? Math.min(100, (perf.totalTokens / perf.promptCount) / 20) : 0}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ${perf.promptCount ? (perf.totalCost / perf.promptCount).toFixed(8) : '0.00000000'}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-yellow-600 h-2.5 rounded-full" 
                                style={{ width: `${perf.promptCount ? Math.min(100, (perf.totalCost / perf.promptCount) * 10000) : 0}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${perf.totalCost ? perf.totalCost.toFixed(8) : '0.00000000'}</div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Model Recommendations */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Model Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  // Calculate same metrics to determine recommendations
                  const modelPerformance = {};
                  results.forEach(result => {
                    if (!result || !result.model || !result.model.id) return;
                    
                    const modelId = result.model.id;
                    if (!modelPerformance[modelId]) {
                      modelPerformance[modelId] = {
                        model: result.model,
                        promptCount: 0,
                        totalResponseTime: 0,
                        totalCost: 0,
                        totalTokens: 0,
                      };
                    }
                    
                    if (!result.output?.startsWith('Error') && result.metrics) {
                      modelPerformance[modelId].promptCount++;
                      modelPerformance[modelId].totalResponseTime += result.metrics.responseTime || 0;
                      modelPerformance[modelId].totalCost += result.metrics.cost || 0;
                      modelPerformance[modelId].totalTokens += result.metrics.tokensUsed || 0;
                    }
                  });
                  
                  // Calculate averages
                  const modelsWithScores = Object.values(modelPerformance).map(perf => {
                    const avgResponseTime = perf.promptCount ? perf.totalResponseTime / perf.promptCount : 0;
                    const avgCost = perf.promptCount ? perf.totalCost / perf.promptCount : 0;
                    const avgTokens = perf.promptCount ? perf.totalTokens / perf.promptCount : 0;
                    
                    // Simple scoring logic - can be enhanced
                    const speedScore = 1 / (avgResponseTime + 0.001); // Prevent division by zero
                    const costScore = 1 / (avgCost + 0.0001); // Prevent division by zero
                    const tokenScore = 1 / (avgTokens + 0.001); // Prevent division by zero
                    
                    return {
                      ...perf,
                      avgResponseTime,
                      avgCost,
                      avgTokens,
                      speedScore,
                      costScore,
                      tokenScore,
                    };
                  });
                  
                  // Find best model for each category
                  const bestSpeed = [...modelsWithScores].sort((a, b) => b.speedScore - a.speedScore)[0];
                  const bestCost = [...modelsWithScores].sort((a, b) => b.costScore - a.costScore)[0];
                  const bestOverall = [...modelsWithScores].sort((a, b) => {
                    // Custom overall score calculation
                    const aScore = a.speedScore * 0.4 + a.costScore * 0.4 + a.tokenScore * 0.2;
                    const bScore = b.speedScore * 0.4 + b.costScore * 0.4 + b.tokenScore * 0.2;
                    return bScore - aScore;
                  })[0];
                  
                  // Create recommendation cards
                  const categories = [
                    {
                      title: "Best Overall",
                      model: bestOverall,
                      description: "Balanced performance across all metrics",
                      color: "from-purple-500 to-indigo-600",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    },
                    {
                      title: "Fastest Response",
                      model: bestSpeed,
                      description: "Optimized for speed and low latency",
                      color: "from-blue-500 to-teal-400",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )
                    },
                    {
                      title: "Most Cost-Effective",
                      model: bestCost,
                      description: "Best value for money",
                      color: "from-green-500 to-emerald-400",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    }
                  ];
                  
                  return categories.map((category, index) => (
                    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
                      <div className={`bg-gradient-to-r ${category.color} p-4`}>
                        <div className="flex items-center">
                          <div className="p-2 bg-white bg-opacity-30 rounded-lg">
                            {category.icon}
                          </div>
                          <h4 className="text-lg font-semibold text-white ml-3">{category.title}</h4>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium text-lg">
                              {category.model?.model?.name ? category.model.model.name.substring(0, 2) : '--'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h5 className="text-lg font-medium text-gray-900">
                              {category.model?.model?.name || 'Unknown Model'}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {category.model?.model?.provider || 'Unknown Provider'}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Response Time:</span>
                            <span className="text-sm font-medium">{category.model?.avgResponseTime ? category.model.avgResponseTime.toFixed(2) : '0.00'}s</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Avg. Cost:</span>
                            <span className="text-sm font-medium">${category.model?.avgCost ? category.model.avgCost.toFixed(8) : '0.00000000'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Avg. Tokens:</span>
                            <span className="text-sm font-medium">{category.model?.avgTokens ? Math.round(category.model.avgTokens) : 0}</span>
                          </div>
                          {category.model?.generationId && generationDetails[category.model.generationId] && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Provider:</span>
                                <span className="text-sm font-medium">{generationDetails[category.model.generationId].provider_name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Prompt Tokens:</span>
                                <span className="text-sm font-medium">{generationDetails[category.model.generationId].tokens_prompt}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Completion Tokens:</span>
                                <span className="text-sm font-medium">{generationDetails[category.model.generationId].tokens_completion}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
          
          {/* Detailed Results Section (with expandable model outputs) */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Detailed Test Results</h2>
            
            {/* Group results by prompt */}
            {(() => {
              // Group results by prompt index
              const resultsByPrompt = {};
              results.forEach(result => {
                if (!resultsByPrompt[result.promptIndex]) {
                  resultsByPrompt[result.promptIndex] = [];
                }
                resultsByPrompt[result.promptIndex].push(result);
              });
              
              // Render each prompt group
              return Object.entries(resultsByPrompt).map(([promptIndex, promptResults]) => (
                <div key={promptIndex} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Prompt Header (always visible) */}
                  <div 
                    className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => togglePrompt(promptIndex)}
                  >
                    <h3 className="text-lg font-semibold">Prompt {promptIndex}</h3>
                    <button className="p-1 rounded-full hover:bg-gray-200">
                      {expandedPrompts[promptIndex] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Collapsible Prompt Content */}
                  {expandedPrompts[promptIndex] && (
                    <div className="p-4 border-t border-gray-200">
                      {/* Prompt Text */}
                      <div className="bg-gray-100 p-3 rounded mb-6">
                        <p className="font-mono whitespace-pre-wrap">
                          {promptResults && promptResults.length > 0 && promptResults[0] ? promptResults[0].prompt : 'No prompt available'}
                        </p>
                      </div>
                      
                      {/* Metrics Comparison Chart for this prompt */}
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                        {promptResults && promptResults.length > 0 ? (
                          <ComparisonChart results={promptResults} />
                        ) : (
                          <p>No metrics available</p>
                        )}
                      </div>
                      
                      {/* Model Outputs for this prompt (with individual collapsible sections) */}
                      <h4 className="text-lg font-semibold mb-4">Model Responses</h4>
                      <div className="space-y-3">
                        {promptResults.map((result, modelIndex) => {
                          const modelKey = `${promptIndex}-${modelIndex}`;
                          const isModelExpanded = expandedModels[modelKey];
                          
                          return (
                            <div key={modelIndex} className="border rounded-lg overflow-hidden">
                              {/* Model Header (always visible) */}
                              <div 
                                className="bg-white p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleModel(promptIndex, modelIndex)}
                              >
                                <div className="flex items-center">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-800 font-medium">
                                      {result?.model?.name ? result.model.name.substring(0, 2) : '--'}
                                    </span>
                                  </div>
                                  <h5 className="font-medium">{result?.model?.name || 'Unknown Model'}</h5>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-3">
                                    {(result?.metrics?.responseTime || 0).toFixed(2)}s | ${(result?.metrics?.cost || 0).toFixed(8)} | {result?.metrics?.tokensUsed || 0} tokens
                                  </span>
                                  <button className="p-1 rounded-full hover:bg-gray-200">
                                    {isModelExpanded ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Collapsible Model Output */}
                              {isModelExpanded && (
                                <div className="border-t border-gray-200">
                                  <pre className="bg-gray-100 p-3 rounded-b-lg whitespace-pre-wrap text-sm overflow-x-auto">
                                    {result?.output || 'No output available'}
                                  </pre>
                                  
                                  {/* Generation Details when available */}
                                  {result?.metrics?.generationId && generationDetails[result.metrics.generationId] && (
                                    <div className="p-3 bg-blue-50 mt-2 rounded text-sm">
                                      <h6 className="font-semibold mb-2">Detailed Generation Stats</h6>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-gray-600">Provider:</span> {generationDetails[result.metrics.generationId].provider_name}
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Generation Time:</span> {(generationDetails[result.metrics.generationId].generation_time / 1000).toFixed(2)}s
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Prompt Tokens:</span> {generationDetails[result.metrics.generationId].tokens_prompt}
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Completion Tokens:</span> {generationDetails[result.metrics.generationId].tokens_completion}
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Total Cost:</span> ${generationDetails[result.metrics.generationId].total_cost?.toFixed(8)}
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Finish Reason:</span> {generationDetails[result.metrics.generationId].finish_reason}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
          
          {/* Maestro Evaluation Results (keep these as they were) */}
          {(Object.keys(evaluationLoading).length > 0 || Object.keys(evaluationResults).length > 0) && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">AI-Powered Evaluations</h2>
              
              {/* Show evaluations for each prompt */}
              {Object.entries(evaluationResults).map(([promptIndex, evaluation]) => (
                <div key={promptIndex} className="mb-8 border-b pb-6">
                  <h3 className="text-xl font-semibold mb-3">Evaluation for Prompt {promptIndex}</h3>
                  <MaestroEvaluation 
                    loading={evaluationLoading[promptIndex]}
                    evaluation={evaluation}
                  />
                </div>
              ))}
              
              {/* Show loading indicators for evaluations in progress */}
              {Object.entries(evaluationLoading)
                .filter(([_, isLoading]) => isLoading)
                .map(([promptIndex]) => (
                  !evaluationResults[promptIndex] && (
                    <div key={promptIndex} className="mb-8 border-b pb-6">
                      <h3 className="text-xl font-semibold mb-3">Evaluation for Prompt {promptIndex}</h3>
                      <MaestroEvaluation 
                        loading={true}
                        evaluation={null}
                      />
                    </div>
                  )
                ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdvisorPage; 