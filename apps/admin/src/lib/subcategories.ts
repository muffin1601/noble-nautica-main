import { supabase } from './supabase'
import type { Subcategory, CreateSubcategoryData } from './supabase'
import { createSlug as createCategorySlug } from './categories'

export const createSlug = createCategorySlug

export async function getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching subcategories:', error)
        throw new Error(`Failed to fetch subcategories: ${error.message}`)
    }

    return data
}

export async function getChildSubcategories(parentSubcategoryId: number): Promise<Subcategory[]> {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('parent_subcategory_id', parentSubcategoryId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching child subcategories:', error)
        throw new Error(`Failed to fetch child subcategories: ${error.message}`)
    }

    return data
}

export async function getSubcategory(id: number): Promise<Subcategory | null> {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if ((error as { code?: string }).code === 'PGRST116') return null
        console.error('Error fetching subcategory:', error)
        throw new Error(`Failed to fetch subcategory: ${error.message}`)
    }

    return data
}

export async function getSubcategoryBySlug(categoryId: number, slug: string): Promise<Subcategory | null> {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('slug', slug)
        .single()

    if (error) {
        if ((error as { code?: string }).code === 'PGRST116') return null
        console.error('Error fetching subcategory by slug:', error)
        throw new Error(`Failed to fetch subcategory: ${error.message}`)
    }

    return data
}

export async function createSubcategory(input: CreateSubcategoryData): Promise<Subcategory> {
    const slug = input.slug || createSlug(input.name)

    const existing = await getSubcategoryBySlug(input.category_id, slug)
    if (existing) {
        throw new Error(`A subcategory with the slug "${slug}" already exists in this category`)
    }

    const { data, error } = await supabase
        .from('subcategories')
        .insert([
            {
                category_id: input.category_id,
                parent_subcategory_id: input.parent_subcategory_id || null,
                name: input.name,
                description: input.description || null,
                slug,
                status: input.status || 'Active',
            },
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating subcategory:', error)
        throw new Error(`Failed to create subcategory: ${error.message}`)
    }

    return data
}

export async function updateSubcategory(id: number, updates: Partial<CreateSubcategoryData>): Promise<Subcategory> {
    const current = await getSubcategory(id)
    if (!current) throw new Error('Subcategory not found')

    const updateData: Record<string, unknown> = { ...updates }

    if (updates.name && !updates.slug) {
        updateData.slug = createSlug(updates.name)
    }

    if (updateData.slug) {
        const existing = await getSubcategoryBySlug(current.category_id, updateData.slug as string)
        if (existing && existing.id !== id) {
            throw new Error(`A subcategory with the slug "${updateData.slug}" already exists in this category`)
        }
    }

    if (updates.parent_subcategory_id !== undefined) {
        updateData.parent_subcategory_id = updates.parent_subcategory_id || null
    }

    const { error } = await supabase
        .from('subcategories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating subcategory:', error)
        throw new Error(`Failed to update subcategory: ${error.message}`)
    }

    const updated = await getSubcategory(id)
    if (!updated) throw new Error('Subcategory not found after update')
    return updated
}

export async function deleteSubcategory(id: number): Promise<void> {
    const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting subcategory:', error)
        throw new Error(`Failed to delete subcategory: ${error.message}`)
    }
}


