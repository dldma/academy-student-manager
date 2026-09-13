import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import AppHeader from '../components/AppHeader'

function AdminStudentNewPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [parentPhone, setParentPhone] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage('학생 이름을 입력해주세요.')
      return
    }

    if (!school.trim()) {
      setErrorMessage('학교를 입력해주세요.')
      return
    }

    if (!grade.trim()) {
      setErrorMessage('학년을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.rpc(
      'register_student',
      {
        p_name: name,
        p_school: school,
        p_grade: grade,
        p_student_phone: studentPhone,
        p_parent_phone: parentPhone,
      },
    )

    setIsSubmitting(false)

    if (error) {
      console.error(error)
      setErrorMessage('학생 등록에 실패했습니다.')
      return
    }

    navigate('/admin/students')
  }

  return (
    <>
      <AppHeader />

      <main className="page-container admin-page admin-form-page">
        <div className="admin-page-heading">
          <div>
            <Link className="back-link" to="/admin/students">
              ← 학생 관리
            </Link>
            <h1>학생 등록</h1>
            <p className="muted">
              기본 정보와 연락처를 입력해 새 학생을 등록합니다.
            </p>
          </div>
        </div>

        <section className="card admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>학생 이름 *</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="학생 이름"
                />
              </label>

              <label className="admin-field">
                <span>학교 *</span>
                <input
                  type="text"
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                  placeholder="예: 관양중학교"
                />
              </label>

              <label className="admin-field">
                <span>학년 *</span>
                <input
                  type="text"
                  value={grade}
                  onChange={(event) => setGrade(event.target.value)}
                  placeholder="예: 중3"
                />
              </label>

              <label className="admin-field">
                <span>학생 전화번호</span>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(event) =>
                    setStudentPhone(event.target.value)
                  }
                  placeholder="010-0000-0000"
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>학부모 전화번호</span>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(event) =>
                    setParentPhone(event.target.value)
                  }
                  placeholder="010-0000-0000"
                />
              </label>
            </div>

            {errorMessage && (
              <div className="form-message form-message-error">
                {errorMessage}
              </div>
            )}

            <div className="admin-form-actions">
              <Link className="secondary-link-button" to="/admin/students">
                취소
              </Link>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '학생 등록'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  )
}

export default AdminStudentNewPage
