"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react'

interface ImageUploadProps {
  folder: string
  onImageSelected: (file: File | null, previewUrl: string | null) => void
  onImageRemoved?: (previousUrl: string) => void
  defaultImage?: string
  className?: string
}

export function ImageUpload({
  folder,
  onImageSelected,
  onImageRemoved,
  defaultImage,
  className,
}: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke any blob URLs to prevent memory leaks
      if (image && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed')
        return
      }

      // Clean up previous object URL if it exists
      if (image && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }

      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file)

      // Update the UI with the preview
      setImage(previewUrl)

      // Pass the file and preview URL to the parent component
      onImageSelected(file, previewUrl)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image')
    }
  }

  const handleRemoveImage = () => {
    // Store the current image URL before removing it
    const previousUrl = image;

    // Clear the image state and notify parent component
    setImage(null);
    onImageSelected(null, null);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear any object URLs from local storage to prevent memory leaks
    if (previousUrl && previousUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl);
    }

    // Call the onImageRemoved callback if provided and there was a previous image
    if (onImageRemoved && previousUrl) {
      onImageRemoved(previousUrl);
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {image ? (
        <div className="relative w-full max-w-[300px] mx-auto aspect-video mb-2">
          <Image
            src={image}
            alt="Uploaded image"
            fill
            className="object-cover rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemoveImage}
          >
            <IconX size={16} />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md w-full max-w-[300px] mx-auto aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-primary mb-2"
          onClick={handleButtonClick}
        >
          <IconPhoto size={48} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center px-2">Click to upload image</p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className="mt-2 w-full sm:w-auto mx-auto"
      >
        <span className="flex items-center">
          <IconUpload size={16} className="mr-2" />
          {image ? 'Change Image' : 'Upload Image'}
        </span>
      </Button>
    </div>
  )
}
