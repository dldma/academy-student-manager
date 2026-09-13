import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import EmptyState from './EmptyState'

function StudentMemoManager({
  studentId,
}) {
  const { user } = useAuth()

  const [memos, setMemos] =
    useState([])

  const [
    profiles,
    setProfiles,
  ] = useState([])

  const [
    memoType,
    setMemoType,
  ] = useState('personal')

  const [content, setContent] =
    useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const fetchMemos =
    async () => {
      setIsLoading(true)

      const [
        memoResult,
        profileResult,
      ] =
        await Promise.all([
          supabase
            .from(
              'student_memos',
            )
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
            ),

          supabase
            .from('profiles')
            .select(
              'id, full_name, role',
            ),
        ])

      if (
        memoResult.error
      ) {
        console.error(
          memoResult.error,
        )

        setMemos([])
      } else {
        setMemos(
          memoResult.data ??
            [],
        )
      }

      if (
        profileResult.error
      ) {
        console.error(
          profileResult.error,
        )

        setProfiles([])
      } else {
        setProfiles(
          profileResult.data ??
            [],
        )
      }

      setIsLoading(false)
    }

  useEffect(() => {
    fetchMemos()
  }, [studentId])

  const handleAddMemo =
    async (event) => {
      event.preventDefault()

      if (!content.trim()) {
        alert(
          '메모 내용을 입력해주세요.',
        )
        return
      }

      setIsSubmitting(true)

      const { error } =
        await supabase
          .from(
            'student_memos',
          )
          .insert({
            student_id:
              studentId,

            author_id:
              user.id,

            memo_type:
              memoType,

            content:
              content.trim(),
          })

      setIsSubmitting(false)

      if (error) {
        console.error(error)

        alert(
          '메모 등록에 실패했습니다.',
        )

        return
      }

      setContent('')

      await fetchMemos()
    }

  const getAuthorName = (
    authorId,
  ) =>
    profiles.find(
      (profile) =>
        profile.id ===
        authorId,
    )?.full_name ??
    '알 수 없음'

  const renderMemo = (
    memo,
  ) => (
    <div
      key={memo.id}
      style={{
        padding: '12px',

        borderRadius:
          '10px',

        marginBottom:
          '8px',

        background:
          memo.memo_type ===
          'shared'
            ? '#eef2ff'
            : '#f9fafb',

        border:
          '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          gap: '10px',
        }}
      >
        <strong>
          {getAuthorName(
            memo.author_id,
          )}
        </strong>

        <span
          style={{
            fontSize:
              '12px',

            color:
              '#9ca3af',
          }}
        >
          {new Date(
            memo.created_at,
          ).toLocaleDateString(
            'ko-KR',
          )}
        </span>
      </div>

      <p
        style={{
          margin:
            '8px 0 0',
        }}
      >
        {memo.content}
      </p>
    </div>
  )

  const personal =
    memos.filter(
      (memo) =>
        memo.memo_type ===
        'personal',
    )

  const shared =
    memos.filter(
      (memo) =>
        memo.memo_type ===
        'shared',
    )

  return (
    <div>
      <h2
        style={{
          marginTop: 0,
        }}
      >
        학생 메모
      </h2>

      <form
        onSubmit={
          handleAddMemo
        }
      >
        <select
          value={memoType}
          onChange={(event) =>
            setMemoType(
              event.target.value,
            )
          }
        >
          <option value="personal">
            개인 메모
          </option>

          <option value="shared">
            공용 메모
          </option>
        </select>

        <br />
        <br />

        <textarea
          rows="5"
          placeholder="메모를 입력하세요."
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value,
            )
          }
        />

        <br />

        <button
          type="submit"
          disabled={
            isSubmitting
          }
        >
          메모 추가
        </button>
      </form>

      <hr />

      {isLoading ? (
        <p>
          메모를 불러오는 중...
        </p>
      ) : (
        <>
          <h3>개인 메모</h3>

          {personal.length ===
          0 ? (
            <EmptyState message="개인 메모가 없습니다." />
          ) : (
            personal.map(
              renderMemo,
            )
          )}

          <h3>공용 메모</h3>

          {shared.length ===
          0 ? (
            <EmptyState message="공용 메모가 없습니다." />
          ) : (
            shared.map(
              renderMemo,
            )
          )}
        </>
      )}
    </div>
  )
}

export default StudentMemoManager