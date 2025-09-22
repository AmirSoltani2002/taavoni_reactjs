import { Building, ChartBar, ChevronDown, Home, User, Clipboard } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { type User as UserType } from "@/pages/users/columns";
import { getTable } from "@/general";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Button } from "./ui/button";
import Cookies from "js-cookie";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
    const [items, setItems] = useState<{
    title: string;
    title_create?: string;
    title_list?: string;
    url: string;
    icon: typeof Home
  }[]>([
    {
      title: "داشبورد",
      url: "/dashboard",
      icon: Home,
    },
  ])

  const [userInfo, setUser] = useState<UserType>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getTable('users/profile', (d) => {
      console.log({d});
      setUser(d);
      setIsAdmin(d?.type === 'admin' || d?.type === 'system')
    });
  }, []);

  useEffect(() => {
    if(isAdmin) {
      setItems([
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
      ])
    } else {
      setItems([
        {
          title: "داشبورد",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "پروژه‌ها",
          url: "/projects/list",
          icon: Building,
        },
        {
          title: "آگهی‌ها",
          url: "/sales/list",
          icon: ChartBar,
        },
        {
          title: "پشتیبانی",
          url: "/tickets/list",
          icon: Clipboard
        }
      ])
    }
  }, [isAdmin])

  return (
    <Sidebar side='right' collapsible="icon" variant='floating'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{'خوش آمدید '}{userInfo?.name ? `${userInfo?.name} گرامی` : ''}</SidebarGroupLabel>
          <SidebarGroupContent>
            {items.map((item) => {
              const isActive =
                location.pathname === item.url ||
                location.pathname.startsWith(`${item.url}/`);
              if(!item.title_create){
                return (
                  <SidebarMenu key={item.title}>
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
      <SidebarFooter>
          <SidebarMenu className="flex">
            <SidebarMenuItem className="flex gap-4">
              <SidebarMenuButton asChild>
                <Button variant={'destructive'} onClick={() => {
                  Cookies.remove('token');
                  navigate('/')
                }}
                className="flex-1 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                size={'icon'}>
                  خروج
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}