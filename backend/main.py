from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
import os
import random
import re

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
print(f"🔑 API Key loaded: {'Yes' if api_key else 'No'}")

model = None
model_name = None

if api_key:
    genai.configure(api_key=api_key)
    
    # Try available models in order of preference
    available_models = [
        "models/gemini-2.0-flash",  # Fast and efficient
        "models/gemini-2.0-flash-001",  # Stable version
        "models/gemini-2.0-flash-lite",  # Lightweight
        "models/gemini-2.0-pro-exp",  # Pro version
        "models/gemini-flash-latest",  # Latest flash
        "models/gemini-pro-latest",  # Latest pro
    ]
    
    for test_model in available_models:
        try:
            model = genai.GenerativeModel(test_model)
            # Test with a simple prompt
            response = model.generate_content("Say hello")
            model_name = test_model
            print(f"✅ Model '{test_model}' initialized successfully")
            break
        except Exception as e:
            print(f"❌ Failed with '{test_model}': {e}")
            continue
    
    if not model:
        print("❌ No working model found!")
else:
    print("❌ No API key found!")

def clean_ai_response(text: str) -> str:
    """Clean up AI response to get a single clean quote"""
    if not text:
        return "Inspiration comes to those who seek it."
    
    # Remove markdown bold formatting
    text = text.replace("**", "")
    
    # Remove option patterns like "Option 1:", "**Option 1**", etc.
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        # Skip lines that are clearly option headers
        if re.match(r'^(Option\s*\d+|#+|[-*]\s*Option)', line, re.IGNORECASE):
            continue
        # Skip lines that are just punctuation or very short
        if len(line) > 10 and not line.startswith('>') and not line.startswith('#'):
            cleaned_lines.append(line)
    
    # If we have multiple lines, try to find the best one
    if cleaned_lines:
        # Prefer lines that look like complete quotes (have punctuation, reasonable length)
        best_line = max(cleaned_lines, key=lambda x: len(x) if any(p in x for p in '.!?') else 0)
        return best_line.strip('"').strip("'").strip()
    
    # Fallback: clean the original text
    text = re.sub(r'Option\s*\d+[:\-]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'^[#>\-*]\s*', '', text)
    text = text.strip('"').strip("'").strip()
    
    # If still problematic, return a simple version
    if len(text) > 200 or text.count('\n') > 2:
        return "The greatest glory is not in never falling, but in rising every time we fall."
    
    return text

@app.get("/")
def root():
    return {"message": "AI Quote Generator API is running!"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model else "error",
        "model_ready": model is not None,
        "model_name": model_name
    }

@app.get("/quote")
def get_ai_quote(category: str = "motivation"):
    if not model:
        raise HTTPException(
            status_code=500, 
            detail="AI service not available. Please check server logs."
        )
    
    try:
        # More specific prompts that request single quotes without options
        prompts = {
            "motivation": [
                "Generate ONE single, original motivational quote about perseverance. Make it concise, inspiring, and avoid markdown formatting. Just provide the quote text itself.",
                "Create ONE unique motivational saying about overcoming challenges. Return only the quote text without any numbering, options, or markdown.",
                "Write ONE inspirational quote about success and determination. Provide only the clean text of the quote.",
                "Generate ONE powerful motivational quote. Return just the quote text, no additional formatting or options."
            ],
            "success": [
                "Generate ONE quote about achieving true success. Return only the clean text without markdown or multiple options.",
                "Create ONE saying about the journey to success. Provide just the quote text.",
                "Write ONE quote about what success really means. No formatting, just the text.",
                "Generate ONE insight about success. Return only the quote text."
            ],
            "life": [
                "Generate ONE philosophical life quote. Return clean text only, no markdown.",
                "Create ONE wisdom saying about life. Just the quote text.",
                "Write ONE reflective quote about human existence. No formatting.",
                "Generate ONE life insight. Return only the text."
            ],
            "wisdom": [
                "Generate ONE piece of wisdom. Clean text only, no markdown.",
                "Create ONE thoughtful saying. Just the quote text.",
                "Write ONE insightful quote. No formatting or options.",
                "Generate ONE wisdom quote. Return only the text."
            ],
            "creativity": [
                "Generate ONE quote about creativity. Clean text only.",
                "Create ONE saying about imagination. Just the text.",
                "Write ONE inspirational creativity quote. No markdown.",
                "Generate ONE insight about innovation. Text only."
            ],
            "perseverance": [
                "Generate ONE quote about perseverance. Clean text only.",
                "Create ONE saying about resilience. Just the text.",
                "Write ONE powerful perseverance quote. No formatting.",
                "Generate ONE insight about persistence. Text only."
            ],
            "love": [
                "Generate ONE quote about love. Clean text only.",
                "Create ONE saying about relationships. Just the text.",
                "Write ONE beautiful love quote. No markdown.",
                "Generate ONE insight about love. Text only."
            ],
            "inspiration": [
                "Generate ONE inspirational quote. Clean text only.",
                "Create ONE uplifting saying. Just the text.",
                "Write ONE hopeful quote. No formatting.",
                "Generate ONE positive insight. Text only."
            ]
        }
        
        category_prompts = prompts.get(category, prompts["motivation"])
        selected_prompt = random.choice(category_prompts)
        
        generation_config = genai.types.GenerationConfig(
            temperature=0.9,
            top_p=0.8,
            top_k=40,
            max_output_tokens=100,
        )
        
        response = model.generate_content(
            selected_prompt,
            generation_config=generation_config
        )
        
        # Clean up the response
        raw_text = response.text.strip()
        cleaned_text = clean_ai_response(raw_text)
        
        return {"quote": cleaned_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")