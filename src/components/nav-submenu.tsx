"use client"

import { useState } from "react"
import { IconChevronDown, IconChevronRight, type Icon } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface SubMenuItem {
  title: string
  url: string
}

export function NavSubmenu({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    isActive?: boolean
    items?: SubMenuItem[]
  }[]
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SubMenuItemComponent key={item.title} item={item} />
      ))}
    </SidebarMenu>
  )
}

function SubMenuItemComponent({ 
  item 
}: { 
  item: {
    title: string
    url: string
    icon?: Icon
    isActive?: boolean
    items?: SubMenuItem[]
  }
}) {
  const [isOpen, setIsOpen] = useState(item.isActive || false)
  const hasSubItems = item.items && item.items.length > 0

  return (
    <SidebarMenuItem>
      {hasSubItems ? (
        <>
          <SidebarMenuButton 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(isOpen && "bg-sidebar-accent text-sidebar-accent-foreground")}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <span className="ml-auto">
              {isOpen ? <IconChevronDown className="size-4" /> : <IconChevronRight className="size-4" />}
            </span>
          </SidebarMenuButton>
          {isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <a href={subItem.url}>
                      <span>{subItem.title}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </>
      ) : (
        <SidebarMenuButton asChild tooltip={item.title}>
          <a href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  )
}
