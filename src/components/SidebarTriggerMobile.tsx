import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar"; // Import the useSidebar hook

const SidebarTriggerMobile = () => {
  const { isMobile } = useSidebar(); // Access the sidebar context

  // Only render the SidebarTrigger if isMobile is true
  return isMobile ? <SidebarTrigger /> : null;
};

export default SidebarTriggerMobile;
