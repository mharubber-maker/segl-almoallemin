import { Pencil, Trash2 } from "lucide-react";
import { COLUMNS, cellValue, type Teacher } from "@/lib/teachers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeachersTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onAdd: () => void;
}

export function TeachersTable({ teachers, onEdit, onDelete, onAdd }: TeachersTableProps) {
  return (
    <section className="hidden max-w-full overflow-hidden rounded-lg bg-paper shadow-border no-print md:block">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-bold text-ink">ثانياً : المعلمين ؛</h2>
        <span className="text-xs text-muted tabular-nums">{teachers.length} معلم</span>
      </div>
      <div className="register-scroll max-w-full overflow-x-auto">
        <table className="register-table w-full border-collapse text-center text-xs text-ink">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="border border-line bg-paper-deep px-1.5 py-2 font-semibold leading-snug"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-24 border border-line bg-paper-deep px-1.5 py-2 font-semibold no-print">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className="cursor-pointer transition-colors duration-(--motion-quick) hover:bg-paper-deep/60"
                onClick={() => onEdit(teacher)}
              >
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "border border-line px-1.5 py-2 align-middle",
                      col.key === "name" && "min-w-40 font-medium",
                      (col.key === "nationalId" || col.key === "phone") && "dir-ltr tabular-nums",
                    )}
                  >
                    {cellValue(teacher, col.key) || "—"}
                  </td>
                ))}
                <td className="border border-line px-1 py-1 no-print" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => onEdit(teacher)}
                      aria-label={`تعديل ${teacher.name}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-danger"
                      onClick={() => onDelete(teacher)}
                      aria-label={`حذف ${teacher.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="border border-line px-4 py-10">
                  <p className="text-sm text-muted">لا يوجد معلمون في السجل بعد.</p>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="mt-3 text-sm font-medium text-azhar underline-offset-4 hover:underline"
                  >
                    إضافة أول معلم
                  </button>
                </td>
              </tr>
            ) : null}
            <tr className="no-print">
              <td
                colSpan={COLUMNS.length + 1}
                className="cursor-pointer border border-dashed border-line bg-paper-deep/40 px-4 py-3 text-muted transition-colors hover:bg-paper-deep"
                onClick={onAdd}
              >
                + صف جديد — اضغط لإضافة معلم
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
