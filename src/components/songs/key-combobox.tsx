"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { IconMusic } from "@tabler/icons-react"

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
import { MUSICAL_KEYS } from "@/constants/musical-keys"

interface KeyComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function KeyCombobox({
  value,
  onChange,
  placeholder = "Select key..."
}: KeyComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter keys based on search query
  const filteredKeys = React.useMemo(() => {
    if (!searchQuery) return MUSICAL_KEYS

    const query = searchQuery.toLowerCase()
    return MUSICAL_KEYS.filter((key) =>
      key.label.toLowerCase().includes(query) ||
      key.value.toLowerCase().includes(query) ||
      key.type.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Group keys by type
  const groupedKeys = React.useMemo(() => {
    const major = filteredKeys.filter(key => key.type === "major")
    const minor = filteredKeys.filter(key => key.type === "minor")
    return { major, minor }
  }, [filteredKeys])

  // Find the selected key
  const selectedKey = React.useMemo(() =>
    MUSICAL_KEYS.find((key) => key.value === value),
    [value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedKey ? (
            <div className="flex items-center">
              <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
              {selectedKey.label}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder="Search keys..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                No key found.
              </div>
            </CommandEmpty>

            {/* Major Keys Group */}
            {groupedKeys.major.length > 0 && (
              <CommandGroup heading="Major Keys">
                {groupedKeys.major.map((key) => (
                  <CommandItem
                    key={key.value}
                    value={key.label}
                    onSelect={() => {
                      onChange(key.value)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex items-center">
                      <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
                      {key.label}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === key.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Minor Keys Group */}
            {groupedKeys.minor.length > 0 && (
              <CommandGroup heading="Minor Keys">
                {groupedKeys.minor.map((key) => (
                  <CommandItem
                    key={key.value}
                    value={key.label}
                    onSelect={() => {
                      onChange(key.value)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex items-center">
                      <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
                      {key.label}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === key.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
