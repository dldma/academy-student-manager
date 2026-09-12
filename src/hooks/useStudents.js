import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function useStudents() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setStudents([])
    } else {
      setStudents(data ?? [])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    isLoading,
    error,
    refetch: fetchStudents,
  }
}

export default useStudents