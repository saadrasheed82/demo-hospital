import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { realtimeDb } from '../../firebase'

export const useRealtimeQueue = (doctorId) => {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!doctorId) {
      setLoading(false)
      return
    }

    const queueRef = ref(realtimeDb, `queues/${doctorId}`)

    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const tokenList = Object.entries(data).map(([id, token]) => ({
          id,
          ...token
        })).sort((a, b) => {
          const aStatus = getStatusPriority(a.status)
          const bStatus = getStatusPriority(b.status)
          if (aStatus !== bStatus) return aStatus - bStatus
          return parseInt(a.token) - parseInt(b.token)
        })
        setTokens(tokenList)
      } else {
        setTokens([])
      }
      setLoading(false)
    }, (err) => {
      setError(err)
      setLoading(false)
    })

    return () => off(queueRef, 'value', unsubscribe)
  }, [doctorId])

  return { tokens, loading, error }
}

const getStatusPriority = (status) => {
  const priorities = {
    current: 1,
    pending: 2,
    end_of_queue: 3,
    completed: 4,
    no_show: 5
  }
  return priorities[status] || 99
}
