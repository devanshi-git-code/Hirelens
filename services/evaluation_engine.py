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


def evaluate_answer(question, answer, role):

    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

Target Role:
{role}

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer on these parameters:

1. Technical Correctness
2. Relevance
3. Explanation Quality
4. Completeness

Give each score from 0 to 10.

Also provide:
- Overall score out of 10
- Strengths
- Weaknesses
- Improvement suggestion

Return ONLY valid JSON.

Use exactly this format:

{{
    "technical_correctness": 0,
    "relevance": 0,
    "explanation_quality": 0,
    "completeness": 0,
    "overall_score": 0,
    "strengths": [],
    "weaknesses": [],
    "improvement_suggestion": ""
}}
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

        print("Answer Evaluation Error:", str(e))

        return {
            "error": str(e),
            "technical_correctness": 0,
            "relevance": 0,
            "explanation_quality": 0,
            "completeness": 0,
            "overall_score": 0,
            "strengths": [],
            "weaknesses": [],
            "improvement_suggestion": ""
        }