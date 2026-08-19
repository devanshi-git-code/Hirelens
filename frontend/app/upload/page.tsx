'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a resume first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()

    formData.append('name', 'Candidate')
    formData.append('email', 'candidate@example.com')
    formData.append('course', 'B.Tech')
    formData.append('role', 'Software Developer')
    formData.append('experience', 'Fresher')
    formData.append('resume', file)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/candidate',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Resume analysis failed.'
        )
      }

      setResult(data)

    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-[500px]">

        <h1 className="text-3xl font-bold mb-3">
          Upload Your Resume
        </h1>

        <p className="text-gray-500 mb-8">
          Upload your resume to begin AI analysis.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">

          <p className="text-gray-500">
            Drag & Drop Resume Here
          </p>

          <p className="text-sm text-gray-400 my-4">
            or
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null
              setFile(selectedFile)
              setError('')
            }}
          />

          {file && (
            <p className="mt-4 text-sm text-emerald-600">
              Selected: {file.name}
            </p>
          )}

        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full mt-8 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
        </button>

        {error && (
          <p className="mt-4 text-red-600 text-sm">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 p-5 bg-emerald-50 rounded-xl">

            <h2 className="text-xl font-bold mb-4">
              Resume Analysis
            </h2>

            {result.analysis?.candidate_name && (
              <p className="mb-3">
                <strong>Candidate:</strong>{' '}
                {result.analysis.candidate_name}
              </p>
            )}

            <h3 className="font-semibold mt-4">
              Skills
            </h3>

            <p className="text-sm text-gray-600">
              {result.analysis?.skills?.join(', ') || 'Not available'}
            </p>

            <h3 className="font-semibold mt-4">
              Technologies
            </h3>

            <p className="text-sm text-gray-600">
              {result.analysis?.technologies?.join(', ') || 'Not available'}
            </p>

            <h3 className="font-semibold mt-4">
              Projects
            </h3>

            <p className="text-sm text-gray-600">
              {result.analysis?.projects?.join(', ') || 'Not available'}
            </p>

          </div>
        )}

      </div>

    </div>
  )
}