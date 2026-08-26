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


# =========================================================
# GENERATE INITIAL INTERVIEW QUESTIONS
# =========================================================

def generate_interview_questions(
    resume_text,
    role,
    difficulty,
    job_description=""
):

    # Clean optional JD
    job_description = job_description.strip()

    # -----------------------------------------------------
    # JD CONTEXT
    # -----------------------------------------------------

    if job_description:

        jd_context = f"""
Job Description:
{job_description}

Use the Job Description together with the candidate's resume
and target role to make the interview relevant to the position.
"""

    else:

        jd_context = """
Job Description:
Not provided.

The candidate has not provided a Job Description.
Generate questions using the candidate's resume and target role.
Do not assume a specific company or job description.
"""

    # -----------------------------------------------------
    # PROMPT
    # -----------------------------------------------------

    prompt = f"""
You are an expert technical interviewer conducting a
Computer Science placement interview.

Generate personalized interview questions based on:

1. Candidate Resume
2. Target Role
3. Job Description, if provided
4. Selected Difficulty

{jd_context}

IMPORTANT:
If the Job Description is not provided, do NOT invent one.
Use the candidate's resume and target role instead.

=========================================================
DIFFICULTY GUIDELINES
=========================================================

EASY:
- Suitable for freshers and beginners.
- Ask basic conceptual questions.
- Focus on definitions, fundamentals and simple practical understanding.
- Do not ask advanced internals, optimization or complex architecture questions.

MEDIUM:
- Suitable for placement-level candidates.
- Ask conceptual + practical questions.
- Questions may require explaining implementation choices,
  project decisions, basic debugging or real-world application.
- Avoid advanced internals and highly specialized concepts.

HARD:
- Ask advanced technical, scenario-based and problem-solving questions.
- Include optimization, architecture, trade-offs, internals and deeper concepts.
- Questions can require detailed technical reasoning.

IMPORTANT:
The selected difficulty MUST be strictly followed.

Selected Difficulty:
{difficulty}

Do NOT generate a HARD-level question when the selected
difficulty is EASY or MEDIUM.

=========================================================
CANDIDATE LEVEL
=========================================================

Assume the candidate is a college placement candidate /
fresher unless their resume clearly indicates significant
professional experience.

Make questions appropriate for the candidate's actual
experience level.

=========================================================
TARGET ROLE
=========================================================

{role}

=========================================================
CANDIDATE RESUME
=========================================================

{resume_text}

=========================================================
QUESTION CATEGORIES
=========================================================

Generate questions from:

1. Technical
2. Project
3. HR/Behavioral

For a Computer Science placement candidate, technical
questions may cover relevant core concepts such as:

- Data Structures and Algorithms
- Object-Oriented Programming
- Operating Systems
- DBMS
- SQL
- Computer Networks
- Software Engineering
- Programming fundamentals

Only ask concepts that are reasonably relevant to the
candidate's resume and target role.

=========================================================
QUESTION QUALITY
=========================================================

Questions should:

- Be clear and understandable.
- Be appropriate for a fresher/placement candidate.
- Be relevant to the resume and target role.
- Avoid unnecessarily difficult wording.
- Avoid asking the same concept repeatedly.
- Avoid extremely advanced questions unless difficulty is HARD.
- Prefer practical understanding over memorization.

IMPORTANT ADAPTIVE BEHAVIOR:

If the candidate later says things such as:

"I don't know"
"I am not sure"
"I have no idea"
"I am not familiar with this"

the interviewer should NOT assume that the candidate understands
the topic.

Instead, the adaptive interviewer should normally move to a
different relevant topic rather than repeatedly asking deeper
questions about the same unknown concept.

=========================================================
OUTPUT
=========================================================

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

Questions should be relevant to the candidate's resume,
target role and Job Description when a Job Description
is provided.
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

        print(
            "Interview Question Generation Error:",
            str(e)
        )

        return {
            "error": str(e),
            "technical_questions": [],
            "project_questions": [],
            "hr_questions": []
        }


# =========================================================
# GENERATE NEXT ADAPTIVE QUESTION
# =========================================================

def generate_next_question(
    resume_text,
    role,
    difficulty,
    previous_question,
    previous_answer,
    previous_score,
    job_description=""
):

    # Clean optional JD
    job_description = job_description.strip()

    # -----------------------------------------------------
    # JD CONTEXT
    # -----------------------------------------------------

    if job_description:

        jd_context = f"""
Job Description:
{job_description}

Use this Job Description when deciding whether the next
question is relevant to the target role.
"""

    else:

        jd_context = """
Job Description:
Not provided.

Use the candidate's resume and target role to determine
the next relevant question.
"""

    # -----------------------------------------------------
    # CHECK WHETHER CANDIDATE DOES NOT KNOW
    # -----------------------------------------------------

    answer_lower = previous_answer.strip().lower()

    dont_know_phrases = [
        "i don't know",
        "i dont know",
        "don't know",
        "dont know",
        "i am not sure",
        "i'm not sure",
        "not sure",
        "no idea",
        "i have no idea",
        "not familiar",
        "i am not familiar"
    ]

    candidate_does_not_know = any(
        phrase in answer_lower
        for phrase in dont_know_phrases
    )

    if candidate_does_not_know:

        adaptive_instruction = """
The candidate explicitly indicated that they do not know
or are not familiar with the previous topic.

IMPORTANT:
Do NOT ask a deeper follow-up question on the same topic.

Move to a DIFFERENT relevant topic from the candidate's
resume, target role or Job Description.

Do not say that the candidate is familiar with the topic.
"""

    else:

        adaptive_instruction = """
Use the previous answer and score to decide whether the
next question should explore a related concept, move to
another concept, or become slightly more challenging.

Do not repeat the previous question.
Avoid unnecessary repetition of the same topic.
"""

    # -----------------------------------------------------
    # PROMPT
    # -----------------------------------------------------

    prompt = f"""
You are an expert AI technical interviewer conducting an
adaptive Computer Science placement interview.

Generate ONE new interview question.

=========================================================
CANDIDATE
=========================================================

Candidate Level:
College placement candidate / fresher unless the resume
indicates significant professional experience.

Target Role:
{role}

Required Difficulty:
{difficulty}

Candidate Resume:
{resume_text}

{jd_context}

=========================================================
PREVIOUS INTERACTION
=========================================================

Previous Question:
{previous_question}

Previous Answer:
{previous_answer}

Previous Answer Score:
{previous_score}/10

=========================================================
ADAPTIVE RULE
=========================================================

{adaptive_instruction}

=========================================================
DIFFICULTY RULES
=========================================================

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

The question MUST match the required difficulty:

{difficulty}

=========================================================
QUESTION QUALITY
=========================================================

The next question should:

- Be clear and understandable.
- Be appropriate for a fresher.
- Be relevant to the resume and target role.
- Use the Job Description when available.
- Avoid repeating the previous question.
- Avoid repeatedly testing a topic the candidate explicitly
  said they do not know.
- Prefer useful interview practice over unnecessarily difficult
  questions.

=========================================================
OUTPUT
=========================================================

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

        print(
            "Next Question Generation Error:",
            str(e)
        )

        return {
            "error": str(e),
            "question": "",
            "category": "",
            "difficulty": difficulty
        }