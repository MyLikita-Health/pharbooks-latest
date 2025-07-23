"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseApiDataOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApiData<T = any>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiDataOptions = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.immediate !== false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred")
      setError(error)
      options.onError?.(error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiCall, options, toast])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  }
}

export function useApiMutation<T = any, P = any>(apiCall: (params: P) => Promise<T>, options: UseApiDataOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(
    async (params: P) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall(params)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred")
        setError(error)
        options.onError?.(error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [apiCall, options, toast],
  )

  return {
    mutate,
    loading,
    error,
  }
}
