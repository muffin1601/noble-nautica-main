"use client"

import { useState, useEffect, useMemo, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Image from "next/image"
import Footer from "@/sections/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Package } from "lucide-react"
import CTA from "@/sections/CTA"
import { getCategoriesWithCounts, sortCategoriesCustomOrder } from "@/lib/products"
import { Skeleton } from "@/components/ui/skeleton"

// Memoized Category Card Component
const CategoryCard = memo(({ category, onClick }: { category: CategoryWithCount; onClick: (slug: string) => void }) => {
    const handleClick = useCallback(() => {
        onClick(category.slug)
    }, [category.slug, onClick])

    return (
        <div
            key={category.id}
            className="group cursor-pointer"
            onClick={handleClick}
        >
            <Card className="h-full hover:translate-y-[-6px] hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#6384AA] bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[340px] h-full">
                    <div className="mb-4 flex flex-col items-center w-full">
                        <div className="w-40 h-40 rounded-full overflow-hidden bg-white flex items-center justify-center border border-[#6384AA]/30 group-hover:scale-110 transition-transform duration-300">
                            <Image unoptimized
                                src={category.image || "/placeholder-product.svg"}
                                alt={`${category.name} icon`}
                                width={64}
                                height={64}
                                className="object-contain p-1"
                                loading="lazy"
                                quality={80}
                                sizes="160px"
                            />
                        </div>
                    </div>

                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-[#6384AA] transition-colors duration-300 mb-2 line-clamp-2 w-full">
                        {category.name}
                    </h3>

                    <p className="text-sm text-slate-600 mb-4 w-full">
                        {category.count} {category.count === 1 ? 'Product' : 'Products'}
                    </p>

                    <div className="flex-grow" />

                    <Button
                        className="w-full mt-auto bg-[#6384AA] hover:bg-[#6384AA]/90 text-white group-hover:bg-[#385785] transition-colors duration-300"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClick()
                        }}
                    >
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
})
CategoryCard.displayName = 'CategoryCard'

interface CategoryWithCount {
    id: number
    name: string
    count: number
    image: string
    description: string | null
    slug: string
}

export default function CategoriesPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<CategoryWithCount[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    // Load categories with product counts
    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            setLoading(true)
            const categoriesWithCounts = await getCategoriesWithCounts()

            // Map to the expected format
            const categoriesWithDetails = categoriesWithCounts.map((category) => ({
                id: category.id,
                name: category.name,
                count: category.count,
                image: category.image || "/pool.svg",
                description: category.description,
                slug: category.slug
            }))

            // Enforce custom order in UI as well
            const sorted = sortCategoriesCustomOrder(categoriesWithDetails)
            setCategories(sorted)
        } catch (error) {
            console.error('Failed to load categories:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter categories based on search term
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories

        return categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }, [categories, searchTerm])

    const handleCategoryClick = useCallback((categorySlug: string) => {
        router.push(`/products/categories/${encodeURIComponent(categorySlug)}`)
    }, [router])

    if (loading) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="h-[50vh] w-full bg-cover bg-center" style={{ backgroundImage: `url("/productbg.svg")` }}>
                    <div className="flex items-end h-full p-8">
                        <div className="max-w-4xl">
                            <Skeleton className="h-12 w-96 mb-4 bg-white/20" />
                            <Skeleton className="h-6 w-80 bg-white/20" />
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

                {/* Categories Grid Skeleton */}
                <section className="py-12 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <Card key={index} className="h-full overflow-hidden">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[340px] h-full space-y-4">
                                        <Skeleton className="w-40 h-40 rounded-full bg-slate-200" />
                                        <Skeleton className="h-6 w-3/4 bg-slate-200" />
                                        <Skeleton className="h-4 w-1/2 bg-slate-200" />
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
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Our Product Categories
                        </h1>
                        <p className="text-xl text-[#FBF5E4] mb-8">
                            Discover our comprehensive range of premium pool and spa equipment
                        </p>
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
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-[#385785] bg-[#C7DAE7] h-12"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-12 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCategories.map((category) => (
                                <CategoryCard key={category.id} category={category} onClick={handleCategoryClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
                            <p className="text-gray-600">Try adjusting your search terms or browse all categories.</p>
                        </div>
                    )}
                </div>
            </section>

            <CTA />
            <Footer />
        </main>
    )
}
