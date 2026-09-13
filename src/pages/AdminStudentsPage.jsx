import { Link } from 'react-router-dom'

import useStudents from '../hooks/useStudents'
import AppHeader from '../components/AppHeader'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

function AdminStudentsPage() {
  const {
    students,
    isLoading,
    error,
  } = useStudents()

  return (
    <>
      <AppHeader />

      <main className="page-container admin-page">
        <div className="admin-page-heading">
          <div>
            <Link className="back-link" to="/admin">
              ← 원장 관리
            </Link>
            <h1>학생 관리</h1>
            <p className="muted">
              등록된 학생을 확인하고 학생별 상세 정보를 관리합니다.
            </p>
          </div>

          <Link className="primary-link-button" to="/admin/students/new">
            + 학생 등록
          </Link>
        </div>

        <section className="card admin-student-list-card">
          {isLoading ? (
            <LoadingState message="학생 목록을 불러오는 중..." />
          ) : error ? (
            <ErrorState message="학생 목록을 불러오지 못했습니다." />
          ) : students.length === 0 ? (
            <EmptyState message="등록된 학생이 없습니다." />
          ) : (
            <div className="admin-student-list">
              {students.map((student) => (
                <Link
                  className="admin-student-row"
                  key={student.id}
                  to={`/admin/students/${student.id}`}
                >
                  <div className="admin-student-avatar">
                    {student.name?.slice(0, 1) ?? '?'}
                  </div>

                  <div className="admin-student-main">
                    <strong>{student.name}</strong>
                    <span>
                      {student.school} · {student.grade}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${
                      student.status === 'active'
                        ? 'status-badge-active'
                        : 'status-badge-inactive'
                    }`}
                  >
                    {student.status === 'active' ? '재원' : '퇴원'}
                  </span>

                  <span className="admin-row-arrow">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default AdminStudentsPage
