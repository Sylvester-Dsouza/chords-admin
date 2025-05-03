"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    subItems?: {
      title: string
      url: string
      icon?: Icon
    }[]
  }[]
}) {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.subItems ? (
                <details className="group" open={pathname.startsWith(item.url)}>
                  <summary className={`flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground ${pathname === item.url || pathname.startsWith(item.url) ? 'bg-accent text-accent-foreground' : ''}`}>
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
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
                        onClick={() => {
                          console.log(`Clicked on subitem: ${subItem.title}, navigating to: ${subItem.url}`);
                        }}
                      >
                        <Link href={subItem.url}>
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </div>
                </details>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={pathname === item.url ? 'bg-accent text-accent-foreground' : ''}
                  onClick={() => {
                    console.log(`Clicked on main item: ${item.title}, navigating to: ${item.url}`);
                  }}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
