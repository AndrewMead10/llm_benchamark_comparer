import os

from ai21 import AI21Client

import dotenv
dotenv.load_dotenv()

client = AI21Client(api_key=os.getenv('AI21_API_KEY'))

response = client.beta.maestro.runs.create_and_poll(
    model='jamba-large',
    tools=[{"type": "web_search"}],
    input='How many fp8 tflops does the nvidia b200 have?'
)

print(response)