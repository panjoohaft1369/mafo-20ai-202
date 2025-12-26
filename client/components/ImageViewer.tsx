import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
}

export function ImageViewer({
  open,
  onOpenChange,
  imageUrl,
  alt = "تصویر",
}: ImageViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-auto p-0 bg-black/90 border-0">
        <div className="relative w-full h-[600px] flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image Container */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
