"use client"

import { useParams } from "next/navigation"
import VocalCategoryForm from "@/components/vocals/vocal-category-form"

export default function EditVocalCategoryPage() {
  const params = useParams()
  const categoryId = params.id as string

  return (
    <VocalCategoryForm 
      mode="edit" 
      title="Edit Vocal Category" 
      categoryId={categoryId}
    />
  )
}
