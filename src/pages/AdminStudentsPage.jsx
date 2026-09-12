import { Link } from 'react-router-dom'

import useStudents from '../hooks/useStudents'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

function AdminStudentsPage() {
  const {
    students,
    isLoading,
    error,
  } = useStudents()

  if (isLoading) {
    return (
      <LoadingState message="학생 목록을 불러오는 중..." />
    )
  }

  if (error) {
    return (
      <ErrorState message="학생 목록을 불러오지 못했습니다." />
    )
  }

  return (
    <div>
      <h1>학생 관리</h1>

      <div>
        <Link to="/admin/students/new">
          + 학생 등록
        </Link>
      </div>

      <hr />

      {students.length === 0 ? (
        <EmptyState message="등록된 학생이 없습니다." />
      ) : (
        <div>
          {students.map((student) => (
            <div key={student.id}>
              <h3>
                <Link
                  to={`/admin/students/${student.id}`}
                >
                  {student.name}
                </Link>
              </h3>

              <p>
                {student.school} / {student.grade}
              </p>

              <p>
                상태:{' '}
                {student.status === 'active'
                  ? '재원'
                  : '퇴원'}
              </p>

              <hr />
            </div>
          ))}
        </div>
      )}

      <Link to="/admin">
        원장 관리로 돌아가기
      </Link>
    </div>
  )
}

export default AdminStudentsPage