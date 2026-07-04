import os
import openai

api_key = os.environ.get("OPENROUTER_API_KEY")
client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

try:
    response = client.chat.completions.create(
        model="gpt-oss-120b",
        messages=[{"role": "user", "content": "What is 2+2? output JSON only: {\"answer\": 4}"}],
    )
    print("SUCCESS")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"ERROR: {e}")
