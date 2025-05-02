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
import { IconFilter, IconSearch, IconCalendar } from "@tabler/icons-react"
import { CommentFilters } from "@/services/comment-service"
import { format } from "date-fns"

interface CommentsFilterProps {
  onFilterChange: (filters: CommentFilters) => void
}

export function CommentsFilter({ onFilterChange }: CommentsFilterProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const handleSearch = () => {
    const filters: CommentFilters = {
      search: search || undefined,
      isDeleted: status === "deleted" ? true : status === "active" ? false : undefined,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    }
    onFilterChange(filters)
  }

  const handleReset = () => {
    setSearch("")
    setStatus("all")
    setStartDate(undefined)
    setEndDate(undefined)
    onFilterChange({})
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search comments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full sm:w-[300px]"
        />
        <Button variant="outline" size="sm" className="h-9" onClick={handleSearch}>
          <IconSearch className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="active">Active Comments</SelectItem>
            <SelectItem value="deleted">Deleted Comments</SelectItem>
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
