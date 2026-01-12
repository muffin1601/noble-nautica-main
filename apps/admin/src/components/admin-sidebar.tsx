"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Package, BarChart3, FolderTree, ChevronDown, Users, Mail } from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/dashboard",
  },
  {
    title: "Products",
    icon: Package,
    items: [
      { title: "All Products", url: "/dashboard/products" },
      { title: "Add Product", url: "/dashboard/products/add" },
    ],
  },
  {
    title: "Categories",
    icon: FolderTree,
    url: "/dashboard/categories"
  },
    {
      title: "Leads",
      icon: Users,
      url: "/dashboard/leads"
    },
    {
      title: "Newsletter",
      icon: Mail,
      url: "/dashboard/newsletter"
    },

]

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Package className="h-6 w-6" />
          <span className="font-semibold text-lg">Noble Nautica</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible className="group/collapsible" open>
                      {/* No Trigger needed if always open */}
                      <SidebarMenuButton>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {/* Optional: Remove chevron or keep static */}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </SidebarMenuButton>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url!}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  )
}
