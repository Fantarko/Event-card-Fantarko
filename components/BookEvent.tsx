'use client'
import React, { useState } from 'react'

const BookEvent = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setError('')
    setLoading(true)

    try {
      // 🔥 ตรงนี้เอาไว้เชื่อม API จริง
      // await fetch('/api/book', { method: 'POST', body: JSON.stringify({ email }) })

      await new Promise((res) => setTimeout(res, 1000)) // mock

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id='book-event'>
      {submitted ? (
        <p className='text-sm text-green-600'>
          ✅ Thank you for signing up!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              className="input"
              required
            />
          </div>

          {/* ❌ error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="button-submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>

        </form>
      )}
    </div>
  )
}

export default BookEvent