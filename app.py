import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx
import asyncio
import dotenv
import json
from ai21 import AI21Client

# Load environment variables
dotenv.load_dotenv()

# Initialize AI21 client
ai21_client = AI21Client(api_key=os.getenv('AI21_API_KEY'))

# Initialize OpenRouter client
openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
if not openrouter_api_key:
    raise ValueError("OPENROUTER_API_KEY environment variable not set")

app = FastAPI(title="LLM Benchmark Finder")

# Define request and response models
class BenchmarkRequest(BaseModel):
    initial_prompt: str = Field(..., description="The user's initial problem description")
    num_questions: int = Field(10, description="Number of test questions to generate")
    models: List[str] = Field(..., description="List of OpenRouter model IDs to test")


class ModelResult(BaseModel):
    model: str
    response: str
    question: str  # Added to track which question this response is for
    score: Optional[float] = None


class BenchmarkResponse(BaseModel):
    questions: List[str]
    model_results: List[ModelResult]
    rankings: List[Dict[str, Any]]


async def generate_test_questions(prompt: str, num_questions: int = 10) -> List[str]:
    """Generate test questions using AI21's Maestro model."""
    system_prompt = "You are a helpful AI assistant that generates diverse and challenging test questions in a json format."
    user_prompt = f"""
    Given the following problem description, generate {num_questions} specific, diverse test questions to evaluate language models:
    
    PROBLEM DESCRIPTION: {prompt}
    
    Your response should be an array of strings, each representing a question. It should be parsable, valid json. Do not include anything else other than the array of questions.

    Example response:
    [
        "What is the capital of France?",
        "What is the capital of Germany?",
        "What is the capital of Italy?",
        "What is the capital of Spain?",
    ]
    """
    
    try:
        response = ai21_client.beta.maestro.runs.create_and_poll(
            model='jamba-large',
            system=system_prompt,
            input=user_prompt
        )
        
        # Extract questions from the response
        result_text = response.result

        print(result_text)

        # Parse the result text into a list of questions
        questions = json.loads(result_text) 
        
        # Ensure we have exactly the requested number of questions
        return questions[:num_questions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")


async def test_with_openrouter(model: str, question: str) -> str:
    """Send a question to a specific model via OpenRouter API."""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {openrouter_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": question}
        ]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"OpenRouter API error: {response.text}"
            )
        
        response_data = response.json()
        return response_data["choices"][0]["message"]["content"]


async def rank_responses(questions: List[str], model_results: List[ModelResult]) -> List[Dict[str, Any]]:
    """Use AI21 to rank the responses from different models."""
    system_prompt = """
    You are an expert at evaluating language model responses. Rank the given model responses based on:
    1. Accuracy and correctness
    2. Completeness of the answer
    3. Clarity and coherence
    4. Relevance to the question
    """
    
    # Group results by model
    model_responses = {}
    for result in model_results:
        if result.model not in model_responses:
            model_responses[result.model] = []
        model_responses[result.model].append(result)
    
    # Create a prompt for AI21 to rank the models
    user_prompt = "I need you to evaluate and rank the following language models based on their responses to a set of questions.\n\n"
    
    # Organize responses by question
    for i, question in enumerate(questions):
        user_prompt += f"QUESTION {i+1}: {question}\n\n"
        
        # Find all model responses for this specific question
        for model_name in model_responses.keys():
            question_responses = [r for r in model_responses[model_name] if r.question == question]
            if question_responses:
                user_prompt += f"MODEL ({model_name}): {question_responses[0].response}\n\n"
                
        user_prompt += "---\n\n"
    
    user_prompt += """
    Please analyze all responses and provide:
    1. A ranking of the models from best to worst
    2. A score for each model on a scale of 1-10
    3. Brief justification for each ranking
    
    Format your response as a JSON array with objects containing "rank", "model", "score", and "justification" fields.
    """
    
    try:
        response = ai21_client.beta.maestro.runs.create_and_poll(
            model='jamba-large',
            system=system_prompt,
            input=user_prompt
        )
        
        # Extract rankings from the response
        result_text = response.result
        
        # The response might contain JSON formatting, let's try to evaluate it
        import json
        import re
        
        # Find JSON array in the text
        json_match = re.search(r'\[\s*{.*}\s*\]', result_text, re.DOTALL)
        if json_match:
            rankings = json.loads(json_match.group())
        else:
            # Fallback to a simpler format if JSON parsing fails
            rankings = []
            for model in model_responses.keys():
                rankings.append({
                    "model": model,
                    "rank": len(rankings) + 1,
                    "score": 5.0,  # Default score
                    "justification": "Automatic ranking fallback"
                })
        
        return rankings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rank responses: {str(e)}")


async def process_model_question(model: str, question: str) -> ModelResult:
    """Process a single model-question pair and return the result."""
    try:
        response = await test_with_openrouter(model, question)
        return ModelResult(model=model, response=response, question=question)
    except Exception as e:
        print(f"Error testing model {model} with question '{question[:30]}...': {str(e)}")
        # Return a placeholder response in case of error
        return ModelResult(
            model=model, 
            response=f"Error: Failed to get response from this model. {str(e)}",
            question=question
        )


@app.post("/benchmark", response_model=BenchmarkResponse)
async def create_benchmark(request: BenchmarkRequest):
    """
    Run a benchmark test for LLMs given a problem prompt.
    1. Generate test questions using AI21
    2. Test each model with the questions using OpenRouter
    3. Rank the model responses using AI21
    """
    # Step 1: Generate test questions
    questions = await generate_test_questions(request.initial_prompt, request.num_questions)
    
    # Step 2: Test models with questions concurrently
    tasks = []
    
    # Create tasks for all model-question pairs
    for model in request.models:
        for question in questions:
            tasks.append(process_model_question(model, question))
    
    # Run all tasks concurrently
    model_results = await asyncio.gather(*tasks)
    
    # Step 3: Rank the model responses
    rankings = await rank_responses(questions, model_results)
    
    # Update the scores in model_results based on rankings
    for result in model_results:
        for ranking in rankings:
            if ranking["model"] == result.model:
                result.score = ranking.get("score")
    
    return BenchmarkResponse(
        questions=questions,
        model_results=model_results,
        rankings=rankings
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 