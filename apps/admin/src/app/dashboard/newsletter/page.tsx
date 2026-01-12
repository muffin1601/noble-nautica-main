"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface NewsletterEmail {
    id: number
    email: string
    created_at: string
}

export default function NewsletterPage() {
    const [emails, setEmails] = useState<NewsletterEmail[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEmails()
    }, [])

    const fetchEmails = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/newsletter-emails")
            const data = await res.json()
            if (data.success) {
                setEmails(data.data)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-10 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Newsletter Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No newsletter emails found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="w-full min-w-[400px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/3">Email</TableHead>
                                        <TableHead className="w-1/3">Date Subscribed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emails.map(email => (
                                        <TableRow key={email.id}>
                                            <TableCell>{email.email}</TableCell>
                                            <TableCell>{new Date(email.created_at).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
