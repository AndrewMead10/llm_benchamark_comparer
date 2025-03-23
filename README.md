# AI Model Advisor

A modern web application for corporations to find the best AI models for their specific needs. This tool helps businesses compare different AI models based on cost, speed, accuracy, and other relevant factors.

## Architecture

The application uses Maestro Model with OpenRouter for LLM benchmarking to evaluate model performance across different capabilities:

![LLM Benchmarking Architecture](/public/images/diagram.png)

This architecture allows us to:
- Route prompts through various LLM providers (GPT-4o, Claude, Llama-2)
- Evaluate performance on different tasks like language comprehension and logical reasoning
- Aggregate responses for comparative analysis
- Calculate metrics including accuracy, speed, and cost

## Features

- **Intuitive UI**: Clean, modern interface for easy navigation
- **Detailed Filtering**: Filter AI models based on specific requirements
- **Visual Comparisons**: Compare models with interactive charts
- **Comprehensive Information**: Get detailed information about each AI model
- **Use Case Matching**: Find models that match your specific business needs

## Screenshots

![AI Model Advisor](https://via.placeholder.com/800x450?text=AI+Model+Advisor+Screenshot)

## Installation and Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/your-username/ai-model-advisor.git
cd ai-model-advisor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To build the app for production, run:

```bash
npm run build
```

The build files will be stored in the `build` directory.

## Technologies Used

- **React**: Frontend library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Chart.js**: JavaScript library for data visualization
- **Headless UI**: Unstyled, accessible UI components

## Future Enhancements

- Add user accounts to save preferences
- Implement more detailed model comparison tools
- Add case studies for each model
- Integrate with APIs to get real-time pricing information
- Add a recommendation engine based on more complex criteria

## License

MIT License - see the LICENSE file for details.

## Contact

For questions or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com) 