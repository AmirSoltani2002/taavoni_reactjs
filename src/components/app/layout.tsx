import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Cookies from 'js-cookie';
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./ErrorBoundry";
import SidebarTriggerMobile from "../SidebarTriggerMobile";
import { TourOverlay } from "../tour-overlay";
 
export default function Layout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get('sidebar_state') === 'true';
  return (
    <>
      <style>{`
        .tour-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
          transition: all 0.3s ease !important;
          z-index: 1000 !important;
          position: relative !important;
        }
      `}</style>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <SidebarTriggerMobile />
          <main>{children}</main>
          <Toaster richColors position='top-center' expand />
          <TourOverlay />
        </SidebarInset>
      </SidebarProvider>
    </>
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
