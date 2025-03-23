#!/usr/bin/env python3
import argparse
import json
import httpx
import asyncio
import sys
from typing import List

async def run_benchmark(
    initial_prompt: str,
    models: List[str],
    num_questions: int = 5,
    api_url: str = "http://localhost:8000/benchmark"
):
    """Send a benchmark request to the API and display the results."""
    data = {
        "initial_prompt": initial_prompt,
        "models": models,
        "num_questions": num_questions
    }
    
    print("\n🔍 Running LLM benchmark...")
    print(f"🧠 Prompt: {initial_prompt}")
    print(f"🤖 Testing models: {', '.join(models)}")
    print(f"❓ Generating {num_questions} test questions\n")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(api_url, json=data, timeout=300)
            
            if response.status_code == 200:
                result = response.json()
                
                # Display questions
                print("\n📝 Generated questions:")
                for i, question in enumerate(result["questions"]):
                    print(f"{i+1}. {question}")
                
                # Display rankings
                print("\n🏆 Model rankings:")
                # Sort rankings by rank field
                sorted_rankings = sorted(result["rankings"], key=lambda x: x["rank"])
                for rank_info in sorted_rankings:
                    print(f"#{rank_info['rank']}: {rank_info['model']} - Score: {rank_info['score']}/10")
                    print(f"   Justification: {rank_info['justification']}")
                    print()
                
                # Ask if user wants to see detailed responses
                if input("\nDo you want to see detailed model responses? (y/n): ").lower() == 'y':
                    for i, question in enumerate(result["questions"]):
                        print(f"\n\nQuestion {i+1}: {question}")
                        
                        # Find all responses for this specific question
                        for model in models:
                            question_responses = [r for r in result["model_results"] 
                                                if r["model"] == model and r["question"] == question]
                            
                            if question_responses:
                                print(f"\n{model} response:")
                                print(f"{question_responses[0]['response']}")
                                print("-" * 80)                
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Error connecting to API: {str(e)}")
            print("Make sure the API server is running with 'uvicorn app:app --reload'")

def main():
    parser = argparse.ArgumentParser(description="LLM Benchmark Finder CLI")
    parser.add_argument("prompt", help="The initial problem prompt")
    parser.add_argument("--models", "-m", nargs="+", 
                        default=["openai/gpt-3.5-turbo", "anthropic/claude-instant-1", "mistralai/mistral-7b-instruct"],
                        help="List of model IDs to test (space-separated)")
    parser.add_argument("--questions", "-q", type=int, default=5,
                        help="Number of test questions to generate (default: 5)")
    parser.add_argument("--url", "-u", default="http://localhost:8000/benchmark",
                        help="API endpoint URL (default: http://localhost:8000/benchmark)")
    
    args = parser.parse_args()
    
    asyncio.run(run_benchmark(
        initial_prompt=args.prompt,
        models=args.models,
        num_questions=args.questions,
        api_url=args.url
    ))

if __name__ == "__main__":
    main() 