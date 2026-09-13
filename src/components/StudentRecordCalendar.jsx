import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import EmptyState from './EmptyState'

function StudentBookManager({
  studentId,
}) {
  const { user } = useAuth()

  const [books, setBooks] =
    useState([])

  const [bookName, setBookName] =
    useState('')

  const [status, setStatus] =
    useState('current')

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

  const fetchBooks =
    async () => {
      setIsLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from('student_books')
        .select('*')
        .eq(
          'student_id',
          studentId,
        )
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        )

      if (error) {
        console.error(error)
        setBooks([])
      } else {
        setBooks(data ?? [])
      }

      setIsLoading(false)
    }

  useEffect(() => {
    fetchBooks()
  }, [studentId])

  const handleAddBook =
    async (event) => {
      event.preventDefault()

      if (!bookName.trim()) {
        alert(
          '교재명을 입력해주세요.',
        )
        return
      }

      setIsSubmitting(true)

      const { error } =
        await supabase
          .from(
            'student_books',
          )
          .insert({
            student_id:
              studentId,

            book_name:
              bookName.trim(),

            status,

            memo:
              memo.trim() ||
              null,

            started_at:
              status ===
              'current'
                ? new Date()
                    .toISOString()
                    .slice(
                      0,
                      10,
                    )
                : null,

            created_by:
              user.id,
          })

      setIsSubmitting(false)

      if (error) {
        console.error(error)

        alert(
          '교재 등록에 실패했습니다.',
        )

        return
      }

      setBookName('')
      setStatus('current')
      setMemo('')

      await fetchBooks()
    }

  const changeBookStatus =
    async (
      book,
      newStatus,
    ) => {
      const updateData = {
        status: newStatus,

        updated_at:
          new Date().toISOString(),
      }

      if (
        newStatus ===
          'current' &&
        !book.started_at
      ) {
        updateData.started_at =
          new Date()
            .toISOString()
            .slice(0, 10)
      }

      if (
        newStatus === 'past'
      ) {
        updateData.ended_at =
          new Date()
            .toISOString()
            .slice(0, 10)
      }

      const { error } =
        await supabase
          .from(
            'student_books',
          )
          .update(
            updateData,
          )
          .eq('id', book.id)

      if (error) {
        console.error(error)

        alert(
          '교재 상태 변경에 실패했습니다.',
        )

        return
      }

      await fetchBooks()
    }

  const renderBook = (
    book,
  ) => (
    <div
      key={book.id}
      style={{
        padding: '12px',

        border:
          '1px solid #e5e7eb',

        borderRadius: '10px',

        marginBottom: '8px',

        background: '#f9fafb',
      }}
    >
      <strong>
        {book.book_name}
      </strong>

      {book.memo && (
        <p
          style={{
            margin:
              '5px 0',
            color: '#6b7280',
          }}
        >
          {book.memo}
        </p>
      )}

      <select
        value={book.status}
        onChange={(event) =>
          changeBookStatus(
            book,
            event.target.value,
          )
        }
        style={{
          marginTop: '8px',
        }}
      >
        <option value="planned">
          앞으로 사용
        </option>

        <option value="current">
          현재 사용
        </option>

        <option value="past">
          사용 완료
        </option>
      </select>
    </div>
  )

  const current =
    books.filter(
      (book) =>
        book.status ===
        'current',
    )

  const planned =
    books.filter(
      (book) =>
        book.status ===
        'planned',
    )

  const past =
    books.filter(
      (book) =>
        book.status ===
        'past',
    )

  return (
    <div>
      <h2
        style={{
          marginTop: 0,
        }}
      >
        교재 관리
      </h2>

      <form
        onSubmit={
          handleAddBook
        }
      >
        <input
          type="text"
          placeholder="교재명"
          value={bookName}
          onChange={(event) =>
            setBookName(
              event.target.value,
            )
          }
        />

        <br />
        <br />

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value,
            )
          }
        >
          <option value="current">
            현재 사용
          </option>

          <option value="planned">
            앞으로 사용
          </option>

          <option value="past">
            사용 완료
          </option>
        </select>

        <br />
        <br />

        <input
          type="text"
          placeholder="교재 메모"
          value={memo}
          onChange={(event) =>
            setMemo(
              event.target.value,
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
          교재 추가
        </button>
      </form>

      <hr />

      <h3>현재 사용</h3>

      {current.length ===
      0 ? (
        <EmptyState message="현재 교재가 없습니다." />
      ) : (
        current.map(
          renderBook,
        )
      )}

      <h3>앞으로 사용</h3>

      {planned.length ===
      0 ? (
        <EmptyState message="예정 교재가 없습니다." />
      ) : (
        planned.map(
          renderBook,
        )
      )}

      <h3>사용 완료</h3>

      {past.length ===
      0 ? (
        <EmptyState message="완료된 교재가 없습니다." />
      ) : (
        past.map(renderBook)
      )}
    </div>
  )
}

export default StudentBookManager