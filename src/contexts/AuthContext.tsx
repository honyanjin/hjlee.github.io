import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  isPartner: boolean
  partnerPages: { id: string; title: string }[]
  partnerResolved: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPartner, setIsPartner] = useState(false)
  const [partnerPages, setPartnerPages] = useState<{ id: string; title: string }[]>([])
  const [partnerResolved, setPartnerResolved] = useState(false)

  useEffect(() => {
    // 초기 세션 가져오기
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      const email = session?.user?.email
      const envAdmin = !!email && email === import.meta.env.VITE_ADMIN_EMAIL
      setIsAdmin(envAdmin)
      // 먼저 로딩 종료
      setLoading(false)
      // 파트너 여부 및 페이지 목록은 비동기 로딩(대시보드 접근 차단과 무관)
      if (session?.user) {
        // 관리자 이메일 화이트리스트 체크 (env 미설정 대비)
        if (!envAdmin && email) {
          checkAdminWhitelist(email)
        }
        fetchPartnerState(session.user.id)
      } else {
        setIsPartner(false)
        setPartnerPages([])
        setPartnerResolved(true)
      }
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        const email = session?.user?.email
        const envAdmin = !!email && email === import.meta.env.VITE_ADMIN_EMAIL
        setIsAdmin(envAdmin)
        // 로딩 종료 먼저
        setLoading(false)
        // 파트너 상태는 비동기 갱신
        if (session?.user) {
          if (!envAdmin && email) {
            checkAdminWhitelist(email)
          }
          fetchPartnerState(session.user.id)
        } else {
          setIsPartner(false)
          setPartnerPages([])
          setPartnerResolved(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
  }

  const checkAdminWhitelist = async (email: string) => {
    try {
      const { data } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', email)
        .maybeSingle()
      if (data) setIsAdmin(true)
    } catch {
      // 무시
    }
  }

  const fetchPartnerState = async (uid: string) => {
    try {
      setPartnerResolved(false)
      // partner_profiles 존재 여부 확인
      const { data: profile } = await supabase
        .from('partner_profiles')
        .select('user_id')
        .eq('user_id', uid)
        .maybeSingle()

      const isPartnerNow = !!profile
      setIsPartner(isPartnerNow)

      if (isPartnerNow) {
        // 접근 가능한 파트너 페이지 목록 로딩
        const { data: assignments } = await supabase
          .from('partner_page_assignments')
          .select('page_id')
          .eq('user_id', uid)

        const pageIds = (assignments ?? []).map(a => a.page_id)
        if (pageIds.length > 0) {
          const { data: pages } = await supabase
            .from('partner_pages')
            .select('id, title')
            .in('id', pageIds)
            .order('title', { ascending: true })
          setPartnerPages((pages ?? []).map(p => ({ id: p.id, title: p.title })))
        } else {
          setPartnerPages([])
        }
      } else {
        setPartnerPages([])
      }
    } catch {
      setIsPartner(false)
      setPartnerPages([])
    } finally {
      setPartnerResolved(true)
    }
  }

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isPartner,
    partnerPages,
    partnerResolved,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 