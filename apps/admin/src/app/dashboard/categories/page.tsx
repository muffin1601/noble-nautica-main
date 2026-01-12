"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash2, FolderTree, Loader2 } from "lucide-react"
import { getCategories, createCategory, updateCategory, deleteCategory, searchCategories } from "@/lib/categories"
import { getSubcategoriesByCategory, getChildSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from "@/lib/subcategories"
import type { Category, Subcategory } from "@/lib/supabase"
import { FileUpload } from "@/components/file-upload"
import { STORAGE_BUCKETS } from "@/lib/storage"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // Subcategories state
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)
  const [activeCategoryForSubs, setActiveCategoryForSubs] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [childSubcategories, setChildSubcategories] = useState<Subcategory[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [loadingChildSubs, setLoadingChildSubs] = useState(false)
  const [savingSub, setSavingSub] = useState(false)
  const [deletingSub, setDeletingSub] = useState(false)
  const [newSub, setNewSub] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  })
  const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null)
  const [selectedParentSubForChildren, setSelectedParentSubForChildren] = useState<Subcategory | null>(null)
  const [newChildSub, setNewChildSub] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  })
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Inactive"
  })

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Search categories with debounce
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        try {
          const results = await searchCategories(searchTerm)
          setCategories(results)
        } catch (error) {
          console.error('Search failed:', error)
        }
      } else {
        loadCategories()
      }
    }

    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      alert('Failed to load categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name')
      return
    }

    try {
      setSaving(true)
      await createCategory({
        name: newCategory.name,
        description: newCategory.description || undefined,
        slug: '', // Will be auto-generated
        status: newCategory.status
      })
      setIsAddDialogOpen(false)
      setNewCategory({ name: "", description: "", status: "Active" })
      await loadCategories()
    } catch (error: unknown) {
      console.error('Failed to create category:', error)
      alert((error as Error).message || 'Failed to create category. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEditCategory = async () => {
    if (!selectedCategory || !selectedCategory.name.trim()) {
      alert('Please enter a category name')
      return
    }

    try {
      setSaving(true)
      await updateCategory(selectedCategory.id, {
        name: selectedCategory.name,
        description: selectedCategory.description || undefined,
        status: selectedCategory.status,
        catalogue_url: selectedCategory.catalogue_url || undefined
      })
      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      await loadCategories()
    } catch (error: unknown) {
      console.error('Failed to update category:', error)
      alert((error as Error).message || 'Failed to update category. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      setDeleting(true)
      await deleteCategory(selectedCategory.id)
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      await loadCategories()
    } catch (error: unknown) {
      console.error('Failed to delete category:', error)
      alert((error as Error).message || 'Failed to delete category. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory({ ...category })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  // Subcategories helpers
  const openSubDialog = async (category: Category) => {
    setActiveCategoryForSubs(category)
    setIsSubDialogOpen(true)
    await loadSubcategories(category.id)
  }

  const loadSubcategories = async (categoryId: number) => {
    try {
      setLoadingSubs(true)
      const data = await getSubcategoriesByCategory(categoryId)
      setSubcategories(data)
      setSelectedParentSubForChildren(null)
      setChildSubcategories([])
    } catch (error) {
      console.error('Failed to load subcategories:', error)
      alert('Failed to load subcategories. Please try again.')
    } finally {
      setLoadingSubs(false)
    }
  }

  const loadChildSubs = async (parentId: number) => {
    try {
      setLoadingChildSubs(true)
      const data = await getChildSubcategories(parentId)
      setChildSubcategories(data)
    } catch (error) {
      console.error('Failed to load child subcategories:', error)
      alert('Failed to load child subcategories. Please try again.')
    } finally {
      setLoadingChildSubs(false)
    }
  }

  const handleAddSubcategory = async () => {
    if (!activeCategoryForSubs) return
    if (!newSub.name.trim()) {
      alert('Please enter a subcategory name')
      return
    }
    try {
      setSavingSub(true)
      await createSubcategory({
        category_id: activeCategoryForSubs.id,
        name: newSub.name,
        description: newSub.description || undefined,
        slug: '',
        status: newSub.status,
      })
      setNewSub({ name: "", description: "", status: "Active" })
      await loadSubcategories(activeCategoryForSubs.id)
    } catch (error: unknown) {
      console.error('Failed to create subcategory:', error)
      alert((error as Error).message || 'Failed to create subcategory. Please try again.')
    } finally {
      setSavingSub(false)
    }
  }

  const handleAddChildSubcategory = async () => {
    if (!activeCategoryForSubs || !selectedParentSubForChildren) return
    if (!newChildSub.name.trim()) {
      alert('Please enter a subcategory name')
      return
    }
    try {
      setSavingSub(true)
      await createSubcategory({
        category_id: activeCategoryForSubs.id,
        parent_subcategory_id: selectedParentSubForChildren.id,
        name: newChildSub.name,
        description: newChildSub.description || undefined,
        slug: '',
        status: newChildSub.status,
      })
      setNewChildSub({ name: "", description: "", status: "Active" })
      await loadChildSubs(selectedParentSubForChildren.id)
    } catch (error: unknown) {
      console.error('Failed to create child subcategory:', error)
      alert((error as Error).message || 'Failed to create child subcategory. Please try again.')
    } finally {
      setSavingSub(false)
    }
  }

  const handleUpdateSubcategory = async () => {
    if (!selectedSub) return
    if (!selectedSub.name.trim()) {
      alert('Please enter a subcategory name')
      return
    }
    try {
      setSavingSub(true)
      await updateSubcategory(selectedSub.id, {
        name: selectedSub.name,
        description: selectedSub.description || undefined,
        status: selectedSub.status,
      })
      setSelectedSub(null)
      if (activeCategoryForSubs) await loadSubcategories(activeCategoryForSubs.id)
    } catch (error: unknown) {
      console.error('Failed to update subcategory:', error)
      alert((error as Error).message || 'Failed to update subcategory. Please try again.')
    } finally {
      setSavingSub(false)
    }
  }

  const handleDeleteSubcategory = async () => {
    if (!selectedSub) return
    try {
      setDeletingSub(true)
      await deleteSubcategory(selectedSub.id)
      setSelectedSub(null)
      if (activeCategoryForSubs) await loadSubcategories(activeCategoryForSubs.id)
    } catch (error: unknown) {
      console.error('Failed to delete subcategory:', error)
      alert((error as Error).message || 'Failed to delete subcategory. Please try again.')
    } finally {
      setDeletingSub(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Organize your products with categories and subcategories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new product category to organize your products.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Spa Equipment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Brief description of this category..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-status">Status</Label>
                <Select value={newCategory.status} onValueChange={(value) => setNewCategory({ ...newCategory, status: value as "Active" | "Inactive" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Manage product categories and their subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {category.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{category.description}</div>
                    </TableCell>
                    <TableCell>{category.product_count || 0}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openSubDialog(category)}>
                        Manage
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.status === "Active" ? "default" : "secondary"}>{category.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openSubDialog(category)}>
                            <FolderTree className="h-4 w-4 mr-2" />
                            Subcategories
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(category)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manage Subcategories Dialog */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subcategories</DialogTitle>
            <DialogDescription>
              {activeCategoryForSubs ? `Category: ${activeCategoryForSubs.name}` : 'Select a category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sub-name">Subcategory Name</Label>
              <Input
                id="sub-name"
                value={newSub.name}
                onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                placeholder="e.g., Pumps"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-description">Description</Label>
              <Textarea
                id="sub-description"
                value={newSub.description}
                onChange={(e) => setNewSub({ ...newSub, description: e.target.value })}
                placeholder="Brief description of this subcategory..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-status">Status</Label>
              <Select value={newSub.status} onValueChange={(value) => setNewSub({ ...newSub, status: value as "Active" | "Inactive" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddSubcategory} disabled={savingSub || !activeCategoryForSubs}>
                {savingSub ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Subcategory'
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Existing Subcategories</h4>
              {loadingSubs ? (
                <div className="text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading...
                </div>
              ) : subcategories.length === 0 ? (
                <div className="text-sm text-muted-foreground">No subcategories yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcategories.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedParentSubForChildren(sub); loadChildSubs(sub.id) }}>View Children</Button>
                            <span>{sub.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs"><div className="truncate">{sub.description}</div></TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'Active' ? 'default' : 'secondary'}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedSub({ ...sub })}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedSub(sub)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Child subcategory management */}
            {selectedParentSubForChildren && (
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Children of: {selectedParentSubForChildren.name}</h4>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedParentSubForChildren(null); setChildSubcategories([]) }}>Clear</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Child subcategory name" value={newChildSub.name} onChange={(e) => setNewChildSub({ ...newChildSub, name: e.target.value })} />
                  <Input placeholder="Description (optional)" value={newChildSub.description} onChange={(e) => setNewChildSub({ ...newChildSub, description: e.target.value })} />
                  <div className="flex justify-end">
                    <Button onClick={handleAddChildSubcategory} disabled={savingSub}>
                      {savingSub ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Add Child Subcategory'}
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  {loadingChildSubs ? (
                    <div className="text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading...</div>
                  ) : childSubcategories.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No child subcategories found.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {childSubcategories.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell className="max-w-xs"><div className="truncate">{c.description}</div></TableCell>
                            <TableCell>
                              <Badge variant={c.status === 'Active' ? 'default' : 'secondary'}>{c.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={!!selectedSub && isSubDialogOpen} onOpenChange={(open) => { if (!open) setSelectedSub(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>Update subcategory information.</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sub-name">Name</Label>
                <Input
                  id="edit-sub-name"
                  value={selectedSub.name}
                  onChange={(e) => setSelectedSub({ ...selectedSub, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sub-description">Description</Label>
                <Textarea
                  id="edit-sub-description"
                  value={selectedSub.description || ''}
                  onChange={(e) => setSelectedSub({ ...selectedSub, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sub-status">Status</Label>
                <Select value={selectedSub.status} onValueChange={(value) => setSelectedSub({ ...selectedSub, status: value as 'Active' | 'Inactive' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSub(null)} disabled={savingSub}>Cancel</Button>
            <Button onClick={handleUpdateSubcategory} disabled={savingSub}>
              {savingSub ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Subcategory'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Dialog */}
      <AlertDialog open={!!selectedSub && deletingSub}>
        {/* Intentionally not used; using inline confirm below */}
      </AlertDialog>
      {selectedSub && (
        <AlertDialog open={!!selectedSub && !deletingSub} onOpenChange={(open) => { if (!open) setSelectedSub(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{selectedSub.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingSub}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteSubcategory} disabled={deletingSub}>
                {deletingSub ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Subcategory'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  placeholder="e.g., Spa Equipment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category-description">Description</Label>
                <Textarea
                  id="edit-category-description"
                  value={selectedCategory.description || ""}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  placeholder="Brief description of this category..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category-status">Status</Label>
                <Select value={selectedCategory.status} onValueChange={(value) => setSelectedCategory({ ...selectedCategory, status: value as "Active" | "Inactive" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Catalogue Upload */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-base">Category Catalogue (PDF)</Label>
                <p className="text-sm text-muted-foreground">Upload a single catalogue PDF for this category. This will be shown on all product pages within this category.</p>
                <FileUpload
                  bucket={STORAGE_BUCKETS.PRODUCT_CATALOGUES}
                  onFilesUploaded={(urls) => {
                    if (urls && urls.length > 0) {
                      setSelectedCategory({ ...selectedCategory, catalogue_url: urls[0] as unknown as string })
                    }
                  }}
                  allowedTypes={["pdf"]}
                  maxFiles={1}
                  maxSizeMB={50}
                  title="Upload Category Catalogue"
                  description="Drag and drop the PDF here, or click to browse"
                />

                {selectedCategory.catalogue_url && (
                  <div className="flex items-center justify-between rounded border p-3">
                    <div className="text-sm truncate mr-2">
                      Current file: <a className="underline" href={selectedCategory.catalogue_url} target="_blank" rel="noreferrer">View</a>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory({ ...selectedCategory, catalogue_url: null as unknown as string })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
              {selectedCategory?.product_count && selectedCategory.product_count > 0 && (
                <span className="text-destructive font-medium">
                  <br />This category has {selectedCategory.product_count} product(s) assigned to it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCategory}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
