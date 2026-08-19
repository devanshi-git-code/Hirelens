"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function InterviewPage() {
  const [sessionId, setSessionId] = useState("");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [role, setRole] = useState("Mock Interview");

  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const recognitionRef = useRef<any>(null);

  // --------------------------------------------------
  // GET SESSION ID FROM URL
  // Example:
  // http://localhost:3000/interview?session_id=YOUR_ID
  // --------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const id = params.get("session_id");

    if (id) {
      setSessionId(id);
      loadInterview(id);
    }
  }, []);

  // --------------------------------------------------
  // LOAD CURRENT QUESTION
  // --------------------------------------------------

  async function loadInterview(id: string) {
    try {
      const response = await fetch(
        `${API_URL}/interview/${id}`
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setCandidateName(data.candidate_name);
      setRole(data.role);
      setQuestion(data.current_question);
      setQuestionNumber(data.current_question_number);
      setTotalQuestions(data.total_questions);

      setTimeLeft(60);

      speakQuestion(data.current_question);

    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend.");
    }
  }

  // --------------------------------------------------
  // AI VOICE
  // --------------------------------------------------

  function speakQuestion(text: string) {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  // --------------------------------------------------
  // 60 SECOND TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!question || isEvaluating) {
      return;
    }

    if (timeLeft <= 0) {
      stopListening();

      if (answer.trim()) {
        submitAnswer();
      }

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft, question, isEvaluating]);

  // --------------------------------------------------
  // SPEECH RECOGNITION
  // --------------------------------------------------

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      setAnswer((previous) => {
        if (event.results[0].isFinal) {
          return previous + " " + transcript;
        }

        return previous + " " + transcript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  }

  // --------------------------------------------------
  // STOP MICROPHONE
  // --------------------------------------------------

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  }

  // --------------------------------------------------
  // SUBMIT ANSWER
  // --------------------------------------------------

  async function submitAnswer() {
    if (!answer.trim()) {
      alert("Please give an answer first.");
      return;
    }

    stopListening();

    window.speechSynthesis?.cancel();

    setIsEvaluating(true);

    try {
      const formData = new FormData();

      formData.append(
        "session_id",
        sessionId
      );

      formData.append(
        "answer",
        answer
      );

      const response = await fetch(
        `${API_URL}/submit-answer`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setIsEvaluating(false);
        return;
      }

      if (data.completed) {
        alert(
          "Interview completed successfully!"
        );

        return;
      }

      // Move to next adaptive question

      setQuestion(
        data.next_question
      );

      setQuestionNumber(
        data.question_number
      );

      setAnswer("");

      setTimeLeft(60);

      setIsEvaluating(false);

      // Speak next question
      setTimeout(() => {
        speakQuestion(
          data.next_question
        );
      }, 500);

    } catch (error) {
      console.error(error);

      alert(
        "Unable to submit answer. Please check that FastAPI is running."
      );

      setIsEvaluating(false);
    }
  }

  // --------------------------------------------------
  // TIMER FORMAT
  // --------------------------------------------------

  const minutes = Math.floor(
    timeLeft / 60
  );

  const seconds = timeLeft % 60;

  const formattedTime =
    `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">

          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                HireLens
              </h1>

              <p className="text-gray-500">
                AI Mock Interview
              </p>
            </div>

            <div className="text-right">

              <p className="font-semibold">
                {candidateName}
              </p>

              <p className="text-sm text-gray-500">
                {role}
              </p>

            </div>

          </div>

        </div>


        {/* QUESTION */}

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-5">

          <div className="flex justify-between items-center mb-6">

            <span className="text-sm font-medium text-gray-500">
              Question {questionNumber} of {totalQuestions}
            </span>

            <span className="text-sm font-semibold text-emerald-600">
              AI Interviewer
            </span>

          </div>


          <div className="bg-emerald-50 rounded-xl p-6">

            <p className="text-xl font-semibold text-gray-900 leading-relaxed">
              {question || "Loading question..."}
            </p>

          </div>


          {/* AI SPEAKING */}

          <div className="mt-5 text-center">

            {isSpeaking && (
              <p className="text-emerald-600 font-medium">
                🔊 AI is asking the question...
              </p>
            )}

            {!isSpeaking && question && (
              <button
                onClick={() =>
                  speakQuestion(question)
                }
                className="text-sm text-emerald-600 hover:underline"
              >
                🔊 Hear Question Again
              </button>
            )}

          </div>

        </div>


        {/* TIMER */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 text-center">

          <p className="text-sm text-gray-500 mb-2">
            Time Remaining
          </p>

          <div
            className={`text-5xl font-bold ${
              timeLeft <= 10
                ? "text-red-500"
                : "text-gray-900"
            }`}
          >
            {formattedTime}
          </div>

        </div>


        {/* ANSWER */}

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-lg font-semibold mb-4">
            Your Answer
          </h2>


          <div className="flex justify-center mb-5">

            {!isListening ? (

              <button
                onClick={startListening}
                disabled={isEvaluating}
                className="rounded-full w-20 h-20 bg-emerald-600 text-white text-3xl shadow-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                🎙
              </button>

            ) : (

              <button
                onClick={stopListening}
                className="rounded-full w-20 h-20 bg-red-500 text-white text-3xl shadow-lg"
              >
                ⏹
              </button>

            )}

          </div>


          <p className="text-center text-sm text-gray-500 mb-5">

            {isListening
              ? "Listening... Speak your answer."
              : "Click the microphone and start speaking."}

          </p>


          {/* TRANSCRIPT */}

          <div className="border rounded-xl p-4 min-h-[150px] bg-gray-50">

            <p className="text-xs text-gray-400 mb-2">
              Live Transcript
            </p>

            <p className="text-gray-700">
              {answer ||
                "Your spoken answer will appear here..."}
            </p>

          </div>


          {/* SUBMIT */}

          <button
            onClick={submitAnswer}
            disabled={
              !answer.trim() ||
              isEvaluating
            }
            className="w-full mt-5 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300"
          >

            {isEvaluating
              ? "Analyzing Your Answer..."
              : "Submit Answer"}

          </button>

        </div>

      </div>

    </main>
  );
}