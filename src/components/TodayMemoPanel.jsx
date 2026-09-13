import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function getTodayString() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function TodayMemoPanel({ students, refreshKey }) {
  const [memos, setMemos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTodayMemos = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('calendar_memos')
        .select('*')
        .eq('memo_date', getTodayString())
        .order('created_at', { ascending: true })

      if (error) {
        console.error(error)
        setMemos([])
      } else {
        setMemos(data ?? [])
      }

      setIsLoading(false)
    }

    fetchTodayMemos()
  }, [refreshKey])

  const getStudentName = (studentId) => {
    if (!studentId) {
      return null
    }

    return students.find(
      (student) => student.id === studentId,
    )?.name
  }

  return (
    <div>
      <h2>오늘 메모</h2>

      {isLoading ? (
        <p>메모 불러오는 중...</p>
      ) : memos.length === 0 ? (
        <p>오늘 등록된 메모가 없습니다.</p>
      ) : (
        memos.map((memo) => (
          <div
            key={memo.id}
            style={{
              padding: '8px',
              marginBottom: '6px',
              border: '1px solid #555',
            }}
          >
            {memo.student_id && (
              <strong>
                {getStudentName(memo.student_id)} -{' '}
              </strong>
            )}

            {memo.content}
          </div>
        ))
      )}
    </div>
  )
}

export default TodayMemoPanel