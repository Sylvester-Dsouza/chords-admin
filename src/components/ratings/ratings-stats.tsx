"use client"

import { useEffect, useState } from "react"
import { IconStar, IconStarFilled, IconUsers } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { RatingStats } from "@/services/rating.service"

interface RatingsStatsProps {
  stats: RatingStats | null
  loading: boolean
  totalRatings: number
}

export function RatingsStats({ stats, loading, totalRatings }: RatingsStatsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const renderDistribution = () => {
    if (!stats) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star.toString()] || 0
          const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0

          return (
            <div key={star} className="flex items-center gap-2">
              <div className="flex items-center w-16">
                <IconStarFilled className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">{star}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <span className="text-xs text-muted-foreground w-10 text-right">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderAverageRating = () => {
    if (!stats) return null

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-3xl font-bold mb-2">
          {stats.averageRating.toFixed(1)}
        </div>
        <div className="flex mb-1">
          {Array.from({ length: 5 }).map((_, index) => (
            index < Math.round(stats.averageRating) 
              ? <IconStarFilled key={index} className="h-5 w-5 text-yellow-500" /> 
              : <IconStar key={index} className="h-5 w-5 text-gray-300" />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Based on {stats.ratingCount} ratings
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{totalRatings}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <IconStarFilled className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            renderAverageRating()
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          ) : (
            renderDistribution()
          )}
        </CardContent>
      </Card>
    </div>
  )
}
