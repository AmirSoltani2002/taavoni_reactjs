import { Building, ChevronDown, Home, User, Clipboard, CreditCard, KeyRound, LogOut, Crown, Award, BookOpen } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { type User as UserType } from "@/pages/users/columns";
import { getTable } from "@/general";
import { UserSelectDialog } from "@/components/user-select-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";
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
    onClick?: () => void;
  }[]>([
    {
      title: "پروفایل",
      url: "/dashboard",
      icon: Home,
    },
  ])

  const [userInfo, setUser] = useState<UserType>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

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
          title: "پروفایل",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "راهنما",
          url: "/guide",
          icon: BookOpen,
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
            {
              title: "پیش‌فروش‌ها",
              url: '/projects/preselling/list',
            },
            
          ],
          url: "/projects",
          icon: Building,
        },
        {
          title: "رسیدهای پرداخت",
          options: [
            {
              title: "رسیدهای پیش‌فروش",
              url: '/transactions/preselling/list',
            },
            {
              title: "رسیدهای نهایی",
              url: '/transactions/final/list',
            },
            
          ],
          url: "/transactions",
          icon: CreditCard,
        },
        {
          title: "پشتیبانی",
          url: "/tickets/list",
          icon: Clipboard
        },
        {
          title: "امتیازات",
          url: "/scores/list",
          icon: Award
        },
        {
          title: "اعطای واحد به کاربر",
          url: "#",
          icon: KeyRound,
          onClick: () => setIsAssignDialogOpen(true)
        }
      ])
    } else {
      setItems([
        {
          title: "پروفایل",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "راهنما",
          url: "/guide",
          icon: BookOpen,
        },
        {
          title: "رسیدهای پرداخت",
          options: [
            {
              title: "رسیدهای پیش‌فروش",
              url: '/transactions/preselling/list',
            },
            {
              title: "رسیدهای نهایی",
              url: '/transactions/final/list',
            },
            
          ],
          url: "/transactions",
          icon: CreditCard,
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
    <Sidebar side='right' variant='floating' className="border-l border-gray-200/50 shadow-xl">
      <SidebarContent className="p-4">
        <SidebarGroup>
          {/* Header Section */}
          <div className="mb-6 pb-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative cursor-pointer group" onClick={() => navigate('/guide')}>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img src={logo} className="relative size-12 rounded-lg shadow-md group-hover:shadow-lg transition-shadow" />
                <div className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-gray-900 truncate">
                  {userInfo?.name ? `${userInfo?.name} ${userInfo?.lastName || ''}`.trim() : 'کاربر'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {isAdmin && (
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                      <Crown className="h-3 w-3 mr-1" />
                      {userInfo?.type === 'system' ? 'مدیر سیستم' : 'ادمین'}
                    </Badge>
                  )}
                  {!isAdmin && userInfo?.accepted && (
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-green-100 text-green-700 border-green-200">
                      تایید شده
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              خوش آمدید
            </p>
          </div>
          
          <SidebarGroupContent className="space-y-1">
            {items.map((item) => {
              const isActive =
                location.pathname === item.url ||
                location.pathname.startsWith(`${item.url}/`);
              if (!item.options) {
                return (
                  <SidebarMenu key={item.title}>
                    <SidebarMenuItem key={item.title}>
                      {item.disabled ? (
                        <HoverCard openDelay={100} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <div className="w-full">
                              <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                disabled={item.disabled}
                                className={cn(
                                  "rounded-lg transition-all duration-200",
                                  "hover:bg-gray-100 hover:shadow-sm",
                                  isActive && "bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-500 shadow-sm"
                                )}
                              >
                                <div className="pointer-events-none opacity-50 w-full flex items-center gap-3">
                                  <item.icon className="h-5 w-5" />
                                  <span className="font-medium">{item.title}</span>
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
                      ) : item.onClick ? (
                        <SidebarMenuButton 
                          isActive={isActive}
                          onClick={item.onClick}
                          data-tour={item.title === "اعطای واحد به کاربر" ? "assign-unit" : undefined}
                          className={cn(
                            "rounded-lg transition-all duration-200 w-full",
                            "hover:bg-gray-100 hover:shadow-sm",
                            isActive && "bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-500 shadow-sm"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={cn(
                            "rounded-lg transition-all duration-200",
                            "hover:bg-gray-100 hover:shadow-sm",
                            isActive && "bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-500 shadow-sm font-semibold"
                          )}
                        >
                          <NavLink to={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                );
              } else {
                return (
                  <Collapsible key={item.title} defaultOpen={isActive} className="group">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isActive}
                        data-tour={
                          item.title === "کاربران" ? "users-menu" : 
                          item.title === "پروژه‌ها" ? "projects-menu" : 
                          item.title === "رسیدهای پرداخت" ? "preselling-transactions" : 
                          item.title === "اعطای واحد به کاربر" ? "assign-unit" : 
                          undefined
                        }
                        className={cn(
                          "justify-between rounded-lg transition-all duration-200 w-full",
                          "hover:bg-gray-100 hover:shadow-sm",
                          isActive && "bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-500 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180 text-gray-500" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1">
                      <SidebarMenu>
                        <SidebarMenuSub className="space-y-1 pr-4">
                          {item.options.map((opt, idx) => {
                            const isSubActive = opt.url && location.pathname.startsWith(opt.url);
                            return (
                              <SidebarMenuSubItem key={idx}>
                                <NavLink 
                                  to={opt.url || '#'} 
                                  className={cn(
                                    "block px-4 py-2 rounded-md text-sm transition-all duration-200",
                                    "hover:bg-gray-50 hover:pr-6 hover:text-xs hover:font-semibold",
                                    isSubActive 
                                      ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-500 pr-6" 
                                      : "text-gray-700"
                                  )}
                                >
                                  {opt.title}
                                </NavLink>
                              </SidebarMenuSubItem>
                            );
                          })}
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
      <SidebarFooter className="p-4 border-t border-gray-200/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                Cookies.remove('tokenut');
                navigate('/')
              }}
              className={cn(
                "w-full rounded-lg transition-all duration-200",
                "bg-gradient-to-r from-red-50 to-orange-50",
                "hover:from-red-100 hover:to-orange-100",
                "hover:shadow-md border border-red-200/50",
                "text-red-700 font-medium"
              )}
            >
              <LogOut className="h-5 w-5" />
              <span>خروج از حساب کاربری</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <UserSelectDialog 
        open={isAssignDialogOpen} 
        onOpenChange={setIsAssignDialogOpen} 
      />
    </Sidebar>
  )
}