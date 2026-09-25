create table if not exists register_settings (
  id integer primary key default 1 check (id = 1),
  institute text not null default '',
  education_admin text not null default '',
  whatsapp_phone text not null default ''
);

insert into register_settings (id) values (1) on conflict (id) do nothing;
