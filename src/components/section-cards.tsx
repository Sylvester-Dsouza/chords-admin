import { IconTrendingDown, IconTrendingUp, IconLoader2 } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  analyticsData?: any
  isLoading?: boolean
  error?: string | null
}

export function SectionCards({ analyticsData, isLoading = false, error }: SectionCardsProps) {
  // Calculate metrics from analytics data
  const totalViews = analyticsData?.contentEngagement?.viewsByType
    ? (analyticsData.contentEngagement.viewsByType.song +
       analyticsData.contentEngagement.viewsByType.artist +
       analyticsData.contentEngagement.viewsByType.collection)
    : 0

  const activeUsers = analyticsData?.userActivity?.activeUsers || 0
  const newUsers = analyticsData?.userActivity?.newUsers || 0
  const totalLikes = analyticsData?.contentEngagement?.totalLikes || 0

  // Calculate growth percentages (mock calculation for now)
  const viewsGrowth = totalViews > 0 ? "+12.5%" : "0%"
  const usersGrowth = newUsers > 0 ? `+${((newUsers / Math.max(activeUsers - newUsers, 1)) * 100).toFixed(1)}%` : "0%"
  const likesGrowth = totalLikes > 0 ? "+8.3%" : "0%"
  const engagementRate = activeUsers > 0 ? ((totalLikes / activeUsers) * 100).toFixed(1) : "0"
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Views Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Views</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <IconLoader2 className="h-8 w-8 animate-spin" />
            ) : error ? (
              "Error"
            ) : (
              totalViews.toLocaleString()
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {viewsGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Content engagement this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Songs, artists, and collections
          </div>
        </CardFooter>
      </Card>
      {/* New Users Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <IconLoader2 className="h-8 w-8 animate-spin" />
            ) : error ? (
              "Error"
            ) : (
              newUsers.toLocaleString()
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {newUsers > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {usersGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            User growth this month {newUsers > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            New registrations
          </div>
        </CardFooter>
      </Card>
      {/* Active Users Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <IconLoader2 className="h-8 w-8 animate-spin" />
            ) : error ? (
              "Error"
            ) : (
              activeUsers.toLocaleString()
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Monthly active users</div>
        </CardFooter>
      </Card>
      {/* Engagement Rate Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Engagement Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <IconLoader2 className="h-8 w-8 animate-spin" />
            ) : error ? (
              "Error"
            ) : (
              `${engagementRate}%`
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {likesGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            User interaction growth <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Likes per active user</div>
        </CardFooter>
      </Card>
    </div>
  )
}
