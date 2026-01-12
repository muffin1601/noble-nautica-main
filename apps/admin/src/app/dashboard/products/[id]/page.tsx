"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Edit, ArrowLeft, ExternalLink, Download, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getProduct } from "@/lib/products"
import type { Product } from "@/lib/supabase"

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(parseInt(id))
        setProduct(data)
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Product Not Found</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
            <p className="text-muted-foreground">
              {product.category} • ID: {product.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={product.status === "Active" ? "default" : "secondary"}>{product.status}</Badge>
          <Button asChild>
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* Only show Models tab if there are models */}
          {(product.data?.sections?.models?.enabled && product.data?.models && product.data.models.length > 0) && (
            <TabsTrigger value="models">Models</TabsTrigger>
          )}
          {/* Only show Charts tab if there are charts */}
          {(product.data?.sections?.pressure?.enabled && product.data?.charts && product.data.charts.length > 0) && (
            <TabsTrigger value="charts">Charts</TabsTrigger>
          )}
          {/* Only show Videos tab if there are videos */}
          {(product.data?.sections?.videos?.enabled && product.data?.videos && product.data.videos.length > 0) && (
            <TabsTrigger value="videos">Videos</TabsTrigger>
          )}
          {/* Only show Documents tab if there are documents */}
          {(product.data?.sections?.certificates?.enabled && product.data?.documents && product.data.documents.length > 0) && (
            <TabsTrigger value="documents">Documents</TabsTrigger>
          )}
          {/* Only show Catalogues tab if there are catalogues */}
          {(product.data?.sections?.catalogues?.enabled && product.data?.catalogues && product.data.catalogues.length > 0) && (
            <TabsTrigger value="catalogues">Catalogues</TabsTrigger>
          )}
          {/* Only show Schematics tab if there are schematics */}
          {(product.data?.sections?.schematics?.enabled && product.data?.schematics && product.data.schematics.length > 0) && (
            <TabsTrigger value="schematics">Schematics</TabsTrigger>
          )}
          {/* Only show Dimensions tab if there are dimensions */}
          {(product.data?.sections?.dimensions?.enabled && product.data?.dimensions && product.data.dimensions.length > 0) && (
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className={`grid grid-cols-1 gap-6 ${product.data?.images && product.data.images.length > 0 ? 'lg:grid-cols-3' : ''}`}>
            {/* Product Images */}
            {product.data?.images && product.data.images.length > 0 && (
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image unoptimized
                        src={product.data.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {product.data.images.length > 1 && (
                      <div className="grid grid-cols-2 gap-2">
                        {product.data.images.slice(1).map((image, index) => (
                          <div key={index} className="aspect-square relative rounded-md overflow-hidden border">
                            <Image unoptimized
                              src={image}
                              alt={`${product.name} ${index + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Information */}
            <Card className={product.data?.images && product.data.images.length > 0 ? "lg:col-span-2" : ""}>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Created: {new Date(product.created_at).toLocaleDateString()} • Last updated: {new Date(product.updated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.description && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {product.data?.features && product.data.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Features & Benefits</h4>
                    <ul className="space-y-2">
                      {product.data.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Models</CardTitle>
              <CardDescription>Product model specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.data?.models?.map((modelImageUrl, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <Image unoptimized
                      src={modelImageUrl}
                      alt={`Model Specification ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                    <div className="p-3">
                      <p className="text-sm text-gray-600">Model Specification {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Charts</CardTitle>
              <CardDescription>Performance charts and graphs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {product.data?.charts?.map((chart, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image unoptimized
                      src={chart || "/placeholder.svg"}
                      alt={`Chart ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Videos</CardTitle>
              <CardDescription>Product videos and demonstrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.data?.videos?.map((video, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                      <video
                        src={video.url}
                        poster={video.thumbnail}
                        className="w-full h-full object-cover"
                        controls
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium">{video.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Technical documents and certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.data?.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">{doc.type}</span>
                      </div>
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = doc.url
                          link.download = doc.name
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalogues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catalogues</CardTitle>
              <CardDescription>Product catalogues and brochures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.data?.catalogues?.map((catalogue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-green-700">{catalogue.type}</span>
                      </div>
                      <span className="font-medium">{catalogue.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(catalogue.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = catalogue.url
                          link.download = catalogue.name
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schematics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schematics</CardTitle>
              <CardDescription>Technical schematics and diagrams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {product.data?.schematics?.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image unoptimized
                      src={image || "/placeholder.svg"}
                      alt={`Schematic ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
              <CardDescription>Dimensional drawings and measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {product.data?.dimensions?.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image unoptimized
                      src={image || "/placeholder.svg"}
                      alt={`Dimension drawing ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
