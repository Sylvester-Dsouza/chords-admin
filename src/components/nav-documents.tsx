"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
    subItems?: {
      title: string
      url: string
      icon?: Icon
    }[]
  }[]
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Manage</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            {item.subItems ? (
              <details className="group" open={pathname.startsWith(item.url)}>
                <summary className={`flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground ${pathname === item.url || pathname.startsWith(item.url) ? 'bg-accent text-accent-foreground' : ''}`}>
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
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
                      <Link href={subItem.url}>
                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ))}
                </div>
              </details>
            ) : (
              <>
                <SidebarMenuButton
                  asChild
                  className={pathname === item.url ? 'bg-accent text-accent-foreground' : ''}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="data-[state=open]:bg-accent rounded-sm"
                    >
                      <IconDots />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <IconFolder />
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconShare3 />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <IconTrash />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </SidebarMenuItem>
        ))}

      </SidebarMenu>
    </SidebarGroup>
  )
}
