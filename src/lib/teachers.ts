export type Gender = "ذكر" | "أنثى" | "";
export type Stage = "ب" | "ع" | "ث" | "";

export interface Teacher {
  id: string;
  serial: number;
  recordNumber: string;
  teacherCode: string;
  name: string;
  gender: Gender;
  birthDate: string;
  nationalId: string;
  pensionDate: string;
  institute: string;
  educationAdmin: string;
  stage: Stage;
  specialization: string;
  cadreJob: string;
  azharAppointmentDate: string;
  firstWorkDate: string;
  qualification: string;
  address: string;
  phone: string;
  createdAt: string;
}

export interface RegisterDefaults {
  institute: string;
  educationAdmin: string;
  whatsappPhone: string;
}

export interface RegisterState {
  teachers: Teacher[];
  defaults: RegisterDefaults;
}

export const STORAGE_KEY = "azhar-teachers-register-v1";

export const EMPTY_DEFAULTS: RegisterDefaults = {
  institute: "",
  educationAdmin: "",
  whatsappPhone: "",
};

export const STAGE_LABEL: Record<Exclude<Stage, "">, string> = {
  ب: "ابتدائي (ب)",
  ع: "إعدادي (ع)",
  ث: "ثانوي (ث)",
};

export const CADRE_JOBS = [
  "معلم",
  "معلم أول",
  "معلم أول أ",
  "معلم خبير",
  "كبير معلمين",
  "وكيل المعهد",
  "شيخ المعهد",
  "معلم قرآن كريم",
  "معلم تجويد",
  "أخصائي اجتماعي",
  "أخصائي مكتبات",
];

export const SPECIALIZATIONS = [
  "لغة عربية",
  "فقه",
  "تفسير",
  "حديث",
  "توحيد",
  "قرآن كريم",
  "تجويد",
  "لغة إنجليزية",
  "رياضيات",
  "علوم",
  "دراسات اجتماعية",
  "حاسب آلي",
  "تربية فنية",
  "تربية رياضية",
];

export const COLUMNS: { key: keyof Teacher | "serial"; label: string }[] = [
  { key: "serial", label: "م" },
  { key: "recordNumber", label: "رقم السجل" },
  { key: "teacherCode", label: "كود المعلم" },
  { key: "name", label: "الاسم" },
  { key: "gender", label: "النوع" },
  { key: "birthDate", label: "تاريخ الميلاد" },
  { key: "nationalId", label: "الرقم القومي" },
  { key: "pensionDate", label: "تاريخ سن المعاش" },
  { key: "institute", label: "المعهد" },
  { key: "educationAdmin", label: "الإدارة التعليمية" },
  { key: "stage", label: "المرحلة ب/ع/ث" },
  { key: "specialization", label: "التخصص" },
  { key: "cadreJob", label: "الوظيفة على الكادر" },
  { key: "azharAppointmentDate", label: "تاريخ تعيين الأزهر" },
  { key: "firstWorkDate", label: "تاريخ مباشرة العمل أول مرة" },
  { key: "qualification", label: "المؤهل وتاريخه" },
  { key: "address", label: "العنوان" },
  { key: "phone", label: "رقم التليفون" },
];

export function emptyTeacher(defaults: RegisterDefaults): Teacher {
  return {
    id: "",
    serial: 0,
    recordNumber: "",
    teacherCode: "",
    name: "",
    gender: "",
    birthDate: "",
    nationalId: "",
    pensionDate: "",
    institute: defaults.institute,
    educationAdmin: defaults.educationAdmin,
    stage: "",
    specialization: "",
    cadreJob: "",
    azharAppointmentDate: "",
    firstWorkDate: "",
    qualification: "",
    address: "",
    phone: "",
    createdAt: new Date().toISOString(),
  };
}

