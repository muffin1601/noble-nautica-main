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
import { getCategoryBySlug, getProductsBySubcategory, getChildSubcategories, getSubcategoryBySlug } from "@/lib/products"
import type { Product, Category, Subcategory } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

// Memoized Product Card Component
const ProductCard = memo(({ product, categorySlug }: { product: Product; categorySlug: string }) => {
    const productImages = useMemo(() => {
        const images = product.data?.images || []
        return images.filter(Boolean)
    }, [product.data?.images])

    const imageSrc = productImages[0] || "/placeholder-product.svg"
    const rating = product.data?.rating || 0
    const reviews = product.data?.reviews || 0

    return (
        <div key={product.id} className="group cursor-pointer h-full flex flex-col">
            <Card className="flex p-0 gap-0 flex-col h-full hover:translate-y-[-6px] hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#6384AA] bg-gradient-to-br from-white to-slate-50">
                <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center">
                    {imageSrc && imageSrc !== "/placeholder-product.svg" ? (
                        <Image unoptimized
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className="object-contain transition-opacity duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                            quality={85}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-white flex items-center justify-center">
                            <Package className="h-12 w-12 text-slate-400" />
                        </div>
                    )}
                </div>
                <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#6384AA] transition-colors duration-300 line-clamp-2">
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
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex-grow" />
                    <Link href={`/products/categories/${encodeURIComponent(categorySlug)}/${product.id}`} className="block mt-4">
                        <Button className="w-full mt-auto bg-[#6384AA] hover:bg-[#6384AA]/90 text-white group-hover:bg-[#385785] transition-colors duration-300">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
})
ProductCard.displayName = 'ProductCard'

export default function SubcategoryProductsPage() {
    const params = useParams()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [category, setCategory] = useState<Category | null>(null)
    const [childSubcategories, setChildSubcategories] = useState<Subcategory[]>([])
    const [selectedChildSlug, setSelectedChildSlug] = useState<string | null>(null)

    const categorySlug = decodeURIComponent(params.slug as string)
    const subcategorySlug = decodeURIComponent(params.subslug as string)


    const loadData = useCallback(async () => {
        if (!categorySlug || !subcategorySlug) return
        try {
            setLoading(true)
            const cat = await getCategoryBySlug(categorySlug)
            setCategory(cat)

            // Load current subcategory to find children
            const currentSubcategory = await getSubcategoryBySlug(subcategorySlug)

            if (currentSubcategory) {
                const children = await getChildSubcategories(currentSubcategory.id)
                setChildSubcategories(children)

                if (children.length > 0) {
                    // Default to first child
                    const defaultChildSlug = children[0].slug
                    setSelectedChildSlug(defaultChildSlug)
                    const productsData = await getProductsBySubcategory(defaultChildSlug)
                    setProducts(productsData)
                    setFilteredProducts(productsData)
                    return
                }
            }

            // Fallback: no children, load products for the subcategory itself
            const productsData = await getProductsBySubcategory(subcategorySlug)
            setProducts(productsData)
            setFilteredProducts(productsData)
        } catch (err) {
            console.error('Failed to load subcategory products:', err)
            setProducts([])
            setFilteredProducts([])
        } finally {
            setLoading(false)
        }
    }, [categorySlug, subcategorySlug])

    useEffect(() => { loadData() }, [loadData])

    // Optimized search with faster debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchTerm.trim()) {
                const localResults = products.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                setFilteredProducts(localResults)
            } else {
                setFilteredProducts(products)
            }
        }, 200) // Reduced debounce time
        return () => clearTimeout(timeout)
    }, [searchTerm, products])

    const handleSelectChild = useCallback(async (childSlug: string) => {
        try {
            setSelectedChildSlug(childSlug)
            setLoading(true)
            const productsData = await getProductsBySubcategory(childSlug)
            setProducts(productsData)
            // Re-apply search filter if there is an active search term
            if (searchTerm.trim()) {
                const localResults = productsData.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                setFilteredProducts(localResults)
            } else {
                setFilteredProducts(productsData)
            }
        } catch (err) {
            console.error('Failed to load child subcategory products:', err)
            setProducts([])
            setFilteredProducts([])
        } finally {
            setLoading(false)
        }
    }, [searchTerm])


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
                                <Card key={index} className="flex p-0 gap-0 flex-col h-full overflow-hidden">
                                    <Skeleton className="aspect-square w-full bg-slate-200" />
                                    <CardContent className="p-6 flex flex-col flex-1 space-y-3">
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
                                onClick={() => router.push(`/products/categories/${encodeURIComponent(categorySlug)}`)}
                                className="text-white hover:text-[#FBF5E4] hover:bg-white/10 mr-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to {category?.name || 'Category'}
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

            <section className="py-8 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder={`Search products...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-[#385785] bg-[#C7DAE7] h-12"
                            />
                        </div>
                    </div>
                    {childSubcategories.length > 0 && (
                        <div className="mt-6">
                            <div className="flex flex-wrap w-full justify-center items-center gap-3">
                                {childSubcategories.map((child) => (
                                    <Button
                                        key={child.id}
                                        variant={selectedChildSlug === child.slug ? 'default' : 'outline'}
                                        className={selectedChildSlug === child.slug ? 'bg-[#6384AA] hover:bg-[#6384AA]/90 text-white' : ''}
                                        onClick={() => handleSelectChild(child.slug)}
                                    >
                                        {child.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-12 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-6">Try a different subcategory or go back.</p>
                            <Button onClick={() => router.push(`/products/categories/${encodeURIComponent(categorySlug)}`)} className="bg-[#6384AA] hover:bg-[#6384AA]/90">
                                Back to {category?.name || 'Category'}
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


