import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function DashboardPage() {
  const { user, profile } = useAuth()

  return (
    <div>
      <h1>학생 관리 시스템</h1>

      <h2>대시보드</h2>

      <p>
        이름: {profile?.full_name ?? '정보 없음'}
      </p>

      <p>
        권한:{' '}
        {profile?.role === 'admin'
          ? '원장'
          : profile?.role === 'teacher'
            ? '선생님'
            : '권한 정보 없음'}
      </p>

      <p>
        이메일: {user?.email}
      </p>

      {profile?.role === 'admin' && (
        <div>
          <h3>원장 관리</h3>

          <Link to="/admin">
            원장 관리 화면으로 이동
          </Link>
        </div>
      )}
    </div>
  )
}

export default DashboardPage