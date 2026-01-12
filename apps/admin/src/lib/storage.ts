import { supabase } from './supabase'

// Storage bucket names
export const STORAGE_BUCKETS = {
    PRODUCT_IMAGES: 'product-images',
    PRODUCT_VIDEOS: 'product-videos',
    PRODUCT_DOCUMENTS: 'product-documents',
    PRODUCT_SCHEMATICS: 'product-schematics',
    PRODUCT_DIMENSIONS: 'product-dimensions',
    PRODUCT_CHARTS: 'product-charts',
    PRODUCT_MODELS: 'product-models',
    PRODUCT_CATALOGUES: 'product-catalogues',
    CATEGORY_CATALOGUES: 'category-catalogues'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// Upload a single file
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')

function buildPublicUrl(bucket: StorageBucket, path: string): string {
    if (!SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    }

    const encodedPath = encodeURI(`${bucket}/${path}`)
    return `${SUPABASE_URL}/storage/v1/object/public/${encodedPath}`
}

export async function uploadFile(
    file: File,
    bucket: StorageBucket,
    fileName?: string
): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop()
        const finalFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(finalFileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Upload error:', error)
            throw error
        }

        return buildPublicUrl(bucket, data.path)
    } catch (error) {
        console.error('Failed to upload file:', error)
        throw error
    }
}

// Upload multiple files
export async function uploadFiles(
    files: File[],
    bucket: StorageBucket
): Promise<string[]> {
    try {
        const uploadPromises = files.map(file => uploadFile(file, bucket))
        return await Promise.all(uploadPromises)
    } catch (error) {
        console.error('Failed to upload files:', error)
        throw error
    }
}

// Delete a file
export async function deleteFile(
    url: string,
    bucket: StorageBucket
): Promise<void> {
    try {
        // Extract file path from URL
        let path = ''
        try {
            const parsedUrl = new URL(url)
            const prefix = '/storage/v1/object/public/'
            const index = parsedUrl.pathname.indexOf(prefix)
            if (index !== -1) {
                path = decodeURI(parsedUrl.pathname.substring(index + prefix.length))
            } else {
                // Fallback for legacy URLs
                path = decodeURI(url.split('/storage/v1/object/public/')[1] || '')
            }
        } catch {
            path = decodeURI(url.split('/storage/v1/object/public/')[1] || '')
        }

        if (!path) {
            throw new Error('Invalid storage URL')
        }

        if (path.startsWith(`${bucket}/`)) {
            path = path.substring(bucket.length + 1)
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path])

        if (error) {
            console.error('Delete error:', error)
            throw error
        }
    } catch (error) {
        console.error('Failed to delete file:', error)
        throw error
    }
}

// Get file type from URL or file
export function getFileType(fileOrUrl: File | string): 'image' | 'video' | 'document' {
    const fileName = typeof fileOrUrl === 'string'
        ? fileOrUrl.split('/').pop() || ''
        : fileOrUrl.name

    const ext = fileName.toLowerCase().split('.').pop() || ''

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return 'image'
    }

    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
        return 'video'
    }

    return 'document'
}

// Format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file type and size
export function validateFile(
    file: File,
    allowedTypes: string[] = [],
    maxSizeMB: number = 50
): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size must be less than ${maxSizeMB}MB`
        }
    }

    // Check file type if specified
    if (allowedTypes.length > 0) {
        const fileExt = file.name.toLowerCase().split('.').pop() || ''
        if (!allowedTypes.includes(fileExt)) {
            return {
                valid: false,
                error: `File type must be one of: ${allowedTypes.join(', ')}`
            }
        }
    }

    return { valid: true }
}

// Create storage buckets (run this once in your Supabase dashboard or via API)
export async function createStorageBuckets(): Promise<void> {
    const buckets = Object.values(STORAGE_BUCKETS)

    for (const bucket of buckets) {
        try {
            const { error } = await supabase.storage.createBucket(bucket, {
                public: true,
                allowedMimeTypes: [
                    'image/*',
                    'video/*',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ],
                fileSizeLimit: 52428800 // 50MB
            })

            if (error && !error.message.includes('already exists')) {
                console.error(`Failed to create bucket ${bucket}:`, error)
            }
        } catch (error) {
            console.error(`Error creating bucket ${bucket}:`, error)
        }
    }
} 