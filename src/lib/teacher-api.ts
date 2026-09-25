import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { Gender, RegisterDefaults, Stage, Teacher } from "@/lib/teachers";

const teacherInputSchema = z.object({
  recordNumber: z.string(),
  teacherCode: z.string(),
  name: z.string().trim().min(1),
  gender: z.enum(["ذكر", "أنثى", ""]),
  birthDate: z.string(),
  nationalId: z.string(),
  pensionDate: z.string(),
  institute: z.string(),
  educationAdmin: z.string(),
  stage: z.enum(["ب", "ع", "ث", ""]),
  specialization: z.string(),
  cadreJob: z.string(),
  azharAppointmentDate: z.string(),
  firstWorkDate: z.string(),
  qualification: z.string(),
  address: z.string(),
  phone: z.string(),
});

export type TeacherInput = z.infer<typeof teacherInputSchema>;

type TeacherRow = {
  id: number;
  record_number: string;
  teacher_code: string;
  name: string;
  gender: string;
  birth_date: string;
  national_id: string;
  pension_date: string;
  institute: string;
  education_admin: string;
  stage: string;
  specialization: string;
  cadre_job: string;
  azhar_appointment_date: string;
  first_work_date: string;
  qualification: string;
  address: string;
  phone: string;
  created_at: string;
};

function toTeacher(row: TeacherRow): Teacher {
  return {
    id: String(row.id),
    serial: row.id,
    recordNumber: row.record_number ?? "",
    teacherCode: row.teacher_code ?? "",
    name: row.name ?? "",
    gender: (row.gender as Gender) ?? "",
    birthDate: row.birth_date ?? "",
    nationalId: row.national_id ?? "",
    pensionDate: row.pension_date ?? "",
    institute: row.institute ?? "",
    educationAdmin: row.education_admin ?? "",
    stage: (row.stage as Stage) ?? "",
    specialization: row.specialization ?? "",
    cadreJob: row.cadre_job ?? "",
    azharAppointmentDate: row.azhar_appointment_date ?? "",
    firstWorkDate: row.first_work_date ?? "",
    qualification: row.qualification ?? "",
    address: row.address ?? "",
    phone: row.phone ?? "",
    createdAt: row.created_at ?? "",
  };
}

export const listTeachers = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<TeacherRow>`
    select
      id, record_number, teacher_code, name, gender, birth_date, national_id,
      pension_date, institute, education_admin, stage, specialization, cadre_job,
      azhar_appointment_date, first_work_date, qualification, address, phone,
      created_at
    from teachers
    order by id asc
  `;
  return rows.map(toTeacher);
});

export const getNextSerial = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ next: number }>`
    select coalesce(max(id), 0) + 1 as next from teachers
  `;
  return rows[0]?.next ?? 1;
});

export const createTeacher = createServerFn({ method: "POST" })
  .validator(teacherInputSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<TeacherRow>`
      insert into teachers (
        record_number, teacher_code, name, gender, birth_date, national_id,
        pension_date, institute, education_admin, stage, specialization, cadre_job,
        azhar_appointment_date, first_work_date, qualification, address, phone
      ) values (
        ${data.recordNumber}, ${data.teacherCode}, ${data.name}, ${data.gender},
        ${data.birthDate}, ${data.nationalId}, ${data.pensionDate}, ${data.institute},
        ${data.educationAdmin}, ${data.stage}, ${data.specialization}, ${data.cadreJob},
        ${data.azharAppointmentDate}, ${data.firstWorkDate}, ${data.qualification},
        ${data.address}, ${data.phone}
      )
      returning
        id, record_number, teacher_code, name, gender, birth_date, national_id,
        pension_date, institute, education_admin, stage, specialization, cadre_job,
        azhar_appointment_date, first_work_date, qualification, address, phone,
        created_at
    `;
    const saved = rows[0];
    if (!saved) throw new Error("تعذر حفظ المعلم");
    return toTeacher(saved);
  });

export const updateTeacher = createServerFn({ method: "POST" })
  .validator(teacherInputSchema.extend({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<TeacherRow>`
      update teachers set
        record_number = ${data.recordNumber},
        teacher_code = ${data.teacherCode},
        name = ${data.name},
        gender = ${data.gender},
        birth_date = ${data.birthDate},
        national_id = ${data.nationalId},
        pension_date = ${data.pensionDate},
        institute = ${data.institute},
        education_admin = ${data.educationAdmin},
        stage = ${data.stage},
        specialization = ${data.specialization},
        cadre_job = ${data.cadreJob},
        azhar_appointment_date = ${data.azharAppointmentDate},
        first_work_date = ${data.firstWorkDate},
        qualification = ${data.qualification},
        address = ${data.address},
        phone = ${data.phone}
      where id = ${data.id}
      returning
        id, record_number, teacher_code, name, gender, birth_date, national_id,
        pension_date, institute, education_admin, stage, specialization, cadre_job,
        azhar_appointment_date, first_work_date, qualification, address, phone,
        created_at
    `;
    const saved = rows[0];
    if (!saved) throw new Error("المعلم غير موجود");
    return toTeacher(saved);
  });

export const deleteTeacher = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from teachers where id = ${data.id}`;
    return { ok: true as const };
  });

export function toTeacherInput(teacher: Teacher): TeacherInput {
  return {
    recordNumber: teacher.recordNumber,
    teacherCode: teacher.teacherCode,
    name: teacher.name,
    gender: teacher.gender,
    birthDate: teacher.birthDate,
    nationalId: teacher.nationalId,
    pensionDate: teacher.pensionDate,
    institute: teacher.institute,
    educationAdmin: teacher.educationAdmin,
    stage: teacher.stage,
    specialization: teacher.specialization,
    cadreJob: teacher.cadreJob,
    azharAppointmentDate: teacher.azharAppointmentDate,
    firstWorkDate: teacher.firstWorkDate,
    qualification: teacher.qualification,
    address: teacher.address,
    phone: teacher.phone,
  };
}

const settingsSchema = z.object({
  institute: z.string(),
  educationAdmin: z.string(),
  whatsappPhone: z.string(),
});

type SettingsRow = {
  institute: string;
  education_admin: string;
  whatsapp_phone: string;
};

function toSettings(row?: SettingsRow | null): RegisterDefaults {
  return {
    institute: row?.institute ?? "",
    educationAdmin: row?.education_admin ?? "",
    whatsappPhone: row?.whatsapp_phone ?? "",
  };
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<SettingsRow>`
    select institute, education_admin, whatsapp_phone from register_settings where id = 1
  `;
  return toSettings(rows[0]);
});

export const saveSettings = createServerFn({ method: "POST" })
  .validator(settingsSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<SettingsRow>`
      insert into register_settings (id, institute, education_admin, whatsapp_phone)
      values (1, ${data.institute}, ${data.educationAdmin}, ${data.whatsappPhone})
      on conflict (id) do update set
        institute = excluded.institute,
        education_admin = excluded.education_admin,
        whatsapp_phone = excluded.whatsapp_phone
      returning institute, education_admin, whatsapp_phone
    `;
    return toSettings(rows[0]);
  });

