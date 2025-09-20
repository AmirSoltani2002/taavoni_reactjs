import { Building, ChartBar, ChevronDown, Home, User, Clipboard } from "lucide-react"
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
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";

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
      title_create: "ایجاد کاربر جدید",
      title_list: "مشاهده همه کاربران",
      url: "/users",
      icon: User,
    },
    {
      title: "پروژه‌ها",
      title_create: "ایجاد پروژه جدید",
      title_list: "مشاهده همه پروژه‌ها",
      url: "/projects",
      icon: Building,
    },
    {
      title: "آگهی‌ها",
      title_create: "ایجاد آگهی جدید",
      title_list: "مشاهده همه آگهی‌ها",
      url: "/sales",
      icon: ChartBar,
    },
    {
      title: "پشتیبانی",
      url: "/tickets/list",
      icon: Clipboard
    }
  ]
  return (
    <Sidebar side='right' collapsible="icon" variant='floating'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>پنل مدیریت</SidebarGroupLabel>
          <SidebarGroupContent>
            {items.map((item) => {
              const isActive =
                location.pathname === item.url ||
                location.pathname.startsWith(`${item.url}/`);
              if(['داشبورد', 'پشتیبانی'].includes(item.title)){
                return (
                  <SidebarMenu>
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                );
              } else {
                const isNew = location.pathname.startsWith(item.url) && location.pathname.endsWith('create');
                const isList = location.pathname.startsWith(item.url) && location.pathname.endsWith('list');
                return (
                  <Collapsible key={item.title} defaultOpen={isActive}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive} className="justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <NavLink to={`${item.url}/list`} className={isList ? 'font-bold' : ''}>
                              {item.title_list}
                            </NavLink>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <NavLink to={`${item.url}/create`} className={isNew ? 'font-bold' : ''}>
                              {item.title_create}
                            </NavLink>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}