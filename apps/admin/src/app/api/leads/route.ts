import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Parse URL parameters for pagination
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // Fetch catalogue requests with pagination
        const { data: leads, error, count } = await supabase
            .from('catalogue_requests')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch leads' },
                { status: 500 }
            )
        }

        // Calculate pagination info
        const totalPages = Math.ceil((count || 0) / limit)
        const hasNextPage = page < totalPages
        const hasPrevPage = page > 1

        return NextResponse.json({
            success: true,
            data: leads,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount: count,
                hasNextPage,
                hasPrevPage,
                limit
            }
        })

    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Lead ID is required' },
                { status: 400 }
            )
        }

        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Delete the lead
        const { error } = await supabase
            .from('catalogue_requests')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json(
                { error: 'Failed to delete lead' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Lead deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting lead:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 