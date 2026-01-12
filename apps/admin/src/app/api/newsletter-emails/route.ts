import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error: supabaseError } = await supabase
            .from('newsletter_emails')
            .select('id, email, created_at')
            .order('created_at', { ascending: false })
        if (supabaseError) {
            return NextResponse.json({ error: supabaseError.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, data })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 