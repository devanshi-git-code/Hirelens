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


def generate_interview_questions(
    resume_text,
    role,
    difficulty
):

    prompt = f"""
You are an expert technical interviewer.

Generate personalized interview questions for the candidate
based on their resume, target role and selected difficulty.
Difficulty Guidelines:

EASY:
- Suitable for freshers and beginners.
- Ask basic conceptual questions.
- Focus on definitions, fundamentals and simple practical understanding.
- Do not ask advanced internals, optimization or complex architecture questions.

MEDIUM:
- Suitable for placement-level candidates.
- Ask conceptual + practical questions.
- Questions may require explaining implementation choices, project decisions,
  basic debugging or real-world application.
- Avoid advanced internals and highly specialized concepts.

HARD:
- Ask advanced technical, scenario-based and problem-solving questions.
- Include optimization, architecture, trade-offs, internals and deeper concepts.
- Questions can require detailed technical reasoning.

IMPORTANT:
The selected difficulty MUST be strictly followed.

Selected Difficulty:
{difficulty}

Do not generate a HARD-level question when the selected difficulty is EASY or MEDIUM.

Candidate Level:
Assume the candidate is a college placement candidate / fresher unless
their resume clearly indicates significant professional experience.

Make questions appropriate for the candidate's actual experience level.

Target Role:
{role}

Difficulty:
{difficulty}

Candidate Resume:
{resume_text}

Generate questions from these categories:
1. Technical
2. Project
3. HR/Behavioral

Return ONLY valid JSON.

Use exactly this format:

{{
    "technical_questions": [],
    "project_questions": [],
    "hr_questions": []
}}

Generate:
- 5 technical questions
- 3 project-based questions
- 2 HR/behavioral questions

Questions should be relevant to the candidate's resume
and target role.
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

        print("Interview Question Generation Error:", str(e))

        return {
            "error": str(e),
            "technical_questions": [],
            "project_questions": [],
            "hr_questions": []
        }

def generate_next_question(
    resume_text,
    role,
    difficulty,
    previous_question,
    previous_answer,
    previous_score
):

    prompt = f"""
You are an expert AI technical interviewer conducting an adaptive
placement interview.

Generate ONE new interview question for the candidate.

Candidate Level:
College placement candidate / fresher unless the resume indicates
significant professional experience.

Target Role:
{role}

Required Difficulty:
{difficulty}

Candidate Resume:
{resume_text}

Previous Question:
{previous_question}

Previous Answer:
{previous_answer}

Previous Answer Score:
{previous_score}/10

IMPORTANT DIFFICULTY RULES:

EASY:
- Basic concepts
- Definitions
- Simple practical questions
- Fresher-friendly
- No advanced internals or complex architecture

MEDIUM:
- Placement-level conceptual and practical questions
- Application-based questions
- Basic debugging and implementation decisions
- Avoid highly advanced internals

HARD:
- Advanced technical reasoning
- Scenario-based questions
- Architecture
- Optimization
- Trade-offs
- Deeper concepts

The question MUST match the required difficulty.

ADAPTIVE RULE:
Use the previous answer to decide what concept should be explored next,
but the difficulty MUST remain exactly at the requested difficulty.

Do NOT repeat the previous question.

The question should be relevant to the candidate's resume and target role.

Return ONLY valid JSON.

Use exactly this format:

{{
    "question": "",
    "category": "",
    "difficulty": "{difficulty}"
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

        print("Next Question Generation Error:", str(e))

        return {
            "error": str(e),
            "question": "",
            "category": "",
            "difficulty": difficulty
        }