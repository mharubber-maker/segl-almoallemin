import { COLUMNS, cellValue, type Teacher } from "@/lib/teachers";

export function TeachersStack({ teachers }: { teachers: Teacher[] }) {
  if (teachers.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 print-stack">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">المعلمون المسجلون</h2>
        <span className="text-xs text-muted tabular-nums">{teachers.length} معلم</span>
      </div>
      {teachers.map((teacher) => (
        <article
          key={teacher.id}
          className="stack-item rounded-lg bg-paper p-4 shadow-border"
        >
          <header className="mb-3 flex items-baseline justify-between gap-3 border-b border-line/10 pb-2">
            <h3 className="font-display text-xl font-bold leading-snug">
              {teacher.name || "بدون اسم"}
            </h3>
            <p className="shrink-0 rounded-md bg-azhar px-2.5 py-1 text-sm font-semibold tabular-nums text-azhar-fg">
              مسلسل {teacher.serial}
            </p>
          </header>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {COLUMNS.filter((c) => c.key !== "name").map((col) => {
              const value = cellValue(teacher, col.key);
              if (!value) return null;
              return (
                <div key={col.key} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted">{col.label}</dt>
                  <dd className="text-sm text-ink">{value}</dd>
                </div>
              );
            })}
          </dl>
        </article>
      ))}
    </section>
  );
}
