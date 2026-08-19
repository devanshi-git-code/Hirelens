from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from services.gemini_service import analyze_resume
from services.jd_service import match_resume_with_jd
from services.evaluation_engine import evaluate_answer
from services.adaptive_engine import get_next_action

from services.interview_session import (
    create_session,
    get_session,
    save_answer
)

from services.interview_service import (
    generate_interview_questions,
    generate_next_question
)

import os
from pypdf import PdfReader


# =========================================================
# CREATE FASTAPI APPLICATION
# =========================================================

app = FastAPI(title="HireLens")


# =========================================================
# CORS - CONNECT NEXT.JS FRONTEND
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# TEMPLATES
# =========================================================

templates = Jinja2Templates(directory="templates")


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# =========================================================
# HOME PAGE
# =========================================================

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="home.html"
    )


# =========================================================
# CANDIDATE DETAILS PAGE
# =========================================================

@app.get("/candidate")
def candidate_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="candidate.html"
    )


# =========================================================
# COMMUNICATION PRACTICE PAGE
# =========================================================

@app.get("/communication")
def communication_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="communication.html"
    )


# =========================================================
# RESUME UPLOAD + RESUME ANALYSIS
# =========================================================

@app.post("/candidate")
async def submit_candidate(
    name: str = Form(...),
    email: str = Form(...),
    course: str = Form(...),
    role: str = Form(...),
    experience: str = Form(...),
    resume: UploadFile = File(...)
):

    # Create uploads folder
    os.makedirs("uploads", exist_ok=True)

    # Save uploaded resume
    file_path = os.path.join(
        "uploads",
        resume.filename
    )

    with open(file_path, "wb") as buffer:
        content = await resume.read()
        buffer.write(content)

    # Read PDF
    reader = PdfReader(file_path)

    resume_text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            resume_text += page_text + "\n"

    # Analyze resume using Gemini
    analysis = analyze_resume(resume_text)

    return {
        "message": "Resume uploaded successfully",
        "name": name,
        "email": email,
        "course": course,
        "role": role,
        "experience": experience,
        "resume": resume.filename,
        "resume_text": resume_text,
        "analysis": analysis
    }


# =========================================================
# JOB DESCRIPTION MATCHING
# =========================================================

@app.post("/match-jd")
async def match_jd(
    job_description: str = Form(...),
    resume: UploadFile = File(...)
):

    # Create uploads folder
    os.makedirs("uploads", exist_ok=True)

    # Save uploaded resume
    file_path = os.path.join(
        "uploads",
        resume.filename
    )

    with open(file_path, "wb") as buffer:
        content = await resume.read()
        buffer.write(content)

    # Extract resume text
    reader = PdfReader(file_path)

    resume_text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            resume_text += page_text + "\n"

    # Match resume with job description
    result = match_resume_with_jd(
        resume_text,
        job_description
    )

    return {
        "message": "Resume and Job Description matched successfully",
        "resume": resume.filename,
        "analysis": result
    }


# =========================================================
# GENERATE INTERVIEW QUESTIONS
# =========================================================

@app.post("/generate-questions")
async def generate_questions(
    resume_text: str = Form(...),
    role: str = Form(...),
    difficulty: str = Form(...)
):

    result = generate_interview_questions(
        resume_text,
        role,
        difficulty
    )

    return {
        "message": "Interview questions generated successfully",
        "analysis": result
    }


# =========================================================
# EVALUATE SINGLE ANSWER
# =========================================================

@app.post("/evaluate-answer")
async def evaluate_candidate_answer(
    question: str = Form(...),
    answer: str = Form(...),
    role: str = Form(...)
):

    result = evaluate_answer(
        question,
        answer,
        role
    )

    return {
        "message": "Answer evaluated successfully",
        "evaluation": result
    }


# =========================================================
# ADAPTIVE DIFFICULTY TEST ENDPOINT
# =========================================================

@app.post("/next-question")
async def next_question(
    score: float = Form(...),
    current_difficulty: str = Form(...)
):

    result = get_next_action(
        score,
        current_difficulty
    )

    return {
        "message": "Next question difficulty decided successfully",
        "result": result
    }


# =========================================================
# START FULL MOCK INTERVIEW
# =========================================================

