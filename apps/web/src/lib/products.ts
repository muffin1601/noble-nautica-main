import { supabase } from './supabase'
import type { Product, Category, Subcategory } from './supabase'
import { withPerformanceMonitoring } from './performance'

// Cache for storing API responses
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

// Request deduplication - prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<unknown>>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

// Error types for better error handling
export class ProductError extends Error {
    constructor(message: string, public code: string, public statusCode?: number) {
        super(message)
        this.name = 'ProductError'
    }
}

// Cache management functions
function getCacheKey(operation: string, params: Record<string, unknown> = {}): string {
    return `${operation}:${JSON.stringify(params)}`
}

function getFromCache<T>(key: string): T | null {
    const cached = cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
        cache.delete(key)
        return null
    }

    return cached.data as T
}

function setCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
    })
}

function clearCache(pattern?: string): void {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key)
            }
        }
    } else {
        cache.clear()
    }
}

// Request deduplication wrapper
async function deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
): Promise<T> {
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key) as Promise<T>
    }

    const promise = requestFn()
    pendingRequests.set(key, promise)

    try {
        const result = await promise
        return result
    } finally {
        pendingRequests.delete(key)
    }
}

// Generic API wrapper with caching and error handling
async function apiCall<T>(
    operation: string,
    params: Record<string, unknown>,
    requestFn: () => Promise<T>,
    cacheKey?: string,
    ttl?: number
): Promise<T> {
    const key = cacheKey || getCacheKey(operation, params)

    // Check cache first
    const cached = getFromCache<T>(key)
    if (cached !== null) {
        return withPerformanceMonitoring(operation, () => Promise.resolve(cached), true)
    }

    // Deduplicate requests
    return deduplicateRequest(key, async () => {
        return withPerformanceMonitoring(operation, async () => {
            try {
                const result = await requestFn()
                setCache(key, result, ttl)
                return result
            } catch (error) {
                console.error(`API Error in ${operation}:`, error)

                if (error instanceof ProductError) {
                    throw error
                }

                // Handle Supabase errors
                if (error && typeof error === 'object' && 'message' in error) {
                    const errorMessage = (error as { message: string }).message
                    if (errorMessage?.includes('JWT')) {
                        throw new ProductError('Authentication required', 'AUTH_REQUIRED', 401)
                    }
                    if (errorMessage?.includes('not found')) {
                        throw new ProductError('Resource not found', 'NOT_FOUND', 404)
                    }
                }

                throw new ProductError(
                    `Failed to ${operation.toLowerCase()}`,
                    'API_ERROR',
                    500
                )
            }
        })
    })
}

// Get all active products for the web app
export async function getProducts(): Promise<Product[]> {
    return apiCall(
        'getProducts',
        {},
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'Active')
                .order('updated_at', { ascending: false })

            if (error) throw error
            return data || []
        },
        'products:all',
        CACHE_TTL
    )
}

// Get a single product by ID
export async function getProduct(id: number): Promise<Product | null> {
    return apiCall(
        'getProduct',
        { id },
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .eq('status', 'Active')
                .single()

            if (error) throw error
            return data
        },
        `product:${id}`,
        CACHE_TTL
    )
}

// Search products (only active ones)
export async function searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) {
        return []
    }

    return apiCall(
        'searchProducts',
        { query },
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'Active')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
                .order('updated_at', { ascending: false })
                .limit(50)

            if (error) throw error
            return data || []
        },
        `search:${query.toLowerCase()}`,
        2 * 60 * 1000 // 2 minutes cache for search results
    )
}

// Get products by category slug (only active ones)
// Note: The 'category' field in the products table should contain the category slug
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
    return apiCall(
        'getProductsByCategory',
        { categorySlug },
        async () => {
            // Direct match: category slug in products table matches the slug from frontend
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', categorySlug)
                .eq('status', 'Active')
                .order('updated_at', { ascending: false })

            if (error) throw error
            return data || []
        },
        `category:${categorySlug}`,
        CACHE_TTL
    )
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    return apiCall(
        'getCategoryBySlug',
        { slug },
        async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'Active')
                .single()

            if (error) {
                if ((error as { code?: string }).code === 'PGRST116') return null
                throw error
            }
            return data
        },
        `category:slug:${slug}`,
        CACHE_TTL
    )
}

