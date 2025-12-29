import { Link, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);

  // WhatsApp contact information
  const whatsappNumber = "+989357887572";
  const whatsappMessage =
    "سلام، من برای ثبت سفارش جدید اکانت در MAFO تماس می‌گیرم";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 items-center justify-between px-4 sm:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2F9e202c908efe4404bc59d52a7a35052a?format=webp&width=800"
              alt="MAFO AI"
              className="h-12 w-auto"
            />
          </Link>

          {/* Center spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoggedIn && (
              <>
                {/* Order Account Button */}
                <Button
                  onClick={() => setShowOrderModal(true)}
                  variant="default"
                  size="sm"
                  className="hidden sm:flex gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden md:inline">ثبت سفارش</span>
                </Button>
              </>
            )}

            {isLoggedIn && <div className="h-5 w-5" />}
          </div>
        </div>
      </header>

      {/* Order Account Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ثبت سفارش اکانت جدید</DialogTitle>
            <DialogDescription>
              برای ثبت سفارش اکانت جدید، لطفاً با پشتیبانی ما تماس بگیرید
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                ⏱️ <strong>زمان پاسخگویی:</strong> شنبه تا پنج‌شنبه، ۹ صبح تا ۶
                بعدازظهر
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full gap-2" size="lg">
                <MessageCircle className="h-5 w-5" />
                تماس از طریق واتساپ
              </Button>
            </a>

            <p className="text-xs text-muted-foreground text-center">
              {whatsappNumber.replace("+98", "0")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
