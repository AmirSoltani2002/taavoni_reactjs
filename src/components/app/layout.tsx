import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Cookies from 'js-cookie';
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./ErrorBoundry";
 
export default function Layout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get('sidebar_state') === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        <main>{children}</main>
        <Toaster richColors position='top-center' expand />
      </SidebarInset>
    </SidebarProvider>
  )
}
export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <main>{children}</main>
      <Toaster richColors position='top-center' />
    </ErrorBoundary>
  )
}
