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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import logo from '@/assets/logo-nobg.png';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
    const [items, setItems] = useState<{
    title: string;
    options?: {
      title?: string;
      url?: string;
    }[]
    url: string;
    icon: typeof Home
    disabled?: boolean;
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
          options: [
            {
              title: "ایجاد ادمین جدید",
              url: '/users/create?type=admin',
            },
            {
              title: "ایجاد کاربر جدید",
              url: '/users/create?type=other',
            },
            {
              title: "مشاهده همه کاربران",
              url: '/users/list',
            },
            
          ],
          url: "/users",
          icon: User,
        },
        {
          title: "پروژه‌ها",
          options: [
            {
              title: "ایجاد پروژه جدید",
              url: '/projects/create',
            },
            {
              title: "مشاهده همه پروژه‌ها",
              url: '/projects/list',
            },
            
          ],
          url: "/projects",
          icon: Building,
        },
        {
          title: "آگهی‌ها",
          options: [
            {
              title: "ایجاد آگهی جدید",
              url: '/sales/create',
            },
            {
              title: "مشاهده همه آگهی‌ها",
              url: '/sales/list',
            },
            
          ],
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
          disabled: !userInfo?.accepted,
        },
        {
          title: "آگهی‌ها",
          url: "/sales/list",
          icon: ChartBar,
          disabled: !userInfo?.accepted,
        },
        {
          title: "پشتیبانی",
          url: "/tickets/list",
          icon: Clipboard,
        }
      ])
    }
  }, [isAdmin, userInfo])
  return (
    <Sidebar side='right' variant='floating'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="h-16">
            {'خوش آمدید '}{userInfo?.name ? `${userInfo?.name} گرامی` : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent className="my-2">
            <img src={logo} className="absolute size-16 top-2 left-2" />
            {items.map((item) => {
              const isActive =
                location.pathname === item.url ||
                location.pathname.startsWith(`${item.url}/`);
              if (!item.options) {
                return (
                  <SidebarMenu key={item.title}>
                    <SidebarMenuItem key={item.title} className="shadow-sm rounded">
                      {item.disabled ? (
                        <HoverCard openDelay={100} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <div style={{ width: '100%' }}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                disabled={item.disabled}
                              >
                                <div style={{ pointerEvents: 'none', opacity: 0.5, width: '100%' }}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </div>
                              </SidebarMenuButton>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="max-w-xs text-xs text-center">
                            حساب شما هنوز تایید نشده است.<br />
                            لطفا با پشتیبانی تماس بگیرید.<br />
                            <a href="/tickets/list" className="text-blue-600 underline">ارسال تیکت</a>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <NavLink to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                );
              } else {
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
                          {item.options.map(opt => (
                            <SidebarMenuSubItem>
                              <NavLink to={opt.url || '#'} className={(opt.url && location.pathname.startsWith(opt.url)) ? 'font-bold' : ''}>
                                {opt.title}
                              </NavLink>
                            </SidebarMenuSubItem>
                          ))}
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
                  Cookies.remove('tokenut');
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