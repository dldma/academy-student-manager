import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import EmptyState from './EmptyState'

function StudentBookManager({ studentId }) {
  const { user } = useAuth()

  const [books, setBooks] = useState([])

  const [bookName, setBookName] = useState('')
  const [status, setStatus] = useState('current')
  const [memo, setMemo] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const fetchBooks = async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('student_books')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', {
        ascending: false,
      })

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

  const handleAddBook = async (event) => {
    event.preventDefault()

    if (!bookName.trim()) {
      alert('교재명을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from('student_books')
      .insert({
        student_id: studentId,
        book_name: bookName.trim(),
        status,
        memo: memo.trim() || null,

        started_at:
          status === 'current'
            ? new Date()
                .toISOString()
                .slice(0, 10)
            : null,

        created_by: user.id,
      })

    setIsSubmitting(false)

    if (error) {
      console.error(error)
      alert('교재 등록에 실패했습니다.')
      return
    }

    setBookName('')
    setStatus('current')
    setMemo('')

    await fetchBooks()
  }

  const changeBookStatus = async (
    book,
    newStatus,
  ) => {
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (
      newStatus === 'current' &&
      !book.started_at
    ) {
      updateData.started_at = new Date()
        .toISOString()
        .slice(0, 10)
    }

    if (newStatus === 'past') {
      updateData.ended_at = new Date()
        .toISOString()
        .slice(0, 10)
    }

    if (newStatus === 'planned') {
      updateData.started_at = null
      updateData.ended_at = null
    }

    const { error } = await supabase
      .from('student_books')
      .update(updateData)
      .eq('id', book.id)

    if (error) {
      console.error(error)
      alert('교재 상태 변경에 실패했습니다.')
      return
    }

    await fetchBooks()
  }

  const currentBooks = books.filter(
    (book) => book.status === 'current',
  )

  const plannedBooks = books.filter(
    (book) => book.status === 'planned',
  )

  const pastBooks = books.filter(
    (book) => book.status === 'past',
  )

  const renderBook = (book) => (
    <div
      key={book.id}
      style={{
        border: '1px solid #555',
        padding: '10px',
        marginBottom: '8px',
      }}
    >
      <strong>{book.book_name}</strong>

      {book.memo && (
        <p>
          메모: {book.memo}
        </p>
      )}

      {book.started_at && (
        <p>
          시작일: {book.started_at}
        </p>
      )}

      {book.ended_at && (
        <p>
          종료일: {book.ended_at}
        </p>
      )}

      {book.status !== 'planned' && (
        <>
          <button
            type="button"
            onClick={() =>
              changeBookStatus(
                book,
                'planned',
              )
            }
          >
            예정으로 변경
          </button>

          {' '}
        </>
      )}

      {book.status !== 'current' && (
        <>
          <button
            type="button"
            onClick={() =>
              changeBookStatus(
                book,
                'current',
              )
            }
          >
            현재 교재로 변경
          </button>

          {' '}
        </>
      )}

      {book.status !== 'past' && (
        <button
          type="button"
          onClick={() =>
            changeBookStatus(
              book,
              'past',
            )
          }
        >
          사용 완료
        </button>
      )}
    </div>
  )

  return (
    <section>
      <h2>교재 관리</h2>

      <form onSubmit={handleAddBook}>
        <div>
          <label>
            교재명
          </label>

          <input
            type="text"
            value={bookName}
            onChange={(event) =>
              setBookName(
                event.target.value,
              )
            }
          />
        </div>

        <br />

        <div>
          <label>
            상태
          </label>

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
              과거 교재
            </option>
          </select>
        </div>

        <br />

        <div>
          <label>
            메모
          </label>

          <input
            type="text"
            placeholder="예: 이 책 끝나면 쎈 시작"
            value={memo}
            onChange={(event) =>
              setMemo(
                event.target.value,
              )
            }
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? '등록 중...'
            : '교재 추가'}
        </button>
      </form>

      <hr />

      {isLoading ? (
        <p>교재를 불러오는 중...</p>
      ) : (
        <>
          <h3>현재 사용 중인 책</h3>

          {currentBooks.length === 0 ? (
            <EmptyState message="현재 사용 중인 교재가 없습니다." />
          ) : (
            currentBooks.map(renderBook)
          )}

          <h3>앞으로 사용할 책</h3>

          {plannedBooks.length === 0 ? (
            <EmptyState message="예정된 교재가 없습니다." />
          ) : (
            plannedBooks.map(renderBook)
          )}

          <h3>과거에 사용한 책</h3>

          {pastBooks.length === 0 ? (
            <EmptyState message="과거 교재가 없습니다." />
          ) : (
            pastBooks.map(renderBook)
          )}
        </>
      )}
    </section>
  )
}

export default StudentBookManager