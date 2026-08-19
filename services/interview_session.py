import uuid


# Temporary in-memory interview sessions
interview_sessions = {}


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
        "questions": questions,
        "current_question": 0,
        "answers": [],
        "evaluations": [],
        "scores": []
    }

    return interview_sessions[session_id]


def get_session(session_id):
    return interview_sessions.get(session_id)


def save_answer(session_id, answer, evaluation):

    session = interview_sessions.get(session_id)

    if not session:
        return None

    session["answers"].append(answer)
    session["evaluations"].append(evaluation)

    score = evaluation.get("overall_score", 0)
    session["scores"].append(score)

    session["current_question"] += 1

    return session


def get_current_question(session_id):

    session = interview_sessions.get(session_id)

    if not session:
        return None

    index = session["current_question"]

    questions = session["questions"]

    if index >= len(questions):
        return None

    return questions[index]