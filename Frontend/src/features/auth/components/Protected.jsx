import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router"
import React from 'react'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#080c14' }}>
                <div className="ui-spinner" style={{ width: '36px', height: '36px' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Verifying authentication...</p>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected