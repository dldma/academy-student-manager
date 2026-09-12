import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadAuthData = async (newSession) => {
    setSession(newSession)

    const currentUser = newSession?.user ?? null

    setUser(currentUser)

    if (!currentUser) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      console.error('프로필 조회 실패:', error)
      setProfile(null)
    } else {
      setProfile(data)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()

      await loadAuthData(data.session)
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        loadAuthData(newSession)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}