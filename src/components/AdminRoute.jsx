import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AdminRoute({ children }) {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return <p>권한 확인 중...</p>
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute