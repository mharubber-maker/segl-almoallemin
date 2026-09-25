import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formShareMessage, whatsappUrl } from "@/lib/teachers";

export function SharePanel({ phone }: { phone: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.getElementById("public-form-url") as HTMLInputElement | null;
      field?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    toast.success("تم نسخ رابط الفورم");
    window.setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    window.open(whatsappUrl(phone, formShareMessage(url || window.location.origin)), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="rounded-xl bg-paper p-4 shadow-border no-print">
      <h2 className="font-display text-lg font-bold">رابط التسجيل</h2>
      <p className="mt-1 text-sm text-muted">
        انسخ الرابط وابعته للمدرسين على واتساب. أي حد يفتحه يملأ الفورم، والبيانات تظهر هنا برقم مسلسل بالترتيب.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          id="public-form-url"
          readOnly
          dir="ltr"
          value={url}
          className="text-start font-mono text-xs"
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button type="button" variant="outline" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />}
          {copied ? "تم النسخ" : "نسخ الرابط"}
        </Button>
        <Button type="button" variant="whatsapp" onClick={shareWhatsApp}>
          <Share2 />
          إرسال على واتساب
        </Button>
      </div>
    </section>
  );
}
