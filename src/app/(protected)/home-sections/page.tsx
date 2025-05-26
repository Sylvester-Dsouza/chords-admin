"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconGripVertical,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import homeSectionService, { HomeSection, SectionType, CreateHomeSectionDto, UpdateHomeSectionDto } from "@/services/home-section.service"

// Sortable table row component
interface SortableRowProps {
  section: HomeSection;
  index: number;
  renderSectionTypeBadge: (type: SectionType) => React.ReactNode;
  handleToggleActive: (section: HomeSection) => Promise<void>;
  openEditDialog: (section: HomeSection) => void;
  openDeleteDialog: (section: HomeSection) => void;
  router: ReturnType<typeof useRouter>;
}

function SortableRow({
  section,
  index,
  renderSectionTypeBadge,
  handleToggleActive,
  openEditDialog,
  openDeleteDialog,
  router
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted/50" : ""}>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span>{index + 1}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical className="h-4 w-4" />
            <span className="sr-only">Drag to reorder</span>
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{section.title}</div>
      </TableCell>
      <TableCell>{renderSectionTypeBadge(section.type)}</TableCell>
      <TableCell>{section.itemCount}</TableCell>
      <TableCell>
        {section.filterType ? (
          <Badge variant="secondary">{section.filterType}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch
            checked={section.isActive}
            onCheckedChange={() => handleToggleActive(section)}
          />
          <span className={section.isActive ? "text-green-600" : "text-muted-foreground"}>
            {section.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(section.updatedAt), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(section)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {section.type === SectionType.BANNER && (
              <DropdownMenuItem onClick={() => router.push(`/home-sections/banner-items/${section.id}`)}>
                <IconEye className="mr-2 h-4 w-4" />
                Manage Banner Items
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => {
              // Redirect to the appropriate content management page based on section type
              switch (section.type) {
                case SectionType.SONGS:
                case SectionType.SONG_LIST:
                  router.push(`/home-sections/content/song/${section.id}`);
                  break;
                case SectionType.ARTISTS:
                  router.push(`/home-sections/content/artist/${section.id}`);
                  break;
                case SectionType.COLLECTIONS:
                  router.push(`/home-sections/content/collection/${section.id}`);
                  break;
                case SectionType.BANNER:
                  router.push(`/home-sections/banner-items/${section.id}`);
                  break;
                default:
                  router.push(`/home-sections/content/${section.id}`);
              }
            }}>
              <IconEye className="mr-2 h-4 w-4" />
              Manage Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteDialog(section)}>
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function HomeSectionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState<HomeSection[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState<HomeSection | null>(null)
  const [formData, setFormData] = useState<CreateHomeSectionDto>({
    title: "",
    type: SectionType.COLLECTIONS,
    isActive: true,
    itemCount: 10, // This will be set to 0 for BANNER type sections
  })

  // Load sections
  useEffect(() => {
    const loadSections = async () => {
      setLoading(true)
      try {
        const data = await homeSectionService.getAllSections(true)
        setSections(data)
      } catch (error) {
        console.error("Error loading home sections:", error)
        toast.error("Failed to load home sections. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSections()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // For numeric fields, ensure we're sending a valid number
    if (name === "itemCount") {
      // Parse as integer and ensure it's within valid range
      const parsedValue = parseInt(value, 10)
      const validValue = isNaN(parsedValue) ? 0 : Math.min(Math.max(parsedValue, 0), 50)

      setFormData({
        ...formData,
        [name]: validValue,
      })
    } else {
      // Handle other fields normally
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === "type" && (value === SectionType.BANNER || value === SectionType.SONG_LIST)) {
      // For banner sections and song list sections, set itemCount to 0 as it's handled differently
      setFormData({
        ...formData,
        [name]: value,
        itemCount: 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  // Handle create section
  const handleCreateSection = async () => {
    try {
      // Ensure itemCount is a valid integer
      const dataToSubmit = {
        ...formData,
        itemCount: (formData.type === SectionType.BANNER || formData.type === SectionType.SONG_LIST) ? 0 :
                  (typeof formData.itemCount === 'number' ? formData.itemCount : 10)
      };

      console.log("Submitting home section data:", dataToSubmit);

      const newSection = await homeSectionService.createSection(dataToSubmit);
      setSections([...sections, newSection]);
      setIsCreateDialogOpen(false);
      toast.success("Home section created successfully.");

      // Reset form data with appropriate defaults
      setFormData({
        title: "",
        type: SectionType.COLLECTIONS,
        isActive: true,
        itemCount: 10, // Default for non-banner sections
      });
    } catch (error) {
      console.error("Error creating home section:", error);
      toast.error("Failed to create home section. Please try again.");
    }
  }

  // Handle edit section
  const handleEditSection = async () => {
    if (!currentSection) return

    try {
      // Ensure itemCount is a valid integer
      const dataToSubmit = {
        ...formData,
        itemCount: (formData.type === SectionType.BANNER || formData.type === SectionType.SONG_LIST) ? 0 :
                  (typeof formData.itemCount === 'number' ? formData.itemCount : 10)
      };

      console.log("Updating home section data:", dataToSubmit);
      console.log("Current section before update:", currentSection);

      // Important: Only send the fields that are actually changing
      // This prevents overwriting itemIds and other fields that aren't being edited
      const fieldsToUpdate: UpdateHomeSectionDto = {};

      // Only include fields that have changed
      if (dataToSubmit.title !== currentSection?.title) fieldsToUpdate.title = dataToSubmit.title;
      if (dataToSubmit.type !== currentSection?.type) fieldsToUpdate.type = dataToSubmit.type;
      if (dataToSubmit.isActive !== currentSection?.isActive) fieldsToUpdate.isActive = dataToSubmit.isActive;
      if (dataToSubmit.itemCount !== currentSection?.itemCount) fieldsToUpdate.itemCount = dataToSubmit.itemCount;
      if (dataToSubmit.filterType !== currentSection?.filterType) fieldsToUpdate.filterType = dataToSubmit.filterType;

      console.log("Fields being updated:", fieldsToUpdate);
      console.log("Current section itemIds:", currentSection?.itemIds);

      const updatedSection = await homeSectionService.updateSection(currentSection.id, fieldsToUpdate);
      console.log("Received updated section from API:", updatedSection);

      // Preserve itemIds from the original section if they weren't explicitly changed
      // This ensures we don't lose manually added items
      if (!fieldsToUpdate.itemIds && currentSection?.itemIds && (!updatedSection.itemIds || updatedSection.itemIds.length === 0)) {
        console.log("Preserving original itemIds:", currentSection.itemIds);
        updatedSection.itemIds = currentSection.itemIds;
      }

      // Update the section in the state
      setSections(sections.map(section => section.id === updatedSection.id ? updatedSection : section));

      // Log the updated sections state
      console.log("Updated sections state:", sections.map(s => ({
        id: s.id,
        title: s.title,
        itemIds: s.itemIds
      })));

      setIsEditDialogOpen(false);
      toast.success("Home section updated successfully.");
    } catch (error) {
      console.error("Error updating home section:", error);
      toast.error("Failed to update home section. Please try again.");
    }
  }

  // Handle delete section
  const handleDeleteSection = async () => {
    if (!currentSection) return

    try {
      await homeSectionService.deleteSection(currentSection.id)
      setSections(sections.filter(section => section.id !== currentSection.id))
      setIsDeleteDialogOpen(false)
      toast.success("Home section deleted successfully.")
    } catch (error) {
      console.error("Error deleting home section:", error)
      toast.error("Failed to delete home section. Please try again.")
    }
  }

  // Handle toggle section active state
  const handleToggleActive = async (section: HomeSection) => {
    try {
      console.log(`Toggling active state for section ${section.id}. Current itemIds:`, section.itemIds);

      // Only update the isActive field
      const updatedSection = await homeSectionService.updateSection(section.id, {
        isActive: !section.isActive,
      });

      console.log(`Received updated section from API:`, updatedSection);

      // Preserve the original itemIds if they're missing in the response
      if (section.itemIds && section.itemIds.length > 0 && (!updatedSection.itemIds || updatedSection.itemIds.length === 0)) {
        console.log(`Preserving original itemIds for section ${section.id}:`, section.itemIds);
        updatedSection.itemIds = section.itemIds;
      }

      // Update the section in the state
      setSections(sections.map(s => s.id === updatedSection.id ? updatedSection : s));
      toast.success(`Section ${updatedSection.isActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      console.error("Error toggling section active state:", error);
      toast.error("Failed to update section. Please try again.");
    }
  }

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sections.findIndex(section => section.id === active.id)
    const newIndex = sections.findIndex(section => section.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    console.log("Reordering sections. Moving section from index", oldIndex, "to", newIndex);

    // Create a copy of the sections array with the new order
    const newSections = arrayMove(sections, oldIndex, newIndex)

    // Optimistically update UI
    setSections(newSections)

    try {
      console.log("Sections before reordering:", sections.map(s => ({
        id: s.id,
        title: s.title,
        itemIds: s.itemIds?.length
      })));

      // Update each section's order individually
      const updatePromises = newSections.map((section, index) => {
        console.log(`Updating order for section ${section.id} to ${index + 1}. Current itemIds:`, section.itemIds);

        return homeSectionService.updateSection(section.id, {
          order: index + 1
        }).then(updatedSection => {
          console.log(`Received updated section ${section.id} from API:`, updatedSection);

          // Preserve itemIds if they're missing in the response
          if (section.itemIds && section.itemIds.length > 0 && (!updatedSection.itemIds || updatedSection.itemIds.length === 0)) {
            console.log(`Preserving itemIds for section ${section.id}:`, section.itemIds);
            return {
              ...updatedSection,
              itemIds: section.itemIds
            };
          }
          return updatedSection;
        });
      });

      // Wait for all updates to complete
      const updatedSections = await Promise.all(updatePromises);

      console.log("All sections after reordering:", updatedSections.map(s => ({
        id: s.id,
        title: s.title,
        itemIds: s.itemIds ? s.itemIds.length : 0
      })));

      // Update the sections state with the preserved itemIds
      setSections(updatedSections);

      toast.success("Sections reordered successfully")
    } catch (error) {
      console.error("Error reordering sections:", error)
      toast.error("Failed to reorder sections. Please try again.")

      // Revert to original order on error
      setSections(sections)
    }
  }

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Open edit dialog
  const openEditDialog = (section: HomeSection) => {
    setCurrentSection(section)
    setFormData({
      title: section.title,
      type: section.type,
      isActive: section.isActive,
      itemCount: section.itemCount,
      filterType: section.filterType,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (section: HomeSection) => {
    setCurrentSection(section)
    setIsDeleteDialogOpen(true)
  }

  // Render section type badge
  const renderSectionTypeBadge = (type: SectionType) => {
    switch (type) {
      case SectionType.COLLECTIONS:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Collections</Badge>
      case SectionType.SONGS:
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Songs</Badge>
      case SectionType.SONG_LIST:
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-50">Song List</Badge>
      case SectionType.ARTISTS:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Artists</Badge>
      case SectionType.BANNER:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Banner</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Home Page Management" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Home Page Management</h1>
              <p className="text-muted-foreground">
                Manage the content displayed on the home page of the mobile app
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </div>

          {/* Sections table */}
          <div className="rounded-md border">
            {loading ? (
              <div className="flex h-[300px] w-full items-center justify-center">
                <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sections.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center p-4">
                  <IconEye className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No home sections found
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Your First Section
                  </Button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Filter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <SortableContext
                    items={sections.map(section => section.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <TableBody>
                      {sections.map((section, index) => (
                        <SortableRow
                          key={section.id}
                          section={section}
                          index={index}
                          renderSectionTypeBadge={renderSectionTypeBadge}
                          handleToggleActive={handleToggleActive}
                          openEditDialog={openEditDialog}
                          openDeleteDialog={openDeleteDialog}
                          router={router}
                        />
                      ))}
                    </TableBody>
                  </SortableContext>
                </Table>
              </DndContext>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Create Section Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Home Section</DialogTitle>
            <DialogDescription>
              Create a new section to display on the home page of the mobile app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., Seasonal Collections"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select section type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SectionType.COLLECTIONS}>Collections</SelectItem>
                  <SelectItem value={SectionType.SONGS}>Songs</SelectItem>
                  <SelectItem value={SectionType.SONG_LIST}>Song List</SelectItem>
                  <SelectItem value={SectionType.ARTISTS}>Artists</SelectItem>
                  <SelectItem value={SectionType.BANNER}>Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type !== SectionType.BANNER && formData.type !== SectionType.SONG_LIST && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemCount" className="text-right">
                  Item Count
                </Label>
                <Input
                  id="itemCount"
                  name="itemCount"
                  type="number"
                  value={formData.itemCount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  min={0}
                  max={50}
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filterType" className="text-right">
                Filter Type
              </Label>
              <Input
                id="filterType"
                name="filterType"
                value={formData.filterType || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., seasonal, trending, new"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
                <Label htmlFor="isActive">
                  {formData.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection}>Create Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Home Section</DialogTitle>
            <DialogDescription>
              Update the details of this home section.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled={true} // Type cannot be changed after creation
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select section type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SectionType.COLLECTIONS}>Collections</SelectItem>
                  <SelectItem value={SectionType.SONGS}>Songs</SelectItem>
                  <SelectItem value={SectionType.SONG_LIST}>Song List</SelectItem>
                  <SelectItem value={SectionType.ARTISTS}>Artists</SelectItem>
                  <SelectItem value={SectionType.BANNER}>Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type !== SectionType.BANNER && formData.type !== SectionType.SONG_LIST && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-itemCount" className="text-right">
                  Item Count
                </Label>
                <Input
                  id="edit-itemCount"
                  name="itemCount"
                  type="number"
                  value={formData.itemCount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  min={0}
                  max={50}
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-filterType" className="text-right">
                Filter Type
              </Label>
              <Input
                id="edit-filterType"
                name="filterType"
                value={formData.filterType || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., seasonal, trending, new"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
                <Label htmlFor="edit-isActive">
                  {formData.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Home Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this home section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">
              Section: <span className="font-bold">{currentSection?.title}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
