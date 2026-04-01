'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type User, type Session, type AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type SupabaseContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  isLoading: true,
})

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface SupabaseProviderProps {
  children: React.ReactNode
  initialSession?: Session | null
}

export function SupabaseProvider({ children, initialSession }: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [isLoading, setIsLoading] = useState(!initialSession)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ user, session, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  )
}
