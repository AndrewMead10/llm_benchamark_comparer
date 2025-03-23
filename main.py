import uvicorn
from app import app

# This is the entry point for the application
# You can run it directly with: python main.py

if __name__ == "__main__":
    print("Starting LLM Benchmark Finder API...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)