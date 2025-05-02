"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
    subItems?: {
      title: string
      url: string
      icon?: Icon
    }[]
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.subItems ? (
                <details className="group" open={pathname.startsWith(item.url)}>
                  <summary className={`flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground ${pathname === item.url || pathname.startsWith(item.url) ? 'bg-accent text-accent-foreground' : ''}`}>
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
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
                      className="h-4 w-4 transition-transform group-open:rotate-180"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </summary>
                  <div className="mt-1 space-y-1 px-2">
                    {item.subItems.map((subItem) => (
                      <SidebarMenuButton
                        key={subItem.title}
                        asChild
                        className={`w-full justify-start pl-6 ${pathname === subItem.url ? 'bg-accent text-accent-foreground' : ''}`}
                      >
                        <a href={subItem.url}>
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuButton>
                    ))}
                  </div>
                </details>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={pathname === item.url ? 'bg-accent text-accent-foreground' : ''}
                >
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
