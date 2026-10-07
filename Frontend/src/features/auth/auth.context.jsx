import { useState, useEffect } from "react"
import { AuthContext } from "./auth.context.js"
import { getMe } from "./services/auth.api.js"

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const fetchInitialUser = async () => {
            try {
                const data = await getMe()
                if (isMounted && data?.user) {
                    setUser(data.user)
                }
            } catch {
                if (isMounted) {
                    setUser(null)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchInitialUser()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}