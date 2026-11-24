
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash"
]

working_model = None

for model in models:

    print(f"\nTesting {model}...")

    try:
        response = client.models.generate_content(
            model=model,
            contents="Reply with exactly: SajiloDocs is ready!"
        )

        if response.text:
            print("SUCCESS!")
            print("Response:", response.text)
            working_model = model
            break

    except Exception as error:
        print("FAILED:", str(error)[:250])

if working_model:
    print("\nWORKING MODEL:", working_model)
else:
    print("\nNo model responded successfully.")
