import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { api_base_url } from "@/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserDoc } from "./columns";

type DocumentEditDialogProps = {
  document: UserDoc | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function DocumentEditDialog({
  document,
  onClose,
  onSaved,
}: DocumentEditDialogProps) {
  const [detail, setDetail] = useState(document?.detail || "");
  const [file, setFile] = useState<File>();
  const [isSaving, setIsSaving] = useState(false);

  if (!document?.id) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("detail", detail);
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(`${api_base_url}/user-doc/${document.id}`, {
        credentials: "include",
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;
        const message = Array.isArray(error?.message)
          ? error.message[0]
          : error?.message;
        toast.error(message || "خطا در ویرایش مدرک");
        return;
      }

      toast.success("مدرک با موفقیت ویرایش شد");
      onSaved();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("خطا در ویرایش مدرک");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ویرایش مدرک</DialogTitle>
          <DialogDescription>
            عنوان مدرک را تغییر دهید یا فایل جدیدی جایگزین کنید.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="document-detail">عنوان مدرک</Label>
            <Input
              id="document-detail"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-file">فایل جایگزین مدرک</Label>
            {document.document && !file && (
              <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3 text-sm text-gray-700">
                <Upload className="h-4 w-4" />
                <span className="truncate">{document.document}</span>
              </div>
            )}
            <Input
              id="document-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0])}
              disabled={isSaving}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
