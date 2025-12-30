import { Users, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminBottomNavProps {
  activeTab: "users" | "edit" | "gallery";
  onTabChange: (tab: "users" | "edit" | "gallery") => void;
}

export function AdminBottomNav({
  activeTab,
  onTabChange,
}: AdminBottomNavProps) {
  return (
    <div className="fixed left-0 right-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-2xl shadow-2xl bottom-[55px] lg:bottom-0 pb-[55px] lg:pb-8">
      <div className="flex h-16 items-center justify-around px-4 sm:px-8">
        {/* Users Tab */}
        <div
          onClick={() => onTabChange("users")}
          className="flex flex-col items-center justify-center h-full cursor-pointer"
        >
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onTabChange("users");
            }}
          >
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">کاربران</span>
        </div>

        {/* Edit Page Tab */}
        <div
          onClick={() => onTabChange("edit")}
          className="flex flex-col items-center justify-center h-full cursor-pointer"
        >
          <Button
            variant={activeTab === "edit" ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onTabChange("edit");
            }}
          >
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">
            ویرایش صفحه
          </span>
        </div>

        {/* Gallery Tab */}
        <div
          onClick={() => onTabChange("gallery")}
          className="flex flex-col items-center justify-center h-full cursor-pointer"
        >
          <Button
            variant={activeTab === "gallery" ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onTabChange("gallery");
            }}
          >
            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">
            گالری تصاویر
          </span>
        </div>
      </div>
    </div>
  );
}