export async function getSubcategoriesByCategorySlug(categorySlug: string): Promise<Subcategory[]> {
    return apiCall(
        'getSubcategoriesByCategorySlug',
        { categorySlug },
        async () => {
            const category = await getCategoryBySlug(categorySlug)
            if (!category) return []
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .eq('category_id', category.id)
                .is('parent_subcategory_id', null)
                .eq('status', 'Active')
                .order('name', { ascending: true })

            if (error) throw error
            return data || []
        },
        `subcategories:category:${categorySlug}`,
        CACHE_TTL
    )
}

export async function getChildSubcategories(parentSubcategoryId: number): Promise<Subcategory[]> {
    return apiCall(
        'getChildSubcategories',
        { parentSubcategoryId },
        async () => {
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .eq('parent_subcategory_id', parentSubcategoryId)
                .eq('status', 'Active')
                .order('name', { ascending: true })

            if (error) throw error
            return data || []
        },
        `subcategories:child:${parentSubcategoryId}`,
        CACHE_TTL
    )
}

export async function getSubcategoryBySlug(slug: string): Promise<Subcategory | null> {
    return apiCall(
        'getSubcategoryBySlug',
        { slug },
        async () => {
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'Active')
                .single()

            if (error) {
                if ((error as { code?: string }).code === 'PGRST116') return null
                throw error
            }
            return data
        },
        `subcategory:slug:${slug}`,
        CACHE_TTL
    )
}

export async function getProductsBySubcategory(subcategorySlug: string): Promise<Product[]> {
    console.log("subcategorySlug", subcategorySlug)
    return apiCall(
        'getProductsBySubcategory',
        { subcategorySlug },
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('subcategory', subcategorySlug)
                .eq('status', 'Active')
                .order('updated_at', { ascending: false })

            if (error) throw error
            return data || []
        },
        `subcategory:${subcategorySlug}`,
        CACHE_TTL
    )
}

// Get all active categories from the categories table
export async function getCategories(): Promise<Category[]> {
    return apiCall(
        'getCategories',
        {},
        async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('status', 'Active')
                .order('name', { ascending: true })

            if (error) throw error
            return data || []
        },
        'categories:all',
        CACHE_TTL
    )
}

