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
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

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
  const toggleModel = (model) => {
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
      console.log("Generating test prompt with Maestro API...");
      const prompt = await generateTestPrompt(userInput);
      setTestPrompt(prompt);
    } catch (error) {
      console.error("Error generating test prompt:", error);
      setApiError(`Error generating test prompt: ${error.message}`);
    } finally {
      setPromptLoading(false);
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
    setEvaluationResults(null);
    setApiError("");
    
    const modelResults = [];
    
    // Test each selected model
    for (const model of selectedModels) {
      try {
        console.log(`Testing model: ${model.name}`);
        
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
              { role: "user", content: testPrompt }
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
        
        modelResults.push({
          model,
          output,
          metrics,
        });
      } catch (error) {
        console.error(`Error testing model ${model.name}:`, error);
        modelResults.push({
          model,
          output: `Error: ${error.message}`,
          metrics: {
            tokensUsed: 0,
            responseTime: 0,
            cost: 0,
          },
        });
        setApiError(prevError => {
          if (prevError) {
            return `${prevError}; ${error.message}`;
          }
          return error.message;
        });
      }
    }
    
    setResults(modelResults);
    setLoading(false);
    
    // If we have results, evaluate them using Maestro
    if (modelResults.length > 0 && modelResults.some(r => !r.output.startsWith('Error'))) {
      await handleEvaluateResults(testPrompt, modelResults);
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
      return;
    }
    
    setEvaluationLoading(true);
    
    try {
      console.log("Evaluating model outputs with Maestro API...");
      const evaluation = await evaluateModelOutputs(prompt, modelResults);
      setEvaluationResults(evaluation);
    } catch (error) {
      console.error("Error evaluating model outputs:", error);
      setApiError(prevError => {
        if (prevError) {
          return `${prevError}; ${error.message}`;
        }
        return error.message;
      });
    } finally {
      setEvaluationLoading(false);
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
          <h2 className="text-2xl font-semibold mb-4">Step 2: Review the test prompt</h2>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="font-mono whitespace-pre-wrap">{testPrompt}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Edit the prompt if needed:
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
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
              onToggle={() => toggleModel(model)}
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
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
          
          {/* Metrics Comparison Chart */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
            <ComparisonChart results={results} />
          </div>
          
          {/* Model Outputs */}
          <h3 className="text-xl font-semibold mb-4">Model Responses</h3>
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-2">{result.model.name}</h4>
                <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">{result.output}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Maestro Evaluation Results */}
      {(evaluationLoading || evaluationResults) && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">AI-Powered Evaluation</h2>
          <MaestroEvaluation 
            loading={evaluationLoading}
            evaluation={evaluationResults}
          />
        </div>
      )}
    </div>
  );
};

export default AdvisorPage; 