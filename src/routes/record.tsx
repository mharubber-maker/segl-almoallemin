import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, Printer, Search, MessageCircle } from "lucide-react";
import { AzharCrest } from "@/components/azhar-crest";
import { SharePanel } from "@/components/share-panel";
import { TeacherForm } from "@/components/teacher-form";
import { TeachersStack } from "@/components/teachers-stack";
import { TeachersTable } from "@/components/teachers-table";
import { WhatsAppDialog } from "@/components/whatsapp-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createTeacher,
  deleteTeacher,
  getNextSerial,
  getSettings,
  listTeachers,
  saveSettings,
  toTeacherInput,
  updateTeacher,
} from "@/lib/teacher-api";
import { exportTeachersExcel, type RegisterDefaults, type Teacher } from "@/lib/teachers";

export const Route = createFileRoute("/record")({
  loader: async () => {
    const [teachers, nextSerial, settings] = await Promise.all([
      listTeachers(),
      getNextSerial(),
      getSettings(),
    ]);
    return { teachers, nextSerial, settings };
  },
  component: RecordPage,
});

function RecordPage() {
  const { teachers, nextSerial, settings } = Route.useLoaderData();
  const router = useRouter();

  const [defaults, setDefaultsState] = useState<RegisterDefaults>(settings);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [waOpen, setWaOpen] = useState(false);
  const [waTeachers, setWaTeachers] = useState<Teacher[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDefaultsState(settings);
  }, [settings]);

  function setDefaults(patch: Partial<RegisterDefaults>) {
    setDefaultsState((prev) => {
      const next = { ...prev, ...patch };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveSettings({ data: next }).catch(() => toast.error("تعذر حفظ الإعدادات"));
      }, 400);
      return next;
    });
  }

  const filtered = teachers.filter((t) => {
    const q = query.trim();
    if (!q) return true;
    const blob = [t.name, t.teacherCode, t.recordNumber, t.nationalId, t.phone, t.institute, String(t.serial)].join(
      " ",
    );
    return blob.includes(q);
  });

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(teacher: Teacher) {
    setEditing(teacher);
    setFormOpen(true);
  }

  async function persist(teacher: Teacher): Promise<Teacher> {
    const payload = toTeacherInput(teacher);
    const saved = teacher.serial
      ? await updateTeacher({ data: { ...payload, id: teacher.serial } })
      : await createTeacher({ data: payload });
    await router.invalidate({ sync: true });
    toast.success(teacher.serial ? "تم تحديث بيانات المعلم" : `تم التسجيل برقم مسلسل ${saved.serial}`);
    return saved;
  }

  async function saveAndWhatsApp(teacher: Teacher) {
    const saved = await persist(teacher);
    setWaTeachers([saved]);
    setWaOpen(true);
  }

  async function saveAndExcel(teacher: Teacher) {
    await persist(teacher);
    const latest = await listTeachers();
    await exportTeachersExcel(latest);
    toast.success("تم تحميل ملف الإكسل");
  }

  async function exportAll() {
    if (teachers.length === 0) {
      toast.error("السجل فارغ");
      return;
    }
    await exportTeachersExcel(teachers);
    toast.success("تم تحميل ملف الإكسل");
  }

  function sendAllWhatsApp() {
    if (teachers.length === 0) {
      toast.error("السجل فارغ");
      return;
    }
    setWaTeachers(teachers);
    setWaOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteTeacher({ data: { id: pendingDelete.serial } });
    await router.invalidate({ sync: true });
    toast.success("تم حذف المعلم — الرقم المسلسل لا يُعاد استخدامه");
    setPendingDelete(null);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-5 overflow-x-hidden px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4 rounded-xl bg-azhar px-5 py-5 text-azhar-fg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AzharCrest className="size-16 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-display text-lg leading-tight">الأزهر الشريف</p>
            <h1 className="font-display text-2xl font-bold leading-snug text-balance">سجل بيانات المعلمين</h1>
            <p className="text-sm text-azhar-fg/80">
              قطاع المعاهد الأزهرية — الرقم المسلسل التالي: {nextSerial} — المسجّلون: {teachers.length}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button type="button" variant="outline" className="bg-azhar-fg text-azhar hover:bg-paper" onClick={openNew}>
            <Plus />
            إضافة معلم
          </Button>
          <Button type="button" variant="whatsapp" onClick={sendAllWhatsApp}>
            <MessageCircle />
            إرسال السجل
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-azhar-fg/20 bg-transparent text-azhar-fg hover:bg-azhar-deep"
            onClick={() => void exportAll()}
          >
            <FileSpreadsheet />
            إكسل
          </Button>
        </div>
      </header>

      <SharePanel phone={defaults.whatsappPhone} />

      <section className="grid grid-cols-1 gap-3 rounded-lg bg-paper-deep/50 p-4 sm:grid-cols-3 no-print">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">المعهد الافتراضي</span>
          <Input
            value={defaults.institute}
            onChange={(e) => setDefaults({ institute: e.target.value })}
            placeholder="يُملأ تلقائيًا في فورم المدرسين"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">الإدارة التعليمية الافتراضية</span>
          <Input
            value={defaults.educationAdmin}
            onChange={(e) => setDefaults({ educationAdmin: e.target.value })}
            placeholder="الإدارة"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">رقم واتساب المستلم</span>
          <Input
            dir="ltr"
            className="text-start"
            inputMode="tel"
            value={defaults.whatsappPhone}
            onChange={(e) => setDefaults({ whatsappPhone: e.target.value })}
            placeholder="01xxxxxxxxx"
          />
        </label>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالاسم أو المسلسل أو الرقم القومي"
            className="ps-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" asChild>
            <Link to="/">فتح فورم التسجيل</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={() => window.print()}>
            <Printer />
            طباعة السجل
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <section className="rounded-lg bg-paper px-5 py-10 text-center shadow-border">
          <h2 className="font-display text-lg font-bold">ثانياً : المعلمين ؛</h2>
          <p className="mt-2 text-sm text-muted">
            لا يوجد معلمون في السجل بعد. ابعتوا رابط الفورم على واتساب أو أضيفوا معلمًا من هنا.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 no-print">
            <Button type="button" onClick={openNew}>
              إضافة أول معلم
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/">فتح الفورم</Link>
            </Button>
          </div>
        </section>
      ) : (
        <>
          <TeachersTable teachers={filtered} onEdit={openEdit} onDelete={setPendingDelete} onAdd={openNew} />
          <TeachersStack teachers={filtered} />
        </>
      )}

      <TeacherForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        defaults={defaults}
        nextSerial={nextSerial}
        submitLabel={editing ? "حفظ التعديل" : "حفظ وأخذ رقم مسلسل"}
        onSave={async (t) => {
          await persist(t);
        }}
        onSaveAndWhatsApp={saveAndWhatsApp}
        onSaveAndExcel={saveAndExcel}
      />

      <WhatsAppDialog
        open={waOpen}
        onOpenChange={setWaOpen}
        teachers={waTeachers}
        defaultPhone={defaults.whatsappPhone}
        onPhoneChange={(phone) => setDefaults({ whatsappPhone: phone })}
      />

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>حذف المعلم؟</DialogTitle>
            <DialogDescription>
              سيتم حذف {pendingDelete?.name || "هذا المعلم"} من السجل. رقمه المسلسل ({pendingDelete?.serial}) لا
              يُعطى لمعلم جديد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="danger" onClick={() => void confirmDelete()}>
              حذف
            </Button>
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
