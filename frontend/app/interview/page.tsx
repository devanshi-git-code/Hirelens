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
  const [timerActive, setTimerActive] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const [questionSpeaking, setQuestionSpeaking] =
    useState(false);

  const recognitionRef = useRef<any>(null);

  const timeoutHandledRef = useRef(false);

  // --------------------------------------------------
  // IMPORTANT TIMER REF
  // Prevents timer from resetting when mic is restarted
  // --------------------------------------------------

  const timerStartedRef = useRef(false);

  // --------------------------------------------------
  // GET SESSION ID
  // --------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const id = params.get("session_id");

    if (id) {
      setSessionId(id);
      loadInterview(id);
    }
  }, []);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        console.log(
          "Recognition already stopped."
        );
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  // --------------------------------------------------
  // LOAD INTERVIEW
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

      setCandidateName(
        data.candidate_name || "Candidate"
      );

      setRole(
        data.role || "Mock Interview"
      );

      setQuestion(
        data.current_question || ""
      );

      setQuestionNumber(
        data.current_question_number || 1
      );

      setTotalQuestions(
        data.total_questions || 10
      );

      // Reset answer
      setAnswer("");

      // New question starts with fresh timer
      setTimeLeft(60);

      // Timer does NOT start automatically
      setTimerActive(false);

      setTimeUp(false);

      timeoutHandledRef.current = false;

      // IMPORTANT:
      // Timer has not started for this question yet
      timerStartedRef.current = false;

      // AI asks question first
      setQuestionSpeaking(true);

      if (data.current_question) {
        setTimeout(() => {
          speakQuestion(
            data.current_question,
            true
          );
        }, 300);
      } else {
        setQuestionSpeaking(false);
      }

    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to backend."
      );
    }
  }

  // --------------------------------------------------
  // AI VOICE
  // --------------------------------------------------

  function speakQuestion(
    text: string,
    isNewQuestion = false
  ) {
    if (!text) {
      return;
    }

    if (!window.speechSynthesis) {
      setQuestionSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // AI is speaking
    setQuestionSpeaking(true);

    // Only reset timer for a NEW question
    if (isNewQuestion) {
      setTimerActive(false);
      setTimeLeft(60);
      setTimeUp(false);

      timeoutHandledRef.current = false;

      // New question = timer can start once again
      timerStartedRef.current = false;
    }

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);

      // IMPORTANT:
      // Timer DOES NOT start here.
      //
      // Candidate must click microphone.
      setQuestionSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);

      setQuestionSpeaking(false);
    };

    window.speechSynthesis.speak(
      speech
    );
  }

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (
      !timerActive ||
      isEvaluating ||
      timeUp
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) => {

          if (previous <= 1) {
            return 0;
          }

          return previous - 1;
        }
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [
    timerActive,
    timeLeft,
    isEvaluating,
    timeUp
  ]);

  // --------------------------------------------------
  // START MICROPHONE
  // --------------------------------------------------

  function startListening() {

    // Cannot start while AI is asking
    if (questionSpeaking) {
      return;
    }

    if (
      isEvaluating ||
      timeUp
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );

      return;
    }

    // Stop previous recognition if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Previous recognition already stopped."
        );
      }
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {

      setIsListening(true);

      // =================================================
      // IMPORTANT TIMER LOGIC
      // =================================================
      //
      // First mic start:
      //      60 seconds starts
      //
      // Second mic start:
      //      remaining time continues
      //
      // NEVER reset to 60 on second click.
      //

      if (!timerStartedRef.current) {

        timerStartedRef.current = true;

        setTimerActive(true);

        setTimeLeft(
          (previous) =>
            previous > 0
              ? previous
              : 60
        );

        setTimeUp(false);

        timeoutHandledRef.current = false;
      }
      else {

        // Timer was already started earlier.
        // Just continue from remaining time.

        setTimerActive(true);
      }
    };

    recognition.onresult = (
      event: any
    ) => {

      let finalTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const result =
          event.results[i];

        const transcript =
          result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        }
      }

      if (
        finalTranscript.trim()
      ) {

        setAnswer((previous) => {

          const newText =
            finalTranscript.trim();

          if (!previous.trim()) {
            return newText;
          }

          return (
            previous.trim() +
            " " +
            newText
          );
        });
      }
    };

    recognition.onerror = (
      event: any
    ) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {

      setIsListening(false);

      // IMPORTANT:
      // Do NOT stop timer here.
      //
      // If user restarts mic, timer continues.
    };

    recognitionRef.current =
      recognition;

    try {

      recognition.start();

    } catch (error) {

      console.error(
        "Unable to start speech recognition:",
        error
      );

      setIsListening(false);
    }
  }

  // --------------------------------------------------
  // STOP MICROPHONE
  // --------------------------------------------------

  function stopListening() {

    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (error) {

        console.log(
          "Recognition already stopped."
        );
      }

      recognitionRef.current = null;
    }

    setIsListening(false);

    // =================================================
    // IMPORTANT:
    //
    // DO NOT:
    // setTimerActive(false)
    //
    // Timer should continue counting even when
    // microphone is temporarily turned off.
    // =================================================
  }

  // --------------------------------------------------
  // TIMEOUT
  // --------------------------------------------------

  function handleTimeout() {

    if (
      timeoutHandledRef.current
    ) {
      return;
    }

    timeoutHandledRef.current = true;

    stopListening();

    setTimerActive(false);

    window.speechSynthesis?.cancel();

    setTimeLeft(0);

    setTimeUp(true);

    // No automatic next question
  }

  // --------------------------------------------------
  // SUBMIT ANSWER
  // --------------------------------------------------

  async function submitAnswer(
    answerText?: string
  ) {

    let finalAnswer =
      answerText !== undefined
        ? answerText.trim()
        : answer.trim();

    // ------------------------------------------------
    // TIME UP WITHOUT ANSWER
    // ------------------------------------------------

    if (
      !finalAnswer &&
      timeUp
    ) {

      finalAnswer =
        "No answer provided. The candidate did not respond within the allotted time.";
    }

    // ------------------------------------------------
    // NORMAL EMPTY ANSWER
    // ------------------------------------------------

    if (!finalAnswer) {

      alert(
        "Please give an answer first."
      );

      return;
    }

    if (isEvaluating) {
      return;
    }

    if (!sessionId) {

      alert(
        "Interview session not found."
      );

      return;
    }

    // Stop timer
    setTimerActive(false);

    // Stop microphone
    stopListening();

    // Stop AI speech
    window.speechSynthesis?.cancel();

    setIsEvaluating(true);

    try {

      const formData =
        new FormData();

      formData.append(
        "session_id",
        sessionId
      );

      formData.append(
        "answer",
        finalAnswer
      );

      const response =
        await fetch(
          `${API_URL}/submit-answer`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(
        "Submit Answer Response:",
        data
      );

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Answer submission failed."
        );
      }

      if (data.error) {

        alert(
          data.error
        );

        setIsEvaluating(false);

        return;
      }

      // ------------------------------------------------
      // INTERVIEW COMPLETED
      // ------------------------------------------------

      if (data.completed) {

        window.location.href =
          `/report?session_id=${sessionId}`;

        return;
      }

      // ------------------------------------------------
      // NEXT QUESTION
      // ------------------------------------------------

      const nextQuestion =
        data.next_question;

      if (
        !nextQuestion ||
        !nextQuestion.trim()
      ) {

        console.error(
          "Next question missing:",
          data
        );

        alert(
          "The next question could not be generated. Please try again."
        );

        setIsEvaluating(false);

        return;
      }

      // ------------------------------------------------
      // RESET FOR NEXT QUESTION
      // ------------------------------------------------

      setQuestion(
        nextQuestion
      );

      setQuestionNumber(
        data.question_number ||
        questionNumber + 1
      );

      setAnswer("");

      // Fresh 60 seconds for NEW question
      setTimeLeft(60);

      // Timer stays stopped until mic starts
      setTimerActive(false);

      setTimeUp(false);

      timeoutHandledRef.current = false;

      // IMPORTANT:
      // New question gets a new timer cycle
      timerStartedRef.current = false;

      setQuestionSpeaking(true);

      setIsEvaluating(false);

      // ------------------------------------------------
      // AI SPEAKS NEXT QUESTION
      // ------------------------------------------------

      setTimeout(() => {

        speakQuestion(
          nextQuestion,
          true
        );

      }, 300);

    } catch (error) {

      console.error(
        "Submit error:",
        error
      );

      alert(
        "Unable to submit answer. Please check that FastAPI is running."
      );

      setIsEvaluating(false);
    }
  }

  // --------------------------------------------------
  // TIMER FORMAT
  // --------------------------------------------------

  const minutes =
    Math.floor(
      timeLeft / 60
    );

  const seconds =
    timeLeft % 60;

  const formattedTime =
    `${minutes
      .toString()
      .padStart(2, "0")}:${seconds
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

              {question ||
                "Loading question..."}

            </p>

          </div>

          {/* AI SPEAKING */}

          <div className="mt-5 text-center">

            {isSpeaking && (

              <p className="text-emerald-600 font-medium">

                🔊 AI is asking the question...

              </p>

            )}

            {!isSpeaking &&
              question &&
              !questionSpeaking && (

                <button
                  onClick={() =>
                    speakQuestion(
                      question,
                      false
                    )
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
              !timerActive
                ? "text-gray-400"
                : timeLeft <= 10
                ? "text-red-500"
                : "text-gray-900"
            }`}
          >

            {formattedTime}

          </div>

          {!timerActive &&
            !timeUp &&
            !questionSpeaking &&
            !isEvaluating && (

              <p className="text-gray-500 mt-2">

                🎙️ Click the microphone to start your timer

              </p>

            )}

          {questionSpeaking && (

            <p className="text-emerald-600 font-medium mt-2">

              🔊 AI is asking the question...

            </p>

          )}

          {timerActive && !timeUp && (

            <p className="text-emerald-600 font-medium mt-2">

              ⏱️ Timer running — answer the question

            </p>

          )}

          {timeUp && (

            <p className="text-red-500 font-medium mt-2">

              ⏰ Time's up. Submit your answer if you have one.

            </p>

          )}

        </div>

        {/* ANSWER */}

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-lg font-semibold mb-4">

            Your Answer

          </h2>

          {/* MICROPHONE */}

          <div className="flex justify-center mb-5">

            {!isListening ? (

              <button
                onClick={
                  startListening
                }
                disabled={
                  questionSpeaking ||
                  isEvaluating ||
                  timeUp
                }
                className="rounded-full w-20 h-20 bg-emerald-600 text-white text-3xl shadow-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >

                🎙️

              </button>

            ) : (

              <button
                onClick={
                  stopListening
                }
                disabled={
                  isEvaluating
                }
                className="rounded-full w-20 h-20 bg-red-500 text-white text-3xl shadow-lg"
              >

                ⏹️

              </button>

            )}

          </div>

          <p className="text-center text-sm text-gray-500 mb-5">

            {questionSpeaking
              ? "Please listen to the question..."

              : isListening
              ? "Listening... Speak your answer."

              : timeUp
              ? "Time has ended. Submit your answer."

              : timerActive
              ? "Timer is running. Speak your answer."

              : "Click the microphone to start your 60-second timer."}

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
            onClick={() =>
              submitAnswer()
            }
            disabled={
              (
                !answer.trim() &&
                !timeUp
              ) ||
              isEvaluating ||
              questionSpeaking
            }
            className="w-full mt-5 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >

            {isEvaluating

              ? "Analyzing Your Answer..."

              : timeUp && !answer.trim()

              ? "Submit — No Answer"

              : "Submit Answer"}

          </button>

        </div>

      </div>

    </main>
  );
}