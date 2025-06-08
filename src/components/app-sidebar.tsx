"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  IconDashboard,
  IconMusic,
  IconUsers,
  IconFolder,
  IconTag,
  IconStar,
  IconChartBar,
  IconMessageCircle,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconList,
  IconUser,
  IconCreditCard,
  IconBrandChrome,
  IconBrandFirebase,
  IconPalette,
  IconBell,
  IconMicrophone,
  IconCrown,
  IconHeadset,
  IconPlus,
  IconServer,
  IconShieldLock,
  IconDatabase,
  IconCpu,
  IconClockHour4,
  IconBug,
  IconHome
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Super Admin",
    email: "superadmin@christianchords.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Songs",
      url: "/songs",
      icon: IconMusic,
      subItems: [
        {
          title: "All Songs",
          url: "/songs",
          icon: IconList,
        },
        {
          title: "Add New Song",
          url: "/songs/new",
          icon: IconMusic,
        },
        {
          title: "Languages",
          url: "/languages",
          icon: IconBrandChrome,
        },
      ],
    },
    {
      title: "Artists",
      url: "/artists",
      icon: IconUsers,
      subItems: [
        {
          title: "All Artists",
          url: "/artists",
          icon: IconList,
        },
        {
          title: "Add New Artist",
          url: "/artists/new",
          icon: IconUser,
        },
      ],
    },
    {
      title: "Collections",
      url: "/collections",
      icon: IconFolder,
      subItems: [
        {
          title: "All Collections",
          url: "/collections",
          icon: IconList,
        },
        {
          title: "Add New Collection",
          url: "/collections/new",
          icon: IconFolder,
        },
      ],
    },
    {
      title: "Tags",
      url: "/tags",
      icon: IconTag,
      subItems: [
        {
          title: "All Tags",
          url: "/tags",
          icon: IconList,
        },
        {
          title: "Add New Tag",
          url: "/tags/new",
          icon: IconTag,
        },
      ],
    },

    {
      title: "Comments",
      url: "/comments",
      icon: IconMessageCircle,
    },
    {
      title: "Ratings",
      url: "/ratings",
      icon: IconStar,
    },
    {
      title: "Home Page",
      url: "/home-sections",
      icon: IconHome,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: IconMicrophone,
      subItems: [
        {
          title: "All Courses",
          url: "/courses",
          icon: IconList,
        },
        {
          title: "Add New Course",
          url: "/courses/new",
          icon: IconPlus,
        },
      ],
    },
    {
      title: "Vocals",
      url: "/vocals",
      icon: IconMicrophone,
      subItems: [
        {
          title: "All Categories",
          url: "/vocals",
          icon: IconList,
        },
        {
          title: "Add New Category",
          url: "/vocals/categories/new",
          icon: IconPlus,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Help",
      url: "/help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "User Management",
      url: "/users",
      icon: IconUsers,
      subItems: [
        {
          title: "Admin Users",
          url: "/users",
          icon: IconUser,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: IconUsers,
        },
      ],
    },
    {
      name: "System Monitoring",
      url: "/system",
      icon: IconServer,
      subItems: [
        {
          title: "Overview",
          url: "/system",
          icon: IconCpu,
        },
        {
          title: "Cache Management",
          url: "/system/cache",
          icon: IconDatabase,
        },
        {
          title: "Audit Logs",
          url: "/system/audit-logs",
          icon: IconShieldLock,
        },
        {
          title: "Performance",
          url: "/system/performance",
          icon: IconClockHour4,
        },
        {
          title: "Debug",
          url: "/system/debug",
          icon: IconBug,
        },
      ],
    },
    {
      name: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
    {
      name: "Subscriptions",
      url: "/subscriptions",
      icon: IconCreditCard,
      subItems: [
        {
          title: "Plans",
          url: "/subscriptions",
          icon: IconCrown,
        },
        {
          title: "Add New Plan",
          url: "/subscriptions/new",
          icon: IconPlus,
        },
      ],
    },
    {
      name: "Help Desk",
      url: "/help-desk",
      icon: IconHeadset,
    },
    {
      name: "Notifications",
      url: "/notifications",
      icon: IconBell,
    },
    {
      name: "Song Requests",
      url: "/song-requests",
      icon: IconMicrophone,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();

  // Custom navigation handler to prevent unwanted redirects
  const handleNavigation = (url: string) => {
    console.log(`AppSidebar - Navigating to: ${url}, from: ${pathname}`);

    // Prevent navigation if we're already on the page
    if (pathname === url) {
      console.log(`AppSidebar - Already on ${url}, preventing navigation`);
      return;
    }

    // Use router.push for client-side navigation
    router.push(url);
  };

  // Add debugging
  React.useEffect(() => {
    console.log("AppSidebar mounted");
    console.log(`AppSidebar - Current path: ${pathname}`);

    // Add a cleanup function to detect unmounting
    return () => {
      console.log("AppSidebar unmounted");
    };
  }, [pathname]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={(e) => {
                e.preventDefault();
                console.log("Clicked on Stuthi logo, navigating to /dashboard");
                handleNavigation('/dashboard');
              }}
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Stuthi Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
