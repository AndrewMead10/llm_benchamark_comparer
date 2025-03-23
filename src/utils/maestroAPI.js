// Maestro API utility functions

// Get API key from environment variables
let MAESTRO_API_KEY = process.env.REACT_APP_MAESTRO_API_KEY || "";

// Debug log to check if API key is loaded
console.log("Maestro API Key loaded:", MAESTRO_API_KEY ? "API key present" : "No API key found");

// Maximum time to wait for Maestro run to complete (in ms)
const MAX_WAIT_TIME = 60000; // 60 seconds
const POLL_INTERVAL = 2000; // Check every 2 seconds

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
 * Helper function to check Maestro run status and retrieve results
 * @param {string} runId - The ID of the Maestro run
 * @returns {Promise<object>} - The completed run object or null if failed/timeout
 */
const checkRunStatus = async (runId) => {
  console.log(`Checking status of Maestro run: ${runId}`);
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      const response = await fetch(`https://api.ai21.com/studio/v1/maestro/runs/${runId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${MAESTRO_API_KEY}`,
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        console.error(`Error checking run status: ${response.status}`);
        return null;
      }
      
      const runData = await response.json();
      console.log(`Run status: ${runData.status}`);
      
      if (runData.status === 'completed') {
        return runData;
      } else if (runData.status === 'failed') {
        console.error('Maestro run failed');
        return null;
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    } catch (error) {
      console.error(`Error polling run status: ${error}`);
      return null;
    }
  }
  
  console.error('Timed out waiting for Maestro run to complete');
  return null;
};

/**
 * Generate a test prompt using AI21 Maestro based on user's general use case description
 * @param {string} userInput - The user's description of what they want to use AI for
 * @param {object} requirements - Optional requirements for the Maestro API
 * @returns {Promise<Array<string>>} - An array of well-formulated test prompts
 */
export const generateTestPrompt = async (userInput, requirements = null) => {
  console.log("generateTestPrompt called with input:", userInput);
  console.log("Using API key:", MAESTRO_API_KEY ? "API key present (length: " + MAESTRO_API_KEY.length + ")" : "No API key");
  
  // Require API key
  if (!MAESTRO_API_KEY) {
    console.error("No API key found");
    // Use the mock function instead of throwing an error
    return ["There was an error generating the test prompt. Please try again later."];
  }

  try {
    console.log("Making request to AI21 Maestro API...");
    
    // Default requirement if none provided
    const defaultRequirements = [
      {
        name: "concise",
        description: "Output only the exact prompt text with no explanations or formatting",
        is_mandatory: true
      }
    ];
    
    // Using AI21's Maestro endpoint to create a run
    const response = await fetch("https://api.ai21.com/studio/v1/maestro/runs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAESTRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [
          {
            role: "user",
            content: `Create test prompts based on the following use case description: ${userInput}`
          }
        ],
        context: {
          purpose: "test_prompt_generation",
          instructions: "You are an AI test prompt designer. Given a user's description of what they want to use AI for, generate high-quality test prompts that would be ideal for comparing different AI models. The prompts should be specific, clear, and designed to test capabilities relevant to the user's needs. Return the results as a valid JSON array of strings with no additional explanations."
        },
        // models: ["jamba-large-1.6"],
        requirements: requirements || defaultRequirements
      }),
    });

    console.log("AI21 Maestro API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }
      console.error("AI21 Maestro API error details:", errorData);
      
      // Instead of throwing an error, fall back to mock functionality
      return ["There was an error generating the test prompt. Please try again later."];
    }

    // Get the run ID from the initial response
    const runCreation = await response.json();
    console.log("Maestro run created with ID:", runCreation.id);
    
    // Wait for the run to complete and get results
    const completedRun = await checkRunStatus(runCreation.id);
    
    if (!completedRun) {
      console.error("Failed to get completed run");
      return ["There was an error generating the test prompt. Please try again later."];
    }
    
    console.log("AI21 Maestro run completed successfully");
    
    // Extract the response from the Maestro output
    const completionText = completedRun.result || "";
    
    // Parse the JSON result if it's in JSON format
    try {
      // Check if the result is a JSON array
      if (completionText.trim().startsWith('[') && completionText.trim().endsWith(']')) {
        return JSON.parse(completionText.trim());
      }
      // Otherwise treat it as a single prompt
      return [completionText.trim()];
    } catch (error) {
      console.error("Error parsing JSON prompts:", error);
      // Return as a single prompt if JSON parsing fails
      return [completionText.trim()];
    }
  } catch (error) {
    console.error("Error in AI21 generateTestPrompt:", error);
    // Fall back to mock functionality instead of throwing the error
    return ["There was an error generating the test prompt. Please try again later."];
  }
};

/**
 * Evaluate model outputs using AI21 Maestro
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
    return "There was an error evaluating the model outputs. Please try again later.";
  }

  // Format the model outputs for evaluation
  const formattedOutputs = modelOutputs.map(item => ({
    name: item.model.name,
    text: item.output
  }));

  try {
    console.log("Making request to AI21 Maestro for evaluation...");
    
    // Using AI21's Maestro endpoint to create an evaluation run
    const response = await fetch("https://api.ai21.com/studio/v1/maestro/runs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAESTRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [
          {
            role: "user",
            content: `User prompt: ${prompt}
            
            ${formattedOutputs.map(output => `${output.name} response: ${output.text}`).join('\n\n')}
            
            Please provide your evaluation in markdown format.`
          }
        ],
        context: {
          purpose: "model_evaluation",
          instructions: `You are an expert at evaluating AI model outputs. You will be given a prompt and multiple AI responses to that prompt from different models. 
          Analyze each response for accuracy, clarity, creativity, and usefulness.`
        },
        // models: ["jamba-large-1.6"],
        requirements: [
          {
            name: "markdown_format",
            description: "Provide output in markdown format with clear sections",
            is_mandatory: true
          },
          {
            name: "comprehensive_evaluation",
            description: "Include: 1) Summary of strengths/weaknesses for each model, 2) Comparative analysis across all models, 3) Recommendation on which model performed best and why",
            is_mandatory: true
          }
        ]
      }),
    });

    console.log("AI21 Maestro evaluation API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }
      console.error("AI21 Maestro evaluation API error details:", errorData);
      
      // Fall back to mock functionality
      return "There was an error evaluating the model outputs. Please try again later.";
    }

    // Get the run ID from the initial response
    const runCreation = await response.json();
    console.log("Maestro evaluation run created with ID:", runCreation.id);
    
    // Wait for the run to complete and get results
    const completedRun = await checkRunStatus(runCreation.id);
    
    if (!completedRun) {
      console.error("Failed to get completed evaluation run");
      return "There was an error evaluating the model outputs. Please try again later.";
    }
    
    console.log("AI21 Maestro evaluation run completed successfully");
    
    // Extract the evaluation from the Maestro output
    const evaluationText = completedRun.result || "";
    
    return evaluationText.trim();
  } catch (error) {
    console.error("Error in AI21 evaluateModelOutputs:", error);
    // Fall back to mock functionality
    return "There was an error evaluating the model outputs. Please try again later.";
  }
};
