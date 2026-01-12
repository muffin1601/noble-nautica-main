import { supabase } from './supabase'
import type { Category, CreateCategoryData } from './supabase'

// Helper function to generate URL-friendly slug
export function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Get all categories (simplified without product counts for now)
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    // Return categories with zero product count for now
    return data.map(category => ({
        ...category,
        product_count: 0
    }))
}

// Get a single category by ID
export async function getCategory(id: number): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null // Category not found
        }
        console.error('Error fetching category:', error)
        throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return {
        ...data,
        product_count: 0
    }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null // Category not found
        }
        console.error('Error fetching category by slug:', error)
        throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return {
        ...data,
        product_count: 0
    }
}

// Create a new category
export async function createCategory(categoryData: CreateCategoryData): Promise<Category> {
    // Generate slug if not provided
    const slug = categoryData.slug || createSlug(categoryData.name)

    // Check if slug already exists
    const existingCategory = await getCategoryBySlug(slug)
    if (existingCategory) {
        throw new Error(`A category with the slug "${slug}" already exists`)
    }

    const { data, error } = await supabase
        .from('categories')
        .insert([{
            name: categoryData.name,
            description: categoryData.description || null,
            slug,
            status: categoryData.status || 'Active'
        }])
        .select()
        .single()

    if (error) {
        console.error('Error creating category:', error)
        throw new Error(`Failed to create category: ${error.message}`)
    }

    return {
        ...data,
        product_count: 0
    }
}

// Update an existing category
export async function updateCategory(id: number, updates: Partial<CreateCategoryData>): Promise<Category> {
    const updateData: Record<string, unknown> = { ...updates }

    // Generate new slug if name is being updated
    if (updates.name && !updates.slug) {
        updateData.slug = createSlug(updates.name as string)

        // Check if new slug already exists (but not for the current category)
        const existingCategory = await getCategoryBySlug(updateData.slug as string)
        if (existingCategory && existingCategory.id !== id) {
            throw new Error(`A category with the slug "${updateData.slug}" already exists`)
        }
    }

    const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating category:', error)
        throw new Error(`Failed to update category: ${error.message}`)
    }

    // Get updated category with product count
    const updatedCategory = await getCategory(id)
    if (!updatedCategory) {
        throw new Error('Category not found after update')
    }

    return updatedCategory
}

// Delete a category
export async function deleteCategory(id: number): Promise<void> {
    // First check if category has products
    const { data: products, error: countError } = await supabase
        .from('products')
        .select('id')
        .eq('category', id.toString())

    if (countError) {
        console.error('Error checking category products:', countError)
        throw new Error(`Failed to check category usage: ${countError.message}`)
    }

    if (products && products.length > 0) {
        throw new Error(`Cannot delete category. It has ${products.length} product(s) assigned to it.`)
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting category:', error)
        throw new Error(`Failed to delete category: ${error.message}`)
    }
}

// Search categories
export async function searchCategories(searchTerm: string): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error searching categories:', error)
        throw new Error(`Failed to search categories: ${error.message}`)
    }

    // Get product counts for each category manually
    const categoriesWithCounts = await Promise.all(
        data.map(async (category) => {
            const { data: products, error: countError } = await supabase
                .from('products')
                .select('id')
                .eq('category', category.slug)

            if (countError) {
                console.error('Error counting products for category:', countError)
                return { ...category, product_count: 0 }
            }

            return { ...category, product_count: products?.length || 0 }
        })
    )

    return categoriesWithCounts
}

// Get active categories for dropdown selection
export async function getActiveCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'Active')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching active categories:', error)
        throw new Error(`Failed to fetch active categories: ${error.message}`)
    }

    return data.map(category => ({
        ...category,
        product_count: 0 // Don't need count for dropdown
    }))
} 