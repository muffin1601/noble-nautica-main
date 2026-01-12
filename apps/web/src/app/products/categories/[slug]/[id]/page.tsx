"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import Navbar from "@/components/navbar"
import Footer from "@/sections/footer"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { getProduct, getSimilarProducts, getMoreProducts } from "@/lib/products"
import type { Product } from "@/lib/supabase"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
// Lazy load carousel components
const Carousel = dynamic(() => import("@/components/ui/carousel").then(mod => mod.Carousel), { ssr: false })
const CarouselContent = dynamic(() => import("@/components/ui/carousel").then(mod => mod.CarouselContent), { ssr: false })
const CarouselItem = dynamic(() => import("@/components/ui/carousel").then(mod => mod.CarouselItem), { ssr: false })
const CarouselNext = dynamic(() => import("@/components/ui/carousel").then(mod => mod.CarouselNext), { ssr: false })
const CarouselPrevious = dynamic(() => import("@/components/ui/carousel").then(mod => mod.CarouselPrevious), { ssr: false })
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [moreProducts, setMoreProducts] = useState<Product[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    location: ''
  })
  const [showDownloadButton, setShowDownloadButton] = useState(false)
  const [pdfAvailable, setPdfAvailable] = useState(true)
  const [pdfChecking, setPdfChecking] = useState(true)


  const checkPdfAvailability = useCallback(async (categorySlug?: string) => {
    if (!categorySlug) {
      setPdfAvailable(false)
      setPdfChecking(false)
      return
    }

    try {
      setPdfChecking(true)
      const response = await fetch(`/api/catalogue?category=${encodeURIComponent(categorySlug)}`, {
        method: 'HEAD' // Use HEAD request to check availability without downloading
      })
      setPdfAvailable(response.ok)
    } catch (error) {
      console.error('Failed to check PDF availability:', error)
      setPdfAvailable(false)
    } finally {
      setPdfChecking(false)
    }
  }, [])

  const loadRelatedProducts = useCallback(async (currentProduct: Product) => {
    try {
      setLoadingRelated(true)
      const [similarData, moreData] = await Promise.all([
        getSimilarProducts(currentProduct.id, currentProduct.category, 10),
        getMoreProducts(currentProduct.id, 10)
      ])
      setSimilarProducts(similarData)
      setMoreProducts(moreData)
    } catch (error) {
      console.error('Failed to load related products:', error)
    } finally {
      setLoadingRelated(false)
    }
  }, [])

  // Move loadProduct above useEffect and memoize it
  const loadProduct = useCallback(async () => {
    if (!params.id) return

    try {
      setLoading(true)
      const productId = Number(params.id)

      if (isNaN(productId)) {
        console.error('Invalid product ID:', params.id)
        return
      }

      const productData = await getProduct(productId)
      setProduct(productData)

      // Check PDF availability in parallel (non-blocking)
      if (productData?.category) {
        checkPdfAvailability(productData.category).catch(console.error)
      }

      // Load related products after a short delay (non-blocking)
      if (productData) {
        // Use setTimeout to defer related products loading
        setTimeout(() => {
          loadRelatedProducts(productData).catch(console.error)
        }, 100)
      }
    } catch (error) {
      console.error('Failed to load product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [params.id, loadRelatedProducts, checkPdfAvailability])

  useEffect(() => {
    let isMounted = true

    const fetchProduct = async () => {
      if (!isMounted) return
      await loadProduct()
    }

    fetchProduct()

    // Check PDF availability will run after product load above

    return () => {
      isMounted = false
    }
  }, [loadProduct, checkPdfAvailability])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    if (!formData.name?.trim() || !formData.number?.trim() || !formData.email?.trim() || !formData.location?.trim()) {
      alert('Please fill in all fields')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    try {
      // Submit form data to API
      const response = await fetch('/api/catalogue-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productId: product?.id,
          productName: product?.name,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        // Download the catalogue from our API route
        try {
          const link = window.document.createElement('a')
          link.href = `/api/catalogue?category=${encodeURIComponent(product?.category || '')}`
          link.download = 'catalogue.pdf'
          link.click()
        } catch (downloadError) {
          console.error('Failed to download catalogue:', downloadError)
          // Show error message if download fails
          alert('Form submitted successfully, but there was an issue with the automatic download. Please use the manual download button below.')
        }

        // Reset form and close dialog
        setFormData({ name: '', number: '', email: '', location: '' })
        setDialogOpen(false)
        setShowDownloadButton(true)
        alert('Thank you! Your catalogue download will begin shortly.')
      } else {
        const errorData = await response.text()
        console.error('Form submission failed:', response.status, errorData)
        alert('Failed to submit form. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
    }
  }

  const getProductImages = (product: Product): string[] => {
    const images = product.data?.images || []
    const filteredImages = images.filter(img => {
      if (!img || img.trim() === '') return false

      // Validate URL format
      try {
        const url = new URL(img)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        // If it's not a valid URL, filter it out
        return false
      }
    })

    // Log for debugging in production
    if (filteredImages.length > 0) {
      console.log('Filtered images:', filteredImages)
    }

    // Use a data URI for placeholder instead of a non-existent file
    const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle' dy='0.35em'%3ENo Image Available%3C/text%3E%3C/svg%3E"
    return filteredImages.length > 0 ? filteredImages : [placeholder]
  }

  const getProductFeatures = (product: Product): string[] => {
    return product.data?.features || []
  }

  // Function to get enabled sections and their content based on bucket structure
  const getEnabledSections = (product: Product) => {
    const sections = product.data?.sections || {}
    const sectionData: {
      name: string;
      images?: string[];
      videos?: { title: string; url: string; thumbnail: string }[];
      documents?: { name: string; url: string; type: string }[];
      type: 'images' | 'videos' | 'documents';
    }[] = []

    // Models - show as images
    if (sections.models?.enabled && product.data?.models?.length) {
      sectionData.push({
        name: "Models",
        images: product.data.models,
        type: 'images'
      })
    }

    // Charts - show as images
    if (sections.pressure?.enabled && product.data?.charts?.length) {
      sectionData.push({
        name: "Charts",
        images: product.data.charts,
        type: 'images'
      })
    }

    // Schematics - show as images
    if (sections.schematics?.enabled && product.data?.schematics?.length) {
      sectionData.push({
        name: "Schematics",
        images: product.data.schematics,
        type: 'images'
      })
    }

    // Dimensions - show as images
    if (sections.dimensions?.enabled && product.data?.dimensions?.length) {
      sectionData.push({
        name: "Dimensions",
        images: product.data.dimensions,
        type: 'images'
      })
    }

    // Videos - show as videos
    if (sections.videos?.enabled && product.data?.videos?.length) {
      sectionData.push({
        name: "Videos",
        videos: product.data.videos,
        type: 'videos'
      })
    }

    // Documents - show as downloadable documents
    if (sections.certificates?.enabled && product.data?.documents?.length) {
      sectionData.push({
        name: "Documents",
        documents: product.data.documents,
        type: 'documents'
      })
    }

    // Catalogues removed from accordion - only available via download button

    return sectionData
  }

  // Memoize computed values (must be before early returns)
  const images = useMemo(() => product ? getProductImages(product) : [], [product])
  const features = useMemo(() => product ? getProductFeatures(product) : [], [product])
  const enabledSections = useMemo(() => product ? getEnabledSections(product) : [], [product])

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="lg:h-80 h-64 flex items-end p-8 w-full bg-cover bg-center" style={{ backgroundImage: `url("/herobg.svg")` }}>
          <Skeleton className="h-10 w-64 bg-white/20" />
        </div>
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images Skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl bg-slate-200" />
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="aspect-square w-full rounded-lg bg-slate-200" />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4 bg-slate-200" />
                  <Skeleton className="h-6 w-1/2 bg-slate-200" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg bg-slate-200" />
                <Skeleton className="h-40 w-full rounded-lg bg-slate-200" />
                <Skeleton className="h-14 w-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Product Card Component - Memoized for performance
  const ProductCard = memo(({ product }: { product: Product }) => {
    const productImages = useMemo(() => getProductImages(product), [product])
    const imageSrc = productImages[0]
    const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle' dy='0.35em'%3ENo Image Available%3C/text%3E%3C/svg%3E"
    const hasValidImage = imageSrc && imageSrc !== placeholder

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-square relative overflow-hidden">
          {hasValidImage ? (
            <Image unoptimized
              src={imageSrc}
              alt={product.name || 'Product image'}
              width={300}
              height={300}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <div className="text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg mb-1 line-clamp-2 text-slate-900">{product.name || 'Unnamed Product'}</h3>
          <p className="text-sm text-slate-600 uppercase mb-2">{product.category || 'Uncategorized'}</p>
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">{product.description || 'No description available'}</p>
          <div className="mt-auto pt-4">
            <Link href={`/products/categories/${product.category.toLowerCase()}/${product.id}`}>
              <Button
                variant="outline"
                className="w-full text-[#385785] border-[#385785] hover:bg-[#385785] hover:text-white"
              >
                See Product
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  })
  ProductCard.displayName = 'ProductCard'

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="lg:h-80 h-64 flex items-end p-8 w-full bg-cover bg-center" style={{ backgroundImage: `url("/herobg.svg")` }}>
        <h1 className="lg:text-4xl text-2xl italic text-[#FBF5E4]">
          “Pure <span className="text-white not-italic font-bold">Waters</span>, Noble <span className="text-white not-italic font-bold">Solutions</span>”
        </h1>
      </div>
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="aspect-square bg-white relative">
                  <Image unoptimized
                    src={images[selectedImage]}
                    alt={`${product.name} image ${selectedImage + 1}`}
                    width={500}
                    height={500}
                    className="absolute inset-0 w-full h-full object-contain"
                    priority={selectedImage === 0}
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* <div className="absolute top-4 left-4">
                    <Badge className={inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div> */}

                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden ${selectedImage === index ? "ring-2 ring-sky-600" : ""}`}
                  >
                    <Image unoptimized
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={120}
                      height={120}
                      className="w-full h-full object-contain bg-white"
                      loading="lazy"
                      quality={75}
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 flex flex-col">
              <div className="border-b border-[#6384AA] pb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{product.name}</h1>
                <h1 className="text-xl uppercase text-slate-600 mb-2">{product.category}</h1>
              </div>
              {product.description && (
                <div className="flex border-2 border-[#385785] p-4 rounded-lg flex-col space-y-4 mb-4">
                  <div className="mb-6">
                    <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  </div>
                </div>
              )}

              {features.length > 0 && (
                <div className="space-y-4 border-2 border-[#385785] p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-[#6384AA]">Highlighted Features:</h3>
                  <ul className="space-y-2">
                    {features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-[#6384AA]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">

                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open)
                  if (open) {
                    setShowDownloadButton(false)
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex-1 text-xl font-bold text-white py-6 border-2 bg-[#385785] hover:bg-[#385785] hover:text-white"
                      disabled={!pdfAvailable || pdfChecking}
                    >
                      {pdfChecking ? 'Checking...' : pdfAvailable ? ' Download Catalogue for More Information' : 'Catalogue Unavailable'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle> Download Catalogue for More Information</DialogTitle>
                      <DialogDescription>
                        Please fill in your details to download the product catalogue.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Phone Number *</Label>
                        <Input
                          id="number"
                          name="number"
                          type="tel"
                          value={formData.number}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          name="location"
                          type="text"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Enter your city/location"
                          required
                        />
                      </div>
                      <DialogFooter>
                        {/* <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#385785] hover:bg-[#385785]/90"
                          >
                            {isSubmitting ? 'Submitting...' : 'Download Catalogue'}
                          </Button> */}

                        <Button
                          type="submit"
                          className="bg-[#385785] hover:bg-[#385785]/90"
                        >
                          Download Catalogue
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>


                {/* Error message if PDF is not available */}
                {showDownloadButton && !pdfAvailable && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 mb-3">Thank you for your submission! However, the catalogue PDF is currently unavailable. Please try again later or contact support.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {enabledSections.map((section, index) => (
        <Accordion key={index} type="multiple" className="w-full border-2 border-[#385785]  rounded-2xl max-w-7xl p-8 py-2 mx-auto">
          <AccordionItem value={`section-${index + 1}`}>
            <AccordionTrigger className="text-2xl font-bold text-[#6384AA]">{section.name}</AccordionTrigger>
            <AccordionContent>
              {/* Render images (for Models, Charts, Schematics, Dimensions) */}
              {section.type === 'images' && section.images && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {section.images.map((image, imgIndex) => (
                    <Image unoptimized
                      key={imgIndex}
                      src={image}
                      alt={`${product.name} ${section.name} ${imgIndex + 1}`}
                      width={8000}
                      height={8000}
                      className=" w-full h-auto object-contain"
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                  ))}
                </div>
              )}

              {/* Render videos */}
              {section.type === 'videos' && section.videos && (
                <div className="space-y-6">
                  {section.videos.map((video, videoIndex) => (
                    <div key={videoIndex} className="space-y-2">
                      <h4 className="text-lg font-semibold text-[#6384AA]">{video.title}</h4>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={video.url}
                          title={video.title}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allowFullScreen
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Render documents and catalogues */}
              {section.type === 'documents' && section.documents && (
                <div className="space-y-3">
                  {section.documents.map((document, docIndex) => (
                    <div key={docIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${section.name === 'Catalogues' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                          <span className={`text-xs font-medium ${section.name === 'Catalogues' ? 'text-green-700' : 'text-blue-700'
                            }`}>
                            {document.type}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{document.name}</p>
                          <p className="text-sm text-gray-500">{document.type} Document</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(document.url, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = window.document.createElement('a')
                            link.href = document.url
                            link.download = document.name
                            link.click()
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#6384AA]">Similar Products</h2>
            <p className="text-slate-600">Products in the same category</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {similarProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* More Products */}
      {moreProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#6384AA]">More Products</h2>
            <p className="text-slate-600">Explore other products</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {moreProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Loading state for related products */}
      {loadingRelated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#6384AA]" />
            <p className="text-slate-600">Loading related products...</p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}