'use client'

import { useState, useCallback, useEffect } from 'react'
import { ProductError } from './products'

// Custom hook for API calls with loading and error states
export function useApiCall<T, P extends Record<string, unknown>>(
    apiFunction: (params: P) => Promise<T>
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ProductError | null>(null)

    const execute = useCallback(async (params: P) => {
        setLoading(true)
        setError(null)

        try {
            const result = await apiFunction(params)
            setData(result)
            return result
        } catch (err) {
            const apiError = err instanceof ProductError ? err : new ProductError(
                'An unexpected error occurred',
                'UNKNOWN_ERROR',
                500
            )
            setError(apiError)
            throw apiError
        } finally {
            setLoading(false)
        }
    }, [apiFunction])

    const reset = useCallback(() => {
        setData(null)
        setError(null)
        setLoading(false)
    }, [])

    return {
        data,
        loading,
        error,
        execute,
        reset
    }
}

// Debounce utility for search inputs
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
} 