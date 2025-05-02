"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SimpleTestPage() {
  const router = useRouter()
  
  // Add debugging
  React.useEffect(() => {
    console.log("Simple test page mounted");
    
    // Add a cleanup function to detect unmounting
    return () => {
      console.log("Simple test page unmounted");
    };
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Test Page</h1>
      <p className="mb-8">This is a simple test page without any sidebar components.</p>
      
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Navigation Tests</h2>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={() => router.push('/songs')}>
            Go to Songs
          </Button>
          <Button onClick={() => {
            console.log('Navigating to /songs with window.location');
            window.location.href = '/songs';
          }}>
            Go to Songs (window.location)
          </Button>
        </div>
      </div>
    </div>
  )
}
