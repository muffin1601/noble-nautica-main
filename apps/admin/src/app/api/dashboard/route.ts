import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Fetch dashboard statistics
        const [
            productsResult,
            categoriesResult,
            leadsResult,
            recentProductsResult
        ] = await Promise.all([
            // Count total products
            supabase
                .from('products')
                .select('id', { count: 'exact', head: true }),

            // Count total categories
            supabase
                .from('categories')
                .select('id', { count: 'exact', head: true }),

            // Count total catalogue leads
            supabase
                .from('catalogue_requests')
                .select('id', { count: 'exact', head: true }),

            // Get recent products (last 5)
            supabase
                .from('products')
                .select('id, name, created_at, status')
                .order('created_at', { ascending: false })
                .limit(5)
        ])

        // Check for errors
        if (productsResult.error) {
            console.error('Products query error:', productsResult.error)
        }
        if (categoriesResult.error) {
            console.error('Categories query error:', categoriesResult.error)
        }
        if (leadsResult.error) {
            console.error('Leads query error:', leadsResult.error)
        }
        if (recentProductsResult.error) {
            console.error('Recent products query error:', recentProductsResult.error)
        }

        // Calculate total media files (rough estimate)
        // This would need to be refined based on your actual storage structure
        let totalMediaFiles = 0
        if (recentProductsResult.data) {
            // Estimate based on average files per product
            totalMediaFiles = (productsResult.count || 0) * 6 // Assuming ~6 files per product on average
        }

        const dashboardData = {
            stats: {
                totalProducts: productsResult.count || 0,
                totalCategories: categoriesResult.count || 0,
                totalLeads: leadsResult.count || 0,
                totalMediaFiles: totalMediaFiles,
            },
            recentProducts: recentProductsResult.data || [],
            quickActions: [
                {
                    title: "Add New Product",
                    url: "/dashboard/products/add",
                    description: "Create a new product entry"
                },
                {
                    title: "Manage Categories",
                    url: "/dashboard/categories",
                    description: "Organize product categories"
                },
                {
                    title: "View Leads",
                    url: "/dashboard/leads",
                    description: "Check catalogue requests"
                },
                {
                    title: "View Products",
                    url: "/dashboard/products",
                    description: "Browse all products"
                }
            ]
        }

        return NextResponse.json({
            success: true,
            data: dashboardData
        })

    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        )
    }
} 