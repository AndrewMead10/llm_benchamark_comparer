// This file provides mock responses for OpenRouter API calls when testing locally

export const generateMockResponse = (model, prompt) => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `mockapi-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
          {
            message: {
              role: "assistant",
              content: getMockResponseContent(model, prompt)
            },
            index: 0,
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: prompt.length / 4,
          completion_tokens: 250,
          total_tokens: prompt.length / 4 + 250
        }
      });
    }, 2000);
  });
};

// Generate different mock responses for different models
const getMockResponseContent = (model, prompt) => {
  const responses = {
    "openai/gpt-4-turbo": `As GPT-4, I would approach this by first analyzing the requirements in detail. ${prompt} requires a comprehensive solution that balances technical implementation with user experience. I would recommend starting with a user research phase to understand the specific needs, followed by prototyping and iterative development.`,
    
    "anthropic/claude-3-opus": `Based on your request about ${prompt}, I'd like to offer a thoughtful, nuanced response. First, it's important to consider the ethical implications. Second, we should examine the technical feasibility. Third, let's consider implementation strategies that prioritize clarity and user safety.`,
    
    "google/gemini-pro": `Regarding your inquiry about ${prompt}, here's my analysis: This represents an opportunity to leverage cutting-edge AI capabilities while maintaining responsible deployment practices. I would recommend a phased approach with continuous evaluation metrics.`,
    
    "meta-llama/llama-3-70b-instruct": `For ${prompt}, I think we should consider the following approach: 1) Define clear success metrics, 2) Establish a baseline using existing solutions, 3) Develop an implementation plan with careful attention to both performance and ethical considerations, 4) Test extensively with diverse user groups.`,
    
    "openai/gpt-3.5-turbo": `To address ${prompt}, I suggest implementing a solution that combines machine learning techniques with human oversight. This could involve training a model on relevant data, implementing a user-friendly interface, and establishing clear escalation paths for edge cases.`,
    
    "mistralai/mistral-7b-instruct": `For ${prompt}, here's what I recommend: First analyze your specific requirements and constraints. Then explore available open-source and commercial solutions. Finally, develop a customized approach that leverages the strengths of foundation models while addressing their limitations.`
  };
  
  return responses[model] || `This is a mock response for ${model} regarding ${prompt}. In a real implementation, this would be an actual response from the AI model.`;
};

// Export a function to use instead of fetch for testing
export const mockOpenRouterFetch = async (url, options) => {
  console.log("Using mock OpenRouter API");
  const { model, messages } = JSON.parse(options.body);
  const prompt = messages[0].content;
  
  const mockResponse = await generateMockResponse(model, prompt);
  
  return {
    ok: true,
    json: async () => mockResponse
  };
}; 