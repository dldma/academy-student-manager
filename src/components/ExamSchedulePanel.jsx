import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import EmptyState from './EmptyState'

const gradeOptions = [
  '1학년',
  '2학년',
  '3학년',
]

const examOptions = [
  '1학기 중간고사',
  '1학기 기말고사',
  '2학기 중간고사',
  '2학기 기말고사',
]

const emptyGradeDates = {
  '1학년': '',
  '2학년': '',
  '3학년': '',
}

const emptyPending = {
  '1학년': false,
  '2학년': false,
  '3학년': false,
}

function ExamSchedulePanel({
  onDataChanged,
}) {
  const [exams, setExams] = useState([])

  const [isOpen, setIsOpen] =
    useState(false)

  const [editingIds, setEditingIds] =
    useState([])

  const [school, setSchool] =
    useState('')

  const [examName, setExamName] =
    useState('1학기 중간고사')

  const [
    periodStartDate,
    setPeriodStartDate,
  ] = useState('')

  const [
    periodEndDate,
    setPeriodEndDate,
  ] = useState('')

  const [
    selectedGrades,
    setSelectedGrades,
  ] = useState([])

  const [
    gradeDates,
    setGradeDates,
  ] = useState(emptyGradeDates)

  const [
    gradePending,
    setGradePending,
  ] = useState(emptyPending)

  const [memo, setMemo] =
    useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const fetchExams = async () => {
    setIsLoading(true)

    const today = new Date()
      .toISOString()
      .slice(0, 10)

    const { data, error } =
      await supabase
        .from('exam_schedules')
        .select('*')
        .gte(
          'period_end_date',
          today,
        )
        .order(
          'period_start_date',
          {
            ascending: true,
          },
        )

    if (error) {
      console.error(error)
      setExams([])
    } else {
      setExams(data ?? [])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const resetForm = () => {
    setEditingIds([])

    setSchool('')

    setExamName(
      '1학기 중간고사',
    )

    setPeriodStartDate('')
    setPeriodEndDate('')

    setSelectedGrades([])

    setGradeDates({
      ...emptyGradeDates,
    })

    setGradePending({
      ...emptyPending,
    })

    setMemo('')
  }

  const openNewForm = () => {
    resetForm()
    setIsOpen(true)
  }

  const closeForm = () => {
    resetForm()
    setIsOpen(false)
  }

  const toggleGrade = (grade) => {
    setSelectedGrades(
      (current) => {
        if (
          current.includes(grade)
        ) {
          return current.filter(
            (item) =>
              item !== grade,
          )
        }

        return [
          ...current,
          grade,
        ]
      },
    )
  }

  const changeGradeDate = (
    grade,
    date,
  ) => {
    setGradeDates(
      (current) => ({
        ...current,
        [grade]: date,
      }),
    )
  }

  const togglePending = (
    grade,
  ) => {
    setGradePending(
      (current) => {
        const nextValue =
          !current[grade]

        if (nextValue) {
          setGradeDates(
            (dates) => ({
              ...dates,
              [grade]: '',
            }),
          )
        }

        return {
          ...current,
          [grade]: nextValue,
        }
      },
    )
  }

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault()

    if (!school.trim()) {
      alert(
        '학교를 입력해주세요.',
      )
      return
    }

    if (
      !periodStartDate ||
      !periodEndDate
    ) {
      alert(
        '전체 시험기간을 입력해주세요.',
      )
      return
    }

    if (
      periodEndDate <
      periodStartDate
    ) {
      alert(
        '시험 종료일을 확인해주세요.',
      )
      return
    }

    if (
      selectedGrades.length === 0
    ) {
      alert(
        '시험 대상 학년을 선택해주세요.',
      )
      return
    }

    const hasInvalidGrade =
      selectedGrades.some(
        (grade) => {
          if (
            gradePending[grade]
          ) {
            return false
          }

          if (
            !gradeDates[grade]
          ) {
            return true
          }

          return (
            gradeDates[grade] <
              periodStartDate ||
            gradeDates[grade] >
              periodEndDate
          )
        },
      )

    if (hasInvalidGrade) {
      alert(
        '확정된 학년은 시험기간 안의 시험일을 입력해주세요.',
      )
      return
    }

    setIsSubmitting(true)

    const { error } =
      await supabase.rpc(
        'save_exam_schedule_group',
        {
          p_existing_ids:
            editingIds.length > 0
              ? editingIds
              : null,

          p_school:
            school.trim(),

          p_exam_name:
            examName,

          p_period_start_date:
            periodStartDate,

          p_period_end_date:
            periodEndDate,

          p_grades:
            selectedGrades,

          p_exam_dates:
            selectedGrades.map(
              (grade) =>
                gradePending[
                  grade
                ]
                  ? null
                  : gradeDates[
                      grade
                    ],
            ),

          p_pending:
            selectedGrades.map(
              (grade) =>
                gradePending[
                  grade
                ],
            ),

          p_memo:
            memo.trim() || null,
        },
      )

    setIsSubmitting(false)

    if (error) {
      console.error(error)

      alert(
        error.message ||
          '시험 일정 저장에 실패했습니다.',
      )

      return
    }

    await fetchExams()

    if (onDataChanged) {
      onDataChanged()
    }

    closeForm()

    alert(
      editingIds.length > 0
        ? '시험 일정이 수정되었습니다.'
        : '시험 일정이 등록되었습니다.',
    )
  }

  const groupedExams =
    exams.reduce(
      (groups, exam) => {
        const key = [
          exam.school,
          exam.exam_name,
          exam.period_start_date,
          exam.period_end_date,
        ].join('-')

        if (!groups[key]) {
          groups[key] = {
            school:
              exam.school,

            examName:
              exam.exam_name,

            periodStartDate:
              exam.period_start_date,

            periodEndDate:
              exam.period_end_date,

            memo:
              exam.memo,

            items: [],
          }
        }

        groups[key].items.push(
          exam,
        )

        return groups
      },
      {},
    )

  const examGroups =
    Object.values(groupedExams)

  const handleEdit = (group) => {
    const nextDates = {
      ...emptyGradeDates,
    }

    const nextPending = {
      ...emptyPending,
    }

    const nextGrades = []

    group.items.forEach(
      (item) => {
        nextGrades.push(
          item.grade,
        )

        nextDates[item.grade] =
          item.exam_date ?? ''

        nextPending[
          item.grade
        ] =
          item.exam_date_status ===
            'pending' ||
          !item.exam_date
      },
    )

    setEditingIds(
      group.items.map(
        (item) => item.id,
      ),
    )

    setSchool(group.school)

    setExamName(
      group.examName,
    )

    setPeriodStartDate(
      group.periodStartDate,
    )

    setPeriodEndDate(
      group.periodEndDate,
    )

    setSelectedGrades(
      nextGrades,
    )

    setGradeDates(
      nextDates,
    )

    setGradePending(
      nextPending,
    )

    setMemo(
      group.memo ?? '',
    )

    setIsOpen(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleDelete = async (
    group,
  ) => {
    const confirmed =
      window.confirm(
        `${group.school} ${group.examName} 일정을 삭제할까요?`,
      )

    if (!confirmed) {
      return
    }

    const { error } =
      await supabase.rpc(
        'delete_exam_schedule_group',
        {
          p_ids:
            group.items.map(
              (item) =>
                item.id,
            ),
        },
      )

    if (error) {
      console.error(error)

      alert(
        '시험 일정 삭제에 실패했습니다.',
      )

      return
    }

    await fetchExams()

    if (onDataChanged) {
      onDataChanged()
    }
  }

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
        }}
      >
        <h2>시험 일정</h2>

        {!isOpen && (
          <button
            type="button"
            onClick={
              openNewForm
            }
          >
            시험 일정 추가
          </button>
        )}
      </div>

      {isOpen && (
        <form
          onSubmit={
            handleSubmit
          }
          style={{
            border:
              '1px solid #555',
            padding: '15px',
            marginBottom:
              '20px',
          }}
        >
          <h3>
            {editingIds.length >
            0
              ? '시험 일정 수정'
              : '시험 일정 추가'}
          </h3>

          <div>
            <label>학교</label>

            <br />

            <input
              type="text"
              placeholder="예: 관양중학교"
              value={school}
              onChange={(
                event,
              ) =>
                setSchool(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <br />

          <div>
            <label>시험</label>

            <br />

            <select
              value={examName}
              onChange={(
                event,
              ) =>
                setExamName(
                  event.target
                    .value,
                )
              }
            >
              {examOptions.map(
                (exam) => (
                  <option
                    key={exam}
                    value={exam}
                  >
                    {exam}
                  </option>
                ),
              )}
            </select>
          </div>

          <br />

          <div>
            <label>
              전체 시험기간
            </label>

            <br />

            <input
              type="date"
              value={
                periodStartDate
              }
              onChange={(
                event,
              ) =>
                setPeriodStartDate(
                  event.target
                    .value,
                )
              }
            />

            {' ~ '}

            <input
              type="date"
              min={
                periodStartDate
              }
              value={
                periodEndDate
              }
              onChange={(
                event,
              ) =>
                setPeriodEndDate(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <br />

          <strong>
            시험 대상 학년
          </strong>

          <br />
          <br />

          {gradeOptions.map(
            (grade) => (
              <label
                key={grade}
                style={{
                  marginRight:
                    '15px',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(
                    grade,
                  )}
                  onChange={() =>
                    toggleGrade(
                      grade,
                    )
                  }
                />

                {' '}
                {grade}
              </label>
            ),
          )}

          {selectedGrades.length >
            0 && (
            <>
              <hr />

              <h3>
                학년별 해당 과목
                시험일
              </h3>

              {gradeOptions
                .filter(
                  (grade) =>
                    selectedGrades.includes(
                      grade,
                    ),
                )
                .map(
                  (grade) => (
                    <div
                      key={
                        grade
                      }
                      style={{
                        marginBottom:
                          '12px',
                      }}
                    >
                      <strong>
                        {grade}
                      </strong>

                      {' '}

                      <input
                        type="date"
                        min={
                          periodStartDate
                        }
                        max={
                          periodEndDate
                        }
                        disabled={
                          gradePending[
                            grade
                          ]
                        }
                        value={
                          gradeDates[
                            grade
                          ]
                        }
                        onChange={(
                          event,
                        ) =>
                          changeGradeDate(
                            grade,
                            event
                              .target
                              .value,
                          )
                        }
                      />

                      {' '}

                      <button
                        type="button"
                        onClick={() =>
                          togglePending(
                            grade,
                          )
                        }
                      >
                        {gradePending[
                          grade
                        ]
                          ? '보류 해제'
                          : '보류'}
                      </button>

                      {gradePending[
                        grade
                      ] && (
                        <span>
                          {' '}
                          날짜 미확정
                        </span>
                      )}
                    </div>
                  ),
                )}
            </>
          )}

          <div>
            <label>메모</label>

            <br />

            <input
              type="text"
              placeholder="선택사항"
              value={memo}
              onChange={(
                event,
              ) =>
                setMemo(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? '저장 중...'
              : editingIds.length >
                  0
                ? '수정 완료'
                : '시험 일정 등록'}
          </button>

          {' '}

          <button
            type="button"
            onClick={
              closeForm
            }
          >
            취소
          </button>
        </form>
      )}

      {isLoading ? (
        <p>
          시험 일정을
          불러오는 중...
        </p>
      ) : examGroups.length ===
        0 ? (
        <EmptyState message="등록된 시험 일정이 없습니다." />
      ) : (
        examGroups.map(
          (group) => (
            <div
              key={[
                group.school,
                group.examName,
                group.periodStartDate,
              ].join('-')}
              style={{
                border:
                  '1px solid #555',
                padding:
                  '12px',
                marginBottom:
                  '10px',
              }}
            >
              <strong>
                {group.school}
              </strong>

              <h3>
                {group.examName}
              </h3>

              <p>
                전체 시험기간:{' '}
                {
                  group.periodStartDate
                }
                {' ~ '}
                {
                  group.periodEndDate
                }
              </p>

              <strong>
                학년별 해당 과목
                시험일
              </strong>

              <br />
              <br />

              {group.items
                .sort(
                  (a, b) =>
                    a.grade.localeCompare(
                      b.grade,
                      'ko',
                      {
                        numeric:
                          true,
                      },
                    ),
                )
                .map(
                  (exam) => (
                    <div
                      key={
                        exam.id
                      }
                    >
                      {exam.grade}
                      {' : '}

                      {exam.exam_date_status ===
                        'pending' ||
                      !exam.exam_date ? (
                        <strong>
                          보류
                        </strong>
                      ) : (
                        exam.exam_date
                      )}
                    </div>
                  ),
                )}

              {group.memo && (
                <p>
                  메모:{' '}
                  {group.memo}
                </p>
              )}

              <br />

              <button
                type="button"
                onClick={() =>
                  handleEdit(
                    group,
                  )
                }
              >
                수정
              </button>

              {' '}

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    group,
                  )
                }
              >
                삭제
              </button>
            </div>
          ),
        )
      )}
    </section>
  )
}

export default ExamSchedulePanel