// Get categories with product counts (optimized with single query)
export async function getCategoriesWithCounts(): Promise<Array<{
    id: number
    name: string
    description: string | null
    slug: string
    count: number
    image?: string
}>> {
    return apiCall(
        'getCategoriesWithCounts',
        {},
        async () => {
            // Get all active categories
            const { data: categories, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .eq('status', 'Active')
                .order('name', { ascending: true })

            if (categoriesError) throw categoriesError

            // Get all products with their categories for efficient counting
            const { data: allProducts, error: productsError } = await supabase
                .from('products')
                .select('category')
                .eq('status', 'Active')

            if (productsError) throw productsError

            // Count products per category slug
            const categoryCounts = new Map<string, number>()
            allProducts?.forEach(product => {
                const count = categoryCounts.get(product.category) || 0
                categoryCounts.set(product.category, count + 1)
            })

            // Map categories with counts and default images from /public, then enforce custom order
            const withCounts = (categories || []).map(category => ({
                ...category,
                count: categoryCounts.get(category.slug) || 0,
                image: category.image || getDefaultCategoryImageBySlug(category.slug) || getDefaultCategoryImage(category.name)
            }))

            return sortCategoriesCustomOrder(withCounts)
        },
        'categories:withCounts',
        CACHE_TTL
    )
}

// Helper function to get default category image based on category name
function getDefaultCategoryImage(categoryName: string): string {
    const imageMap: Record<string, string> = {
        "Filters & Filtration Systems": "/filteration.svg",
        "Filters": "/filteration.svg",
        "Pumps": "/pumps.svg",
        "Air Blower": "/airblower.svg",
        "Air Blowers": "/airblower.svg",
        "Pool Cleaning Equipment": "/pce.png",
        "Pool Cleaning Robots": "/Robotic.svg",
        "Robotic Pool Cleaners": "/Robotic.svg",
        "Acrylic Pool": "/acrylic.png",
        "Pool Cover": "/poolcover.svg",
        "Lighting": "/Lighting.svg",
        "Fountain Nozzle": "/Fountain.svg",
        "Fountain Nozzles": "/Fountain.svg",
        "Decorative Water Spout": "/Fountain.svg",
        "Heat Pump & Chill Pump": "/WaterChiller.svg",
        "Heat Pump": "/WaterChiller.svg",
        "Water Chiller Units": "/WaterChiller.svg",
        "Pool Fittings and Cleaners": "/pfc.png",
        "Pool Fittings": "/pfc.png",
        "Pool Dis-Infection System": "/pd.png",
        "Pool Disinfection Systems": "/pd.png",
        "Stainless steel": "/ss.png",
        "Stainless Steel": "/ss.png",
        "Wellness": "/Wellness.svg",
    }

    return imageMap[categoryName] || "/placeholder-product.svg"
}

// Prefer slug-based mapping when possible
function getDefaultCategoryImageBySlug(slug: string): string | undefined {
    const bySlug: Record<string, string> = {
        "filters": "/filteration.svg",
        "filters-filtration-systems": "/filteration.svg",
        "pumps": "/pumps.svg",
        "air-blower": "/airblower.svg",
        "air-blowers": "/airblower.svg",
        "pool-cleaning-equipment": "/pce.png",
        "pool-cleaning-robots": "/Robotic.svg",
        "robotic-pool-cleaners": "/Robotic.svg",
        "pool-disinfection-systems": "/pd.png",
        "pool-fittings": "/pfc.png",
        "lighting": "/Lighting.svg",
        "heat-pump": "/WaterChiller.svg",
        "wellness": "/Wellness.svg",
        "pool-cover": "/poolcover.svg",
        "stainless-steel": "/ss.png",
        "acrylic-pool": "/acrylic.png",
        "fountain-nozzles": "/Fountain.svg",
        // legacy/other mappings
        "decorative-water-spout": "/Fountain.svg",
        "fountain-nozzle": "/Fountain.svg",
        "heat-pump-chill-pump": "/WaterChiller.svg",
        "pool-dis-infection-system": "/pd.png",
        "pool-fittings-and-cleaners": "/pfc.png",
        "water-chiller-units": "/WaterChiller.svg",
    }
    return bySlug[slug]
}

// Custom sort order for categories
export const CATEGORY_SORT_ORDER: string[] = [
    "Filters & Filtration Systems",
    "Pumps",
    "Air Blower",
    "Pool Cleaning Equipment",
    "Pool Cleaning Robots",
    "Pool Dis-Infection System",
    "Pool Fittings and Cleaners",
    "Lighting",
    "Heat Pump & Chill Pump",
    "Wellness",
    "Pool Cover",
    "Stainless Steel",
    "Acrylic Pool",
    "Fountain Nozzle"
]

// Sorting function for categories array (by name or slug)
export function sortCategoriesCustomOrder<T extends { name?: string; slug?: string }>(categories: T[]): T[] {
    // Normalize names for comparison
    const normalize = (str?: string) => (str || "").toLowerCase().replace(/[\s\-&]+/g, " ").trim();

    // Map normalized names/slugs to their order index
    const orderMap = new Map<string, number>();
    CATEGORY_SORT_ORDER.forEach((cat, idx) => {
        orderMap.set(normalize(cat), idx);
    });

    return categories.slice().sort((a, b) => {
        const aKey = normalize(a.name) || normalize(a.slug);
        const bKey = normalize(b.name) || normalize(b.slug);

        const aIdx = orderMap.has(aKey) ? orderMap.get(aKey)! : Number.POSITIVE_INFINITY;
        const bIdx = orderMap.has(bKey) ? orderMap.get(bKey)! : Number.POSITIVE_INFINITY;

        if (aIdx !== bIdx) return aIdx - bIdx;
        // fallback to alphabetical
        return (a.name || a.slug || "").localeCompare(b.name || b.slug || "");
    });
}

// Get similar products (same category, excluding current product)
export async function getSimilarProducts(currentProductId: number, categorySlug: string, limit: number = 10): Promise<Product[]> {
    return apiCall(
        'getSimilarProducts',
        { currentProductId, categorySlug, limit },
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', categorySlug)
                .eq('status', 'Active')
                .neq('id', currentProductId)
                .order('updated_at', { ascending: false })
                .limit(limit)

            if (error) throw error
            return data || []
        },
        `similar:${currentProductId}:${categorySlug}`,
        3 * 60 * 1000 // 3 minutes cache for similar products
    )
}

// Get more products (random selection, excluding current product)
export async function getMoreProducts(currentProductId: number, limit: number = 10): Promise<Product[]> {
    return apiCall(
        'getMoreProducts',
        { currentProductId, limit },
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'Active')
                .neq('id', currentProductId)
                .order('updated_at', { ascending: false })
                .limit(limit)

            if (error) throw error
            return data || []
        },
        `more:${currentProductId}`,
        3 * 60 * 1000 // 3 minutes cache for more products
    )
}

// Cache management exports
export const cacheUtils = {
    clearCache,
    getCacheSize: () => cache.size,
    getPendingRequestsCount: () => pendingRequests.size
} 