import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Cookies from 'js-cookie';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get('sidebar_state') === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}