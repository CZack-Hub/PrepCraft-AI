import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            setError(err.message || "Registration failed")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading && !submitting) {
        return (
            <main className="auth-page">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className="ui-spinner" style={{ width: '36px', height: '36px' }} />
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/logo.svg" alt="PrepCraft AI Logo" width="48" height="48" style={{ borderRadius: '12px', filter: 'drop-shadow(0 6px 16px rgba(99, 102, 241, 0.4))', marginBottom: '0.25rem' }} />
                    <span className="brand-badge">PrepCraft AI</span>
                    <h1>Create Account</h1>
                    <p>Get personalized interview roadmaps tailored to your targets</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Full Name / Username</label>
                        <div className="input-wrapper">
                            <input
                                onChange={(e) => { setUsername(e.target.value) }}
                                value={username}
                                required
                                type="text"
                                id="username"
                                name="username"
                                placeholder="alex_dev"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <input
                                onChange={(e) => { setEmail(e.target.value) }}
                                value={email}
                                required
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@work.com"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                onChange={(e) => { setPassword(e.target.value) }}
                                value={password}
                                required
                                minLength={6}
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Create a strong password (6+ chars)"
                            />
                        </div>
                    </div>

                    <button disabled={submitting} className="button primary-button" type="submit">
                        {submitting ? (
                            <>
                                <span className="ui-spinner" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            'Get Started Free'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account?</span>
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </main>
    )
}

export default Register