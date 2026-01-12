"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ArrowLeft, HelpCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { createProduct } from "@/lib/products"
import type { ProductData, Category, Subcategory } from "@/lib/supabase"
import { getSubcategoriesByCategory, getChildSubcategories, createSubcategory } from "@/lib/subcategories"
import { FileUpload } from "@/components/file-upload"
import { STORAGE_BUCKETS } from "@/lib/storage"
import { getActiveCategories } from "@/lib/categories"
import Image from "next/image"

interface DynamicSection {
  id: string
  name: string
  description: string
  type: string
  enabled: boolean
}

// Removed ModelRow interface as we're now using images for models

interface ValidationErrors {
  productName?: string
  category?: string
  description?: string
  features?: string
  images?: string
}

export default function AddProductPage() {
  const router = useRouter()
  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [childSubcategories, setChildSubcategories] = useState<Subcategory[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [loadingChildSubs, setLoadingChildSubs] = useState(false)
  const [isAddingSub, setIsAddingSub] = useState(false)
  const [newSubName, setNewSubName] = useState("")
  const [newSubDesc, setNewSubDesc] = useState("")
  const [savingNewSub, setSavingNewSub] = useState(false)
  const [selectedParentSub, setSelectedParentSub] = useState("")
  const [features, setFeatures] = useState<string[]>([""])
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<Array<{ title: string; url: string; thumbnail: string }>>([])
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; type: string }>>([])
  // const [catalogues, setCatalogues] = useState<Array<{ name: string; url: string; type: string }>>([])
  const [charts, setCharts] = useState<string[]>([])
  const [schematics, setSchematics] = useState<string[]>([])
  const [dimensions, setDimensions] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([]) // Changed to string array for model images
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getActiveCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubs = async () => {
      setSubcategory("")
      setSelectedParentSub("")
      setChildSubcategories([])
      if (!category) {
        setSubcategories([])
        return
      }
      const cat = categories.find(c => c.slug === category)
      if (!cat) return
      try {
        setLoadingSubs(true)
        const subs = await getSubcategoriesByCategory(cat.id)
        setSubcategories(subs)
      } catch (err) {
        console.error('Failed to load subcategories:', err)
        setSubcategories([])
      } finally {
        setLoadingSubs(false)
      }
    }
    loadSubs()
  }, [category, categories])

  // Load child subcategories when parent subcategory changes
  useEffect(() => {
    const loadChild = async () => {
      setSubcategory("")
      if (!selectedParentSub) {
        setChildSubcategories([])
        return
      }
      const parent = subcategories.find(s => s.slug === selectedParentSub)
      if (!parent) return
      try {
        setLoadingChildSubs(true)
        const children = await getChildSubcategories(parent.id)
        setChildSubcategories(children)
      } catch (err) {
        console.error('Failed to load child subcategories:', err)
        setChildSubcategories([])
      } finally {
        setLoadingChildSubs(false)
      }
    }
    loadChild()
  }, [selectedParentSub, subcategories])

  // Dynamic sections with better descriptions
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([
    {
      id: "models",
      name: "Product Models",
      description: "Upload images of your product specifications table",
      type: "images",
      enabled: false,
    },
    {
      id: "pressure",
      name: "Performance Chart",
      description: "Upload charts showing how your product performs under different conditions",
      type: "chart",
      enabled: false,
    },
    {
      id: "schematics",
      name: "Installation Diagrams",
      description: "Add technical diagrams showing how to install or connect your product",
      type: "images",
      enabled: false,
    },
    {
      id: "dimensions",
      name: "Size & Measurements",
      description: "Upload drawings showing the exact size and dimensions of your product",
      type: "images",
      enabled: false,
    },
    {
      id: "certificates",
      name: "Certificates & Documents",
      description: "Add safety certificates, manuals, and other important documents",
      type: "documents",
      enabled: false,
    },
    {
      id: "videos",
      name: "Product Videos",
      description: "Add videos showing your product in action or installation guides",
      type: "media",
      enabled: false,
    },
    // {
    //   id: "catalogues",
    //   name: "Product Catalogues",
    //   description: "Upload PDF catalogues for your products",
    //   type: "documents",
    //   enabled: false,
    // },
  ])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!productName.trim()) {
      newErrors.productName = "Product name is required"
    }

    if (!category) {
      newErrors.category = "Category is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    const validFeatures = features.filter(f => f.trim() !== '')
    if (validFeatures.length === 0) {
      newErrors.features = "At least one feature is required"
    }

    if (images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
    // Clear feature error when user starts typing
    if (errors.features && value.trim()) {
      setErrors(prev => ({ ...prev, features: undefined }))
    }
  }

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index))
    }
  }

  const toggleDynamicSection = (id: string) => {
    setDynamicSections((sections) =>
      sections.map((section) => (section.id === id ? { ...section, enabled: !section.enabled } : section)),
    )
  }

  // Model functions removed - now using image uploads for models

  const handleSave = async (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return
    }

    try {
      setSaving(true)

      const sections: ProductData['sections'] = {}
      dynamicSections.forEach(section => {
        if (sections) {
          (sections as Record<string, { enabled: boolean }>)[section.id] = { enabled: section.enabled }
        }
      })

      const productData: ProductData = {
        features: features.filter(f => f.trim() !== ''),
        images,
        sections,
        models: dynamicSections.find(s => s.id === 'models')?.enabled ? models : [],
        documents,
        // catalogues,
        videos,
        charts,
        schematics,
        dimensions
      }

      // Choose child subcategory if selected; otherwise use parent subcategory if selected
      const finalSub = subcategory || (selectedParentSub || undefined)

      const newProduct = await createProduct({
        name: productName,
        description: description || undefined,
        category,
        subcategory: finalSub,
        status: isDraft ? 'Draft' : 'Active',
        data: productData
      })

      router.push(`/dashboard/products/${newProduct.id}`)
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">


        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
            <Button variant="outline" size="sm" asChild className="mb-2 sm:mb-0">
              <Link href="/dashboard/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Add New Product</h2>
              <p className="text-muted-foreground text-sm md:text-base">Create a new product for your catalog</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Product'
              )}
            </Button>
          </div>
        </div>

        {/* Single Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Product Details
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the basic information about your product that customers will see first</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>This information will be displayed prominently on your product page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value)
                      if (errors.productName && e.target.value.trim()) {
                        setErrors(prev => ({ ...prev, productName: undefined }))
                      }
                    }}
                    placeholder="e.g., Nano Spa Heater"
                    className={`text-base ${errors.productName ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage error={errors.productName} />
                  {!errors.productName && (
                    <p className="text-sm text-muted-foreground">
                      Choose a clear, descriptive name that customers will easily understand
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium">
                    Product Category *
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value)
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger className={`text-base ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage error={errors.category} />
                  {!errors.category && (
                    <p className="text-sm text-muted-foreground">This helps customers find your product more easily</p>
                  )}
                </div>

                {/* Parent Subcategory selection */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory" className="text-base font-medium">Product Subcategory</Label>
                  <Select
                    value={selectedParentSub}
                    onValueChange={(value) => setSelectedParentSub(value)}
                    disabled={!category || loadingSubs || subcategories.length === 0}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder={
                        !category
                          ? 'Choose a category first'
                          : loadingSubs
                            ? 'Loading subcategories...'
                            : subcategories.length === 0
                              ? 'No subcategories available'
                              : 'Choose a subcategory (optional)'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.slug}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Optional. Filters products further within the chosen category.</p>
                    <Button type="button" variant="ghost" size="sm" disabled={!category} onClick={() => setIsAddingSub((v) => !v)}>
                      {isAddingSub ? 'Cancel' : 'Add new subcategory'}
                    </Button>
                  </div>
                  {isAddingSub && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <Input placeholder="Subcategory name" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} />
                      </div>
                      <div className="md:col-span-1">
                        <Input placeholder="Description (optional)" value={newSubDesc} onChange={(e) => setNewSubDesc(e.target.value)} />
                      </div>
                      <div className="md:col-span-1 flex gap-2">
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!category) return
                            if (!newSubName.trim()) {
                              alert('Enter a subcategory name')
                              return
                            }
                            const cat = categories.find(c => c.slug === category)
                            if (!cat) return
                            try {
                              setSavingNewSub(true)
                              const created = await createSubcategory({ category_id: cat.id, name: newSubName, description: newSubDesc || undefined, slug: '' })
                              // refresh list and select newly created sub
                              const subs = await getSubcategoriesByCategory(cat.id)
                              setSubcategories(subs)
                              setSelectedParentSub(created.slug)
                              setNewSubName('')
                              setNewSubDesc('')
                              setIsAddingSub(false)
                            } catch (err: unknown) {
                              console.error('Failed to create subcategory from product form:', err)
                              alert((err as Error).message || 'Failed to create subcategory')
                            } finally {
                              setSavingNewSub(false)
                            }
                          }}
                          disabled={savingNewSub}
                        >
                          {savingNewSub ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Subcategory'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Child Subcategory selection (final subcategory) */}
                <div className="space-y-2">
                  <Label htmlFor="child-subcategory" className="text-base font-medium">Child Subcategory</Label>
                  <Select
                    value={subcategory}
                    onValueChange={(value) => setSubcategory(value)}
                    disabled={!selectedParentSub || loadingChildSubs || childSubcategories.length === 0}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder={
                        !selectedParentSub
                          ? 'Choose a subcategory first'
                          : loadingChildSubs
                            ? 'Loading child subcategories...'
                            : childSubcategories.length === 0
                              ? 'No child subcategories available'
                              : 'Choose a child subcategory (optional)'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {childSubcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.slug}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Product Description *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description && e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, description: undefined }))
                    }
                  }}
                  placeholder="Describe what your product does and why customers should choose it..."
                  rows={4}
                  className={`text-base ${errors.description ? 'border-red-500' : ''}`}
                />
                <ErrorMessage error={errors.description} />
                {!errors.description && (
                  <p className="text-sm text-muted-foreground">
                    Write a clear description that explains the main benefits and uses of your product
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Product Images *
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Add high-quality images that show your product clearly. The first image will be the main photo.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                Upload clear, high-quality photos of your product. The first image will be used as the main product
                photo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
                onFilesUploaded={(urls) => {
                  setImages([...images, ...urls])
                  if (errors.images) {
                    setErrors(prev => ({ ...prev, images: undefined }))
                  }
                }}
                allowedTypes={['jpg', 'jpeg', 'png', 'webp']}
                maxFiles={5}
                maxSizeMB={10}
                title="Add Product Photos"
                description="Drag and drop images here, or click to browse. Recommended size: 800x800px or larger."
              />
              <ErrorMessage error={errors.images} />

              {images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Images ({images.length})</h4>
                  <div className="flex flex-wrap gap-4">
                    {images.map((url, index) => (
                      <div key={url} className="relative group">
                        <Image unoptimized
                          src={url}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-28 h-28 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-white/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Remove image"
                        >
                          <span className="sr-only">Remove image</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Product Features *
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List the key features and benefits that make your product special</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Add the key features and benefits that customers care about most</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., Easy to install and use"
                        className="text-base"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={features.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeature} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Feature
                </Button>
                <ErrorMessage error={errors.features} />
              </div>
            </CardContent>
          </Card>

          {/* Additional Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Additional Product Information
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Turn on sections you want to include with your product. Only enable what you need.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                Choose which additional information to include with your product. You can always change these later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dynamicSections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Switch
                        checked={section.enabled}
                        onCheckedChange={() => toggleDynamicSection(section.id)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <h4 className="font-medium text-base">{section.name}</h4>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <Badge variant={section.enabled ? "default" : "secondary"}>
                      {section.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  {section.enabled && section.id === "models" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Product Models & Specifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Upload images of your product specifications table
                        </p>
                      </div>
                      <FileUpload
                        bucket={STORAGE_BUCKETS.PRODUCT_MODELS}
                        onFilesUploaded={(urls) => {
                          setModels([...models, ...urls])
                        }}
                        allowedTypes={['jpg', 'jpeg', 'png', 'pdf']}
                        maxFiles={3}
                        maxSizeMB={10}
                        title="Upload Model Specifications"
                        description="Drag and drop specification tables here, or click to browse"
                      />

                      {models.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Uploaded Model Specifications ({models.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {models.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Model Specification ${index + 1}`}
                                  className="w-full h-32 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => setModels(models.filter((_, i) => i !== index))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {section.enabled &&
                    (section.id === "pressure" || section.id === "schematics" || section.id === "dimensions") && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Upload {section.name}</Label>
                          <p className="text-sm text-muted-foreground">
                            {section.id === "pressure" && "Upload charts or graphs showing product performance"}
                            {section.id === "schematics" && "Upload technical diagrams and installation guides"}
                            {section.id === "dimensions" && "Upload drawings showing product measurements"}
                          </p>
                        </div>
                        <FileUpload
                          bucket={
                            section.id === "pressure" ? STORAGE_BUCKETS.PRODUCT_CHARTS :
                              section.id === "schematics" ? STORAGE_BUCKETS.PRODUCT_SCHEMATICS :
                                STORAGE_BUCKETS.PRODUCT_DIMENSIONS
                          }
                          onFilesUploaded={(urls) => {
                            if (section.id === "pressure") {
                              setCharts([...charts, ...urls])
                            } else if (section.id === "schematics") {
                              setSchematics([...schematics, ...urls])
                            } else if (section.id === "dimensions") {
                              setDimensions([...dimensions, ...urls])
                            }
                          }}
                          allowedTypes={['jpg', 'jpeg', 'png', 'pdf', 'svg']}
                          maxFiles={3}
                          maxSizeMB={10}
                          title={`Upload ${section.name}`}
                          description="Drag and drop files here, or click to browse"
                        />

                        {/* Show previews for uploaded files */}
                        {section.id === "pressure" && charts.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Uploaded Charts ({charts.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {charts.map((url, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Chart ${index + 1}`}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setCharts(charts.filter((_, i) => i !== index))}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.id === "schematics" && schematics.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Uploaded Schematics ({schematics.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {schematics.map((url, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Schematic ${index + 1}`}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setSchematics(schematics.filter((_, i) => i !== index))}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.id === "dimensions" && dimensions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Uploaded Dimensions ({dimensions.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {dimensions.map((url, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Dimension ${index + 1}`}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setDimensions(dimensions.filter((_, i) => i !== index))}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {section.enabled && section.id === "videos" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Upload {section.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          Add videos showing your product in action or installation guides
                        </p>
                      </div>
                      <FileUpload
                        bucket={STORAGE_BUCKETS.PRODUCT_VIDEOS}
                        onFilesUploaded={(urls) => {
                          const newVideos = urls.map((url, index) => ({
                            title: `Product Video ${videos.length + index + 1}`,
                            url,
                            thumbnail: url // For now, use video URL as thumbnail
                          }))
                          setVideos([...videos, ...newVideos])
                        }}
                        allowedTypes={['mp4', 'webm', 'mov']}
                        maxFiles={2}
                        maxSizeMB={100}
                        title="Upload Product Videos"
                        description="Drag and drop video files here, or click to browse"
                      />

                      {videos.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Uploaded Videos ({videos.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videos.map((video, index) => (
                              <div key={index} className="border rounded-lg p-3 space-y-2">
                                <video
                                  src={video.url}
                                  className="w-full h-32 object-cover rounded"
                                  controls
                                />
                                <div className="space-y-1">
                                  <Label className="text-sm">Video Title</Label>
                                  <Input
                                    value={video.title}
                                    onChange={(e) => {
                                      const newVideos = [...videos]
                                      newVideos[index].title = e.target.value
                                      setVideos(newVideos)
                                    }}
                                    placeholder="Enter video title"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                                >
                                  Remove Video
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {section.enabled && section.id === "certificates" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Upload {section.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          Add safety certificates, manuals, and other important documents
                        </p>
                      </div>
                      <FileUpload
                        bucket={STORAGE_BUCKETS.PRODUCT_DOCUMENTS}
                        onFilesUploaded={(urls) => {
                          const newDocuments = urls.map((url) => {
                            const fileName = url.split('/').pop() || 'Document'
                            const fileExt = fileName.split('.').pop()?.toUpperCase() || 'PDF'
                            return {
                              name: fileName,
                              url,
                              type: fileExt
                            }
                          })
                          setDocuments([...documents, ...newDocuments])
                        }}
                        allowedTypes={['pdf', 'doc', 'docx']}
                        maxFiles={5}
                        maxSizeMB={20}
                        title="Upload Documents & Certificates"
                        description="Drag and drop documents here, or click to browse"
                      />

                      {documents.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Uploaded Documents ({documents.length})</h4>
                          <div className="space-y-2">
                            {documents.map((document, index) => (
                              <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded">
                                    <span className="text-xs font-medium text-blue-700">{document.type}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-sm">Document Name</Label>
                                    <Input
                                      value={document.name}
                                      onChange={(e) => {
                                        const newDocuments = [...documents]
                                        newDocuments[index].name = e.target.value
                                        setDocuments(newDocuments)
                                      }}
                                      placeholder="Enter document name"
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(document.url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* {section.enabled && section.id === "catalogues" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Upload {section.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          Upload PDF catalogues for your products
                        </p>
                      </div>
                      <FileUpload
                        bucket={STORAGE_BUCKETS.PRODUCT_CATALOGUES}
                        onFilesUploaded={(urls) => {
                          const newCatalogues = urls.map((url) => {
                            const fileName = url.split('/').pop() || 'Catalogue'
                            const fileExt = fileName.split('.').pop()?.toUpperCase() || 'PDF'
                            return {
                              name: fileName,
                              url,
                              type: fileExt
                            }
                          })
                          setCatalogues([...catalogues, ...newCatalogues])
                        }}
                        allowedTypes={['pdf']}
                        maxFiles={3}
                        maxSizeMB={50}
                        title="Upload Product Catalogues"
                        description="Drag and drop PDF catalogues here, or click to browse"
                      />

                      {catalogues.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Uploaded Catalogues ({catalogues.length})</h4>
                          <div className="space-y-2">
                            {catalogues.map((catalogue, index) => (
                              <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded">
                                    <span className="text-xs font-medium text-green-700">{catalogue.type}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-sm">Catalogue Name</Label>
                                    <Input
                                      value={catalogue.name}
                                      onChange={(e) => {
                                        const newCatalogues = [...catalogues]
                                        newCatalogues[index].name = e.target.value
                                        setCatalogues(newCatalogues)
                                      }}
                                      placeholder="Enter catalogue name"
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(catalogue.url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setCatalogues(catalogues.filter((_, i) => i !== index))}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )} */}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
