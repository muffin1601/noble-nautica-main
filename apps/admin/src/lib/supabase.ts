import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export interface Product {
    id: number
    name: string
    description: string | null
    category: string
    subcategory?: string | null
    status: 'Active' | 'Draft' | 'Archived'
    data: ProductData
    created_at: string
    updated_at: string
}

export interface Category {
    id: number
    name: string
    description: string | null
    slug: string
    status: 'Active' | 'Inactive'
    product_count?: number
    image?: string | null
    catalogue_url?: string | null
    created_at: string
    updated_at: string
}

export interface ProductData {
    features?: string[]
    images?: string[]
    sections?: {
        models?: { enabled: boolean }
        pressure?: { enabled: boolean }
        schematics?: { enabled: boolean }
        dimensions?: { enabled: boolean }
        certificates?: { enabled: boolean }
        videos?: { enabled: boolean }
        catalogues?: { enabled: boolean }
    }
    models?: string[] // Changed to array of image URLs
    documents?: Array<{
        name: string
        url: string
        type: string
    }>
    catalogues?: Array<{
        name: string
        url: string
        type: string
    }>
    videos?: Array<{
        title: string
        url: string
        thumbnail: string
    }>
    charts?: string[]
    schematics?: string[]
    dimensions?: string[]
}

export interface CreateProductData {
    name: string
    description?: string
    category: string
    subcategory?: string
    status?: 'Active' | 'Draft' | 'Archived'
    data?: ProductData
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id: number
}

export interface CreateCategoryData {
    name: string
    description?: string
    slug: string
    status?: 'Active' | 'Inactive'
    image?: string
    catalogue_url?: string
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id: number
}

// Subcategory types
export interface Subcategory {
    id: number
    category_id: number
    parent_subcategory_id?: number | null
    name: string
    description: string | null
    slug: string
    status: 'Active' | 'Inactive'
    created_at: string
    updated_at: string
}

export interface CreateSubcategoryData {
    category_id: number
    parent_subcategory_id?: number | null
    name: string
    description?: string
    slug: string
    status?: 'Active' | 'Inactive'
}

export interface UpdateSubcategoryData extends Partial<CreateSubcategoryData> {
    id: number
}