export const aiModels = [
  {
    id: 1,
    name: "GPT-4",
    provider: "OpenAI",
    type: "Large Language Model",
    cost: 5,
    speed: 3,
    accuracy: 5,
    useCase: ["Natural Language Processing", "Content Generation", "Code Generation", "Reasoning"],
    description: "Advanced LLM with strong reasoning and generative capabilities. Best for complex language tasks and creative content.",
    limitations: "High cost, can hallucinate on complex reasoning.",
    imageUrl: "https://via.placeholder.com/150?text=GPT-4"
  },
  {
    id: 2,
    name: "Claude 3 Opus",
    provider: "Anthropic",
    type: "Large Language Model",
    cost: 4,
    speed: 3,
    accuracy: 5,
    useCase: ["Natural Language Processing", "Content Generation", "Reasoning", "Document Analysis"],
    description: "Excellent reasoning abilities and long context windows. Good for document analysis and complex conversations.",
    limitations: "Higher cost compared to smaller models, not specialized for code.",
    imageUrl: "https://via.placeholder.com/150?text=Claude3"
  },
  {
    id: 3,
    name: "DALL-E 3",
    provider: "OpenAI",
    type: "Text-to-Image",
    cost: 4,
    speed: 2,
    accuracy: 4,
    useCase: ["Image Generation", "Design", "Creative Content"],
    description: "Creates high-quality images from text descriptions. Great for creative and marketing teams.",
    limitations: "Cannot generate photorealistic human faces, has content filters.",
    imageUrl: "https://via.placeholder.com/150?text=DALL-E"
  },
  {
    id: 4,
    name: "Gemini Pro",
    provider: "Google",
    type: "Multimodal",
    cost: 3,
    speed: 4,
    accuracy: 4,
    useCase: ["Natural Language Processing", "Image Understanding", "Content Generation"],
    description: "Well-rounded multimodal model with good performance across text and image understanding.",
    limitations: "Less specialized than purpose-built models for specific tasks.",
    imageUrl: "https://via.placeholder.com/150?text=Gemini"
  },
  {
    id: 5,
    name: "Llama 3",
    provider: "Meta",
    type: "Large Language Model",
    cost: 2,
    speed: 4,
    accuracy: 3,
    useCase: ["Natural Language Processing", "Content Generation", "Local Deployment"],
    description: "Open weights model that can be run locally or fine-tuned. Good cost-performance balance.",
    limitations: "Less capable than leading closed models, requires technical expertise to deploy.",
    imageUrl: "https://via.placeholder.com/150?text=Llama3"
  },
  {
    id: 6,
    name: "Whisper",
    provider: "OpenAI",
    type: "Speech-to-Text",
    cost: 2,
    speed: 4,
    accuracy: 4,
    useCase: ["Transcription", "Translation", "Voice Applications"],
    description: "Strong speech recognition across multiple languages. Good for transcription and voice applications.",
    limitations: "Not real-time for very long content, some dialect challenges.",
    imageUrl: "https://via.placeholder.com/150?text=Whisper"
  },
  {
    id: 7,
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    type: "Text-to-Image",
    cost: 2,
    speed: 3,
    accuracy: 4,
    useCase: ["Image Generation", "Design", "Open Source Projects"],
    description: "Open source image generation model with good quality and flexibility. Can be deployed locally.",
    limitations: "Requires GPU for reasonable performance, less consistent than DALL-E.",
    imageUrl: "https://via.placeholder.com/150?text=StableDiffusion"
  },
  {
    id: 8,
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    type: "Large Language Model",
    cost: 1,
    speed: 5,
    accuracy: 3,
    useCase: ["Customer Support", "Content Generation", "Classification"],
    description: "Cost-effective LLM with good performance for mainstream tasks. Fast and affordable.",
    limitations: "Less capable at complex reasoning and prone to more errors than GPT-4.",
    imageUrl: "https://via.placeholder.com/150?text=GPT3.5"
  },
  {
    id: 9,
    name: "BERT",
    provider: "Google",
    type: "Language Understanding",
    cost: 1,
    speed: 5,
    accuracy: 3,
    useCase: ["Classification", "Named Entity Recognition", "Search"],
    description: "Efficient for text classification and understanding. Good for specific, well-defined language tasks.",
    limitations: "Not generative, limited context window, requires fine-tuning.",
    imageUrl: "https://via.placeholder.com/150?text=BERT"
  },
  {
    id: 10,
    name: "Mistral 7B",
    provider: "Mistral AI",
    type: "Large Language Model",
    cost: 1,
    speed: 5,
    accuracy: 3,
    useCase: ["Natural Language Processing", "Content Generation", "Edge Deployment"],
    description: "Efficient small model with strong performance for its size. Good for cost-sensitive applications.",
    limitations: "Less capable than larger models, especially for complex reasoning.",
    imageUrl: "https://via.placeholder.com/150?text=Mistral"
  }
];

export const useCases = [
  "Natural Language Processing",
  "Content Generation",
  "Code Generation",
  "Reasoning",
  "Document Analysis",
  "Image Generation",
  "Design",
  "Creative Content",
  "Image Understanding",
  "Local Deployment",
  "Transcription",
  "Translation",
  "Voice Applications",
  "Open Source Projects",
  "Customer Support",
  "Classification",
  "Named Entity Recognition",
  "Search",
  "Edge Deployment"
];

// Helper function to filter models based on requirements
export const filterModels = (requirements) => {
  const { useCase, minAccuracy, maxCost, minSpeed } = requirements;
  
  return aiModels.filter(model => {
    const useCaseMatch = !useCase || model.useCase.includes(useCase);
    const accuracyMatch = !minAccuracy || model.accuracy >= minAccuracy;
    const costMatch = !maxCost || model.cost <= maxCost;
    const speedMatch = !minSpeed || model.speed >= minSpeed;
    
    return useCaseMatch && accuracyMatch && costMatch && speedMatch;
  });
}; 