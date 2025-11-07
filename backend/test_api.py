import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {'Yes' if api_key else 'No'}")

if api_key:
    genai.configure(api_key=api_key)
    
    # Test the models that are actually available
    model_names = [
        "models/gemini-2.0-flash",
        "models/gemini-2.0-flash-001", 
        "models/gemini-2.0-flash-lite",
        "models/gemini-2.0-pro-exp",
        "models/gemini-flash-latest",
        "models/gemini-pro-latest",
    ]
    
    for model_name in model_names:
        try:
            print(f"\nTrying model: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Generate a very short motivational quote about success.")
            print(f"✅ SUCCESS with {model_name}")
            print(f"Quote: {response.text}")
            break  # Stop at first successful model
        except Exception as e:
            print(f"❌ FAILED with {model_name}: {e}")
else:
    print("No API key found")