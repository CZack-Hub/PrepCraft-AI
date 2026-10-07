import React, { useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { Link, useParams, useNavigate } from 'react-router'

const NAV_ITEMS = [
    {
        id: 'technical',
        label: 'Technical Questions',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        )
    },
    {
        id: 'behavioral',
        label: 'Behavioral Questions',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        id: 'roadmap',
        label: 'Preparation Road Map',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
        )
    },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(index === 0)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>🎯 Interviewer Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>💡 Recommended Answer Framework</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    <span>{task}</span>
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const [ downloading, setDownloading ] = useState(false)
    const [ showDeleteModal, setShowDeleteModal ] = useState(false)
    const [ deleting, setDeleting ] = useState(false)
    const { report, loading, getResumePdf, deleteReport } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    const handleDownloadResume = async () => {
        setDownloading(true)
        try {
            await getResumePdf(interviewId)
        } catch {
            // caught inside getResumePdf
        } finally {
            setDownloading(false)
        }
    }

    const handleDeletePlan = async () => {
        setDeleting(true)
        try {
            await deleteReport(interviewId)
            navigate('/')
        } catch (err) {
            alert(err.message || "Failed to delete strategy")
            setDeleting(false)
        }
    }

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='loading-pulse'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h1>Loading your interview plan...</h1>
                <p>Generating technical questions &amp; roadmap</p>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    const scoreVerdict =
        report.matchScore >= 80 ? 'Strong match for this position' :
            report.matchScore >= 60 ? 'Moderate match with addressable gaps' : 'Requires targeted preparation'

    return (
        <div className='interview-page'>
            {/* Top Navigation Bar */}
            <header className='interview-topbar'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Link to="/" title="PrepCraft AI Dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img src="/logo.svg" alt="PrepCraft AI" width="28" height="28" style={{ borderRadius: '6px', filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.35))' }} />
                    </Link>
                    <Link to="/" className='back-link'>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                <div className='plan-meta'>
                    <span className='ai-badge'>AI Evaluated</span>
                    <span className='plan-title'>{report.title || 'Target Position'}</span>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            marginLeft: '0.75rem'
                        }}
                        title="Delete this strategy"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        <span>Delete Strategy</span>
                    </button>
                </div>
            </header>

            <div className='interview-layout'>

                {/* ── Left Navigation ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Workspace</p>
                        {NAV_ITEMS.map(item => {
                            let count = 0
                            if (item.id === 'technical') count = report.technicalQuestions?.length || 0
                            if (item.id === 'behavioral') count = report.behavioralQuestions?.length || 0
                            if (item.id === 'roadmap') count = report.preparationPlan?.length || 0

                            return (
                                <button
                                    key={item.id}
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <div className='nav-item-left'>
                                        <span className='interview-nav__icon'>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    <span className='nav-count'>{count}</span>
                                </button>
                            )
                        })}
                    </div>

                    <button
                        onClick={handleDownloadResume}
                        disabled={downloading}
                        className='download-resume-btn'
                    >
                        {downloading ? (
                            <>
                                <span className='ui-spinner' style={{ width: '14px', height: '14px' }} />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                <span>Download Tailored Resume</span>
                            </>
                        )}
                    </button>
                </nav>

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions &amp; Strategies</h2>
                                <span className='content-header__count'>{report.technicalQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral &amp; Situational Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>7-Day Interview Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan?.length || 0}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan?.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <span className='match-score__label'>Profile Match Score</span>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>{scoreVerdict}</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <span className='skill-gaps__label'>Identified Skill Gaps</span>
                        <div className='skill-gaps__list'>
                            {report.skillGaps && report.skillGaps.length > 0 ? (
                                report.skillGaps.map((gap, i) => (
                                    <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                        {gap.skill}
                                    </span>
                                ))
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No major skill gaps identified!</span>
                            )}
                        </div>
                    </div>

                </aside>
            </div>

            {/* Modal: Confirm Delete Strategy */}
            {showDeleteModal && (
                <div className='modal-overlay' onClick={() => !deleting && setShowDeleteModal(false)}>
                    <div className='modal-card' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-card__header'>
                            <div className='danger-icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </div>
                            <h3>Delete Strategy?</h3>
                        </div>
                        <div className='modal-card__body'>
                            <p>Are you sure you want to delete this interview strategy for <strong>"{report.title || 'Untitled Target Role'}"</strong>?</p>
                            <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.825rem' }}>This action is permanent and cannot be undone.</p>
                        </div>
                        <div className='modal-card__actions'>
                            <button
                                className='btn-cancel'
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn-danger'
                                onClick={handleDeletePlan}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Yes, Delete Strategy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Interview