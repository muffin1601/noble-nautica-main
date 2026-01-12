import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const categorySlug = searchParams.get('category')

        if (!categorySlug) {
            return NextResponse.json(
                { error: 'Missing required category parameter' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('categories')
            .select('catalogue_url, name')
            .eq('slug', categorySlug)
            .eq('status', 'Active')
            .maybeSingle()

        if (error) {
            console.error('Error fetching category:', error)
            return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
        }

        if (!data || !data.catalogue_url) {
            return NextResponse.json(
                { error: 'Catalogue not found for this category' },
                { status: 404 }
            )
        }

        const fileRes = await fetch(data.catalogue_url)
        if (!fileRes.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch catalogue file' },
                { status: 502 }
            )
        }

        const arrayBuffer = await fileRes.arrayBuffer()
        const fileName = `${(data.name || 'catalogue').toLowerCase().replace(/\s+/g, '-')}.pdf`

        return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'public, max-age=3600',
            },
        })
    } catch (error) {
        console.error('Error serving category catalogue PDF:', error)
        return NextResponse.json(
            { error: 'Failed to serve catalogue PDF' },
            { status: 500 }
        )
    }
}
