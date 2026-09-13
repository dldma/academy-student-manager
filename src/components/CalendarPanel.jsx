import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function CalendarPanel({
  students,
  onDataChanged,
  refreshKey = 0,
}) {
  const { user } = useAuth()

  const today = new Date()
  const todayString = formatDate(today)

  const [viewDate, setViewDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ),
  )

  const [selectedDate, setSelectedDate] =
    useState(todayString)

  const [memos, setMemos] = useState([])
  const [events, setEvents] = useState([])
  const [exams, setExams] = useState([])

  const [memoContent, setMemoContent] =
    useState('')

  const [memoStudentId, setMemoStudentId] =
    useState('')

  const [eventTitle, setEventTitle] =
    useState('')

  const [eventDescription, setEventDescription] =
    useState('')

  const [eventStudentId, setEventStudentId] =
    useState('')

  const [eventEndDate, setEventEndDate] =
    useState('')

  const [showAddForm, setShowAddForm] =
    useState(false)

  const [formType, setFormType] =
    useState('memo')

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const fetchCalendarData = async () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const monthStart = formatDate(
      new Date(year, month, 1),
    )

    const monthEnd = formatDate(
      new Date(year, month + 1, 0),
    )

    const [
      memoResult,
      eventResult,
      examResult,
    ] = await Promise.all([
      supabase
        .from('calendar_memos')
        .select('*')
        .gte('memo_date', monthStart)
        .lte('memo_date', monthEnd),

      supabase
        .from('events')
        .select('*')
        .lte('start_date', monthEnd)
        .or(
          `end_date.is.null,end_date.gte.${monthStart}`,
        ),

      supabase
        .from('exam_schedules')
        .select('*')
        .lte('period_start_date', monthEnd)
        .gte('period_end_date', monthStart)
        .order('period_start_date', {
          ascending: true,
        }),
    ])

    if (memoResult.error) {
      console.error(memoResult.error)
    }

    if (eventResult.error) {
      console.error(eventResult.error)
    }

    if (examResult.error) {
      console.error(examResult.error)
    }

    setMemos(memoResult.data ?? [])
    setEvents(eventResult.data ?? [])
    setExams(examResult.data ?? [])
  }

  useEffect(() => {
    fetchCalendarData()
  }, [viewDate, refreshKey])

  const previousMonth = () => {
    setViewDate(
      new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() - 1,
        1,
      ),
    )
  }

  const nextMonth = () => {
    setViewDate(
      new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        1,
      ),
    )
  }

  const goToday = () => {
    const now = new Date()

    setViewDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    )

    setSelectedDate(formatDate(now))
  }

  const getStudentName = (studentId) => {
    if (!studentId) {
      return ''
    }

    return (
      students.find(
        (student) =>
          student.id === studentId,
      )?.name ?? ''
    )
  }

  const handleDateClick = (dateString) => {
    setSelectedDate(dateString)
  }

  const openMemoForm = () => {
    setFormType('memo')
    setShowAddForm(true)
  }

  const openEventForm = () => {
    setFormType('event')
    setShowAddForm(true)
  }

  const handleAddMemo = async (event) => {
    event.preventDefault()

    if (!memoContent.trim()) {
      alert('메모 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from('calendar_memos')
      .insert({
        memo_date: selectedDate,
        student_id:
          memoStudentId || null,
        content:
          memoContent.trim(),
        created_by: user.id,
      })

    setIsSubmitting(false)

    if (error) {
      console.error(error)
      alert('메모 등록에 실패했습니다.')
      return
    }

    setMemoContent('')
    setMemoStudentId('')
    setShowAddForm(false)

    await fetchCalendarData()

    if (onDataChanged) {
      onDataChanged()
    }
  }

  const handleAddEvent = async (event) => {
    event.preventDefault()

    if (!eventTitle.trim()) {
      alert('일정 제목을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from('events')
      .insert({
        title: eventTitle.trim(),

        description:
          eventDescription.trim() ||
          null,

        start_date: selectedDate,

        end_date:
          eventEndDate || null,

        student_id:
          eventStudentId || null,

        created_by: user.id,
      })

    setIsSubmitting(false)

    if (error) {
      console.error(error)
      alert('일정 등록에 실패했습니다.')
      return
    }

    setEventTitle('')
    setEventDescription('')
    setEventStudentId('')
    setEventEndDate('')
    setShowAddForm(false)

    await fetchCalendarData()

    if (onDataChanged) {
      onDataChanged()
    }
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(
    year,
    month,
    1,
  ).getDay()

  const lastDate = new Date(
    year,
    month + 1,
    0,
  ).getDate()

  const calendarCells = []

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null)
  }

  for (let day = 1; day <= lastDate; day++) {
    calendarCells.push(day)
  }

  const examGroups = Object.values(
    exams.reduce((groups, exam) => {
      const key = [
        exam.school,
        exam.exam_name,
        exam.period_start_date,
        exam.period_end_date,
      ].join('|')

      if (!groups[key]) {
        groups[key] = {
          key,
          school: exam.school,
          examName: exam.exam_name,
          periodStartDate: exam.period_start_date,
          periodEndDate: exam.period_end_date,
          items: [],
        }
      }

      groups[key].items.push(exam)
      return groups
    }, {}),
  )

  const getDateItems = (dateString) => {
    const items = []

    // 여러 날짜에 걸친 일정은 시작일~종료일까지 모두 표시한다.
    events
      .filter((event) => {
        const endDate =
          event.end_date ?? event.start_date

        return (
          event.start_date <= dateString &&
          endDate >= dateString
        )
      })
      .forEach((event) => {
        const studentName =
          getStudentName(event.student_id)

        const endDate =
          event.end_date ?? event.start_date

        items.push({
          id: `event-${event.id}`,
          type: 'event',
          text: studentName
            ? `${studentName} · ${event.title}`
            : event.title,
          rangeStart: event.start_date,
          rangeEnd: endDate,
          isRange:
            event.start_date !== endDate,
          sortKey: `1-${event.start_date}-${event.id}`,
        })
      })

    // 시험은 학년별 시험일뿐 아니라 전체 시험기간도
    // 갤럭시 캘린더처럼 이어지는 막대로 보여준다.
    examGroups
      .filter(
        (group) =>
          group.periodStartDate <= dateString &&
          group.periodEndDate >= dateString,
      )
      .forEach((group) => {
        items.push({
          id: `exam-range-${group.key}`,
          type: 'exam-range',
          text: `${group.school} · ${group.examName}`,
          rangeStart: group.periodStartDate,
          rangeEnd: group.periodEndDate,
          isRange:
            group.periodStartDate !==
            group.periodEndDate,
          sortKey: `0-${group.periodStartDate}-${group.key}`,
        })
      })

    // 확정된 학년별 실제 시험일은 작은 별도 항목으로 유지한다.
    exams
      .filter(
        (exam) =>
          exam.exam_date === dateString,
      )
      .forEach((exam) => {
        items.push({
          id: `exam-day-${exam.id}`,
          type: 'exam-day',
          text: `${exam.school} ${exam.grade} · ${exam.exam_name}`,
          sortKey: `2-${exam.exam_date}-${exam.id}`,
        })
      })

    memos
      .filter(
        (memo) =>
          memo.memo_date === dateString,
      )
      .forEach((memo) => {
        const studentName =
          getStudentName(memo.student_id)

        items.push({
          id: `memo-${memo.id}`,
          type: 'memo',
          text: studentName
            ? `${studentName} · ${memo.content}`
            : memo.content,
          sortKey: `3-${memo.id}`,
        })
      })

    return items.sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    )
  }

  const selectedItems =
    getDateItems(selectedDate)

  const activeStudents =
    students.filter(
      (student) =>
        student.status === 'active',
    )

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        border:
          '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    >
      {/* 캘린더 상단 */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: '15px',
          borderBottom:
            '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={previousMonth}
            style={{
              background: '#f3f4f6',
              color: '#374151',
            }}
          >
            ‹
          </button>

          <h2
            style={{
              margin: 0,
              minWidth: '150px',
              textAlign: 'center',
            }}
          >
            {year}년 {month + 1}월
          </h2>

          <button
            type="button"
            onClick={nextMonth}
            style={{
              background: '#f3f4f6',
              color: '#374151',
            }}
          >
            ›
          </button>

          <button
            type="button"
            onClick={goToday}
            style={{
              background: '#eef2ff',
              color: '#4f46e5',
            }}
          >
            오늘
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={openMemoForm}
          >
            + 메모
          </button>

          {' '}

          <button
            type="button"
            onClick={openEventForm}
            style={{
              background: '#059669',
            }}
          >
            + 일정
          </button>
        </div>
      </div>

      {/* 요일 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(7, 1fr)',
          background: '#f9fafb',
          borderBottom:
            '1px solid #e5e7eb',
        }}
      >
        {[
          '일',
          '월',
          '화',
          '수',
          '목',
          '금',
          '토',
        ].map((day, index) => (
          <div
            key={day}
            style={{
              padding: '10px',
              textAlign: 'center',
              fontWeight: '600',

              color:
                index === 0
                  ? '#ef4444'
                  : index === 6
                    ? '#3b82f6'
                    : '#6b7280',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 월간 캘린더 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(7, 1fr)',
          background: '#e5e7eb',
          gap: '1px',
        }}
      >
        {calendarCells.map(
          (day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  style={{
                    minHeight: '115px',
                    background: '#fafafa',
                  }}
                />
              )
            }

            const dateString =
              formatDate(
                new Date(
                  year,
                  month,
                  day,
                ),
              )

            const items =
              getDateItems(
                dateString,
              )

            const isToday =
              dateString ===
              todayString

            const isSelected =
              dateString ===
              selectedDate

            const weekday =
              new Date(
                year,
                month,
                day,
              ).getDay()

            return (
              <div
                key={dateString}
                onClick={() =>
                  handleDateClick(
                    dateString,
                  )
                }
                style={{
                  minHeight: '115px',
                  padding: '7px',
                  background:
                    isSelected
                      ? '#f5f7ff'
                      : 'white',

                  outline:
                    isSelected
                      ? '2px solid #6366f1'
                      : 'none',

                  outlineOffset:
                    '-2px',

                  cursor: 'pointer',
                  overflow: 'visible',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',

                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',

                    borderRadius:
                      '50%',

                    marginBottom:
                      '4px',

                    background:
                      isToday
                        ? '#4f46e5'
                        : 'transparent',

                    color:
                      isToday
                        ? 'white'
                        : weekday === 0
                          ? '#ef4444'
                          : weekday === 6
                            ? '#3b82f6'
                            : '#374151',

                    fontWeight:
                      isToday
                        ? '700'
                        : '500',

                    fontSize:
                      '13px',
                  }}
                >
                  {day}
                </div>

                {/* 갤럭시 캘린더처럼 기간 일정은 날짜 칸을 이어서 표시 */}
                {items
                  .slice(0, 4)
                  .map((item) => {
                    const isRange = Boolean(
                      item.isRange &&
                        item.rangeStart &&
                        item.rangeEnd,
                    )

                    const isRangeStart =
                      isRange &&
                      dateString ===
                        item.rangeStart

                    const isRangeEnd =
                      isRange &&
                      dateString ===
                        item.rangeEnd

                    const connectsLeft =
                      isRange &&
                      !isRangeStart &&
                      day !== 1 &&
                      weekday !== 0

                    const connectsRight =
                      isRange &&
                      !isRangeEnd &&
                      day !== lastDate &&
                      weekday !== 6

                    const showRangeText =
                      !isRange ||
                      isRangeStart ||
                      day === 1 ||
                      weekday === 0

                    const isExam =
                      item.type ===
                        'exam-range' ||
                      item.type ===
                        'exam-day'

                    const background =
                      item.type === 'memo'
                        ? '#fef3c7'
                        : isExam
                          ? item.type ===
                            'exam-day'
                            ? '#ddd6fe'
                            : '#ede9fe'
                          : '#d1fae5'

                    const color =
                      item.type === 'memo'
                        ? '#92400e'
                        : isExam
                          ? '#5b21b6'
                          : '#065f46'

                    return (
                      <div
                        key={item.id}
                        title={item.text}
                        style={{
                          position:
                            'relative',
                          zIndex: isRange
                            ? 2
                            : 1,
                          marginBottom:
                            '3px',
                          marginLeft:
                            connectsLeft
                              ? '-8px'
                              : 0,
                          marginRight:
                            connectsRight
                              ? '-8px'
                              : 0,
                          padding:
                            '3px 5px',
                          minHeight:
                            '18px',
                          borderTopLeftRadius:
                            connectsLeft
                              ? 0
                              : '4px',
                          borderBottomLeftRadius:
                            connectsLeft
                              ? 0
                              : '4px',
                          borderTopRightRadius:
                            connectsRight
                              ? 0
                              : '4px',
                          borderBottomRightRadius:
                            connectsRight
                              ? 0
                              : '4px',
                          fontSize:
                            '11px',
                          lineHeight:
                            '1.25',
                          whiteSpace:
                            'nowrap',
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                          background,
                          color,
                        }}
                      >
                        {showRangeText ? (
                          <>
                            {item.type ===
                            'memo'
                              ? '● '
                              : isExam
                                ? '◆ '
                                : '■ '}
                            {item.text}
                          </>
                        ) : (
                          '\u00a0'
                        )}
                      </div>
                    )
                  })}

                {items.length > 4 && (
                  <div
                    style={{
                      fontSize:
                        '11px',
                      color:
                        '#6b7280',
                      paddingLeft:
                        '3px',
                    }}
                  >
                    +{items.length - 4}개
                  </div>
                )}
              </div>
            )
          },
        )}
      </div>

      {/* 선택 날짜 상세 */}
      <div
        style={{
          padding: '20px',
          background: '#fafafa',
          borderTop:
            '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
            }}
          >
            {selectedDate}
          </h3>

          <span
            style={{
              color: '#6b7280',
              fontSize: '13px',
            }}
          >
            메모는 노랑 · 일정은 초록 · 시험은 보라 · 기간 일정은 이어서 표시
          </span>
        </div>

        {selectedItems.length === 0 ? (
          <p
            style={{
              color: '#9ca3af',
              marginBottom: 0,
            }}
          >
            등록된 메모, 일정 또는 시험이 없습니다.
          </p>
        ) : (
          <div
            style={{
              marginTop: '12px',
              display: 'grid',
              gap: '7px',
            }}
          >
            {selectedItems.map(
              (item) => (
                <div
                  key={item.id}
                  style={{
                    padding:
                      '9px 12px',

                    borderRadius:
                      '8px',

                    background:
                      item.type === 'memo'
                        ? '#fef3c7'
                        : item.type ===
                              'exam-range' ||
                            item.type ===
                              'exam-day'
                          ? '#ede9fe'
                          : '#d1fae5',

                    color:
                      item.type === 'memo'
                        ? '#92400e'
                        : item.type ===
                              'exam-range' ||
                            item.type ===
                              'exam-day'
                          ? '#5b21b6'
                          : '#065f46',
                  }}
                >
                  {item.type === 'memo'
                    ? '메모'
                    : item.type ===
                          'exam-range'
                      ? '시험기간'
                      : item.type ===
                          'exam-day'
                        ? '시험일'
                        : '일정'}

                  {' · '}

                  {item.text}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* 추가 입력창 */}
      {showAddForm && (
        <div
          style={{
            padding: '20px',
            borderTop:
              '1px solid #e5e7eb',
          }}
        >
          {formType === 'memo' ? (
            <form
              onSubmit={
                handleAddMemo
              }
            >
              <h3>
                {selectedDate} 메모 추가
              </h3>

              <select
                value={
                  memoStudentId
                }
                onChange={(
                  event,
                ) =>
                  setMemoStudentId(
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  학원 전체
                </option>

                {activeStudents.map(
                  (student) => (
                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >
                      {student.name}
                    </option>
                  ),
                )}
              </select>

              <br />
              <br />

              <input
                type="text"
                placeholder="메모 내용을 입력하세요"
                value={
                  memoContent
                }
                onChange={(
                  event,
                ) =>
                  setMemoContent(
                    event.target
                      .value,
                  )
                }
              />

              <br />
              <br />

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
              >
                메모 저장
              </button>

              {' '}

              <button
                type="button"
                onClick={() =>
                  setShowAddForm(
                    false,
                  )
                }
                style={{
                  background:
                    '#6b7280',
                }}
              >
                취소
              </button>
            </form>
          ) : (
            <form
              onSubmit={
                handleAddEvent
              }
            >
              <h3>
                {selectedDate} 일정 추가
              </h3>

              <select
                value={
                  eventStudentId
                }
                onChange={(
                  event,
                ) =>
                  setEventStudentId(
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  학원 전체
                </option>

                {activeStudents.map(
                  (student) => (
                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >
                      {student.name}
                    </option>
                  ),
                )}
              </select>

              <br />
              <br />

              <input
                type="text"
                placeholder="일정 제목"
                value={
                  eventTitle
                }
                onChange={(
                  event,
                ) =>
                  setEventTitle(
                    event.target
                      .value,
                  )
                }
              />

              <br />
              <br />

              <input
                type="text"
                placeholder="설명"
                value={
                  eventDescription
                }
                onChange={(
                  event,
                ) =>
                  setEventDescription(
                    event.target
                      .value,
                  )
                }
              />

              <br />
              <br />

              <label>
                종료일
              </label>

              <input
                type="date"
                min={selectedDate}
                value={
                  eventEndDate
                }
                onChange={(
                  event,
                ) =>
                  setEventEndDate(
                    event.target
                      .value,
                  )
                }
              />

              <br />
              <br />

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
              >
                일정 저장
              </button>

              {' '}

              <button
                type="button"
                onClick={() =>
                  setShowAddForm(
                    false,
                  )
                }
                style={{
                  background:
                    '#6b7280',
                }}
              >
                취소
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarPanel