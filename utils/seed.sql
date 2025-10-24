create table departamento (
  id_departamento serial primary key,
  nombre text not null
);

create table carrera (
  id_carrera serial primary key,
  id_departamento int references departamento(id_departamento),
  nombre text not null,
  clave text
);

create table modalidad (
  id_modalidad serial primary key,
  nombre text not null
);

create table periodo (
  id_periodo serial primary key,
  anio int not null,
  etiqueta text not null,
  inicio date,
  fin date
);

create table materia (
  id_materia serial primary key,
  id_departamento int references departamento(id_departamento),
  clave text not null,
  nombre text not null,
  creditos int
);

create table grupo (
  id_grupo serial primary key,
  id_carrera int references carrera(id_carrera),
  clave text not null,
  turno text
);

create table estudiante (
  id_estudiante uuid primary key default gen_random_uuid(),
  numero_control text unique not null,
  ap_paterno text not null,
  ap_materno text not null,
  nombres text not null,
  genero char(1),
  fecha_nacimiento date,
  email text check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  telefono text,
  id_carrera int references carrera(id_carrera),
  id_modalidad int references modalidad(id_modalidad),
  estatus text check (estatus in ('activo','baja_temp','egresado','desertor')),
  fecha_ingreso date default now()
);

create table oferta (
  id_oferta serial primary key,
  id_materia int references materia(id_materia),
  id_periodo int references periodo(id_periodo),
  id_grupo int references grupo(id_grupo)
);

create table inscripcion (
  id_inscripcion serial primary key,
  id_estudiante uuid references estudiante(id_estudiante),
  id_oferta int references oferta(id_oferta),
  cal_final numeric(5,2) check (cal_final between 0 and 100),
  aprobado boolean generated always as (cal_final >= 70) stored,
  asistencia_pct numeric(5,2) check (asistencia_pct between 0 and 100),
  intentos int default 1,
  unique(id_estudiante, id_oferta)
);

create table factor (
  id_factor serial primary key,
  nombre text not null,
  descripcion text
);

create table subfactor (
  id_subfactor serial primary key,
  id_factor int references factor(id_factor),
  nombre text not null,
  descripcion text
);

create table estudiante_factor (
  id_estudiante_factor serial primary key,
  id_estudiante uuid references estudiante(id_estudiante),
  id_periodo int references periodo(id_periodo),
  id_factor int references factor(id_factor),
  id_subfactor int references subfactor(id_subfactor),
  severidad int check (severidad between 1 and 5),
  observacion text,
  fecha_registro date default now(),
  unique(id_estudiante, id_periodo, id_factor, id_subfactor)
);