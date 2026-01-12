import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface CatalogueRequestData {
    name: string
    number: string
    email: string
    location: string
    productId: number
    productName: string
    timestamp: string
}

export async function POST(request: NextRequest) {
    try {
        const data: CatalogueRequestData = await request.json()

        // Validate required fields
        if (!data.name || !data.number || !data.email || !data.location) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Save to Supabase database
        const { error } = await supabase
            .from('catalogue_requests')
            .insert([
                {
                    name: data.name,
                    phone: data.number,
                    email: data.email,
                    location: data.location,
                    product_id: data.productId,
                    product_name: data.productName,
                }
            ])

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json(
                { error: 'Failed to save catalogue request' },
                { status: 500 }
            )
        }

        console.log('Catalogue request saved successfully:', {
            name: data.name,
            email: data.email,
            product: data.productName,
        })

        return NextResponse.json(
            {
                success: true,
                message: 'Catalogue request submitted successfully'
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error processing catalogue request:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 