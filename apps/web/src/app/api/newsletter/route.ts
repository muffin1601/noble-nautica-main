import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const insertResult = await supabase
            .from('newsletter_emails')
            .insert([{ email }])
        if (insertResult.error) {
            if (insertResult.error.code === '23505') {
                // Unique violation
                return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 })
            }
            return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 