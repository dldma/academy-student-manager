import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function getTodayString() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function useTodayAttendance() {
  const { user } = useAuth()

  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTodayClasses = async () => {
    if (!user) {
      return
    }

    setIsLoading(true)
    setError(null)

    const today = getTodayString()
    const weekday = new Date().getDay()

    const {
      data: schedules,
      error: scheduleError,
    } = await supabase
      .from('class_schedules')
      .select(`
        id,
        student_id,
        teacher_id,
        weekday,
        start_time,
        end_time,
        valid_from,
        valid_to
      `)
      .eq('teacher_id', user.id)
      .eq('weekday', weekday)
      .lte('valid_from', today)
      .or(`valid_to.is.null,valid_to.gte.${today}`)
      .order('start_time', {
        ascending: true,
      })

    if (scheduleError) {
      console.error(scheduleError)
      setError(scheduleError.message)
      setIsLoading(false)
      return
    }

    if (!schedules || schedules.length === 0) {
      setClasses([])
      setIsLoading(false)
      return
    }

    const studentIds = [
      ...new Set(
        schedules.map(
          (schedule) => schedule.student_id,
        ),
      ),
    ]

    const scheduleIds = schedules.map(
      (schedule) => schedule.id,
    )

    const [
      studentsResult,
      attendanceResult,
    ] = await Promise.all([
      supabase
        .from('students')
        .select(
          'id, name, school, grade, status',
        )
        .in('id', studentIds),

      supabase
        .from('attendance')
        .select(
          'id, class_schedule_id, status, check_in_at, check_out_at',
        )
        .in('class_schedule_id', scheduleIds)
        .eq('attendance_date', today),
    ])

    if (studentsResult.error) {
      console.error(studentsResult.error)
      setError(studentsResult.error.message)
      setIsLoading(false)
      return
    }

    if (attendanceResult.error) {
      console.error(attendanceResult.error)
      setError(attendanceResult.error.message)
      setIsLoading(false)
      return
    }

    const students =
      studentsResult.data ?? []

    const attendance =
      attendanceResult.data ?? []

    const merged = schedules
      .map((schedule) => {
        const student = students.find(
          (item) =>
            item.id === schedule.student_id,
        )

        const attendanceRecord =
          attendance.find(
            (item) =>
              item.class_schedule_id ===
              schedule.id,
          )

        return {
          ...schedule,
          student,
          attendance:
            attendanceRecord ?? null,
        }
      })
      .filter(
        (item) =>
          item.student?.status === 'active',
      )

    setClasses(merged)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTodayClasses()
  }, [user])

  return {
    classes,
    isLoading,
    error,
    refetch: fetchTodayClasses,
    today: getTodayString(),
  }
}

export default useTodayAttendance