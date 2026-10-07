import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports, deleteReport } = useInterview()
    const { user, handleLogout, handleDeleteAccount } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ selectedJdFile, setSelectedJdFile ] = useState(null)
    const [ error, setError ] = useState("")
    const [ generating, setGenerating ] = useState(false)
    const [ deletingReportId, setDeletingReportId ] = useState(null)
    const [ reportToDelete, setReportToDelete ] = useState(null)
    const [ showAccountModal, setShowAccountModal ] = useState(false)
    const [ deletingAccount, setDeletingAccount ] = useState(false)
    const resumeInputRef = useRef(null)
    const jdInputRef = useRef(null)

    const navigate = useNavigate()

    const handleResumeChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                setError("Please select a PDF file for your resume.")
                e.target.value = ""
                setSelectedFile(null)
                return
            }
            setError("")
            setSelectedFile(file)
        }
    }

    const handleRemoveResume = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const handleJdFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                setError("Please select a PDF file for the job description.")
                e.target.value = ""
                setSelectedJdFile(null)
                return
            }
            setError("")
            setSelectedJdFile(file)
        }
    }

    const handleRemoveJdFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedJdFile(null)
        if (jdInputRef.current) {
            jdInputRef.current.value = ""
        }
    }

    const handleGenerateReport = async () => {
        setError("")

        if (!jobDescription.trim() && !selectedJdFile) {
            setError("Please provide a target job description (upload a PDF or paste text).")
            return
        }

        if (!selectedFile && !selfDescription.trim()) {
            setError("Please provide your profile (upload a resume PDF or enter a self-description).")
            return
        }

        setGenerating(true)
        try {
            const data = await generateReport({
                jobDescription,
                jobDescriptionFile: selectedJdFile,
                selfDescription,
                resumeFile: selectedFile
            })

            if (data?._id) {
                navigate(`/interview/${data._id}`)
            } else {
                setError("Failed to create interview strategy. Please try again.")
            }
        } catch (err) {
            setError(err.message || "Failed to generate interview strategy. Please try again.")
        } finally {
            setGenerating(false)
        }
    }

    const confirmDeleteReport = async () => {
        if (!reportToDelete) return
        setDeletingReportId(reportToDelete._id)
        try {
            await deleteReport(reportToDelete._id)
            setReportToDelete(null)
        } catch (err) {
            setError(err.message || "Failed to delete interview strategy.")
        } finally {
            setDeletingReportId(null)
        }
    }

    const confirmDeleteAccount = async () => {
        setDeletingAccount(true)
        try {
            await handleDeleteAccount()
            setShowAccountModal(false)
            navigate("/register")
        } catch (err) {
            setError(err.message || "Failed to delete account.")
            setDeletingAccount(false)
        }
    }

    if (loading && !generating && !deletingReportId && !deletingAccount) {
        return (
            <main className='loading-screen'>
                <div className='loading-pulse'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h1>Loading your interview workspace...</h1>
                <p>Retrieving your tailored preparation plans</p>
            </main>
        )
    }

    return (
        <div className='home-page'>
            {/* Top Navigation Bar */}
            <header className='home-nav'>
                <div className='home-nav__brand'>
                    <img src="/logo.svg" alt="PrepCraft AI Logo" className='brand-logo-img' width="34" height="34" />
                    <span className='brand-title'>PrepCraft AI</span>
                </div>

                <div className='home-nav__user'>
                    {user && (
                        <div className='user-chip'>
                            <div className='avatar-circle'>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span>Signed in as <strong>{user.username}</strong></span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowAccountModal(true)}
                        className='delete-account-btn'
                        title="Delete account and all saved plans"
                    >
                        Delete Account
                    </button>
                    <button onClick={handleLogout} className='logout-btn'>
                        Logout
                    </button>
                </div>
            </header>

            <div className='main-container'>
                {/* Hero Header */}
                <div className='page-header'>
                    <span className='hero-pill'>⚡ Next-Gen Interview Preparation</span>
                    <h1>Create Your Custom <span className='highlight'>Interview Strategy</span></h1>
                    <p>Let our AI evaluate requirements, uncover hidden skill gaps, and generate your 7-day preparation roadmap.</p>
                </div>

                {error && (
                    <div style={{
                        width: '100%',
                        maxWidth: '900px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#fca5a5',
                        padding: '0.85rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.875rem'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Symmetrical Setup Card */}
                <div className='interview-card'>
                    <div className='interview-card__body'>

                        {/* Left Panel: Target Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </span>
                                <h2>Target Job Description</h2>
                                <span className='badge badge--required'>Required</span>
                            </div>

                            {/* Upload Job Description PDF */}
                            <div className='upload-section'>
                                <div className='section-label'>
                                    <span>Upload JD PDF</span>
                                    <span className='badge badge--best'>Direct Parse</span>
                                </div>
                                <label className='dropzone' htmlFor='jdFile'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                    </span>
                                    {selectedJdFile ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <p className='dropzone__title' style={{ color: '#34d399' }}>📄 {selectedJdFile.name}</p>
                                            <p className='dropzone__subtitle'>{(selectedJdFile.size / 1024).toFixed(1)} KB &bull; PDF</p>
                                            <button
                                                type='button'
                                                onClick={handleRemoveJdFile}
                                                style={{
                                                    marginTop: '0.4rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#f87171',
                                                    cursor: 'pointer',
                                                    fontSize: '0.785rem',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='dropzone__title'>Upload Job Description PDF</p>
                                            <p className='dropzone__subtitle'>Click or drag &amp; drop (Max 5MB)</p>
                                        </>
                                    )}
                                    <input
                                        ref={jdInputRef}
                                        onChange={handleJdFileChange}
                                        hidden
                                        type='file'
                                        id='jdFile'
                                        name='jdFile'
                                        accept='.pdf,application/pdf'
                                    />
                                </label>
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'><span>OR</span></div>

                            {/* Paste Job Description */}
                            <div>
                                <div className='section-label'>
                                    <span>Paste Text Description</span>
                                </div>
                                <textarea
                                    id='jobDescription'
                                    value={jobDescription}
                                    onChange={(e) => { setJobDescription(e.target.value) }}
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Paste job posting text, qualifications, and requirements here..."
                                    maxLength={5000}
                                />
                                <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                                </span>
                                <p>Provide the job description as a <strong>PDF upload</strong>, <strong>pasted text</strong>, or both.</p>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel: Candidate Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <h2>Your Profile &amp; Experience</h2>
                                <span className='badge badge--required'>Required</span>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <div className='section-label'>
                                    <span>Upload Resume</span>
                                    <span className='badge badge--best'>Highest Accuracy</span>
                                </div>
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    {selectedFile ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <p className='dropzone__title' style={{ color: '#34d399' }}>📄 {selectedFile.name}</p>
                                            <p className='dropzone__subtitle'>{(selectedFile.size / 1024).toFixed(1)} KB &bull; PDF</p>
                                            <button
                                                type='button'
                                                onClick={handleRemoveResume}
                                                style={{
                                                    marginTop: '0.4rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#f87171',
                                                    cursor: 'pointer',
                                                    fontSize: '0.785rem',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='dropzone__title'>Upload Your Resume PDF</p>
                                            <p className='dropzone__subtitle'>Click or drag &amp; drop (Max 5MB)</p>
                                        </>
                                    )}
                                    <input
                                        ref={resumeInputRef}
                                        onChange={handleResumeChange}
                                        hidden
                                        type='file'
                                        id='resume'
                                        name='resume'
                                        accept='.pdf,application/pdf'
                                    />
                                </label>
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'><span>OR</span></div>

                            {/* Quick Self-Description */}
                            <div>
                                <div className='section-label'>
                                    <span>Quick Self-Description</span>
                                </div>
                                <textarea
                                    value={selfDescription}
                                    onChange={(e) => { setSelfDescription(e.target.value) }}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Summarize your key skills, tech stack, and years of experience..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                                </span>
                                <p>Either a <strong>Resume PDF</strong> or a <strong>Self Description</strong> is used to tailor question answers.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer Action Bar */}
                    <div className='interview-card__footer'>
                        <div className='footer-info'>
                            <span className='status-dot' />
                            <span>AI Engine Ready &bull; Analysis &amp; 7-Day Roadmap generation</span>
                        </div>
                        <button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className='generate-btn'
                        >
                            {generating ? (
                                <>
                                    <span className='ui-spinner' />
                                    <span>Crafting Interview Strategy...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                                    <span>Generate My Interview Strategy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Recent Plans Dashboard */}
                {reports.length > 0 && (
                    <section className='recent-reports'>
                        <div className='section-header'>
                            <h2>Your Saved Interview Strategies</h2>
                            <span>{reports.length} {reports.length === 1 ? 'plan' : 'plans'} generated</span>
                        </div>
                        <div className='reports-grid'>
                            {reports.map(report => (
                                <div
                                    key={report._id}
                                    className='report-card'
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                >
                                    <div className='report-card__top'>
                                        <h3>{report.title || 'Untitled Target Role'}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className={`score-badge ${report.matchScore >= 80 ? 'score-badge--high' : report.matchScore >= 60 ? 'score-badge--mid' : 'score-badge--low'}`}>
                                                {report.matchScore}% Match
                                            </span>
                                            <button
                                                title="Delete this saved strategy"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setReportToDelete(report)
                                                }}
                                                className='delete-report-btn'
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className='report-card__bottom'>
                                        <span>Generated on {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className='card-arrow'>
                                            <span>View Plan</span>
                                            <span>&rarr;</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer Links */}
                <footer className='page-footer'>
                    <a href='#'>Privacy Policy</a>
                    <a href='#'>Terms of Service</a>
                    <a href='#'>Documentation</a>
                </footer>
            </div>

            {/* Modal: Confirm Delete Strategy */}
            {reportToDelete && (
                <div className='modal-overlay' onClick={() => setReportToDelete(null)}>
                    <div className='modal-card' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-card__header'>
                            <div className='danger-icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </div>
                            <h3>Delete Interview Strategy?</h3>
                        </div>
                        <div className='modal-card__body'>
                            <p>Are you sure you want to delete the strategy for <strong>"{reportToDelete.title || 'Untitled Position'}"</strong>?</p>
                            <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.825rem' }}>This action will permanently remove questions, answers, and the preparation roadmap.</p>
                        </div>
                        <div className='modal-card__actions'>
                            <button
                                className='btn-cancel'
                                onClick={() => setReportToDelete(null)}
                                disabled={Boolean(deletingReportId)}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn-danger'
                                onClick={confirmDeleteReport}
                                disabled={Boolean(deletingReportId)}
                            >
                                {deletingReportId ? 'Deleting...' : 'Yes, Delete Strategy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Delete Account */}
            {showAccountModal && (
                <div className='modal-overlay' onClick={() => !deletingAccount && setShowAccountModal(false)}>
                    <div className='modal-card modal-card--danger' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-card__header'>
                            <div className='danger-icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            </div>
                            <h3>Delete Account Permanently?</h3>
                        </div>
                        <div className='modal-card__body'>
                            <p>Are you sure you want to delete your account? <strong>All your saved interview strategies, roadmaps, and profile information will be immediately and irreversibly deleted.</strong></p>
                        </div>
                        <div className='modal-card__actions'>
                            <button
                                className='btn-cancel'
                                onClick={() => setShowAccountModal(false)}
                                disabled={deletingAccount}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn-danger'
                                onClick={confirmDeleteAccount}
                                disabled={deletingAccount}
                            >
                                {deletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home