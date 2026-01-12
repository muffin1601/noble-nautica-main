"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ArrowLeft, Save, HelpCircle, Loader2, ExternalLink } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import Image from "next/image"
import { getProduct, updateProduct } from "@/lib/products"
import type { ProductData, Category, Subcategory } from "@/lib/supabase"
import { getSubcategoriesByCategory, getChildSubcategories, createSubcategory, getSubcategoryBySlug, getSubcategory } from "@/lib/subcategories"
import { FileUpload } from "@/components/file-upload"
import { STORAGE_BUCKETS, deleteFile as deleteStorageFile } from "@/lib/storage"
import { getActiveCategories } from "@/lib/categories"

interface DynamicSection {
    id: string
    name: string
    description: string
    type: string
    enabled: boolean
}

// ModelRow interface removed - now using images for models

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap the params Promise using React.use()
    const { id } = use(params)

    const [productName, setProductName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [subcategory, setSubcategory] = useState("")
    const [selectedParentSub, setSelectedParentSub] = useState("")
    const [categories, setCategories] = useState<Category[]>([])
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [childSubcategories, setChildSubcategories] = useState<Subcategory[]>([])
    const [loadingSubs, setLoadingSubs] = useState(false)
    const [loadingChildSubs, setLoadingChildSubs] = useState(false)
    const [isAddingSub, setIsAddingSub] = useState(false)
    const [newSubName, setNewSubName] = useState("")
    const [newSubDesc, setNewSubDesc] = useState("")
    const [savingNewSub, setSavingNewSub] = useState(false)
    const [features, setFeatures] = useState<string[]>([""])
    const [images, setImages] = useState<string[]>([])
    const [videos, setVideos] = useState<Array<{ title: string; url: string; thumbnail: string }>>([])
    const [documents, setDocuments] = useState<Array<{ name: string; url: string; type: string }>>([])
    const [catalogues, setCatalogues] = useState<Array<{ name: string; url: string; type: string }>>([])
    const [charts, setCharts] = useState<string[]>([])
    const [schematics, setSchematics] = useState<string[]>([])
    const [dimensions, setDimensions] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [removingImageIndex, setRemovingImageIndex] = useState<number | null>(null)

    // Dynamic sections with better descriptions
    const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([
        {
            id: "models",
            name: "Product Models",
            description: "Upload images of your product specifications table",
            type: "images",
            enabled: false
        },
        {
            id: "pressure",
            name: "Performance Chart",
            description: "Upload charts showing how your product performs under different conditions",
            type: "chart",
            enabled: false
        },
        {
            id: "schematics",
            name: "Installation Diagrams",
            description: "Add technical diagrams showing how to install or connect your product",
            type: "images",
            enabled: false
        },
        {
            id: "dimensions",
            name: "Size & Measurements",
            description: "Upload drawings showing the exact size and dimensions of your product",
            type: "images",
            enabled: false
        },
        {
            id: "certificates",
            name: "Certificates & Documents",
            description: "Add safety certificates, manuals, and other important documents",
            type: "documents",
            enabled: false
        },
        {
            id: "videos",
            name: "Product Videos",
            description: "Add videos showing your product in action or installation guides",
            type: "media",
            enabled: false
        },
        {
            id: "catalogues",
            name: "Product Catalogues",
            description: "Upload PDF catalogues for your products",
            type: "documents",
            enabled: false
        },
    ])

    const [models, setModels] = useState<string[]>([])

    // Load categories
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

    // When product's existing subcategory is present, align parent/child selections
    useEffect(() => {
        const alignFromExisting = async () => {
            if (!subcategory) return
            if (subcategories.length === 0) return

            const cat = categories.find(c => c.slug === category)
            if (!cat) return

            // If the current product subcategory is a top-level subcategory, set it as parent
            const isTopLevel = subcategories.some(s => s.slug === subcategory)
            if (isTopLevel) {
                setSelectedParentSub(subcategory)
                setChildSubcategories([])
                return
            }

            // Otherwise, find its parent by fetching the subcategory row
            try {
                const child = await getSubcategoryBySlug(cat.id, subcategory)
                if (child && child.parent_subcategory_id) {
                    const parent = await getSubcategory(child.parent_subcategory_id)
                    if (parent) {
                        setSelectedParentSub(parent.slug)
                        // Load children for that parent so UI can show them
                        const kids = await getChildSubcategories(parent.id)
                        setChildSubcategories(kids)
                        // Keep subcategory as the selected child slug
                    }
                }
            } catch (err) {
                // Non-fatal; leave selections empty
                console.error('Failed to align existing subcategory:', err)
            }
        }

        alignFromExisting()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subcategory, subcategories, category, categories])

    // Load existing data
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await getProduct(parseInt(id))
                if (productData) {
                    setProductName(productData.name)
                    setDescription(productData.description || '')
                    setCategory(productData.category)
                    setSubcategory(productData.subcategory || "")
                    setFeatures(productData.data?.features || [''])
                    setImages(productData.data?.images || [])
                    setModels(productData.data?.models || [])
                    setVideos(productData.data?.videos || [])
                    setDocuments(productData.data?.documents || [])
                    setCatalogues(productData.data?.catalogues || [])
                    setCharts(productData.data?.charts || [])
                    setSchematics(productData.data?.schematics || [])
                    setDimensions(productData.data?.dimensions || [])

                    // Update dynamic sections
                    setDynamicSections(sections =>
                        sections.map(section => ({
                            ...section,
                            enabled: productData.data?.sections?.[section.id as keyof typeof productData.data.sections]?.enabled || false
                        }))
                    )
                }
            } catch (error) {
                console.error('Failed to load product:', error)
            }
        }

        loadProduct()
    }, [id])

    const addFeature = () => {
        setFeatures([...features, ""])
    }

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features]
        newFeatures[index] = value
        setFeatures(newFeatures)
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

    // Helper: Build ProductData from current state with optional images override
    const buildProductData = (imagesOverride?: string[]): ProductData => {
        const sections: ProductData['sections'] = {}
        dynamicSections.forEach(section => {
            (sections as Record<string, { enabled: boolean }>)[section.id] = { enabled: section.enabled }
        })

        return {
            features: features.filter(f => f.trim() !== ''),
            images: imagesOverride ?? images,
            sections,
            models: dynamicSections.find(s => s.id === 'models')?.enabled ? models : [],
            documents,
            catalogues,
            videos,
            charts,
            schematics,
            dimensions
        }
    }

    // Delete image from storage and persist DB immediately
    const handleRemoveImage = async (index: number) => {
        const url = images[index]
        if (!url) return

        // Optional confirm
        if (!confirm('Remove this image from storage and the product?')) return

        const previousImages = [...images]
        const newImages = images.filter((_, i) => i !== index)
        try {
            setRemovingImageIndex(index)
            // Delete from storage first
            await deleteStorageFile(url, STORAGE_BUCKETS.PRODUCT_IMAGES)

            // Update local state
            setImages(newImages)

            // Persist to DB
            const productData = buildProductData(newImages)
            const finalSub = subcategory || (selectedParentSub || undefined)
            await updateProduct(parseInt(id), {
                name: productName,
                description: description || undefined,
                category,
                subcategory: finalSub,
                data: productData
            })
        } catch (error) {
            console.error('Failed to remove image:', error)
            // Revert
            setImages(previousImages)
            alert('Failed to remove image. Please try again.')
        } finally {
            setRemovingImageIndex(null)
        }
    }

    const handleSave = async () => {
        if (!productName.trim() || !category) {
            alert('Please fill in the required fields (Product Name and Category)')
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
                catalogues,
                videos,
                charts,
                schematics,
                dimensions
            }

            // Choose child subcategory if selected; otherwise use parent subcategory if selected
            const finalSub = subcategory || (selectedParentSub || undefined)
            await updateProduct(parseInt(id), {
                name: productName,
                description: description || undefined,
                category,
                subcategory: finalSub,
                data: productData
            })

            alert('Product updated successfully!')
        } catch (error) {
            console.error('Failed to update product:', error)
            alert('Failed to update product. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/products/${id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Product
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
                            <p className="text-muted-foreground">Make changes to your product information</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">Save as Draft</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="basic" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Information</TabsTrigger>
                        <TabsTrigger value="features">Features & Options</TabsTrigger>
                        <TabsTrigger value="media">Images & Files</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
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
                                <CardDescription>
                                    This information will be displayed prominently on your product page
                                </CardDescription>
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
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="e.g., Nano Spa Heater"
                                            className="text-base"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Choose a clear, descriptive name that customers will easily understand
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-base font-medium">
                                            Product Category *
                                        </Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="text-base">
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
                                        <p className="text-sm text-muted-foreground">
                                            This helps customers find your product more easily
                                        </p>
                                    </div>

                                    {/* Parent Subcategory selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="subcategory" className="text-base font-medium">Product Subcategory</Label>
                                        <Select
                                            value={selectedParentSub}
                                            onValueChange={setSelectedParentSub}
                                            disabled={!category || loadingSubs || subcategories.length === 0}
                                        >
                                            <SelectTrigger className="text-base">
                                                <SelectValue
                                                    placeholder={
                                                        !category
                                                            ? 'Choose a category first'
                                                            : loadingSubs
                                                                ? 'Loading subcategories...'
                                                                : subcategories.length === 0
                                                                    ? 'No subcategories available'
                                                                    : 'Choose a subcategory (optional)'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subcategories.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.slug}>{sub.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">Optional. Filters products further within the chosen category.</p>
                                        <div className="flex items-center justify-between">
                                            <div />
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
                                            onValueChange={setSubcategory}
                                            disabled={!selectedParentSub || loadingChildSubs || childSubcategories.length === 0}
                                        >
                                            <SelectTrigger className="text-base">
                                                <SelectValue
                                                    placeholder={
                                                        !selectedParentSub
                                                            ? 'Choose a subcategory first'
                                                            : loadingChildSubs
                                                                ? 'Loading child subcategories...'
                                                                : childSubcategories.length === 0
                                                                    ? 'No child subcategories available'
                                                                    : 'Choose a child subcategory (optional)'
                                                    }
                                                />
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
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what your product does and why customers should choose it..."
                                        rows={4}
                                        className="text-base"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Write a clear description that explains the main benefits and uses of your product
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Product Features
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>List the key features and benefits that make your product special</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                                <CardDescription>
                                    Add the key features and benefits that customers care about most
                                </CardDescription>
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
                                </div>
                            </CardContent>
                        </Card>

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

                                                {models.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Current Model Specifications ({models.length})</h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                            {models.map((url, index) => (
                                                                <div key={index} className="relative group">
                                                                    <Image unoptimized
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
                                            </div>
                                        )}

                                        {section.enabled && (section.id === "pressure" || section.id === "schematics" || section.id === "dimensions") && (
                                            <div className="space-y-4 pt-4 border-t">
                                                <div className="space-y-2">
                                                    <Label className="text-base font-medium">Upload {section.name}</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {section.id === "pressure" && "Upload charts or graphs showing product performance"}
                                                        {section.id === "schematics" && "Upload technical diagrams and installation guides"}
                                                        {section.id === "dimensions" && "Upload drawings showing product measurements"}
                                                    </p>
                                                </div>

                                                {/* Show existing files */}
                                                {((section.id === "pressure" && charts.length > 0) ||
                                                    (section.id === "schematics" && schematics.length > 0) ||
                                                    (section.id === "dimensions" && dimensions.length > 0)) && (
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium">Current Files</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                {(section.id === "pressure" ? charts :
                                                                    section.id === "schematics" ? schematics :
                                                                        dimensions).map((file, index) => (
                                                                            <div key={index} className="relative group border rounded-lg p-2">
                                                                                <div className="aspect-video relative rounded overflow-hidden">
                                                                                    <Image unoptimized
                                                                                        src={file}
                                                                                        alt={`${section.name} ${index + 1}`}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                    />
                                                                                </div>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                    onClick={() => {
                                                                                        if (section.id === "pressure") {
                                                                                            setCharts(charts.filter((_, i) => i !== index))
                                                                                        } else if (section.id === "schematics") {
                                                                                            setSchematics(schematics.filter((_, i) => i !== index))
                                                                                        } else {
                                                                                            setDimensions(dimensions.filter((_, i) => i !== index))
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                            </div>
                                                        </div>
                                                    )}

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

                                                {videos.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Current Videos</h4>
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

                                                <FileUpload
                                                    bucket={STORAGE_BUCKETS.PRODUCT_VIDEOS}
                                                    onFilesUploaded={(urls) => {
                                                        const newVideos = urls.map((url, index) => ({
                                                            title: `Product Video ${videos.length + index + 1}`,
                                                            url,
                                                            thumbnail: url
                                                        }))
                                                        setVideos([...videos, ...newVideos])
                                                    }}
                                                    allowedTypes={['mp4', 'webm', 'mov']}
                                                    maxFiles={2}
                                                    maxSizeMB={100}
                                                    title="Upload Product Videos"
                                                    description="Drag and drop video files here, or click to browse"
                                                />
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

                                                {documents.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Current Documents</h4>
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
                                                                            View
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
                                            </div>
                                        )}

                                        {section.enabled && section.id === "catalogues" && (
                                            <div className="space-y-4 pt-4 border-t">
                                                <div className="space-y-2">
                                                    <Label className="text-base font-medium">Upload {section.name}</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Upload PDF catalogues for your products
                                                    </p>
                                                </div>

                                                {catalogues.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Current Catalogues ({catalogues.length})</h4>
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
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="media" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Product Images
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add high-quality images that show your product clearly. The first image will be the main photo.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                                <CardDescription>
                                    Upload clear, high-quality photos of your product. The first image will be used as the main product photo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square relative rounded-lg overflow-hidden border">
                                                    <Image unoptimized
                                                        src={image || "/placeholder.svg"}
                                                        alt={`Product image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {index === 0 && (
                                                        <Badge className="absolute top-2 left-2">Main Photo</Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveImage(index)}
                                                    disabled={removingImageIndex === index}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        <h4 className="font-medium">Current Images</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                                                        <Image
                                                            unoptimized
                                                            src={image || "/placeholder.svg"}
                                                            alt={`Product image ${index + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        {index === 0 && (
                                                            <Badge className="absolute top-2 left-2">Main Photo</Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveImage(index)}
                                                        disabled={removingImageIndex === index}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                   
                                )}

                                <FileUpload
                                    bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
                                    onFilesUploaded={(urls) => setImages([...images, ...urls])}
                                    allowedTypes={['jpg', 'jpeg', 'png', 'webp']}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    title="Add More Product Photos"
                                    description="Drag and drop images here, or click to browse. Recommended size: 800x800px or larger."
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
    )
}
