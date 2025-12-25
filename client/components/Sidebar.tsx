import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  BarChart3,
  CreditCard,
  LogOut,
  Phone,
  MessageSquare,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

export function Sidebar({ open, onOpenChange, onLogout }: SidebarProps) {
  const handleLogout = () => {
    onOpenChange(false);
    onLogout();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-64">
        <nav className="flex flex-col h-full">
          {/* Navigation items */}
          <div className="flex-1 space-y-4 py-8">
            <Link
              to="/generate"
              onClick={() => onOpenChange(false)}
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base"
              >
                <ImageIcon className="h-5 w-5" />
                هوش مصنوعی تصویر ساز
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base opacity-50 cursor-not-allowed"
              disabled
            >
              <BarChart3 className="h-5 w-5" />
              هوش مصنوعی ویدیو ساز
            </Button>

            <div className="border-t pt-4">
              <Link
                to="/logs"
                onClick={() => onOpenChange(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sm"
                >
                  <BarChart3 className="h-5 w-5" />
                  گزارش تصاویر
                </Button>
              </Link>

              <Link
                to="/billing"
                onClick={() => onOpenChange(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sm"
                >
                  <CreditCard className="h-5 w-5" />
                  اعتبار و بیل
                </Button>
              </Link>
            </div>
          </div>

          {/* Support and logout */}
          <div className="border-t space-y-3 pt-4">
            <a
              href="tel:+989357887572"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Phone className="h-4 w-4" />
                تماس: 09357887572
              </Button>
            </a>

            <a
              href="http://wa.me/+989357887572"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <MessageSquare className="h-4 w-4" />
                واتساپ
              </Button>
            </a>

            <Button
              variant="destructive"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              خروج از حساب
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
