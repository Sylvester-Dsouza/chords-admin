import React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

/**
 * TableSkeleton - A skeleton loader for tables
 */
export function TableSkeleton({ 
  rowCount = 5, 
  columnCount = 6,
  showHeader = true,
  className
}: { 
  rowCount?: number;
  columnCount?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        {showHeader && (
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {Array(columnCount).fill(0).map((_, i) => (
                <th key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="[&_tr:last-child]:border-0">
          {Array(rowCount).fill(0).map((_, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              {Array(columnCount).fill(0).map((_, colIndex) => (
                <td key={colIndex} className="p-4 align-middle">
                  <Skeleton className={cn(
                    "h-4",
                    colIndex === 0 ? "w-8" : // Checkbox or small cell
                    colIndex === 1 ? "w-12 h-12" : // Image cell
                    "w-full max-w-[120px]" // Regular cell
                  )} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * CardSkeleton - A skeleton loader for cards
 */
export function CardSkeleton({
  count = 1,
  className
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", 
      count > 1 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
      className
    )}>
      {Array(count).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * FormSkeleton - A skeleton loader for forms
 */
export function FormSkeleton({ 
  fieldCount = 5,
  className
}: { 
  fieldCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array(fieldCount).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-28 mt-6" />
    </div>
  );
}

/**
 * StatsCardSkeleton - A skeleton loader for stats cards
 */
export function StatsCardSkeleton({
  count = 4,
  className
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(
      "grid gap-4",
      count === 1 ? "grid-cols-1" :
      count === 2 ? "grid-cols-1 md:grid-cols-2" :
      count === 3 ? "grid-cols-1 md:grid-cols-3" :
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {Array(count).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * ChartSkeleton - A skeleton loader for charts
 */
export function ChartSkeleton({
  height = 350,
  className
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className={cn(`h-[${height}px] w-full`)} />
      </CardContent>
    </Card>
  );
}

/**
 * PageSkeleton - A full page skeleton
 */
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <StatsCardSkeleton count={4} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="pl-2">
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="ml-4 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="ml-auto">
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <TableSkeleton rowCount={5} columnCount={6} />
    </div>
  );
}

/**
 * ErrorDisplay - A component to display errors
 */
export function ErrorDisplay({
  title = "An error occurred",
  message,
  onRetry,
  className
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
          <path d="M9.09 5H15l5 5v5.09a1.93 1.93 0 0 1-1.93 1.91H6.93A1.93 1.93 0 0 1 5 15.09V10l4.09-5Z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
