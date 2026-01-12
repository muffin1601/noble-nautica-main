"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Star, Loader2 } from "lucide-react"
import Link from "next/link"
import { getProducts } from "@/lib/products"
import type { Product } from "@/lib/supabase"

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await getProducts()
      // Show only products whose id is 115 or 41
      setProducts(allProducts.filter(p => p.id === 27 || p.id === 41 || p.id === 106))
    } catch (error) {
      console.error('Failed to fetch featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions to get data from the Product structure
  const getProductImages = (product: Product): string[] => {
    const images = product.data?.images || []
    const filteredImages = images.filter(img => img && img.trim() !== '')
    const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle' dy='0.35em'%3ENo Image Available%3C/text%3E%3C/svg%3E"
    return filteredImages.length > 0 ? filteredImages : [placeholder]
  }

  const getProductRating = (product: Product): number => {
    return product.data?.rating || 0
  }

  const getProductReviews = (product: Product): number => {
    return product.data?.reviews || 0
  }

  const isProductInStock = (product: Product): boolean => {
    return product.data?.inStock !== false
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#385785] mb-4">
            Trusted leader in pool equipment and <br />
            technology solutions
          </h2>
        </div>
        <p className="text-lg mb-8 text-center italic text-[#385785] max-w-2xl mx-auto">
          Top Products
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="h-full py-0 bg-white border-0 shadow-md overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const images = getProductImages(product)
              const rating = getProductRating(product)
              const reviews = getProductReviews(product)
              const inStock = isProductInStock(product)

              return (
                <div key={product.id} className="group cursor-pointer">
                  <Card className="flex flex-col h-full py-0 bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                    <div className="aspect-video h-96 bg-white relative overflow-hidden">
                      <div
                        style={{ backgroundImage: `url(${images[0]})` }}
                        className="absolute bg-center bg-cover bg-no-repeat inset-0 "
                      />
                      {/* <div className="absolute top-4 left-4">
                        <Badge variant={inStock ? "default" : "secondary"}>
                          {inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-slate-700">
                        {product.category}
                      </div> */}
                    </div>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors duration-300">
                            {product.name}
                          </h3>
                          {rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-slate-600">{rating}</span>
                              {reviews > 0 && (
                                <span className="text-xs text-slate-400">({reviews})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {product.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                        )}

                        {/* {features.length > 0 && (
                          <ul className="space-y-1 mb-4">
                            {features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-center">
                                <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )} */}
                      </div>
                      <div className="flex-grow" />
                      <Link href={`/products/categories/${product.category}/${product.id}`} className="block mt-4">
                        <Button
                          className="bg-sky-600 w-full hover:bg-sky-700"
                          disabled={!inStock}
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#385785]" />
            <p className="text-lg text-slate-600">No featured products available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products/categories">
            <Button
              size="lg"
              variant="outline"
              className="border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white bg-transparent"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
