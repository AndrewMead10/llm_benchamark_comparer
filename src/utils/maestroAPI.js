// Maestro API utility functions

// Get API key from environment variables
let MAESTRO_API_KEY = process.env.REACT_APP_MAESTRO_API_KEY || "";

// Debug log to check if API key is loaded
console.log("Maestro API Key loaded:", MAESTRO_API_KEY ? "API key present" : "No API key found");

/**
 * Set the Maestro API key from the UI (no longer needed, but kept for backwards compatibility)
 * @param {string} apiKey - The API key to use for Maestro calls
 */
export const setMaestroApiKey = (apiKey) => {
  // Only set if environment variable is not available
  if (!process.env.REACT_APP_MAESTRO_API_KEY) {
    MAESTRO_API_KEY = apiKey;
    console.log("Maestro API key set manually");
  }
};

/**
 * Create a mock prompt for fallback when API fails
 * @param {string} userInput - The user's description
 * @returns {string} - A generated prompt
 */
const createMockPrompt = (userInput) => {
  // Simple fallback logic to generate a prompt based on the input
  const topic = userInput.toLowerCase().includes('math') ? 'math problem' : 
               userInput.toLowerCase().includes('story') ? 'creative story' :
               userInput.toLowerCase().includes('code') ? 'coding challenge' : 
               'general knowledge question';
               
  return `Create a detailed response to the following ${topic}: [Insert specific question related to ${userInput}]`;
};

/**
 * Generate a test prompt using AI21 based on user's general use case description
 * @param {string} userInput - The user's description of what they want to use AI for
 * @returns {Promise<string>} - A well-formulated test prompt
 */
