"use client"

import { useParams } from "next/navigation"
import VocalItemForm from "@/components/vocals/vocal-item-form"

export default function EditVocalItemPage() {
  const params = useParams()
  const itemId = params.id as string

  return (
    <VocalItemForm 
      mode="edit" 
      title="Edit Vocal Item" 
      itemId={itemId}
    />
  )
}
