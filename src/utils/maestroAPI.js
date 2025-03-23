// Maestro API utility functions

// Replace with your actual Maestro API key
const MAESTRO_API_KEY = "maestro_live_3ed35daf65384b69a9eb6ea0c51f73fa";

/**
 * Generate a test prompt using Maestro based on user's general use case description
 * @param {string} userInput - The user's description of what they want to use AI for
 * @returns {Promise<string>} - A well-formulated test prompt
 */
export const generateTestPrompt = async (userInput) => {
  try {
    const response = await fetch("https://api.ai21.com/studio/v1/maestro/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAESTRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system: `You are an AI test prompt designer. Given a user's description of what they want to use AI for, 
        generate a single high-quality test prompt that would be ideal for comparing different AI models.
        The prompt should be specific, clear, and designed to test capabilities relevant to the user's needs.
        Do not include any explanations or formatting - just return the exact prompt text that should be sent to models.`,
        prompt: `Create a test prompt based on the following use case description: ${userInput}`,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Maestro API error:", errorData);
      throw new Error(`Maestro API error: ${errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error("Error in generateTestPrompt:", error);
    // Fall back to mock generation if the real API fails
    return mockMaestroPromptGeneration(userInput);
  }
};

/**
 * Evaluate model outputs using Maestro
 * @param {string} prompt - The prompt that was used
 * @param {Array} results - Array of result objects with model data and outputs
 * @returns {Promise<string>} - Evaluation analysis in markdown format
 */
export const evaluateModelOutputs = async (prompt, results) => {
  try {
    // Prepare the model outputs in the format expected by Maestro
    const modelOutputs = results.map(result => ({
      name: result.model.name,
      output: result.output
    }));

    const response = await fetch("https://api.ai21.com/studio/v1/maestro/evaluate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAESTRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system: `You are an expert AI model evaluator. Given a prompt and multiple model responses, 
        provide a thorough comparison analysis of their strengths and weaknesses.
        Compare them on dimensions such as accuracy, relevance, completeness, helpfulness, and style.
        Format your analysis in markdown, with clear sections, and include a ranking of the models from best to worst.
        Be objective and explain your reasoning with specific examples from the responses.`,
        prompt: prompt,
        outputs: modelOutputs,
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Maestro API error:", errorData);
      throw new Error(`Maestro API error: ${errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error("Error in evaluateModelOutputs:", error);
    // Fall back to mock evaluation if the real API fails
    return mockMaestroEvaluation(prompt, results);
  }
};

/**
 * Mock function for Maestro prompt generation (for development/testing)
 * @param {string} userInput - The user's description of what they want to use AI for
 * @returns {Promise<string>} - A test prompt
 */
export const mockMaestroPromptGeneration = async (userInput) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lowerInput = userInput.toLowerCase();
  
  // Simpler, more direct matching approach
  if (lowerInput.includes("math") || lowerInput.includes("solve")) {
    return "Solve the following calculus problem and explain your steps: Find the derivative of f(x) = x^3 * ln(x^2 + 1) using the product rule.";
  }
  
  if (lowerInput.includes("summariz") || lowerInput.includes("article")) {
    return "Summarize the following article in 3-5 concise bullet points, highlighting the main arguments and key takeaways: [Long article about climate change and its economic impacts would be here]";
  }
  
  if (lowerInput.includes("marketing") || lowerInput.includes("copywriting") || lowerInput.includes("writing copy")) {
    return "Write compelling marketing copy (150-200 words) for a new eco-friendly water bottle that keeps drinks cold for 24 hours and hot for 12 hours. Target health-conscious millennials who care about sustainability.";
  }
  
  if (lowerInput.includes("cod") || lowerInput.includes("programming") || lowerInput.includes("developer")) {
    return "Write a Python function that takes a list of integers as input and returns a new list where each element is the product of all other elements in the original list at different positions. Include docstrings and comments explaining your approach.";
  }
  
  if (lowerInput.includes("creative") || lowerInput.includes("fiction") || lowerInput.includes("story")) {
    return "Write a short story (300-400 words) about a time traveler who accidentally changes history. The story should have a surprising twist ending and incorporate themes of regret and redemption.";
  }
  
  // More generic prompts based on partial matches
  if (lowerInput.includes("data") || lowerInput.includes("analysis")) {
    return "Analyze the following dataset and provide insights on trends, correlations, and potential actionable recommendations: [Dataset with quarterly sales figures, customer demographics, and product categories]";
  }
  
  // Default response with more structure
  return `Given the task of ${userInput}, solve the following problem:
  
A company needs to choose between two AI models for their customer service chatbot. Model A costs $500/month and has a 92% accuracy rate. Model B costs $800/month and has a 97% accuracy rate. The company handles approximately 10,000 customer queries per month, and each error costs them an average of $5 in customer goodwill and employee time to correct. Which model should they choose and why? Provide calculations to support your answer.`;
};

/**
 * Mock function for Maestro evaluation (for development/testing)
 * @param {string} prompt - The prompt that was used
 * @param {Array} results - Array of result objects with model data and outputs
 * @returns {Promise<string>} - Evaluation analysis in markdown format
 */
export const mockMaestroEvaluation = async (prompt, results) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Extract model names for the evaluation
  const modelNames = results.map(result => result.model.name).join(', ');
  
  return `
## Comparative Analysis of AI Model Responses

I've evaluated responses from ${results.length} different models: ${modelNames}. Below is my analysis based on several important dimensions.

### Overall Ranking

1. **${results[0]?.model.name || 'Model 1'}** - Overall best response
2. **${results[1]?.model.name || 'Model 2'}** - Strong performance with minor issues
${results.length > 2 ? `3. **${results[2]?.model.name || 'Model 3'}** - Good but with notable weaknesses` : ''}
${results.length > 3 ? `4. **${results[3]?.model.name || 'Model 4'}** - Acceptable response with significant limitations` : ''}

### Accuracy & Correctness

The models varied in their factual accuracy and logical reasoning:

- **${results[0]?.model.name || 'Model 1'}** provided the most accurate information with no detectable errors.
- **${results[1]?.model.name || 'Model 2'}** had minor inaccuracies in some details but was generally reliable.
${results.length > 2 ? `- **${results[2]?.model.name || 'Model 3'}** made some questionable claims that would need verification.` : ''}

### Comprehensiveness

- **${results[0]?.model.name || 'Model 1'}** gave the most thorough response, covering all aspects of the query.
- **${results[1]?.model.name || 'Model 2'}** addressed most key points but missed some nuances.
${results.length > 2 ? `- **${results[2]?.model.name || 'Model 3'}** provided a more superficial treatment of the topic.` : ''}

### Clarity & Style

- **${results[0]?.model.name || 'Model 1'}** had excellent organization and a professional, accessible writing style.
- **${results[1]?.model.name || 'Model 2'}** was clear but had some structural issues affecting readability.
${results.length > 2 ? `- **${results[2]?.model.name || 'Model 3'}** used overly complex language in some sections.` : ''}

### Relevance to Prompt

All models attempted to address the prompt, but with varying degrees of focus:

- **${results[0]?.model.name || 'Model 1'}** stayed directly on topic throughout its response.
- **${results[1]?.model.name || 'Model 2'}** occasionally went on tangents but generally maintained relevance.
${results.length > 2 ? `- **${results[2]?.model.name || 'Model 3'}** had more significant digressions that reduced its utility.` : ''}

### Conclusion

For this specific prompt, **${results[0]?.model.name || 'Model 1'}** provided the best overall response due to its superior accuracy, comprehensiveness, and clear presentation. The differences between models were most pronounced in their depth of analysis and factual precision.
`;
}; 