# LLM Benchmark Finder

A FastAPI backend that helps benchmark and evaluate different LLM models for a given problem using AI21 and OpenRouter.

## Features

- Generate test questions for any problem using AI21's Jamba model
- Test multiple LLM models via OpenRouter API with parallel processing for speed
- Rank and score model responses
- Return comprehensive results

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Add your AI21 API key and OpenRouter API key:
     ```
     AI21_API_KEY=your_ai21_api_key_here
     OPENROUTER_API_KEY=your_openrouter_api_key_here
     ```

## Running the API

Start the API server:

```bash
uvicorn app:app --reload
```

The server will be available at http://localhost:8000

## CLI Tool

The repository includes a command-line tool for running benchmarks without needing to use a REST client.

```bash
# Basic usage
./cli.py "Create a function to find the nth Fibonacci number"

# Specify models to test
./cli.py "Create a function to find the nth Fibonacci number" --models openai/gpt-4 anthropic/claude-3-opus

# Change number of questions
./cli.py "Create a function to find the nth Fibonacci number" --questions 3

# Full options
./cli.py --help
```

## API Documentation

Once the server is running, view the interactive API documentation at:
http://localhost:8000/docs

## Usage Example

Send a POST request to `/benchmark` endpoint with:

```json
{
  "initial_prompt": "Create a function to find the nth Fibonacci number",
  "num_questions": 10,
  "models": [
    "openai/gpt-3.5-turbo",
    "anthropic/claude-3-opus",
    "mistralai/mistral-large"
  ]
}
```

The response will include:
- Generated test questions
- Model responses for each question
- Rankings and scores for each model

## Performance

The API processes all model queries concurrently using asyncio. This means that testing multiple models with multiple questions is significantly faster than sequential processing, as all API requests to OpenRouter happen in parallel.

## Models

You can use any model ID supported by OpenRouter. See the [OpenRouter documentation](https://openrouter.ai/docs) for a list of available models. 

## Architecture

The application uses Maestro Model with OpenRouter for LLM benchmarking to evaluate model performance across different capabilities:

![LLM Benchmarking Architecture](/public/images/diagram.png)

This architecture allows us to:
- Route prompts through various LLM providers (GPT-4o, Claude 3.7 Sonnet, Llama-2)
- Evaluate performance on different tasks like language comprehension and logical reasoning
- Aggregate responses for comparative analysis
- Calculate metrics including accuracy, speed, and cost 