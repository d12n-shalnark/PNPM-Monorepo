import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to subscribe to real-time changes on a table
 */
export function useRealtimeTable<T extends { id: string }>(
  table: string,
  options: {
    filter?: string
    initialData?: T[]
    select?: string
  } = {}
) {
  const { filter, initialData = [], select = '*' } = options
  const [data, setData] = useState<T[]>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial data
    const fetchData = async () => {
      try {
        let query = supabase.from(table).select(select)
        
        if (filter) {
          const [column, operator, value] = filter.split('.')
          if (column && operator && value) {
            query = query.filter(column, operator, value)
          }
        }

        const { data: result, error } = await query
        
        if (error) throw error
        setData((result as unknown as T[]) || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as const,
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          const p = payload as unknown as { eventType: string; new: T; old: { id: string } }
          if (p.eventType === 'INSERT') {
            setData((prev) => [p.new, ...prev])
          } else if (p.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                item.id === p.new.id ? p.new : item
              )
            )
          } else if (p.eventType === 'DELETE') {
            setData((prev) => prev.filter((item) => item.id !== p.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, select])

  return { data, error, isLoading }
}

/**
 * Hook for fetching data with loading and error states
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, error, isLoading, refetch: fetch }
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T extends { id: string }>(
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const addOptimistic = useCallback((item: T, tempId: string) => {
    setData((prev) => [{ ...item, id: tempId } as T, ...prev])
    setPendingIds((prev) => new Set(prev).add(tempId))
  }, [])

  const updateOptimistic = useCallback((tempId: string, updates: Partial<T>) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === tempId ? { ...item, ...updates } : item
      )
    )
  }, [])

  const removeOptimistic = useCallback((tempId: string) => {
    setData((prev) => prev.filter((item) => item.id !== tempId))
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.delete(tempId)
      return next
    })
  }, [])

  const confirmUpdate = useCallback((tempId: string, realId: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === tempId ? { ...item, id: realId } as T : item
      )
    )
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.delete(tempId)
      return next
    })
  }, [])

  const revertOptimistic = useCallback((tempId: string) => {
    setData((prev) => prev.filter((item) => item.id !== tempId))
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.delete(tempId)
      return next
    })
  }, [])

  return {
    data,
    setData,
    pendingIds,
    isPending: pendingIds.size > 0,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmUpdate,
    revertOptimistic,
  }
}
