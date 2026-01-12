"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, FolderTree, ImageIcon, Users, Plus, Eye, Settings } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalLeads: number
  totalMediaFiles: number
}

interface RecentProduct {
  id: number
  name: string
  created_at: string
  status: string
}

interface QuickAction {
  title: string
  url: string
  description: string
}

interface DashboardData {
  stats: DashboardStats
  recentProducts: RecentProduct[]
  quickActions: QuickAction[]
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const result = await response.json()

      if (result.success) {
        setDashboardData(result.data)
      } else {
        console.error('Failed to fetch dashboard data:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getQuickActionIcon = (title: string) => {
    switch (title) {
      case 'Add New Product':
        return Plus
      case 'Manage Categories':
        return FolderTree
      case 'View Leads':
        return Users
      case 'View Products':
        return Eye
      default:
        return Settings
    }
  }

  const stats = [
    {
      title: "Total Products",
      value: loading ? "..." : dashboardData?.stats.totalProducts.toString() || "0",
      description: "Active products in catalog",
      icon: Package,
    },
    {
      title: "Categories",
      value: loading ? "..." : dashboardData?.stats.totalCategories.toString() || "0",
      description: "Product categories",
      icon: FolderTree,
    },
    {
      title: "Media Files",
      value: loading ? "..." : dashboardData?.stats.totalMediaFiles.toString() || "0",
      description: "Images and documents",
      icon: ImageIcon,
    },
    {
      title: "Catalogue Leads",
      value: loading ? "..." : dashboardData?.stats.totalLeads.toString() || "0",
      description: "Download requests",
      icon: Users,
    },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your product management system</p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Latest products added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.recentProducts && dashboardData.recentProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentProducts.map((product, index) => {
                  const colors = ['blue', 'green', 'purple', 'orange', 'pink']
                  const color = colors[index % colors.length]
                  return (
                    <Link
                      key={product.id}
                      href={`/dashboard/products/${product.id}`}
                      className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                        <Package className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatTimeAgo(product.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {product.status}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent products</p>
                <p className="text-sm">Products will appear here when you add them</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData?.quickActions.map((action, index) => {
                  const IconComponent = getQuickActionIcon(action.title)
                  return (
                    <Link key={index} href={action.url}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto text-left"
                      >
                        <IconComponent className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
