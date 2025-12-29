import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface EditField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "color" | "select";
  value: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface AdminEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: EditField[];
  onSave: (data: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
}

export function AdminEditModal({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSave,
  isLoading = false,
}: AdminEditModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string>),
  );
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleChange(key, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError("");

    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.key]?.trim()) {
        setError(`${field.label} الزامی است`);
        return;
      }
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "خطا در ذخیره تغییرات");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium">{field.label}</label>

              {field.type === "text" && (
                <Input
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.label}
                  disabled={isLoading}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.label}
                  disabled={isLoading}
                  className="min-h-24 resize-none"
                />
              )}

              {field.type === "color" && (
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData[field.key] || "#000000"}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="h-10 w-20 rounded border border-border cursor-pointer"
                    disabled={isLoading}
                  />
                  <Input
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder="#000000"
                    disabled={isLoading}
                  />
                </div>
              )}

              {field.type === "image" && (
                <div className="space-y-2">
                  {formData[field.key] && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                      <img
                        src={formData[field.key]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleChange(field.key, "")}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(field.key, e)}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <span className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer text-sm font-medium">
                      انتخاب تصویر
                    </span>
                  </label>
                </div>
              )}

              {field.type === "select" && (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="">انتخاب کنید</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "درحال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
