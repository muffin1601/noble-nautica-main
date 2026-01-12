"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/sections/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
import { Search, Star, ArrowRight, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import CTA from "@/sections/CTA"
import { getProductsByCategory, searchProducts, getCategories, getSubcategoriesByCategorySlug } from "@/lib/products"
import type { Product, Category, Subcategory } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

// Memoized Product Card Component
const ProductCard = memo(({ product, categorySlug }: { product: Product; categorySlug: string }) => {
    const productImages = useMemo(() => {
        const images = product.data?.images || []
        return images.filter(img => img && img.trim() !== '')
    }, [product.data?.images])

    const imageSrc = productImages[0] || "/placeholder-product.svg"
    const rating = product.data?.rating || 0
    const reviews = product.data?.reviews || 0

    return (
        <div
            key={product.id}
            className="group cursor-pointer"
            data-product-id={String(product.id)}
        >
            <Card className="h-full py-0 hover:translate-y-[-10px] hover:shadow-xl transition-all gap-0 duration-300 overflow-hidden flex flex-col">
                <div className="aspect-video bg-white relative overflow-hidden">
                    {imageSrc && imageSrc !== "/placeholder-product.svg" ? (
                        <Image unoptimized
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className="object-contain"
                            loading="lazy"
                            quality={85}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-white flex items-center justify-center">
                            <Package className="h-12 w-12 text-slate-400" />
                        </div>
                    )}
                </div>
                <CardContent className="p-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors duration-300">
                            {product.name}
                        </h3>
                        {rating > 0 && (
                            <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-slate-600">{rating}</span>
                                <span className="text-xs text-slate-400">({reviews})</span>
                            </div>
                        )}
                    </div>

                    {product.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-auto pt-4">
                        <Link href={`/products/categories/${categorySlug}/${product.id}`}>
                            <Button className="bg-[#6384AA] w-full hover:bg-[#6384AA]">
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
})
ProductCard.displayName = 'ProductCard'

//

export default function CategoryProductsPage() {
    const params = useParams()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [category, setCategory] = useState<Category | null>(null)


    const categorySlug = decodeURIComponent(params.slug as string)

    const loadCategoryAndProducts = useCallback(async () => {
        if (!categorySlug) return

        try {
            setLoading(true)

            // Get category details
            const categories = await getCategories()
            const foundCategory = categories.find(cat => cat.slug === categorySlug)

            if (!foundCategory) {
                console.error('Category not found:', categorySlug)
                setProducts([])
                setFilteredProducts([])
                setCategory(null)
                return
            }

            setCategory(foundCategory)

            // Check subcategories; if present, show them instead of products
            const subs = await getSubcategoriesByCategorySlug(categorySlug)
            setSubcategories(subs)
            if (subs.length === 0) {
                const productsData = await getProductsByCategory(categorySlug)
                setProducts(productsData)
                setFilteredProducts(productsData)
            } else {
                setProducts([])
                setFilteredProducts([])
            }
        } catch (error) {
            console.error('Failed to load category products:', error)
            setProducts([])
            setFilteredProducts([])
            setCategory(null)
        } finally {
            setLoading(false)
        }
    }, [categorySlug])

    // Load category and products
    useEffect(() => {
        loadCategoryAndProducts()
    }, [loadCategoryAndProducts])

    // Search products with debounce - optimized with local filtering first
    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.trim()) {
                // Use local filtering first (faster, no API call)
                const localResults = products.filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                setFilteredProducts(localResults)

                // Optionally do API search in background for better results
                // But don't block UI with it
                if (localResults.length === 0) {
                    try {
                        const results = await searchProducts(searchTerm)
                        const categoryResults = results.filter(product =>
                            product.category === category?.name
                        )
                        if (categoryResults.length > 0) {
                            setFilteredProducts(categoryResults)
                        }
                    } catch (error) {
                        console.error('Search failed:', error)
                    }
                }
            } else {
                setFilteredProducts(products)
            }
        }

        const timeoutId = setTimeout(performSearch, 200) // Reduced debounce time
        return () => clearTimeout(timeoutId)
    }, [searchTerm, products, category])


    // Image loading handlers






    if (loading) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="h-[50vh] w-full bg-cover bg-center" style={{ backgroundImage: `url("/productbg.svg")` }}>
                    <div className="flex items-end h-full p-8">
                        <div className="max-w-4xl">
                            <Skeleton className="h-10 w-32 mb-4 bg-white/20" />
                            <Skeleton className="h-12 w-64 bg-white/20" />
                        </div>
                    </div>
                </div>

                {/* Search Section Skeleton */}
                <section className="py-8 pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-md mx-auto">
                            <Skeleton className="h-12 w-full bg-slate-200" />
                        </div>
                    </div>
                </section>

                {/* Products Grid Skeleton */}
                <section className="py-12 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, index) => (
                                <Card key={index} className="h-full py-0 overflow-hidden flex flex-col">
                                    <Skeleton className="aspect-video w-full bg-slate-200" />
                                    <CardContent className="p-3 flex-1 flex flex-col space-y-3">
                                        <Skeleton className="h-5 w-3/4 bg-slate-200" />
                                        <Skeleton className="h-4 w-full bg-slate-200" />
                                        <Skeleton className="h-4 w-2/3 bg-slate-200" />
                                        <div className="flex-grow" />
                                        <Skeleton className="h-10 w-full bg-slate-200" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <CTA />
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="h-[50vh] w-full bg-cover bg-center" style={{ backgroundImage: `url("/productbg.svg")` }}>
                <div className="flex items-end h-full p-8">
                    <div className="max-w-4xl">
                        <div className="flex items-center mb-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/products/categories')}
                                className="text-white hover:text-[#FBF5E4] hover:bg-white/10 mr-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Categories
                            </Button>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            {category?.name || 'Category'}
                        </h1>
                        {/* <p className="text-xl text-[#FBF5E4] mb-8">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
                        </p> */}
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <section className="py-8 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder={`Search ${category?.name || 'category'} products...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-[#385785] bg-[#C7DAE7] h-12"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* If subcategories exist, show them; else show products */}
            <section className="py-12 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, index) => (
                                <Card key={index} className="h-full overflow-hidden">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] h-full space-y-4">
                                        <Skeleton className="w-24 h-24 rounded-full bg-slate-200" />
                                        <Skeleton className="h-5 w-3/4 bg-slate-200" />
                                        <div className="flex-grow" />
                                        <Skeleton className="h-10 w-full bg-slate-200" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : subcategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {subcategories.map((sub) => (
                                <div key={sub.id} className="group cursor-pointer">
                                    <Card className="h-full hover:translate-y-[-6px] hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#6384AA] bg-gradient-to-br from-white to-slate-50">
                                        <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] h-full">
                                            <div className="mb-4 flex flex-col items-center w-full">
                                                <div className="w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center border border-[#6384AA]/30 group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-[#6384AA] font-bold text-3xl">{sub.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-xl text-slate-900 group-hover:text-[#6384AA] transition-colors duration-300 mb-2 line-clamp-2 w-full">
                                                {sub.name}
                                            </h3>
                                            <div className="flex-grow" />
                                            <Link href={`/products/categories/${categorySlug}/subcategories/${encodeURIComponent(sub.slug)}`} className="block mt-4 w-full">
                                                <Button className="w-full mt-auto bg-[#6384AA] hover:bg-[#6384AA]/90 text-white group-hover:bg-[#385785] transition-colors duration-300">
                                                    View Products
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm ? `No products in ${category?.name || 'this category'} match your search criteria.` : `No products available in ${category?.name || 'this category'}.`}
                            </p>
                            <Button
                                onClick={() => router.push('/products')}
                                className="bg-[#6384AA] hover:bg-[#6384AA]/90"
                            >
                                Browse All Categories
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            <CTA />
            <Footer />
        </main>
    )
} 