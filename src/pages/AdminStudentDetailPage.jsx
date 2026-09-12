import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

const weekdays = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
]

function AdminStudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [contact, setContact] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [schedules, setSchedules] = useState([])

  // 학생 정보 수정
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [parentPhone, setParentPhone] = useState('')

  // 수업시간 추가
  const [teacherId, setTeacherId] = useState('')
  const [weekday, setWeekday] = useState('1')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isScheduleSubmitting, setIsScheduleSubmitting] =
    useState(false)
  const [isStatusChanging, setIsStatusChanging] =
    useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const [
      studentResult,
      contactResult,
      teachersResult,
      schedulesResult,
    ] = await Promise.all([
      supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single(),

      supabase
        .from('student_contacts')
        .select('*')
        .eq('student_id', id)
        .maybeSingle(),

      supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name', { ascending: true }),

      supabase
        .from('class_schedules')
        .select(
          'id, teacher_id, weekday, start_time, end_time, valid_from, valid_to',
        )
        .eq('student_id', id)
        .order('weekday', { ascending: true })
        .order('start_time', { ascending: true }),
    ])

    if (studentResult.error) {
      console.error(studentResult.error)
      setErrorMessage('학생 정보를 불러오지 못했습니다.')
      setIsLoading(false)
      return
    }

    if (contactResult.error) {
      console.error(contactResult.error)
    }

    if (teachersResult.error) {
      console.error(teachersResult.error)
      setErrorMessage('선생님 목록을 불러오지 못했습니다.')
      setIsLoading(false)
      return
    }

    if (schedulesResult.error) {
      console.error(schedulesResult.error)
      setErrorMessage('수업시간을 불러오지 못했습니다.')
      setIsLoading(false)
      return
    }

    const studentData = studentResult.data
    const contactData = contactResult.data

    setStudent(studentData)
    setContact(contactData)
    setTeachers(teachersResult.data ?? [])
    setSchedules(schedulesResult.data ?? [])

    setName(studentData.name ?? '')
    setSchool(studentData.school ?? '')
    setGrade(studentData.grade ?? '')
    setStudentPhone(contactData?.student_phone ?? '')
    setParentPhone(contactData?.parent_phone ?? '')

    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleUpdateStudent = async (event) => {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

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

    setIsSaving(true)

    const { error } = await supabase.rpc(
      'update_student_info',
      {
        p_student_id: id,
        p_name: name,
        p_school: school,
        p_grade: grade,
        p_student_phone: studentPhone,
        p_parent_phone: parentPhone,
      },
    )

    setIsSaving(false)

    if (error) {
      console.error(error)
      setErrorMessage('학생 정보 수정에 실패했습니다.')
      return
    }

    setSuccessMessage('학생 정보가 수정되었습니다.')
    await loadData()
  }

  const handleAddSchedule = async (event) => {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!teacherId) {
      setErrorMessage('담당 선생님을 선택해주세요.')
      return
    }

    if (!startTime || !endTime) {
      setErrorMessage(
        '수업 시작시간과 종료시간을 입력해주세요.',
      )
      return
    }

    if (endTime <= startTime) {
      setErrorMessage(
        '종료시간은 시작시간보다 늦어야 합니다.',
      )
      return
    }

    setIsScheduleSubmitting(true)

    const { error } = await supabase.rpc(
      'add_student_schedule',
      {
        p_student_id: id,
        p_teacher_id: teacherId,
        p_weekday: Number(weekday),
        p_start_time: startTime,
        p_end_time: endTime,
      },
    )

    setIsScheduleSubmitting(false)

    if (error) {
      console.error(error)
      setErrorMessage('수업시간 등록에 실패했습니다.')
      return
    }

    setTeacherId('')
    setWeekday('1')
    setStartTime('')
    setEndTime('')

    setSuccessMessage('수업시간이 등록되었습니다.')

    await loadData()
  }

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      '이 학생을 퇴원 처리하시겠습니까?\n기존 기록은 삭제되지 않습니다.',
    )

    if (!confirmed) {
      return
    }

    setIsStatusChanging(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.rpc(
      'withdraw_student',
      {
        p_student_id: id,
      },
    )

    setIsStatusChanging(false)

    if (error) {
      console.error(error)
      setErrorMessage('퇴원 처리에 실패했습니다.')
      return
    }

    setSuccessMessage('퇴원 처리가 완료되었습니다.')
    await loadData()
  }

  const handleReenroll = async () => {
    const confirmed = window.confirm(
      '이 학생을 다시 재원 학생으로 등록하시겠습니까?\n담당 선생님과 수업시간은 새로 설정해야 합니다.',
    )

    if (!confirmed) {
      return
    }

    setIsStatusChanging(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.rpc(
      'reenroll_student',
      {
        p_student_id: id,
      },
    )

    setIsStatusChanging(false)

    if (error) {
      console.error(error)
      setErrorMessage('재등록 처리에 실패했습니다.')
      return
    }

    setSuccessMessage(
      '재등록되었습니다. 담당 선생님과 수업시간을 새로 지정해주세요.',
    )

    await loadData()
  }

  const getTeacherName = (teacherIdValue) => {
    const teacher = teachers.find(
      (item) => item.id === teacherIdValue,
    )

    return teacher?.full_name ?? '알 수 없음'
  }

  const getWeekdayName = (value) => {
    const day = weekdays.find(
      (item) => item.value === value,
    )

    return day?.label ?? ''
  }

  const formatTime = (time) => {
    if (!time) {
      return ''
    }

    return time.slice(0, 5)
  }

  if (isLoading) {
    return (
      <LoadingState message="학생 정보를 불러오는 중..." />
    )
  }

  if (errorMessage && !student) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <div>
      <h1>학생 상세 관리</h1>

      <section>
        <h2>{student.name}</h2>

        <p>
          학교: {student.school}
        </p>

        <p>
          학년: {student.grade}
        </p>

        <p>
          상태:{' '}
          <strong>
            {student.status === 'active'
              ? '재원'
              : '퇴원'}
          </strong>
        </p>
      </section>

      <hr />

      <section>
        <h2>학생 정보 수정</h2>

        <form onSubmit={handleUpdateStudent}>
          <div>
            <label htmlFor="name">
              학생 이름
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
              학교
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
              학년
            </label>

            <input
              id="grade"
              type="text"
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
              value={parentPhone}
              onChange={(event) =>
                setParentPhone(event.target.value)
              }
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? '저장 중...'
              : '학생 정보 저장'}
          </button>
        </form>
      </section>

      <hr />

      <section>
        <h2>수업 일정</h2>

        {schedules.length === 0 ? (
          <EmptyState message="등록된 수업시간이 없습니다." />
        ) : (
          <div>
            {schedules.map((schedule) => (
              <div key={schedule.id}>
                <strong>
                  {getWeekdayName(schedule.weekday)}
                </strong>

                {' '}

                {formatTime(schedule.start_time)}
                {' - '}
                {formatTime(schedule.end_time)}

                {' / 담당: '}

                {getTeacherName(
                  schedule.teacher_id,
                )}

                {schedule.valid_to && (
                  <span>
                    {' '}
                    / 종료됨
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {student.status === 'active' && (
        <>
          <hr />

          <section>
            <h2>수업시간 추가</h2>

            <form onSubmit={handleAddSchedule}>
              <div>
                <label htmlFor="teacher">
                  담당 선생님
                </label>

                <select
                  id="teacher"
                  value={teacherId}
                  onChange={(event) =>
                    setTeacherId(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    선생님 선택
                  </option>

                  {teachers.map((teacher) => (
                    <option
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.full_name}
                      {teacher.role === 'admin'
                        ? ' (원장)'
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <br />

              <div>
                <label htmlFor="weekday">
                  요일
                </label>

                <select
                  id="weekday"
                  value={weekday}
                  onChange={(event) =>
                    setWeekday(
                      event.target.value,
                    )
                  }
                >
                  {weekdays.map((day) => (
                    <option
                      key={day.value}
                      value={day.value}
                    >
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <br />

              <div>
                <label htmlFor="startTime">
                  시작시간
                </label>

                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(
                      event.target.value,
                    )
                  }
                />
              </div>

              <br />

              <div>
                <label htmlFor="endTime">
                  종료시간
                </label>

                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value,
                    )
                  }
                />
              </div>

              <br />

              <button
                type="submit"
                disabled={isScheduleSubmitting}
              >
                {isScheduleSubmitting
                  ? '등록 중...'
                  : '수업시간 추가'}
              </button>
            </form>
          </section>
        </>
      )}

      <hr />

      <section>
        <h2>재원 상태 관리</h2>

        {student.status === 'active' ? (
          <button
            type="button"
            disabled={isStatusChanging}
            onClick={handleWithdraw}
          >
            {isStatusChanging
              ? '처리 중...'
              : '퇴원 처리'}
          </button>
        ) : (
          <button
            type="button"
            disabled={isStatusChanging}
            onClick={handleReenroll}
          >
            {isStatusChanging
              ? '처리 중...'
              : '재등록'}
          </button>
        )}
      </section>

      {errorMessage && (
        <p style={{ color: 'red' }}>
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p>
          {successMessage}
        </p>
      )}

      <hr />

      <button
        type="button"
        onClick={() =>
          navigate('/admin/students')
        }
      >
        학생 관리로 돌아가기
      </button>

      {' '}

      <Link to="/admin">
        원장 관리
      </Link>
    </div>
  )
}

export default AdminStudentDetailPage