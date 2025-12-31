import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountActivationModal({
  isOpen,
  onClose,
}: AccountActivationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 py-8 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl" dir="rtl">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">نیاز به فعال‌سازی</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="بستن"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700 text-right">
            حساب کاربری شما هنوز فعال نشده است.
          </p>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="font-bold">1️⃣</span>
              <p className="text-right">با تیم پشتیبانی ما تماس بگیرید</p>
            </div>

            <div className="flex gap-3">
              <span className="font-bold">2️⃣</span>
              <p className="text-right">با آنها در مورد پلان‌های مختلف صحبت کنید</p>
            </div>

            <div className="flex gap-3">
              <span className="font-bold">3️⃣</span>
              <p className="text-right">پلان مورد نیاز خود را انتخاب کنید</p>
            </div>

            <div className="flex gap-3">
              <span className="font-bold">4️⃣</span>
              <p className="text-right">تیم پشتیبانی حساب شما را فعال می‌کند</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
            <p className="text-xs text-amber-900 text-right">
              ☎ <strong>09357887572</strong> | 💬 <strong>واتساپ</strong>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          <a href="tel:+989357887572" className="block w-full">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
              ☎ تماس با پشتیبانی
            </Button>
          </a>

          <a href="https://wa.me/+989357887572" target="_blank" rel="noopener noreferrer" className="block w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
              💬 ارسال پیام واتساپ
            </Button>
          </a>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full text-gray-700"
          >
            بازگشت به خانه
          </Button>
        </div>
      </div>
    </div>
  );
}
