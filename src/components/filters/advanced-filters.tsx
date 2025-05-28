"use client"

import * as React from "react"
import { 
  IconSearch, 
  IconFilter, 
  IconX, 
  IconCalendar,
  IconSortAscending,
  IconSortDescending,
  IconRefresh
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

export interface FilterOption {
  id: string
  label: string
  type: "select" | "multiselect" | "daterange" | "number" | "text"
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}

export interface FilterState {
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
  dateRange?: DateRange
  [key: string]: any
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  filterOptions: FilterOption[]
  searchPlaceholder?: string
  sortOptions?: { value: string; label: string }[]
  onReset?: () => void
  showDateFilter?: boolean
  showSortFilter?: boolean
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  filterOptions,
  searchPlaceholder = "Search...",
  sortOptions = [],
  onReset,
  showDateFilter = true,
  showSortFilter = true
}: AdvancedFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const resetAllFilters = () => {
    onFiltersChange({
      search: "",
      sortBy: sortOptions[0]?.value || "",
      sortOrder: "asc"
    })
    onReset?.()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    
    filterOptions.forEach(option => {
      if (filters[option.id] && filters[option.id] !== "all" && filters[option.id] !== "") {
        count++
      }
    })
    
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter("search", "")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          {showSortFilter && sortOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                className="px-2"
              >
                {filters.sortOrder === "asc" ? (
                  <IconSortAscending className="h-4 w-4" />
                ) : (
                  <IconSortDescending className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="gap-2"
          >
            <IconFilter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="gap-2"
            >
              <IconRefresh className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Date Range Filter */}
            {showDateFilter && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={(range) => updateFilter("dateRange", range)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {filters.dateRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter("dateRange")}
                    className="w-full"
                  >
                    Clear date range
                  </Button>
                )}
              </div>
            )}

            {/* Dynamic Filter Options */}
            {filterOptions.map((option) => (
              <div key={option.id} className="space-y-2">
                <label className="text-sm font-medium">{option.label}</label>
                {option.type === "select" && (
                  <Select
                    value={filters[option.id] || "all"}
                    onValueChange={(value) => updateFilter(option.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={option.placeholder || `Select ${option.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {option.label}</SelectItem>
                      {option.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {option.type === "number" && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      min={option.min}
                      max={option.max}
                      value={filters[`${option.id}_min`] || ""}
                      onChange={(e) => updateFilter(`${option.id}_min`, e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      min={option.min}
                      max={option.max}
                      value={filters[`${option.id}_max`] || ""}
                      onChange={(e) => updateFilter(`${option.id}_max`, e.target.value)}
                    />
                  </div>
                )}
                {option.type === "text" && (
                  <Input
                    placeholder={option.placeholder || `Enter ${option.label.toLowerCase()}`}
                    value={filters[option.id] || ""}
                    onChange={(e) => updateFilter(option.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter("search", "")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <IconX className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange?.from && (
            <Badge variant="secondary" className="gap-1">
              Date: {format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter("dateRange")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <IconX className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterOptions.map((option) => {
            const value = filters[option.id]
            if (!value || value === "all" || value === "") return null
            
            const displayValue = option.options?.find(opt => opt.value === value)?.label || value
            
            return (
              <Badge key={option.id} variant="secondary" className="gap-1">
                {option.label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(option.id)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <IconX className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
