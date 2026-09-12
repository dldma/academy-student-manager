import { Link } from 'react-router-dom'

function AdminPage() {
  return (
    <div>
      <h1>원장 관리</h1>

      <p>학생과 담당 선생님을 관리합니다.</p>

      <div>
        <Link to="/admin/students">
          학생 관리
        </Link>
      </div>

      <div>
        <Link to="/dashboard">
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export default AdminPage