import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { MessageCircle, Save, FileSpreadsheet } from "lucide-react";
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
  addYears,
  CADRE_JOBS,
  emptyTeacher,
  parseEgyptianId,
  SPECIALIZATIONS,
  type RegisterDefaults,
  type Teacher,
} from "@/lib/teachers";
import { cn } from "@/lib/utils";

function Field({
  label,
  htmlFor,
  children,
  hint,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const selectClass =
  "flex h-11 w-full rounded-md bg-paper px-3 text-sm text-ink shadow-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azhar/40";

interface TeacherFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initial?: Teacher | null;
  defaults: RegisterDefaults;
  nextSerial?: number;
  variant?: "dialog" | "page";
  submitLabel?: string;
  onSave: (teacher: Teacher) => void | Promise<void>;
  onSaveAndWhatsApp?: (teacher: Teacher) => void | Promise<void>;
  onSaveAndExcel?: (teacher: Teacher) => void | Promise<void>;
}

export function TeacherForm({
  open = true,
  onOpenChange,
  initial,
  defaults,
  nextSerial,
  variant = "dialog",
  submitLabel,
  onSave,
  onSaveAndWhatsApp,
  onSaveAndExcel,
}: TeacherFormProps) {
  const seed = useMemo(() => initial ?? emptyTeacher(defaults), [initial, defaults]);
  const [form, setForm] = useState<Teacher>(seed);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (variant === "page" || open) setForm(initial ?? emptyTeacher(defaults));
  }, [open, initial, defaults, variant]);

  function patch(partial: Partial<Teacher>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function onNationalId(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    const parsed = parseEgyptianId(digits);
    setForm((prev) => {
      if (!parsed) return { ...prev, nationalId: digits };
      return {
        ...prev,
        nationalId: digits,
        birthDate: parsed.birthDate,
        gender: prev.gender || parsed.gender,
        pensionDate: prev.pensionDate || parsed.pensionDate,
      };
    });
  }

  function onBirthDate(value: string) {
    patch({
      birthDate: value,
      pensionDate: form.pensionDate || addYears(value, 60),
    });
  }

  function validate(): boolean {
    if (!form.name.trim()) {
      toast.error("الاسم مطلوب");
      return false;
    }
    if (form.nationalId && form.nationalId.length !== 14) {
      toast.error("الرقم القومي يجب أن يكون 14 رقمًا");
      return false;
    }
    return true;
  }

  async function submit(kind: "save" | "whatsapp" | "excel") {
    if (!validate()) return;
    const next = { ...form, name: form.name.trim() };
    setBusy(true);
    try {
      if (kind === "whatsapp") await onSaveAndWhatsApp?.(next);
      else if (kind === "excel") await onSaveAndExcel?.(next);
      else await onSave(next);
      onOpenChange?.(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  const editing = Boolean(initial?.serial);
  const title = editing ? "تعديل بيانات معلم" : "إضافة معلم";
  const serialHint = editing
    ? `رقم مسلسل ${initial?.serial}`
    : nextSerial
      ? `سيأخذ رقم مسلسل ${nextSerial}`
      : "الرقم المسلسل يُعطى تلقائيًا عند الحفظ";

  const fields = (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit("save");
      }}
    >
      <p className="rounded-md bg-azhar/10 px-3 py-2 text-sm font-medium text-azhar">{serialHint}</p>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-azhar">بيانات شخصية</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="الاسم" htmlFor="name" className="sm:col-span-2">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="الاسم رباعي"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="الرقم القومي" htmlFor="nid" hint="١٤ رقمًا — يُستخرج منه الميلاد والنوع">
            <Input
              id="nid"
              inputMode="numeric"
              value={form.nationalId}
              onChange={(e) => onNationalId(e.target.value)}
              placeholder="2 أو 3 ثم تاريخ الميلاد"
              maxLength={14}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="النوع" htmlFor="gender">
            <select
              id="gender"
              className={selectClass}
              value={form.gender}
              onChange={(e) => patch({ gender: e.target.value as Teacher["gender"] })}
            >
              <option value="">—</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </Field>
          <Field label="تاريخ الميلاد" htmlFor="birth">
            <Input id="birth" type="date" value={form.birthDate} onChange={(e) => onBirthDate(e.target.value)} />
          </Field>
          <Field label="تاريخ سن المعاش" htmlFor="pension" hint="يُحسب بعد ٦٠ سنة من الميلاد">
            <Input
              id="pension"
              type="date"
              value={form.pensionDate}
              onChange={(e) => patch({ pensionDate: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-azhar">بيانات وظيفية</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="رقم السجل" htmlFor="record">
            <Input id="record" value={form.recordNumber} onChange={(e) => patch({ recordNumber: e.target.value })} />
          </Field>
          <Field label="كود المعلم" htmlFor="code">
            <Input id="code" value={form.teacherCode} onChange={(e) => patch({ teacherCode: e.target.value })} />
          </Field>
          <Field label="المعهد" htmlFor="institute">
            <Input id="institute" value={form.institute} onChange={(e) => patch({ institute: e.target.value })} />
          </Field>
          <Field label="الإدارة التعليمية" htmlFor="admin">
            <Input id="admin" value={form.educationAdmin} onChange={(e) => patch({ educationAdmin: e.target.value })} />
          </Field>
          <Field label="المرحلة ب/ع/ث" htmlFor="stage">
            <select
              id="stage"
              className={selectClass}
              value={form.stage}
              onChange={(e) => patch({ stage: e.target.value as Teacher["stage"] })}
            >
              <option value="">—</option>
              <option value="ب">ابتدائي (ب)</option>
              <option value="ع">إعدادي (ع)</option>
              <option value="ث">ثانوي (ث)</option>
            </select>
          </Field>
          <Field label="التخصص" htmlFor="spec">
            <Input
              id="spec"
              list="spec-list"
              value={form.specialization}
              onChange={(e) => patch({ specialization: e.target.value })}
            />
            <datalist id="spec-list">
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="الوظيفة على الكادر" htmlFor="job">
            <Input
              id="job"
              list="job-list"
              value={form.cadreJob}
              onChange={(e) => patch({ cadreJob: e.target.value })}
            />
            <datalist id="job-list">
              {CADRE_JOBS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="المؤهل وتاريخه" htmlFor="qual">
            <Input
              id="qual"
              value={form.qualification}
              onChange={(e) => patch({ qualification: e.target.value })}
              placeholder="ليسانس أصول الدين ٢٠١٢"
            />
          </Field>
          <Field label="تاريخ تعيين الأزهر" htmlFor="azhar">
            <Input
              id="azhar"
              type="date"
              value={form.azharAppointmentDate}
              onChange={(e) => patch({ azharAppointmentDate: e.target.value })}
            />
          </Field>
          <Field label="تاريخ مباشرة العمل أول مرة" htmlFor="first">
            <Input
              id="first"
              type="date"
              value={form.firstWorkDate}
              onChange={(e) => patch({ firstWorkDate: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-azhar">بيانات التواصل</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="رقم التليفون" htmlFor="phone">
            <Input
              id="phone"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="01xxxxxxxxx"
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="العنوان" htmlFor="address" className="sm:col-span-2">
            <Textarea id="address" value={form.address} onChange={(e) => patch({ address: e.target.value })} rows={2} />
          </Field>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
        <Button type="submit" disabled={busy}>
          <Save />
          {submitLabel ?? "حفظ وأخذ رقم مسلسل"}
        </Button>
        {onSaveAndWhatsApp ? (
          <Button type="button" variant="whatsapp" disabled={busy} onClick={() => void submit("whatsapp")}>
            <MessageCircle />
            حفظ وإرسال واتساب
          </Button>
        ) : null}
        {onSaveAndExcel ? (
          <Button type="button" variant="outline" disabled={busy} onClick={() => void submit("excel")}>
            <FileSpreadsheet />
            حفظ وتصدير إكسل
          </Button>
        ) : null}
      </div>
    </form>
  );

  if (variant === "page") {
    return (
      <section className="rounded-xl bg-paper p-5 shadow-border">
        <header className="mb-5">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            عبّئ البيانات ثم احفظ. الرقم المسلسل يُعطى بالترتيب تلقائيًا ولا يتكرر.
          </p>
        </header>
        {fields}
      </section>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-dialog overflow-y-auto p-0">
        <div className="sticky top-0 z-10 border-b border-line/10 bg-paper px-5 pt-5 pb-3">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              الحقول مطابقة لنموذج «ثانياً: المعلمين». الرقم القومي يملأ الميلاد والنوع وسن المعاش تلقائيًا.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-5 py-4">{fields}</div>
        <DialogFooter className="sr-only" />
      </DialogContent>
    </Dialog>
  );
}