export function addYears(isoDate: string, years: number): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${y + years}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseEgyptianId(raw: string): {
  birthDate: string;
  gender: Gender;
  pensionDate: string;
} | null {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 14) return null;
  const century = d[0] === "2" ? 1900 : d[0] === "3" ? 2000 : null;
  if (century == null) return null;
  const year = century + Number(d.slice(1, 3));
  const month = Number(d.slice(3, 5));
  const day = Number(d.slice(5, 7));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const serial = Number(d.slice(9, 13));
  const gender: Gender = serial % 2 === 1 ? "ذكر" : "أنثى";
  const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { birthDate, gender, pensionDate: addYears(birthDate, 60) };
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function cellValue(teacher: Teacher, key: (typeof COLUMNS)[number]["key"]): string {
  if (key === "serial") return teacher.serial ? String(teacher.serial) : "";
  if (key === "birthDate" || key === "pensionDate" || key === "azharAppointmentDate" || key === "firstWorkDate") {
    return formatDate(teacher[key]);
  }
  if (key === "stage") {
    const stage = teacher.stage;
    return stage ? STAGE_LABEL[stage] : "";
  }
  return teacher[key] ?? "";
}

export function loadRegister(): RegisterState {
  if (typeof localStorage === "undefined") {
    return { teachers: [], defaults: { ...EMPTY_DEFAULTS } };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { teachers: [], defaults: { ...EMPTY_DEFAULTS } };
    const parsed = JSON.parse(raw) as Partial<RegisterState>;
    return {
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : [],
      defaults: { ...EMPTY_DEFAULTS, ...(parsed.defaults ?? {}) },
    };
  } catch {
    return { teachers: [], defaults: { ...EMPTY_DEFAULTS } };
  }
}

export function saveRegister(state: RegisterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return `20${digits.slice(1)}`;
  if (digits.startsWith("20")) return digits;
  return digits;
}

export function teacherLines(teacher: Teacher): string[] {
  return COLUMNS.map((col) => `*${col.label}:* ${cellValue(teacher, col.key) || "—"}`);
}

export function formatWhatsAppMessage(teachers: Teacher[]): string {
  if (teachers.length === 1) {
    const t = teachers[0];
    return [
      "بسم الله الرحمن الرحيم",
      "",
      "*ثانياً: المعلمين*",
      "*سجل بيانات المعلمين — الأزهر الشريف*",
      "━━━━━━━━━━━━",
      ...teacherLines(t),
    ].join("\n");
  }

  const blocks = teachers.map((t) => {
    return [`*معلم (${t.serial}) — ${t.name || "بدون اسم"}*`, ...teacherLines(t)].join("\n");
  });

  return [
    "بسم الله الرحمن الرحيم",
    "",
    `*ثانياً: المعلمين — عدد ${teachers.length}*`,
    "*سجل بيانات المعلمين — الأزهر الشريف*",
    "━━━━━━━━━━━━",
    blocks.join("\n\n────────\n\n"),
  ].join("\n");
}

export function formShareMessage(formUrl: string): string {
  return [
    "السلام عليكم ورحمة الله",
    "",
    "برجاء تعبئة فورم بيانات المعلمين من الرابط التالي:",
    formUrl,
    "",
    "كل معلم يسجّل يأخذ رقم مسلسل تلقائي بالترتيب، والبيانات توصل للإدارة مباشرة.",
  ].join("\n");
}

export function isLivePublicHost(hostname: string): boolean {
  return hostname.endsWith(".grok.me") || hostname.endsWith(".vercel.app");
}

export function whatsappUrl(phone: string, text: string): string {
  const encoded = encodeURIComponent(text);
  const normalized = normalizePhone(phone);
  if (normalized) return `https://wa.me/${normalized}?text=${encoded}`;
  return `https://wa.me/?text=${encoded}`;
}

export const EXCEL_HEADERS = COLUMNS.map((c) => c.label);

export function teacherToExcelRow(teacher: Teacher): string[] {
  return COLUMNS.map((col) => cellValue(teacher, col.key));
}

export async function exportTeachersExcel(teachers: Teacher[]) {
  const XLSX = await import("xlsx");
  const title = "ثانياً: المعلمين — سجل بيانات المعلمين — الأزهر الشريف";
  const aoa: string[][] = [
    [title],
    [`تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}`],
    [],
    EXCEL_HEADERS,
    ...teachers.map((t) => teacherToExcelRow(t)),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!views"] = [{ rightToLeft: true, state: "frozen", ySplit: 4 }];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: EXCEL_HEADERS.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: EXCEL_HEADERS.length - 1 } },
  ];
  ws["!cols"] = EXCEL_HEADERS.map((h, i) => ({
    wch: Math.max(h.length + 4, i === 3 || i === 16 ? 22 : 14),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "المعلمين");
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `سجل_المعلمين_${stamp}.xlsx`);
}
