import uuid


# Temporary in-memory interview sessions
interview_sessions = {}


# =========================================================
# CREATE INTERVIEW SESSION
# =========================================================

def create_session(
    candidate_name,
    role,
    difficulty,
    resume_text,
    job_description,
    questions
):

    session_id = str(uuid.uuid4())

    interview_sessions[session_id] = {
        "session_id": session_id,
        "candidate_name": candidate_name,
        "role": role,
        "difficulty": difficulty,
        "resume_text": resume_text,
        "job_description": job_description,

        # Interview questions
        "questions": questions,

        # Current question index
        "current_question": 0,

        # Candidate answers
        "answers": [],

        # AI evaluations
        "evaluations": [],

        # Overall scores
        "scores": [],

        # Interview completion status
        "completed": False
    }

    return interview_sessions[session_id]


# =========================================================
# GET SESSION
# =========================================================

def get_session(session_id):

    return interview_sessions.get(session_id)


# =========================================================
# SAVE ANSWER + EVALUATION
# =========================================================

def save_answer(
    session_id,
    answer,
    evaluation
):

    session = interview_sessions.get(session_id)

    if not session:
        return None

    # Save candidate answer
    session["answers"].append(answer)

    # Save Gemini evaluation
    session["evaluations"].append(evaluation)

    # Save overall score
    score = evaluation.get(
        "overall_score",
        0
    )

    session["scores"].append(score)

    # Move to next question
    session["current_question"] += 1

    # Mark interview completed after 10 questions
    if session["current_question"] >= 10:
        session["completed"] = True

    return session


# =========================================================
# GET CURRENT QUESTION
# =========================================================

def get_current_question(session_id):

    session = interview_sessions.get(session_id)

    if not session:
        return None

    index = session["current_question"]

    questions = session["questions"]

    if index >= len(questions):
        return None

    return questions[index]


# =========================================================
# GET INTERVIEW REPORT DATA
# =========================================================

def get_interview_report(session_id):

    session = interview_sessions.get(session_id)

    if not session:
        return None

    scores = session.get(
        "scores",
        []
    )

    evaluations = session.get(
        "evaluations",
        []
    )

    # -----------------------------------------
    # Calculate average scores
    # -----------------------------------------

    if scores:
        overall_score = round(
            sum(scores) / len(scores),
            2
        )
    else:
        overall_score = 0

    # -----------------------------------------
    # Category scores
    # -----------------------------------------

    technical_scores = []
    relevance_scores = []
    explanation_scores = []
    completeness_scores = []

    for evaluation in evaluations:

        technical_scores.append(
            evaluation.get(
                "technical_correctness",
                0
            )
        )

        relevance_scores.append(
            evaluation.get(
                "relevance",
                0
            )
        )

        explanation_scores.append(
            evaluation.get(
                "explanation_quality",
                0
            )
        )

        completeness_scores.append(
            evaluation.get(
                "completeness",
                0
            )
        )

    def average(values):

        if not values:
            return 0

        return round(
            sum(values) / len(values),
            2
        )

    category_scores = {
        "technical_correctness": average(
            technical_scores
        ),

        "relevance": average(
            relevance_scores
        ),

        "explanation_quality": average(
            explanation_scores
        ),

        "completeness": average(
            completeness_scores
        )
    }

    # -----------------------------------------
    # Collect strengths
    # -----------------------------------------

    strengths = []

    for evaluation in evaluations:

        for strength in evaluation.get(
            "strengths",
            []
        ):

            if strength not in strengths:
                strengths.append(strength)

    # -----------------------------------------
    # Collect weaknesses
    # -----------------------------------------

    weaknesses = []

    for evaluation in evaluations:

        for weakness in evaluation.get(
            "weaknesses",
            []
        ):

            if weakness not in weaknesses:
                weaknesses.append(weakness)

    # -----------------------------------------
    # Collect improvement suggestions
    # -----------------------------------------

    improvement_suggestions = []

    for evaluation in evaluations:

        suggestion = evaluation.get(
            "improvement_suggestion",
            ""
        )

        if (
            suggestion
            and suggestion not in improvement_suggestions
        ):
            improvement_suggestions.append(
                suggestion
            )

    # -----------------------------------------
    # Final report
    # -----------------------------------------

    return {
        "session_id": session["session_id"],
        "candidate_name": session["candidate_name"],
        "role": session["role"],

        "completed": session.get(
            "completed",
            False
        ),

        "total_questions": 10,

        "answered_questions": len(
            session["answers"]
        ),

        "overall_score": overall_score,

        "category_scores": category_scores,

        "strengths": strengths,

        "weaknesses": weaknesses,

        "improvement_suggestions":
            improvement_suggestions,

        "scores": scores
    }