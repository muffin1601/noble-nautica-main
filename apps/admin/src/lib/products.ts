import { supabase } from './supabase'
import type { Product, CreateProductData, UpdateProductData } from './supabase'

// Get all products
export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        throw error
    }

    return data || []
}

// Get a single product by ID
export async function getProduct(id: number): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        throw error
    }

    return data
}

// Create a new product
export async function createProduct(productData: CreateProductData): Promise<Product> {
    const insertPayload = {
        name: productData.name,
        description: productData.description || null,
        category: productData.category,
        subcategory: productData.subcategory || null,
        status: productData.status || 'Draft',
        data: productData.data || {}
    }
    // Debug: verify we are sending subcategory
    console.log('createProduct payload', insertPayload)

    const { data, error } = await supabase
        .from('products')
        .insert([insertPayload])
        .select()
        .single()

    if (error) {
        console.error('Error creating product:', error)
        throw error
    }

    return data
}

// Update an existing product
export async function updateProduct(id: number, productData: Partial<UpdateProductData>): Promise<Product> {
    const updateData: Record<string, unknown> = {}

    if (productData.name) updateData.name = productData.name
    if (productData.description !== undefined) updateData.description = productData.description
    if (productData.category) updateData.category = productData.category
    if (productData.subcategory !== undefined) updateData.subcategory = productData.subcategory || null
    if (productData.status) updateData.status = productData.status
    if (productData.data) updateData.data = productData.data

    // Debug: verify we are updating subcategory
    console.log('updateProduct payload', { id, updateData })

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating product:', error)
        throw error
    }

    return data
}

// Delete a product
export async function deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting product:', error)
        throw error
    }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error searching products:', error)
        throw error
    }

    return data || []
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching products by category:', error)
        throw error
    }

    return data || []
}

// Get products by status
export async function getProductsByStatus(status: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', status)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching products by status:', error)
        throw error
    }

    return data || []
} 