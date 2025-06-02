"use client"

import { useParams } from "next/navigation"
import VocalItemForm from "@/components/vocals/vocal-item-form"

export default function NewVocalItemPage() {
  const params = useParams()
  const categoryId = params.id as string

  return (
    <VocalItemForm 
      mode="create" 
      title="Add New Vocal Item" 
      defaultCategoryId={categoryId}
    />
  )
}
