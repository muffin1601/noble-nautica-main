'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { ProductError } from '@/lib/products'

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
            }

            return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
        }

        return this.props.children
    }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
    const isProductError = error instanceof ProductError

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full mx-auto p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isProductError ? 'API Error' : 'Something went wrong'}
                    </h3>

                    <p className="text-sm text-gray-600 mb-6">
                        {isProductError
                            ? error.message
                            : 'An unexpected error occurred. Please try again.'
                        }
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={resetError}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            Go to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Hook for handling API errors in components
export function useErrorHandler() {
    const [error, setError] = React.useState<ProductError | null>(null)

    const handleError = React.useCallback((err: unknown) => {
        if (err instanceof ProductError) {
            setError(err)
        } else {
            setError(new ProductError(
                'An unexpected error occurred',
                'UNKNOWN_ERROR',
                500
            ))
        }
    }, [])

    const clearError = React.useCallback(() => {
        setError(null)
    }, [])

    return { error, handleError, clearError }
} 