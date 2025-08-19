import { useState, useEffect, useCallback } from 'react'

// 옵션 타입 정의
interface UseSupabaseQueryOptions<T> {
  // 컴포넌트 마운트 시 즉시 실행할지 여부
  immediate?: boolean
  // 성공 콜백
  onSuccess?: (data: T) => void
  // 에러 콜백
  onError?: (error: string) => void
  // 데이터가 없을 때 기본값
  defaultValue?: T
  // 에러 메시지 커스터마이징
  errorMessage?: string
}

// 반환 타입 정의
interface UseSupabaseQueryResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  reset: () => void
}

/**
 * Supabase 쿼리를 위한 범용 훅
 * 
 * @param queryFn - Supabase 쿼리 함수
 * @param deps - 의존성 배열 (쿼리 재실행 조건)
 * @param options - 추가 옵션들
 * @returns 데이터, 로딩 상태, 에러, refetch 함수, reset 함수
 */
export const useSupabaseQuery = <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  deps: any[] = [],
  options: UseSupabaseQueryOptions<T> = {}
): UseSupabaseQueryResult<T> => {
  const [data, setData] = useState<T | null>(options.defaultValue || null)
  const [loading, setLoading] = useState(options.immediate !== false)
  const [error, setError] = useState<string | null>(null)

  // 쿼리 실행 함수
  const executeQuery = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await queryFn()
      
      if (result.error) {
        throw new Error(result.error.message || result.error.toString())
      }
      
      const resultData = result.data || options.defaultValue || null
      setData(resultData)
      
      // 성공 콜백 실행
      if (resultData && options.onSuccess) {
        options.onSuccess(resultData)
      }
    } catch (err: any) {
      const errorMessage = options.errorMessage || 
        err.message || 
        '데이터를 불러오는데 실패했습니다.'
      
      setError(errorMessage)
      console.error('Supabase query error:', err)
      
      // 에러 콜백 실행
      if (options.onError) {
        options.onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [...deps, options.errorMessage])

  // 상태 초기화 함수
  const reset = useCallback(() => {
    setData(options.defaultValue || null)
    setError(null)
    setLoading(false)
  }, [options.defaultValue])

  // 의존성이 변경되면 쿼리 재실행
  useEffect(() => {
    if (options.immediate !== false) {
      executeQuery()
    }
  }, [executeQuery])

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
    reset
  }
}

/**
 * 비동기 작업을 위한 범용 훅
 * 주로 CUD 작업(Create, Update, Delete)에 사용
 */
export const useAsyncOperation = <T, P = any>(
  operationFn: (params: P) => Promise<{ data: T | null; error: any }>,
  options: {
    onSuccess?: (data: T, params: P) => void
    onError?: (error: string, params: P) => void
    successMessage?: string
    errorMessage?: string
  } = {}
) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const execute = useCallback(async (params: P): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const result = await operationFn(params)
      
      if (result.error) {
        throw new Error(result.error.message || result.error.toString())
      }
      
      // 성공 메시지 설정
      if (options.successMessage) {
        setSuccess(options.successMessage)
      }
      
      // 성공 콜백 실행
      if (result.data && options.onSuccess) {
        options.onSuccess(result.data, params)
      }
      
      return result.data
    } catch (err: any) {
      const errorMessage = options.errorMessage || 
        err.message || 
        '작업을 수행하는데 실패했습니다.'
      
      setError(errorMessage)
      console.error('Async operation error:', err)
      
      // 에러 콜백 실행
      if (options.onError) {
        options.onError(errorMessage, params)
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [options.onSuccess, options.onError, options.successMessage, options.errorMessage])

  const reset = useCallback(() => {
    setError(null)
    setSuccess(null)
    setLoading(false)
  }, [])

  return {
    execute,
    loading,
    error,
    success,
    reset
  }
}
