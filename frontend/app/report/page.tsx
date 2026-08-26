"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const API_URL =
  "http://127.0.0.1:8000";

type Report = {
  candidate_name: string;
  role: string;
  completed: boolean;
  total_questions: number;
  answered_questions: number;
  overall_score: number;

  category_scores: {
    technical_correctness: number;
    relevance: number;
    explanation_quality: number;
    completeness: number;
  };

  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];

  scores: number[];
};

export default function ReportPage() {

  const [report, setReport] =
    useState<Report | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // FETCH REPORT
  // =====================================================

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const sessionId =
      params.get("session_id");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(
      `${API_URL}/interview-report/${sessionId}`
    )
      .then((response) =>
        response.json()
      )
      .then((data) => {

        if (data.error) {

          console.error(
            data.error
          );

          setLoading(false);
          return;
        }

        setReport(data.report);

        setLoading(false);
      })
      .catch((error) => {

        console.error(
          "Report error:",
          error
        );

        setLoading(false);
      });

  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">

          <div className="text-5xl mb-4">
            📊
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Generating your report...
          </h1>

          <p className="text-gray-500 mt-2">
            Please wait while HireLens prepares your performance analysis.
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // REPORT NOT FOUND
  // =====================================================

  if (!report) {

    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-sm p-10 text-center max-w-md">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Report Not Found
          </h1>

          <p className="text-gray-500 mt-2">
            Please check the interview session and try again.
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // CATEGORY DATA
  // =====================================================

  const categoryData = [

    {
      name: "Technical",
      score:
        report.category_scores
          .technical_correctness,
    },

    {
      name: "Relevance",
      score:
        report.category_scores
          .relevance,
    },

    {
      name: "Explanation",
      score:
        report.category_scores
          .explanation_quality,
    },

    {
      name: "Completeness",
      score:
        report.category_scores
          .completeness,
    },

  ];

  // =====================================================
  // QUESTION DATA
  // =====================================================

  const questionData =
    report.scores.map(
      (score, index) => ({

        question:
          `Q${index + 1}`,

        score,

      })
    );

  // =====================================================
  // SCORE HELPERS
  // =====================================================

  function getScoreLabel(
    score: number
  ) {

    if (score >= 8) {
      return "Excellent";
    }

    if (score >= 6) {
      return "Good";
    }

    if (score >= 4) {
      return "Needs Improvement";
    }

    return "Needs Significant Improvement";
  }

  function getScoreMessage(
    score: number
  ) {

    if (score >= 8) {

      return "Strong overall interview performance.";

    }

    if (score >= 6) {

      return "Good performance with some areas that can be improved.";

    }

    if (score >= 4) {

      return "Some understanding was demonstrated, but more preparation is recommended.";

    }

    return "More preparation in core concepts is recommended before the next interview.";
  }

  // =====================================================
  // UI
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-100 p-4 md:p-8">

      <div className="max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                HireLens
              </h1>

              <p className="text-gray-500 mt-1">
                AI Interview Performance Report
              </p>

            </div>

            <div className="md:text-right">

              <h2 className="text-xl font-bold text-gray-900">
                {report.candidate_name}
              </h2>

              <p className="text-gray-500">
                {report.role}
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            COMPLETION STATUS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-7 md:p-8 mb-6 text-center">

          <div className="text-5xl mb-3">
            {report.completed
              ? "🎉"
              : "📋"}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">

            {report.completed
              ? "Interview Completed"
              : "Interview Report"}

          </h2>

          <p className="text-gray-500 mt-2">

            {report.answered_questions} of{" "}

            {report.total_questions}

            {" "}questions answered

          </p>

        </div>


        {/* =================================================
            TOP SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* OVERALL SCORE */}

          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm p-8 text-center">

            <p className="text-gray-500 font-medium">
              Overall Score
            </p>

            <div className="mt-4">

              <span className="text-6xl md:text-7xl font-bold text-emerald-600">

                {report.overall_score}

              </span>

              <span className="text-2xl text-gray-400 ml-1">
                /10
              </span>

            </div>

            <p className="mt-3 font-semibold text-gray-700">

              {getScoreLabel(
                report.overall_score
              )}

            </p>

            <p className="text-sm text-gray-500 mt-2">

              {getScoreMessage(
                report.overall_score
              )}

            </p>

          </div>


          {/* QUICK STATS */}

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">

            <div className="bg-white rounded-3xl shadow-sm p-6">

              <p className="text-sm text-gray-500">
                Questions
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {report.answered_questions}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                answered
              </p>

            </div>


            <div className="bg-white rounded-3xl shadow-sm p-6">

              <p className="text-sm text-gray-500">
                Completion
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">

                {report.total_questions > 0
                  ? Math.round(
                      (
                        report.answered_questions /
                        report.total_questions
                      ) * 100
                    )
                  : 0}%

              </p>

              <p className="text-sm text-gray-400 mt-1">
                interview completion
              </p>

            </div>


            <div className="bg-white rounded-3xl shadow-sm p-6">

              <p className="text-sm text-gray-500">
                Strongest Area
              </p>

              <p className="text-lg font-bold text-gray-900 mt-2">

                {
                  categoryData.reduce(
                    (best, current) =>
                      current.score >
                      best.score
                        ? current
                        : best
                  ).name
                }

              </p>

            </div>


            <div className="bg-white rounded-3xl shadow-sm p-6">

              <p className="text-sm text-gray-500">
                Areas Evaluated
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                4
              </p>

              <p className="text-sm text-gray-400 mt-1">
                performance dimensions
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            CATEGORY PERFORMANCE CHART
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <div className="mb-6">

            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              📊 Performance Breakdown
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Performance across the four evaluation dimensions.
            </p>

          </div>

          <div className="w-full h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={categoryData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[0, 10]}
                  ticks={[
                    0,
                    2,
                    4,
                    6,
                    8,
                    10,
                  ]}
                />

                <Tooltip
                  formatter={(
                    value
                  ) => [
                    `${Number(value).toFixed(1)}/10`,
                    "Score",
                  ]}
                />

                <Bar
                  dataKey="score"
                  fill="#10b981"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  maxBarSize={70}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =================================================
            QUESTION-WISE CHART
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <div className="mb-6">

            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              📈 Question-wise Performance
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Score progression across the interview questions.
            </p>

          </div>

          <div className="w-full h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={questionData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="question"
                />

                <YAxis
                  domain={[0, 10]}
                  ticks={[
                    0,
                    2,
                    4,
                    6,
                    8,
                    10,
                  ]}
                />

                <Tooltip
                  formatter={(
                    value
                  ) => [
                    `${Number(value).toFixed(1)}/10`,
                    "Score",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =================================================
            QUESTION SCORE CARDS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            🎯 Question-wise Scores
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

            {report.scores.map(
              (score, index) => {

                const scoreClass =
                  score >= 8
                    ? "text-emerald-600"
                    : score >= 5
                    ? "text-yellow-600"
                    : "text-red-500";

                return (

                  <div
                    key={index}
                    className="border rounded-2xl p-5 text-center hover:shadow-sm transition"
                  >

                    <p className="text-sm text-gray-500">
                      Question {index + 1}
                    </p>

                    <p
                      className={`text-2xl font-bold mt-2 ${scoreClass}`}
                    >
                      {score}
                      <span className="text-sm text-gray-400">
                        /10
                      </span>
                    </p>

                  </div>

                );

              }
            )}

          </div>

        </div>


        {/* =================================================
            STRENGTHS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-2xl">
              💪
            </div>

            <div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Strengths
              </h2>

              <p className="text-sm text-gray-500">
                Positive aspects identified during the interview.
              </p>

            </div>

          </div>

          {report.strengths.length > 0 ? (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {report.strengths.map(
                (strength, index) => (

                  <div
                    key={index}
                    className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4"
                  >

                    <div className="flex gap-3">

                      <span className="text-emerald-600">
                        ✓
                      </span>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {strength}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="text-gray-500">
              No strengths recorded yet.
            </p>

          )}

        </div>


        {/* =================================================
            AREAS TO IMPROVE
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-2xl">
              ⚠️
            </div>

            <div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Areas to Improve
              </h2>

              <p className="text-sm text-gray-500">
                Key areas that need more attention and practice.
              </p>

            </div>

          </div>

          {report.weaknesses.length > 0 ? (

            <div className="space-y-3">

              {report.weaknesses.map(
                (weakness, index) => (

                  <div
                    key={index}
                    className="bg-red-50 border border-red-100 rounded-2xl p-4"
                  >

                    <div className="flex gap-3">

                      <span className="text-red-500">
                        !
                      </span>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {weakness}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="text-gray-500">
              No major weaknesses recorded.
            </p>

          )}

        </div>


        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-2xl">
              💡
            </div>

            <div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Recommendations
              </h2>

              <p className="text-sm text-gray-500">
                Suggested next steps based on your interview performance.
              </p>

            </div>

          </div>

          {report.improvement_suggestions.length > 0 ? (

            <div className="space-y-3">

              {report.improvement_suggestions.map(
                (suggestion, index) => (

                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-100 rounded-2xl p-5"
                  >

                    <div className="flex gap-3">

                      <span className="text-blue-600 font-bold">
                        {index + 1}.
                      </span>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {suggestion}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="text-gray-500">
              No recommendations available yet.
            </p>

          )}

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="text-center text-gray-400 text-sm py-8">

          Generated by HireLens AI Interview System

        </div>

      </div>

    </main>
  );
}