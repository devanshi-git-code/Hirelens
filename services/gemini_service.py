import os
import json

from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Read API key
API_KEY = os.getenv("GEMINI_API_KEY")

# Create Gemini client
client = genai.Client(api_key=API_KEY)


def analyze_resume(resume_text):

    prompt = f"""
You are an expert technical recruiter.

Analyze the following resume.

Return ONLY valid JSON.

The JSON format should be:

{{
    "candidate_name": "",
    "skills": [],
    "projects": [],
    "internships": [],
    "technologies": [],
    "resume_claims": []
}}

Resume:

{resume_text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        clean_text = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        return json.loads(clean_text)

    except Exception as e:

        print("Gemini Error:", str(e))

        return {
            "error": str(e),
            "candidate_name": "",
            "skills": [],
            "projects": [],
            "internships": [],
            "technologies": [],
            "resume_claims": []
        }