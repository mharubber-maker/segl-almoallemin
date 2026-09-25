create table if not exists teachers (
  id serial primary key,
  record_number text not null default '',
  teacher_code text not null default '',
  name text not null,
  gender text not null default '',
  birth_date text not null default '',
  national_id text not null default '',
  pension_date text not null default '',
  institute text not null default '',
  education_admin text not null default '',
  stage text not null default '',
  specialization text not null default '',
  cadre_job text not null default '',
  azhar_appointment_date text not null default '',
  first_work_date text not null default '',
  qualification text not null default '',
  address text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists teachers_created_at_idx on teachers (created_at);
