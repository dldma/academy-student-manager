import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

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
    <div>
      <h1>학생 등록</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            학생 이름 *
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label htmlFor="school">
            학교 *
          </label>

          <input
            id="school"
            type="text"
            value={school}
            onChange={(event) =>
              setSchool(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label htmlFor="grade">
            학년 *
          </label>

          <input
            id="grade"
            type="text"
            placeholder="예: 중3"
            value={grade}
            onChange={(event) =>
              setGrade(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label htmlFor="studentPhone">
            학생 전화번호
          </label>

          <input
            id="studentPhone"
            type="tel"
            placeholder="010-0000-0000"
            value={studentPhone}
            onChange={(event) =>
              setStudentPhone(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label htmlFor="parentPhone">
            학부모 전화번호
          </label>

          <input
            id="parentPhone"
            type="tel"
            placeholder="010-0000-0000"
            value={parentPhone}
            onChange={(event) =>
              setParentPhone(event.target.value)
            }
          />
        </div>

        {errorMessage && (
          <p style={{ color: 'red' }}>
            {errorMessage}
          </p>
        )}

        <br />

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? '등록 중...'
            : '학생 등록'}
        </button>
      </form>

      <br />

      <Link to="/admin/students">
        학생 관리로 돌아가기
      </Link>
    </div>
  )
}

export default AdminStudentNewPage