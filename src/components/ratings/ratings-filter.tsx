"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { IconFilter, IconSearch, IconCalendar, IconStar } from "@tabler/icons-react"
import { RatingFilters } from "@/services/rating.service"
import { format } from "date-fns"

interface RatingsFilterProps {
  onFilterChange: (filters: RatingFilters) => void
  onResetFilters: () => void
}

export function RatingsFilter({ onFilterChange, onResetFilters }: RatingsFilterProps) {
  const [search, setSearch] = useState("")
  const [minRating, setMinRating] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const handleSearch = () => {
    const filters: RatingFilters = {
      search: search || undefined,
      minRating: minRating !== "all" ? parseInt(minRating, 10) : undefined,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    }
    onFilterChange(filters)
  }

  const handleReset = () => {
    setSearch("")
    setMinRating("all")
    setStartDate(undefined)
    setEndDate(undefined)
    onResetFilters()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search ratings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full sm:w-[300px]"
        />
        <Button variant="outline" size="sm" className="h-9" onClick={handleSearch}>
          <IconSearch className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="1">1+ Star</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-[180px] justify-start text-left font-normal">
              <IconCalendar className="mr-2 h-4 w-4" />
              {startDate && endDate ? (
                <>
                  {format(startDate, "PP")} - {format(endDate, "PP")}
                </>
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col space-y-2 p-2">
              <div className="px-4 py-2 font-medium">Start Date</div>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
              <div className="px-4 py-2 font-medium">End Date</div>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" className="h-9" onClick={handleSearch}>
          <IconFilter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="ghost" size="sm" className="h-9" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
