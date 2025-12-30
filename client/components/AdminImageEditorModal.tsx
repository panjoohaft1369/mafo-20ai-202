import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminImageEditor } from "@/components/AdminImageEditor";
import { useResponsive } from "@/hooks/useResponsive";

interface AdminImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (imageData: string) => void;
  initialImage?: string;
  title?: string;
}

export function AdminImageEditorModal({
  open,
  onOpenChange,
  onSave,
  initialImage,
  title = "ویرایش تصویر",
}: AdminImageEditorModalProps) {
  const { isMobile, device } = useResponsive();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${
          isMobile 
            ? "w-full h-full max-w-full max-h-full p-0" 
            : "max-w-4xl max-h-[90vh]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className={isMobile ? "h-full" : "max-h-[80vh]"}>
          <AdminImageEditor
            onClose={() => onOpenChange(false)}
            onSave={(imageData) => {
              onSave?.(imageData);
              onOpenChange(false);
            }}
            initialImage={initialImage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
