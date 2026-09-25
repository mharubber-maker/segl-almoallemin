import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  exportTeachersExcel,
  formatWhatsAppMessage,
  whatsappUrl,
  type Teacher,
} from "@/lib/teachers";

const WA_LIMIT = 3500;

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
  defaultPhone: string;
  onPhoneChange: (phone: string) => void;
}

export function WhatsAppDialog({
  open,
  onOpenChange,
  teachers,
  defaultPhone,
  onPhoneChange,
}: WhatsAppDialogProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const message = useMemo(() => formatWhatsAppMessage(teachers), [teachers]);
  const tooLong = message.length > WA_LIMIT;
  const preview = tooLong
    ? [
        "بسم الله الرحمن الرحيم",
        "",
        `*ثانياً: المعلمين — عدد ${teachers.length}*`,
        "*سجل بيانات المعلمين — الأزهر الشريف*",
        "━━━━━━━━━━━━",
        ...teachers.map((t) => `${t.serial}. ${t.name || "بدون اسم"} — ${t.phone || "بدون تليفون"}`),
        "",
        "التفاصيل الكاملة في ملف الإكسل المرفق.",
      ].join("\n")
    : message;

  useEffect(() => {
    if (open) setPhone(defaultPhone);
  }, [open, defaultPhone]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(preview);
      toast.success("تم نسخ الرسالة");
    } catch {
      toast.error("تعذر النسخ");
    }
  }

  async function send() {
    onPhoneChange(phone);
    if (tooLong) {
      await exportTeachersExcel(teachers);
      toast.message("تم تحميل ملف الإكسل", {
        description: "أرفقوه مع رسالة الواتساب لأن عدد المعلمين كبير.",
      });
    }
    window.open(whatsappUrl(phone, preview), "_blank", "noopener,noreferrer");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>إرسال عبر واتساب</DialogTitle>
          <DialogDescription>
            {teachers.length === 1
              ? `رسالة بيانات: ${teachers[0]?.name || "معلم"}`
              : `رسالة مجمّعة لـ ${teachers.length} معلم`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wa-phone">رقم المستلم (اختياري)</Label>
            <Input
              id="wa-phone"
              dir="ltr"
              className="text-start"
              inputMode="tel"
              placeholder="01xxxxxxxxx أو اتركه فارغًا لاختيار المحادثة"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wa-msg">معاينة الرسالة</Label>
            <Textarea id="wa-msg" readOnly value={preview} rows={12} className="font-mono text-xs leading-relaxed" />
          </div>
          {tooLong ? (
            <p className="text-xs text-muted">
              الرسالة أطول من حد واتساب، سيتم إرسال ملخص وتحميل ملف الإكسل لإرفاقه.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="whatsapp" onClick={() => void send()}>
            <MessageCircle />
            فتح واتساب
          </Button>
          <Button type="button" variant="outline" onClick={() => void copyText()}>
            <Copy />
            نسخ الرسالة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
