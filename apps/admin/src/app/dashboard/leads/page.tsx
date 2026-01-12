"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Download, Mail, Phone, MapPin, Calendar, Package } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface CatalogueRequest {
    id: number
    name: string
    phone: string
    email: string
    location: string
    product_id: number | null
    product_name: string | null
    created_at: string
    updated_at: string
}

interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<CatalogueRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20
    })
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        fetchLeads(1)
    }, [])

    const fetchLeads = async (page: number = 1) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/leads?page=${page}&limit=20`)
            const data = await response.json()

            if (data.success) {
                setLeads(data.data)
                setPagination(data.pagination)
            } else {
                console.error('Failed to fetch leads:', data.error)
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteLead = async (id: number) => {
        try {
            setDeletingId(id)
            const response = await fetch(`/api/leads?id=${id}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                // Refresh the current page
                await fetchLeads(pagination.currentPage)
            } else {
                console.error('Failed to delete lead:', data.error)
                alert('Failed to delete lead')
            }
        } catch (error) {
            console.error('Error deleting lead:', error)
            alert('Error deleting lead')
        } finally {
            setDeletingId(null)
        }
    }

    const handleExportCSV = () => {
        if (leads.length === 0) return

        const headers = ['Date', 'Name', 'Phone', 'Email', 'Location', 'Product Name', 'Product ID']
        const csvData = leads.map(lead => [
            new Date(lead.created_at).toLocaleDateString(),
            lead.name,
            lead.phone,
            lead.email,
            lead.location,
            lead.product_name || 'N/A',
            lead.product_id || 'N/A'
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `catalogue-leads-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catalogue Leads</h1>
                    <p className="text-muted-foreground">
                        Manage catalogue download requests from website visitors
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        disabled={leads.length === 0}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={() => fetchLeads(pagination.currentPage)}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.totalCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Catalogue requests received
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Page</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leads.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Showing {leads.length} of {pagination.totalCount} leads
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Page</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.currentPage}</div>
                        <p className="text-xs text-muted-foreground">
                            of {pagination.totalPages} pages
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Catalogue Requests</CardTitle>
                    <CardDescription>
                        All catalogue download requests from your website visitors
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Contact Info</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Product Interest</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="text-muted-foreground">
                                                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    <p>No catalogue requests found</p>
                                                    <p className="text-sm">Leads will appear here when visitors download catalogues</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leads.map((lead) => (
                                            <TableRow key={lead.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{formatDate(lead.created_at)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{lead.name}</div>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center space-x-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span>{lead.email}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{lead.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{lead.location}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {lead.product_name ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-sm">{lead.product_name}</div>
                                                            {lead.product_id && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    ID: {lead.product_id}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No product specified</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={deletingId === lead.id}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this catalogue request from {lead.name}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteLead(lead.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchLeads(pagination.currentPage - 1)}
                                            disabled={!pagination.hasPrevPage || loading}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                                const pageNum = Math.max(1, pagination.currentPage - 2) + i
                                                if (pageNum > pagination.totalPages) return null

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === pagination.currentPage ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => fetchLeads(pageNum)}
                                                        disabled={loading}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchLeads(pagination.currentPage + 1)}
                                            disabled={!pagination.hasNextPage || loading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
