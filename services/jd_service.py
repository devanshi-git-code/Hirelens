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


def match_resume_with_jd(resume_text, job_description):

    prompt = f"""
You are an expert technical recruiter.

Compare the candidate's resume with the given job description.

Return ONLY valid JSON.

Use exactly this format:

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "recommendations": []
}}

Candidate Resume:
{resume_text}

Job Description:
{job_description}
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

        print("JD Matching Error:", str(e))

        return {
            "error": str(e),
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "recommendations": []
        }