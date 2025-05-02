"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { IconUser } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Artist } from "@/services/artist.service"

interface ArtistComboboxProps {
  artists: Artist[]
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  onCreateNew?: () => void
}

export function ArtistCombobox({
  artists,
  value,
  onChange,
  isLoading = false,
  onCreateNew
}: ArtistComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter artists based on search query
  const filteredArtists = React.useMemo(() => {
    if (!searchQuery) return artists

    console.log('Filtering artists with query:', searchQuery)
    const filtered = artists.filter((artist) =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    console.log('Filtered artists:', filtered.map(a => a.name))
    return filtered
  }, [artists, searchQuery])

  // Find the selected artist
  const selectedArtist = React.useMemo(() =>
    artists.find((artist) => artist.id === value),
    [artists, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {selectedArtist ? (
            <div className="flex items-center">
              <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
              {selectedArtist.name}
            </div>
          ) : (
            "Select artist..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder="Search artists..."
            value={searchQuery}
            onValueChange={(value) => {
              console.log('Search input changed:', value)
              setSearchQuery(value)
            }}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading artists...</div>
              ) : (
                <div className="py-6 text-center text-sm">
                  <p>No artist found.</p>
                  {onCreateNew && (
                    <Button
                      variant="link"
                      className="mt-2 text-primary"
                      onClick={() => {
                        setOpen(false)
                        onCreateNew()
                      }}
                    >
                      Create new artist
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredArtists.map((artist) => (
                <CommandItem
                  key={artist.id}
                  value={artist.name} // Use name for search matching
                  onSelect={() => {
                    onChange(artist.id) // But pass the ID to the onChange handler
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <div className="flex items-center">
                    <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                    {artist.name}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === artist.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
