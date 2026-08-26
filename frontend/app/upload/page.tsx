'use client'

import {
  useState,
} from 'react'

const API_URL =
  'http://127.0.0.1:8000'

export default function UploadPage() {

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [course, setCourse] =
    useState('')

  const [role, setRole] =
    useState('')

  const [experience, setExperience] =
    useState('fresher')

  const [difficulty, setDifficulty] =
    useState('EASY')

  const [file, setFile] =
    useState<File | null>(null)

  const [jobDescription, setJobDescription] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [status, setStatus] =
    useState('')

  async function handleStartInterview(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setError('')
    setStatus('')

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!name.trim()) {
      setError(
        'Please enter your full name.'
      )
      return
    }

    if (!email.trim()) {
      setError(
        'Please enter your email.'
      )
      return
    }

    if (!course.trim()) {
      setError(
        'Please enter your course / branch.'
      )
      return
    }

    if (!role.trim()) {
      setError(
        'Please enter your target job role.'
      )
      return
    }

    if (!file) {
      setError(
        'Please upload your resume PDF.'
      )
      return
    }

    // ---------------------------------------------
    // PDF CHECK
    // ---------------------------------------------

    if (
      file.type !==
        'application/pdf' &&
      !file.name
        .toLowerCase()
        .endsWith('.pdf')
    ) {

      setError(
        'Please upload a valid PDF resume.'
      )

      return
    }

    setLoading(true)

    try {

      // =================================================
      // STEP 1
      // SEND CANDIDATE + RESUME + OPTIONAL JD
      // =================================================

      setStatus(
        'Uploading resume and preparing your profile...'
      )

      const candidateForm =
        new FormData()

      candidateForm.append(
        'name',
        name.trim()
      )

      candidateForm.append(
        'email',
        email.trim()
      )

      candidateForm.append(
        'course',
        course.trim()
      )

      candidateForm.append(
        'role',
        role.trim()
      )

      candidateForm.append(
        'experience',
        experience
      )

      candidateForm.append(
        'resume',
        file
      )

      // JD is optional
      candidateForm.append(
        'job_description',
        jobDescription.trim()
      )

      const candidateResponse =
        await fetch(
          `${API_URL}/candidate`,
          {
            method: 'POST',
            body: candidateForm,
          }
        )

      const candidateData =
        await candidateResponse.json()

      if (
        !candidateResponse.ok
      ) {

        throw new Error(
          candidateData?.detail ||
          candidateData?.error ||
          'Unable to process candidate details.'
        )
      }

      // ---------------------------------------------
      // RESUME TEXT FROM BACKEND
      // ---------------------------------------------

      const resumeText =
        candidateData.resume_text

      if (
        !resumeText ||
        !resumeText.trim()
      ) {

        throw new Error(
          'Could not extract text from your resume. Please upload a text-based PDF.'
        )
      }

      // =================================================
      // STEP 2
      // CREATE INTERVIEW SESSION
      // =================================================

      setStatus(
        'Generating your personalized interview...'
      )

      const interviewForm =
        new FormData()

      interviewForm.append(
        'candidate_name',
        name.trim()
      )

      interviewForm.append(
        'role',
        role.trim()
      )

      interviewForm.append(
        'difficulty',
        difficulty
      )

      interviewForm.append(
        'resume_text',
        resumeText
      )

      // Optional JD
      interviewForm.append(
        'job_description',
        jobDescription.trim()
      )

      const interviewResponse =
        await fetch(
          `${API_URL}/start-interview`,
          {
            method: 'POST',
            body: interviewForm,
          }
        )

      const interviewData =
        await interviewResponse.json()

      if (
        !interviewResponse.ok
      ) {

        throw new Error(
          interviewData?.detail ||
          interviewData?.error ||
          'Unable to start interview.'
        )
      }

      if (
        interviewData.error
      ) {

        throw new Error(
          interviewData.error
        )
      }

      // ---------------------------------------------
      // SESSION ID AUTOMATICALLY RECEIVED
      // ---------------------------------------------

      const sessionId =
        interviewData.session_id

      if (!sessionId) {

        throw new Error(
          'Interview session could not be created.'
        )
      }

      // Save candidate info locally
      // for frontend continuity.
      localStorage.setItem(
        'hirelens_candidate',
        JSON.stringify({
          name,
          email,
          course,
          role,
          experience,
          difficulty,
          resumeName:
            file.name,
          jdAvailable:
            Boolean(
              jobDescription.trim()
            ),
        })
      )

      // =================================================
      // STEP 3
      // AUTOMATICALLY OPEN INTERVIEW
      // =================================================

      setStatus(
        'Interview ready. Starting...'
      )

      window.location.href =
        `/interview?session_id=${encodeURIComponent(
          sessionId
        )}`

    } catch (err: any) {

      console.error(
        'Start interview error:',
        err
      )

      setError(
        err?.message ||
        'Something went wrong. Please make sure FastAPI is running.'
      )

      setLoading(false)
      setStatus('')
    }

  }

  return (

    <main className="min-h-screen bg-gray-100 px-4 py-8 md:py-12">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white text-2xl font-bold shadow-lg">
            H
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
            Candidate Details
          </h1>

          <p className="text-gray-500 mt-2">
            Tell us about yourself so HireLens can personalize your interview.
          </p>

        </div>


        {/* FORM CARD */}

        <form
          onSubmit={
            handleStartInterview
          }
          className="bg-white rounded-3xl shadow-sm p-6 md:p-8"
        >

          {/* PERSONAL DETAILS */}

          <div className="mb-8">

            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAME */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />

              </div>


              {/* COURSE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course / Branch
                </label>

                <input
                  type="text"
                  value={course}
                  onChange={(e) =>
                    setCourse(
                      e.target.value
                    )
                  }
                  placeholder="Example: B.Tech CSE"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />

              </div>


              {/* ROLE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Role
                </label>

                <input
                  type="text"
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value
                    )
                  }
                  placeholder="Example: Software Developer"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />

              </div>


              {/* EXPERIENCE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>

                <select
                  value={experience}
                  onChange={(e) =>
                    setExperience(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >

                  <option value="fresher">
                    Fresher
                  </option>

                  <option value="internship">
                    Internship Experience
                  </option>

                  <option value="0-1">
                    0–1 Year
                  </option>

                  <option value="1-3">
                    1–3 Years
                  </option>

                </select>

              </div>


              {/* DIFFICULTY */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >

                  <option value="EASY">
                    Easy
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HARD">
                    Hard
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* RESUME */}

          <div className="mb-8">

            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Resume
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-8 text-center hover:border-emerald-400 transition">

              <div className="text-4xl mb-3">
                📄
              </div>

              <p className="font-medium text-gray-800">
                Upload your resume
              </p>

              <p className="text-sm text-gray-500 mt-1">
                PDF format only
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {

                  const selectedFile =
                    e.target.files?.[0] ||
                    null

                  setFile(
                    selectedFile
                  )

                  setError('')

                }}
                className="mt-5 block w-full text-sm text-gray-500"
                required
              />

              {file && (

                <div className="mt-4 bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700">

                  ✓ Selected:
                  {' '}
                  {file.name}

                </div>

              )}

            </div>

          </div>


          {/* JOB DESCRIPTION */}

          <div className="mb-8">

            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Job Description
              <span className="text-gray-400 font-normal text-sm ml-2">
                (Optional)
              </span>
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              It is advisable to upload or provide a job description for better and more personalized interview practice.
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(
                  e.target.value
                )
              }
              placeholder="Paste the job description here..."
              rows={7}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />

            <p className="text-xs text-gray-400 mt-2">
              You can leave this blank if a job description is not available.
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">
              ⚠️ {error}
            </div>

          )}


          {/* STATUS */}

          {status && (

            <div className="mb-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl p-4 text-sm">
              ⏳ {status}
            </div>

          )}


          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >

            {loading
              ? 'Preparing Your Interview...'
              : '🚀 Start Interview'}

          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your resume is processed to personalize your interview.
          </p>

        </form>

      </div>

    </main>
  )
}