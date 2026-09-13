import { useEffect, useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

import AppHeader from '../components/AppHeader'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import StudentRecordCalendar from '../components/StudentRecordCalendar'
import StudentBookManager from '../components/StudentBookManager'
import StudentMemoManager from '../components/StudentMemoManager'

const weekdays = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
]

function StudentDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()

  const [student, setStudent] =
    useState(null)

  const [contact, setContact] =
    useState(null)

  const [schedules, setSchedules] =
    useState([])

  const [teachers, setTeachers] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true)
      setError('')

      const [
        studentResult,
        contactResult,
        scheduleResult,
        teacherResult,
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
          .from('class_schedules')
          .select(
            `
            id,
            teacher_id,
            weekday,
            start_time,
            end_time,
            valid_from,
            valid_to
            `,
          )
          .eq('student_id', id)
          .order('weekday', {
            ascending: true,
          })
          .order('start_time', {
            ascending: true,
          }),

        supabase
          .from('profiles')
          .select(
            'id, full_name, role',
          ),
      ])

      if (studentResult.error) {
        console.error(
          studentResult.error,
        )

        setError(
          '학생 정보를 불러오지 못했습니다.',
        )

        setIsLoading(false)
        return
      }

      if (contactResult.error) {
        console.error(
          contactResult.error,
        )
      }

      if (scheduleResult.error) {
        console.error(
          scheduleResult.error,
        )
      }

      if (teacherResult.error) {
        console.error(
          teacherResult.error,
        )
      }

      setStudent(
        studentResult.data,
      )

      setContact(
        contactResult.data ??
          null,
      )

      setSchedules(
        scheduleResult.data ??
          [],
      )

      setTeachers(
        teacherResult.data ??
          [],
      )

      setIsLoading(false)
    }

    fetchStudent()
  }, [id])

  const getTeacherName = (
    teacherId,
  ) => {
    const teacher =
      teachers.find(
        (item) =>
          item.id === teacherId,
      )

    return (
      teacher?.full_name ??
      '알 수 없음'
    )
  }

  const formatTime = (time) => {
    if (!time) {
      return ''
    }

    return time.slice(0, 5)
  }

  const today =
    new Date()
      .toISOString()
      .slice(0, 10)

  const currentSchedules =
    schedules.filter(
      (schedule) =>
        !schedule.valid_to ||
        schedule.valid_to >=
          today,
    )

  if (isLoading) {
    return (
      <>
        <AppHeader />

        <main
          className="page-container"
          style={{
            paddingTop: '30px',
          }}
        >
          <LoadingState message="학생 정보를 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AppHeader />

        <main
          className="page-container"
          style={{
            paddingTop: '30px',
          }}
        >
          <ErrorState
            message={error}
          />
        </main>
      </>
    )
  }

  if (!student) {
    return (
      <>
        <AppHeader />

        <main
          className="page-container"
          style={{
            paddingTop: '30px',
          }}
        >
          <EmptyState message="학생 정보를 찾을 수 없습니다." />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />

      <main
        style={{
          width:
            'min(1200px, calc(100% - 40px))',
          margin: '0 auto',
          padding:
            '28px 0 50px',
        }}
      >
        {/* 상단 이동 */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '18px',
          }}
        >
          <Link
            to="/dashboard"
            style={{
              color: '#6b7280',
              textDecoration:
                'none',
            }}
          >
            ← 대시보드로 돌아가기
          </Link>

          {profile?.role ===
            'admin' && (
            <Link
              to={`/admin/students/${id}`}
              style={{
                textDecoration:
                  'none',
              }}
            >
              학생 관리
            </Link>
          )}
        </div>

        {/* 학생 프로필 */}
        <section
          style={{
            padding: '26px',
            marginBottom: '20px',

            borderRadius:
              '18px',

            color: 'white',

            background:
              'linear-gradient(135deg, #6d5dfc, #8b5cf6)',

            boxShadow:
              '0 10px 30px rgba(109, 93, 252, 0.20)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize:
                    '13px',
                  opacity: 0.85,
                  marginBottom:
                    '6px',
                }}
              >
                학생 프로필
              </div>

              <h1
                style={{
                  margin:
                    '0 0 8px',
                  fontSize:
                    '30px',
                }}
              >
                {student.name}
              </h1>

              <div
                style={{
                  fontSize:
                    '16px',
                  opacity: 0.95,
                }}
              >
                {student.school}{' '}
                {student.grade}
              </div>
            </div>

            <span
              style={{
                padding:
                  '7px 12px',

                borderRadius:
                  '999px',

                background:
                  student.status ===
                  'active'
                    ? 'rgba(255,255,255,0.20)'
                    : 'rgba(239,68,68,0.30)',

                fontWeight: 700,
                fontSize:
                  '13px',
              }}
            >
              {student.status ===
              'active'
                ? '재원'
                : '퇴원'}
            </span>
          </div>

          {contact && (
            <div
              style={{
                display: 'flex',
                gap: '30px',
                flexWrap: 'wrap',
                marginTop:
                  '22px',

                paddingTop:
                  '18px',

                borderTop:
                  '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {contact.student_phone && (
                <div>
                  <div
                    style={{
                      fontSize:
                        '12px',
                      opacity:
                        0.75,
                    }}
                  >
                    학생 연락처
                  </div>

                  <div
                    style={{
                      marginTop:
                        '3px',
                    }}
                  >
                    {
                      contact.student_phone
                    }
                  </div>
                </div>
              )}

              {contact.parent_phone && (
                <div>
                  <div
                    style={{
                      fontSize:
                        '12px',
                      opacity:
                        0.75,
                    }}
                  >
                    보호자 연락처
                  </div>

                  <div
                    style={{
                      marginTop:
                        '3px',
                    }}
                  >
                    {
                      contact.parent_phone
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 현재 수업 일정 */}
        <section
          className="card"
          style={{
            marginBottom:
              '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            현재 수업 일정
          </h2>

          {currentSchedules.length ===
          0 ? (
            <EmptyState message="현재 등록된 수업 일정이 없습니다." />
          ) : (
            <div
              style={{
                display:
                  'grid',
                gap: '10px',
              }}
            >
              {currentSchedules.map(
                (schedule) => (
                  <div
                    key={
                      schedule.id
                    }
                    style={{
                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      alignItems:
                        'center',

                      gap: '20px',

                      flexWrap:
                        'wrap',

                      padding:
                        '14px 16px',

                      border:
                        '1px solid #e5e7eb',

                      borderRadius:
                        '12px',

                      background:
                        '#f9fafb',
                    }}
                  >
                    <div>
                      <strong>
                        {
                          weekdays[
                            schedule
                              .weekday
                          ]
                        }
                      </strong>

                      <span
                        style={{
                          marginLeft:
                            '10px',

                          color:
                            '#4b5563',
                        }}
                      >
                        {formatTime(
                          schedule.start_time,
                        )}
                        {' - '}
                        {formatTime(
                          schedule.end_time,
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        color:
                          '#6b7280',

                        fontSize:
                          '14px',
                      }}
                    >
                      담당{' '}
                      {getTeacherName(
                        schedule.teacher_id,
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* 수업 기록 */}
        <section
          className="card"
          style={{
            marginBottom:
              '20px',
          }}
        >
          <StudentRecordCalendar
            studentId={id}
          />
        </section>

        {/* 교재 + 메모 */}
        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',

            gap: '20px',
          }}
        >
          <section className="card">
            <StudentBookManager
              studentId={id}
            />
          </section>

          <section className="card">
            <StudentMemoManager
              studentId={id}
            />
          </section>
        </div>
      </main>
    </>
  )
}

export default StudentDetailPage