@app.post("/start-interview")
async def start_interview(
    candidate_name: str = Form(...),
    role: str = Form(...),
    difficulty: str = Form(...),
    resume_text: str = Form(...),
    job_description: str = Form(...)
):

    # Generate initial personalized questions
    question_data = generate_interview_questions(
        resume_text,
        role,
        difficulty
    )

    # Check for AI error
    if "error" in question_data:
        return {
            "message": "Unable to generate interview questions",
            "error": question_data["error"]
        }

    # Combine question categories
    questions = (
        question_data.get("technical_questions", [])
        + question_data.get("project_questions", [])
        + question_data.get("hr_questions", [])
    )

    # Limit interview to 10 questions
    questions = questions[:10]

    if not questions:
        return {
            "message": "No interview questions were generated"
        }

    # Create interview session
    session = create_session(
        candidate_name,
        role,
        difficulty,
        resume_text,
        job_description,
        questions
    )

    return {
        "message": "Interview started successfully",
        "session_id": session["session_id"],
        "candidate_name": session["candidate_name"],
        "role": session["role"],
        "total_questions": 10,
        "current_question_number": 1,
        "current_question": questions[0],
        "completed": False
    }


# =========================================================
# GET CURRENT INTERVIEW SESSION
# =========================================================

@app.get("/interview/{session_id}")
async def get_interview(session_id: str):

    session = get_session(session_id)

    if not session:
        return {
            "error": "Interview session not found"
        }

    current_index = session["current_question"]
    questions = session["questions"]

    # Interview completed
    if current_index >= 10:
        return {
            "session_id": session["session_id"],
            "candidate_name": session["candidate_name"],
            "role": session["role"],
            "current_question_number": 10,
            "total_questions": 10,
            "current_question": None,
            "completed": True
        }

    current_question = questions[current_index]

    return {
        "session_id": session["session_id"],
        "candidate_name": session["candidate_name"],
        "role": session["role"],
        "current_question_number": current_index + 1,
        "total_questions": 10,
        "current_question": current_question,
        "completed": False
    }


# =========================================================
# SUBMIT ANSWER
# EVALUATE → ADAPT → GENERATE NEW QUESTION
# =========================================================

@app.post("/submit-answer")
async def submit_answer(
    session_id: str = Form(...),
    answer: str = Form(...)
):

    # Get interview session
    session = get_session(session_id)

    if not session:
        return {
            "error": "Interview session not found"
        }

    # Check empty answer
    if not answer.strip():
        return {
            "error": "Answer cannot be empty"
        }

    # Current question index
    current_index = session["current_question"]

    # Interview already completed
    if current_index >= 10:
        return {
            "error": "Interview already completed"
        }

    # Get current question
    question = session["questions"][current_index]

    # -----------------------------------------------------
    # 1. EVALUATE ANSWER
    # -----------------------------------------------------

    evaluation = evaluate_answer(
        question,
        answer,
        session["role"]
    )

    score = evaluation.get(
        "overall_score",
        0
    )

    # -----------------------------------------------------
    # 2. SAVE ANSWER + EVALUATION
    # -----------------------------------------------------

    save_answer(
        session_id,
        answer,
        evaluation
    )

    # -----------------------------------------------------
    # 3. ADAPTIVE DIFFICULTY
    # -----------------------------------------------------

    adaptive_result = get_next_action(
        score,
        session["difficulty"]
    )

    next_difficulty = adaptive_result.get(
        "next_difficulty",
        session["difficulty"]
    )

    session["difficulty"] = next_difficulty

    # -----------------------------------------------------
    # 4. CHECK COMPLETION
    # -----------------------------------------------------

    completed = (
        session["current_question"] >= 10
    )

    next_question = None

    # -----------------------------------------------------
    # 5. GENERATE NEXT QUESTION
    # -----------------------------------------------------

    if not completed:

        next_index = session["current_question"]

        next_question_data = generate_next_question(
            session["resume_text"],
            session["role"],
            session["difficulty"],
            question,
            answer,
            score
        )

        generated_question = next_question_data.get(
            "question",
            ""
        )

        # -------------------------------------------------
        # FALLBACK
        # If Gemini fails, use the existing question
        # instead of sending an empty question to frontend.
        # -------------------------------------------------

        if generated_question.strip():

            next_question = generated_question

            session["questions"][next_index] = (
                generated_question
            )

        else:

            # Use already generated question as fallback
            next_question = session["questions"][next_index]

            print(
                "Warning: Adaptive question generation failed."
                " Using fallback question."
            )

    # -----------------------------------------------------
    # 6. FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "message": "Answer submitted successfully",
        "evaluation": evaluation,
        "current_score": score,
        "next_difficulty": next_difficulty,
        "next_question": next_question,
        "question_number": (
            session["current_question"]
            if completed
            else session["current_question"] + 1
        ),
        "total_questions": 10,
        "completed": completed
    }