import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function AppHeader() {
  const navigate = useNavigate()

  const { profile } = useAuth()

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut()

    if (error) {
      console.error(error)

      alert(
        '로그아웃에 실패했습니다.',
      )

      return
    }

    navigate('/login', {
      replace: true,
    })
  }

  return (
    <header
      style={{
        width: '100%',
        height: '64px',

        background: '#ffffff',

        borderBottom:
          '1px solid #e5e7eb',

        display: 'flex',
        alignItems: 'center',

        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width:
            'min(1200px, calc(100% - 40px))',

          margin: '0 auto',

          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',

          gap: '20px',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            color: '#111827',
            textDecoration: 'none',

            fontWeight: '700',
            fontSize: '18px',
          }}
        >
          학생 관리 시스템
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <Link
            to="/dashboard"
            style={{
              color: '#374151',
            }}
          >
            대시보드
          </Link>

          {profile?.role ===
            'admin' && (
            <Link
              to="/admin"
              style={{
                color: '#374151',
              }}
            >
              원장 관리
            </Link>
          )}

          <span
            style={{
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            {profile?.full_name ??
              '사용자'}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: '#111827',
            }}
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  )
}

export default AppHeader