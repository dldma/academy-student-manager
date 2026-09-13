import { Link } from 'react-router-dom'

import AppHeader from '../components/AppHeader'

function AdminPage() {
  return (
    <>
      <AppHeader />

      <main className="page-container admin-page">
        <section className="admin-hero">
          <div>
            <span className="admin-eyebrow">ADMIN</span>
            <h1>원장 관리</h1>
            <p>
              학생 등록부터 정보 수정, 수업 일정과 재원 상태까지
              한곳에서 관리하세요.
            </p>
          </div>

          <Link className="secondary-link-button" to="/dashboard">
            대시보드로 돌아가기
          </Link>
        </section>

        <section className="admin-menu-grid">
          <Link className="admin-menu-card" to="/admin/students">
            <div className="admin-menu-icon">👥</div>
            <div>
              <h2>학생 관리</h2>
              <p>
                학생 목록 확인, 신규 등록, 정보 수정, 수업 시간 및
                재원 상태를 관리합니다.
              </p>
            </div>
            <span className="admin-menu-arrow">→</span>
          </Link>

          <div className="admin-menu-card admin-menu-card-muted">
            <div className="admin-menu-icon">📊</div>
            <div>
              <h2>학원 운영</h2>
              <p>
                출석, 일정, 시험 정보는 대시보드에서 바로 확인할 수
                있습니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default AdminPage
