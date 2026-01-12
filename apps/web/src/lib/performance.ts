// Performance monitoring utilities
interface PerformanceMetric {
    operation: string
    duration: number
    timestamp: number
    success: boolean
    cacheHit?: boolean
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = []
    private maxMetrics = 100 // Keep last 100 metrics

    recordMetric(metric: PerformanceMetric) {
        this.metrics.push(metric)

        // Keep only the last maxMetrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics)
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Performance: ${metric.operation} took ${metric.duration}ms (${metric.success ? 'success' : 'failed'})${metric.cacheHit ? ' [CACHE HIT]' : ''}`)
        }
    }

    getMetrics() {
        return this.metrics
    }

    getAverageResponseTime(operation?: string) {
        const filtered = operation
            ? this.metrics.filter(m => m.operation === operation)
            : this.metrics

        if (filtered.length === 0) return 0

        const total = filtered.reduce((sum, m) => sum + m.duration, 0)
        return total / filtered.length
    }

    getCacheHitRate() {
        const cacheHits = this.metrics.filter(m => m.cacheHit).length
        return this.metrics.length > 0 ? cacheHits / this.metrics.length : 0
    }

    getSuccessRate() {
        const successes = this.metrics.filter(m => m.success).length
        return this.metrics.length > 0 ? successes / this.metrics.length : 0
    }

    clear() {
        this.metrics = []
    }
}

export const performanceMonitor = new PerformanceMonitor()

// Performance wrapper for API calls
export function withPerformanceMonitoring<T>(
    operation: string,
    fn: () => Promise<T>,
    cacheHit = false
): Promise<T> {
    const startTime = performance.now()

    return fn()
        .then(result => {
            const duration = performance.now() - startTime
            performanceMonitor.recordMetric({
                operation,
                duration,
                timestamp: Date.now(),
                success: true,
                cacheHit
            })
            return result
        })
        .catch(error => {
            const duration = performance.now() - startTime
            performanceMonitor.recordMetric({
                operation,
                duration,
                timestamp: Date.now(),
                success: false,
                cacheHit
            })
            throw error
        })
}

// Cache performance utilities
export function getCacheStats() {
    return {
        cacheHitRate: performanceMonitor.getCacheHitRate(),
        averageResponseTime: performanceMonitor.getAverageResponseTime(),
        successRate: performanceMonitor.getSuccessRate(),
        totalMetrics: performanceMonitor.getMetrics().length
    }
} 