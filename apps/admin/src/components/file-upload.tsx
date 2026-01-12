"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, X, FileIcon, ImageIcon, VideoIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { uploadFiles, validateFile, formatFileSize, getFileType, type StorageBucket } from '@/lib/storage'

interface FileUploadProps {
    bucket: StorageBucket
    onFilesUploaded: (urls: string[]) => void
    allowedTypes?: string[]
    maxFiles?: number
    maxSizeMB?: number
    multiple?: boolean
    title?: string
    description?: string
    className?: string
}

interface UploadingFile {
    file: File
    progress: number
    error?: string
    url?: string
}

export function FileUpload({
    bucket,
    onFilesUploaded,
    allowedTypes = [],
    maxFiles = 10,
    maxSizeMB = 50,
    multiple = true,
    title = 'Upload Files',
    description = 'Drag and drop files here, or click to browse',
    className = ''
}: FileUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const [uploading, setUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Validate files
        const validFiles: File[] = []
        const errors: string[] = []

        for (const file of acceptedFiles) {
            const validation = validateFile(file, allowedTypes, maxSizeMB)
            if (validation.valid) {
                validFiles.push(file)
            } else {
                errors.push(`${file.name}: ${validation.error}`)
            }
        }

        if (errors.length > 0) {
            alert('Some files were rejected:\n' + errors.join('\n'))
        }

        if (validFiles.length === 0) return

        // Check max files limit
        if (validFiles.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} files at once`)
            return
        }

        // Initialize uploading state
        const uploadingFileStates = validFiles.map(file => ({
            file,
            progress: 0
        }))
        setUploadingFiles(uploadingFileStates)
        setUploading(true)

        try {
            // Upload files
            const urls = await uploadFiles(validFiles, bucket)

            // Update progress to 100%
            setUploadingFiles(prev =>
                prev.map((item, index) => ({
                    ...item,
                    progress: 100,
                    url: urls[index]
                }))
            )

            // Call callback with URLs
            onFilesUploaded(urls)

            // Clear uploading state after a delay
            setTimeout(() => {
                setUploadingFiles([])
            }, 2000)

        } catch (error) {
            console.error('Upload failed:', error)
            setUploadingFiles(prev =>
                prev.map(item => ({
                    ...item,
                    error: 'Upload failed'
                }))
            )
        } finally {
            setUploading(false)
        }
    }, [bucket, onFilesUploaded, allowedTypes, maxFiles, maxSizeMB])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        disabled: uploading
    })

    const removeUploadingFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, i) => i !== index))
    }

    const getFileIcon = (file: File) => {
        const type = getFileType(file)
        switch (type) {
            case 'image':
                return <ImageIcon className="h-4 w-4" />
            case 'video':
                return <VideoIcon className="h-4 w-4" />
            default:
                return <FileIcon className="h-4 w-4" />
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
            >
                <input {...getInputProps()} />

                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-base font-medium mb-2">{title}</p>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>

                {allowedTypes.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-2">
                        Accepted formats: {allowedTypes.join(', ')}
                    </p>
                )}

                <p className="text-xs text-muted-foreground">
                    Max file size: {maxSizeMB}MB • Max files: {maxFiles}
                </p>

                <Button variant="outline" className="mt-4" disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                </Button>
            </div>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium">Uploading Files</h4>
                    {uploadingFiles.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {getFileIcon(item.file)}
                                    <span className="text-sm font-medium truncate">
                                        {item.file.name}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        {formatFileSize(item.file.size)}
                                    </Badge>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {item.error ? (
                                        <Badge variant="destructive">Failed</Badge>
                                    ) : item.progress === 100 ? (
                                        <Badge variant="default">Complete</Badge>
                                    ) : (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeUploadingFile(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            {!item.error && (
                                <Progress value={uploading ? 50 : item.progress} className="h-1" />
                            )}

                            {item.error && (
                                <p className="text-xs text-red-600">{item.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Image Preview Component
interface ImagePreviewProps {
    urls: string[]
    onRemove: (index: number) => void
    className?: string
}

export function ImagePreview({ urls, onRemove, className = '' }: ImagePreviewProps) {
    if (urls.length === 0) return null

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
            {urls.map((url, index) => (
                <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                        <Image
                            src={url}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        {index === 0 && (
                            <Badge className="absolute top-2 left-2">Main</Badge>
                        )}
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemove(index)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ))}
        </div>
    )
}

// Video Preview Component
interface VideoPreviewProps {
    urls: string[]
    onRemove: (index: number) => void
    className?: string
}

export function VideoPreview({ urls, onRemove, className = '' }: VideoPreviewProps) {
    if (urls.length === 0) return null

    return (
        <div className={`space-y-4 ${className}`}>
            {urls.map((url, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden">
                    <video
                        src={url}
                        controls
                        className="w-full aspect-video"
                    />
                    <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemove(index)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ))}
        </div>
    )
} 