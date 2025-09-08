import { Building, ChartBar, Home, User } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const location = useLocation();

  const items = [
    {
      title: "داشبورد",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "کاربران",
      url: "/users",
      icon: User,
    },
    {
      title: "پروژه‌ها",
      url: "/projects",
      icon: Building,
    },
    {
      title: "آگهی‌ها",
      url: "/sales",
      icon: ChartBar,
    },
  ]
  return (
    <Sidebar side='right' collapsible="icon" variant='floating'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>پنل مدیریت</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  location.pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}