export const generateTestPrompt = async (userInput) => {
  console.log("generateTestPrompt called with input:", userInput);
  console.log("Using API key:", MAESTRO_API_KEY ? "API key present (length: " + MAESTRO_API_KEY.length + ")" : "No API key");
  
  // Require API key
  if (!MAESTRO_API_KEY) {
    console.error("No API key found");
    // Use the mock function instead of throwing an error
    return mockMaestroPromptGeneration(userInput);
  }

  try {
    console.log("Making request to AI21 API...");
    
    // Using AI21's chat API with Jamba model (newer model)
    const response = await fetch("https://api.ai21.com/studio/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAESTRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "jamba-1.5-mini",  // Using newer Jamba model
        messages: [
          {
            role: "system",
            content: "You are an AI test prompt designer. Given a user's description of what they want to use AI for, generate a single high-quality test prompt that would be ideal for comparing different AI models. The prompt should be specific, clear, and designed to test capabilities relevant to the user's needs. Do not include any explanations or formatting - just return the exact prompt text that should be sent to models."
          },
          {
            role: "user",
            content: `Create a test prompt based on the following use case description: ${userInput}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    console.log("AI21 API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }
      console.error("AI21 API error details:", errorData);
      
      // Instead of throwing an error, fall back to mock functionality
      console.log("Falling back to mock prompt generation");
      return mockMaestroPromptGeneration(userInput);
    }

    const data = await response.json();
    console.log("AI21 generate API successful, data:", data);
    
    // Extract the completion text from the response based on chat API structure
    const completionText = data.choices?.[0]?.message?.content || "";
    
    return completionText.trim();
  } catch (error) {
    console.error("Error in AI21 generateTestPrompt:", error);
    // Fall back to mock functionality instead of throwing the error
    console.log("Falling back to mock prompt generation due to error");
    return mockMaestroPromptGeneration(userInput);
  }
};

/**
 * Evaluate model outputs using AI21 or fallback to manual evaluation
 * @param {string} prompt - The original prompt
 * @param {Array} modelOutputs - Array of {model, output} objects 
 * @returns {Promise<string>} - Markdown formatted evaluation
 */
export const evaluateModelOutputs = async (prompt, modelOutputs) => {
  console.log("evaluateModelOutputs called with prompt:", prompt);
  console.log("Model outputs to evaluate:", modelOutputs.map(m => m.model.name));
  
  // Require API key - fallback to mock if missing
  if (!MAESTRO_API_KEY) {
    console.error("No API key found for evaluation");
    return mockEvaluateModelOutputs(prompt, modelOutputs);
  }

  // Check if there's a user benchmark
  const hasBenchmark = modelOutputs.some(item => item.model.id === 'benchmark');
  
  // Format the model outputs for evaluation
  const formattedOutputs = modelOutputs.map(item => ({
    name: item.model.name,
    text: item.output
  }));

  try {
    console.log("Making request to AI21 for evaluation...");
    
    // Using AI21's chat API for evaluation
    const response = await fetch("https://api.ai21.com/studio/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAESTRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "jamba-1.5-mini",  // Using newer Jamba model
        messages: [
          {
            role: "system",
            content: `You are an expert at evaluating AI model outputs. You will be given a prompt and multiple AI responses to that prompt from different models. 
            ${hasBenchmark ? "One of the responses is labeled as 'User Benchmark' - this is the user's own answer and should be used as a reference point for evaluating the other AI responses." : ""}
            Analyze each response for accuracy, clarity, creativity, and usefulness. Provide a detailed comparison in markdown format that includes:
            
            1. Summary of strengths and weaknesses for each model
            2. Comparative analysis across all models
            3. Recommendation on which model performed best and why
            ${hasBenchmark ? "4. How the AI models compare to the user's benchmark answer" : ""}`
          },
          {
            role: "user",
            content: `User prompt: ${prompt}
            
            ${formattedOutputs.map(output => `${output.name} response: ${output.text}`).join('\n\n')}
            
            Please provide your evaluation in markdown format.`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      }),
    });

    console.log("AI21 evaluation API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }
      console.error("AI21 evaluation API error details:", errorData);
      
      // Fall back to mock functionality
      console.log("Falling back to mock evaluation");
      return mockEvaluateModelOutputs(prompt, modelOutputs);
    }

    const data = await response.json();
    console.log("AI21 evaluation successful, returning result");
    
    // Extract the evaluation text from the response based on chat API structure
    const evaluationText = data.choices?.[0]?.message?.content || "";
    
    return evaluationText.trim();
  } catch (error) {
    console.error("Error in AI21 evaluateModelOutputs:", error);
    // Fall back to mock functionality
    console.log("Falling back to mock evaluation due to error");
    return mockEvaluateModelOutputs(prompt, modelOutputs);
  }
};

/**
 * Mock function for Maestro prompt generation
 * @param {string} userInput - The user's description of what they want to use AI for
 * @returns {Promise<string>} - A test prompt
 */
export const mockMaestroPromptGeneration = async (userInput) => {
  return createMockPrompt(userInput);
};

/**
 * Mock function for model output evaluation
 * @param {string} prompt - The prompt that was used
 * @param {Array} modelOutputs - Model outputs to evaluate
 * @returns {Promise<string>} - Evaluation analysis in markdown format
 */
const mockEvaluateModelOutputs = async (prompt, modelOutputs) => {
  // Create a basic evaluation
  const modelNames = modelOutputs.map(item => item.model.name).join(', ');
  const hasBenchmark = modelOutputs.some(item => item.model.id === 'benchmark');
  
  return `# Model Evaluation

## Summary of Model Performances

I've analyzed the responses from ${modelNames} based on the prompt: "${prompt}".

${modelOutputs.map(item => `
### ${item.model.name}

**Strengths:**
- Addresses the main points of the prompt
- Provides relevant information

**Weaknesses:**
- May lack some level of detail or comprehensiveness

`).join('\n')}

## Comparative Analysis

The models show different approaches to the same prompt, with some providing more technical detail and others focusing on practical applications.

## Recommendation

Based on the overall quality, completeness, and usefulness of the responses, ${modelOutputs[0]?.model.name || 'the first model'} appears to provide the most comprehensive and useful response to the given prompt.

${hasBenchmark ? `
## Comparison to User Benchmark

The User Benchmark provides a human perspective that differs from the AI models in the following ways:
- May show different reasoning approaches
- Often more concise or focused on practical aspects
- Provides a useful reference point for evaluating AI responses
` : ''}

*Note: This is an auto-generated evaluation as a fallback when the AI evaluation service is unavailable.*
`;
};

/**
 * Mock function for Maestro evaluation (kept for backwards compatibility)
 */
export const mockMaestroEvaluation = async (prompt, results) => {
  return mockEvaluateModelOutputs(prompt, results);
}; 