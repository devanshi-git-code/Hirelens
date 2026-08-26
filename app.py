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
    save_answer,
    get_interview_report
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

templates = Jinja2Templates(
    directory="templates"
)


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
# CANDIDATE DETAILS + RESUME
# JD IS OPTIONAL
# =========================================================

@app.post("/candidate")
async def submit_candidate(

    name: str = Form(...),

    email: str = Form(...),

    course: str = Form(...),

    role: str = Form(...),

    experience: str = Form(...),

    resume: UploadFile = File(...),

    job_description: str = Form("")
):

    # -----------------------------------------------------
    # CREATE UPLOADS FOLDER
    # -----------------------------------------------------

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    # -----------------------------------------------------
    # SAVE RESUME
    # -----------------------------------------------------

    file_path = os.path.join(
        "uploads",
        resume.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        content = await resume.read()

        buffer.write(content)

    # -----------------------------------------------------
    # EXTRACT RESUME TEXT
    # -----------------------------------------------------

    reader = PdfReader(
        file_path
    )

    resume_text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:

            resume_text += (
                page_text + "\n"
            )

    # -----------------------------------------------------
    # CLEAN OPTIONAL JD
    # -----------------------------------------------------

    job_description = (
        job_description.strip()
    )

    # -----------------------------------------------------
    # ANALYZE RESUME
    # -----------------------------------------------------

    analysis = analyze_resume(
        resume_text
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message":
            "Candidate details received successfully",

        "name":
            name,

        "email":
            email,

        "course":
            course,

        "role":
            role,

        "experience":
            experience,

        "resume":
            resume.filename,

        "resume_text":
            resume_text,

        "job_description":
            job_description,

        "jd_available":
            bool(job_description),

        "analysis":
            analysis
    }


# =========================================================
# JOB DESCRIPTION MATCHING
# =========================================================

@app.post("/match-jd")
async def match_jd(

    job_description: str = Form(...),

    resume: UploadFile = File(...)
):

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    file_path = os.path.join(
        "uploads",
        resume.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        content = await resume.read()

        buffer.write(content)

    reader = PdfReader(
        file_path
    )

    resume_text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:

            resume_text += (
                page_text + "\n"
            )

    result = match_resume_with_jd(
        resume_text,
        job_description
    )

    return {

        "message":
            "Resume and Job Description matched successfully",

        "resume":
            resume.filename,

        "analysis":
            result
    }


# =========================================================
# GENERATE INTERVIEW QUESTIONS
# =========================================================

@app.post("/generate-questions")
async def generate_questions(

    resume_text: str = Form(...),

    role: str = Form(...),

    difficulty: str = Form(...),

    job_description: str = Form("")
):

    result = generate_interview_questions(

        resume_text,

        role,

        difficulty,

        job_description
    )

    return {

        "message":
            "Interview questions generated successfully",

        "analysis":
            result
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

        "message":
            "Answer evaluated successfully",

        "evaluation":
            result
    }


# =========================================================
# ADAPTIVE DIFFICULTY TEST
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

        "message":
            "Next question difficulty decided successfully",

        "result":
            result
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

    job_description: str = Form("")
):

    # -----------------------------------------------------
    # CLEAN OPTIONAL JD
    # -----------------------------------------------------

    job_description = (
        job_description.strip()
    )

    # -----------------------------------------------------
    # GENERATE INITIAL QUESTIONS
    # -----------------------------------------------------

    question_data = generate_interview_questions(

        resume_text,

        role,

        difficulty,

        job_description
    )

    # -----------------------------------------------------
    # AI ERROR
    # -----------------------------------------------------

    if "error" in question_data:

        return {

            "message":
                "Unable to generate interview questions",

            "error":
                question_data["error"]
        }

    # -----------------------------------------------------
    # COMBINE QUESTIONS
    # -----------------------------------------------------

    questions = (

        question_data.get(
            "technical_questions",
            []
        )

        +

        question_data.get(
            "project_questions",
            []
        )

        +

        question_data.get(
            "hr_questions",
            []
        )
    )

    # -----------------------------------------------------
    # CURRENTLY 10 QUESTIONS
    # -----------------------------------------------------

    questions = questions[:10]

    if not questions:

        return {

            "message":
                "No interview questions were generated",

            "error":
                "AI did not return any questions."
        }

    # -----------------------------------------------------
    # CREATE SESSION
    # -----------------------------------------------------

    session = create_session(

        candidate_name,

        role,

        difficulty,

        resume_text,

        job_description,

        questions
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message":
            "Interview started successfully",

        "session_id":
            session["session_id"],

        "candidate_name":
            session["candidate_name"],

        "role":
            session["role"],

        "total_questions":
            len(questions),

        "current_question_number":
            1,

        "current_question":
            questions[0],

        "jd_available":
            bool(job_description),

        "completed":
            False
    }


# =========================================================
# GET CURRENT INTERVIEW QUESTION
# =========================================================

@app.get("/interview/{session_id}")
async def get_interview(
    session_id: str
):

    session = get_session(
        session_id
    )

    if not session:

        return {
            "error":
                "Interview session not found"
        }

    current_index = (
        session["current_question"]
    )

    questions = (
        session["questions"]
    )

    # -----------------------------------------------------
    # CHECK COMPLETION
    # -----------------------------------------------------

    if current_index >= len(
        questions
    ):

        return {

            "session_id":
                session["session_id"],

            "candidate_name":
                session["candidate_name"],

            "role":
                session["role"],

            "current_question_number":
                len(questions),

            "total_questions":
                len(questions),

            "current_question":
                None,

            "completed":
                True
        }

    # -----------------------------------------------------
    # CURRENT QUESTION
    # -----------------------------------------------------

    current_question = (
        questions[current_index]
    )

    return {

        "session_id":
            session["session_id"],

        "candidate_name":
            session["candidate_name"],

        "role":
            session["role"],

        "current_question_number":
            current_index + 1,

        "total_questions":
            len(questions),

        "current_question":
            current_question,

        "completed":
            False
    }


# =========================================================
# SUBMIT ANSWER
# EVALUATE → ADAPT → GENERATE NEXT QUESTION
# =========================================================

@app.post("/submit-answer")
async def submit_answer(

    session_id: str = Form(...),

    answer: str = Form(...)
):

    # -----------------------------------------------------
    # GET SESSION
    # -----------------------------------------------------

    session = get_session(
        session_id
    )

    if not session:

        return {

            "error":
                "Interview session not found"
        }

    # -----------------------------------------------------
    # CHECK ANSWER
    # -----------------------------------------------------

    if not answer.strip():

        return {

            "error":
                "Answer cannot be empty"
        }

    # -----------------------------------------------------
    # CURRENT INDEX
    # -----------------------------------------------------

    current_index = (
        session["current_question"]
    )

    questions = (
        session["questions"]
    )

    # -----------------------------------------------------
    # CHECK COMPLETION
    # -----------------------------------------------------

    if current_index >= len(
        questions
    ):

        return {

            "error":
                "Interview already completed"
        }

    # -----------------------------------------------------
    # CURRENT QUESTION
    # -----------------------------------------------------

    question = (
        questions[current_index]
    )

    # =====================================================
    # 1. EVALUATE ANSWER
    # =====================================================

    evaluation = evaluate_answer(

        question,

        answer,

        session["role"]
    )

    # -----------------------------------------------------
    # SCORE
    # -----------------------------------------------------

    score = evaluation.get(
        "overall_score",
        0
    )

    # =====================================================
    # 2. SAVE ANSWER
    # =====================================================

    save_answer(

        session_id,

        answer,

        evaluation
    )

    # =====================================================
    # 3. ADAPT DIFFICULTY
    # =====================================================

    adaptive_result = get_next_action(

        score,

        session["difficulty"]
    )

    next_difficulty = (
        adaptive_result.get(
            "next_difficulty",
            session["difficulty"]
        )
    )

    session["difficulty"] = (
        next_difficulty
    )

    # =====================================================
    # 4. CHECK COMPLETION
    # =====================================================

    completed = (

        session["current_question"]
        >= len(session["questions"])
    )

    # -----------------------------------------------------
    # IF LAST QUESTION
    # -----------------------------------------------------

    if completed:

        return {

            "message":
                "Interview completed successfully",

            "evaluation":
                evaluation,

            "current_score":
                score,

            "next_difficulty":
                next_difficulty,

            "next_question":
                None,

            "question_number":
                session["current_question"],

            "total_questions":
                len(session["questions"]),

            "completed":
                True
        }

    # =====================================================
    # 5. GENERATE NEXT QUESTION
    # =====================================================

    next_index = (
        session["current_question"]
    )

    next_question_data = (
        generate_next_question(

            session["resume_text"],

            session["role"],

            session["difficulty"],

            question,

            answer,

            score,

            session.get(
                "job_description",
                ""
            )
        )
    )

    generated_question = (
        next_question_data.get(
            "question",
            ""
        )
    )

    # =====================================================
    # 6. SAVE GENERATED QUESTION
    # =====================================================

    if generated_question.strip():

        next_question = (
            generated_question.strip()
        )

        # Put next question exactly
        # at the current session position
        session["questions"][
            next_index
        ] = next_question

    else:

        # Fallback question
        # prevents frontend from receiving blank question

        next_question = (
            session["questions"][
                next_index
            ]
        )

        print(
            "Warning: Adaptive question generation failed. "
            "Using fallback question."
        )

    # =====================================================
    # 7. FINAL RESPONSE
    # =====================================================

    return {

        "message":
            "Answer submitted successfully",

        "evaluation":
            evaluation,

        "current_score":
            score,

        "next_difficulty":
            next_difficulty,

        "next_question":
            next_question,

        "question_number":
            session["current_question"] + 1,

        "total_questions":
            len(session["questions"]),

        "completed":
            False
    }


# =========================================================
# INTERVIEW REPORT
# =========================================================

@app.get("/interview-report/{session_id}")
async def interview_report(
    session_id: str
):

    report = get_interview_report(
        session_id
    )

    if not report:

        return {

            "error":
                "Interview session not found"
        }

    return {

        "message":
            "Interview report generated successfully",

        "report":
            report
    }