import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AzharCrest } from "@/components/azhar-crest";
import { TeacherForm } from "@/components/teacher-form";
import { Button } from "@/components/ui/button";
import { createTeacher, getNextSerial, getSettings, toTeacherInput } from "@/lib/teacher-api";
import type { Teacher } from "@/lib/teachers";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [nextSerial, settings] = await Promise.all([getNextSerial(), getSettings()]);
    return { nextSerial, settings };
  },
  component: PublicRegister,
});

function PublicRegister() {
  const { nextSerial, settings } = Route.useLoaderData();
  const router = useRouter();
  const [saved, setSaved] = useState<Teacher | null>(null);

  async function onSave(teacher: Teacher) {
    const result = await createTeacher({ data: toTeacherInput(teacher) });
    setSaved(result);
    toast.success(`تم التسجيل برقم مسلسل ${result.serial}`);
    await router.invalidate({ sync: true });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <header className="flex items-center gap-4 rounded-xl bg-azhar px-5 py-5 text-azhar-fg">
        <AzharCrest className="size-14 shrink-0" />
        <div>
          <p className="font-display text-lg leading-tight">الأزهر الشريف</p>
          <h1 className="font-display text-2xl font-bold leading-snug">فورم تسجيل معلم</h1>
          <p className="text-sm text-azhar-fg/80">الرقم المسلسل التالي: {nextSerial}</p>
        </div>
      </header>

      {saved ? (
        <section className="rounded-xl bg-paper p-6 text-center shadow-border">
          <p className="text-sm text-muted">تم الحفظ — البيانات وصلت للإدارة</p>
          <p className="mt-2 font-display text-3xl font-bold text-azhar tabular-nums">مسلسل {saved.serial}</p>
          <p className="mt-2 text-lg font-medium">{saved.name}</p>
          <p className="mt-3 text-sm text-muted">احتفظ بالرقم المسلسل. المعلم التالي يأخذ الرقم اللي بعده.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                setSaved(null);
              }}
            >
              تسجيل معلم آخر
            </Button>
          </div>
        </section>
      ) : (
        <TeacherForm
          variant="page"
          defaults={settings}
          nextSerial={nextSerial}
          submitLabel="تسجيل وأخذ رقم مسلسل"
          onSave={onSave}
        />
      )}

      <p className="pb-4 text-center text-xs text-muted">
        <Link to="/record" className="underline-offset-4 hover:underline">
          سجل الإدارة
        </Link>
      </p>
    </main>
  );
}
