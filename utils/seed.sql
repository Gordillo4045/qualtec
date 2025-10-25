-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.carrera
(
  id_carrera integer NOT NULL DEFAULT nextval('carrera_id_carrera_seq'
  ::regclass),
  id_departamento integer,
  nombre text NOT NULL,
  clave text,
  CONSTRAINT carrera_pkey PRIMARY KEY
  (id_carrera),
  CONSTRAINT carrera_id_departamento_fkey FOREIGN KEY
  (id_departamento) REFERENCES public.departamento
  (id_departamento)
);
  CREATE TABLE public.departamento
  (
    id_departamento integer NOT NULL DEFAULT nextval('departamento_id_departamento_seq'
    ::regclass),
  nombre text NOT NULL,
  CONSTRAINT departamento_pkey PRIMARY KEY
    (id_departamento)
);
    CREATE TABLE public.estudiante
    (
      id_estudiante uuid NOT NULL DEFAULT gen_random_uuid(),
      numero_control text NOT NULL UNIQUE,
      ap_paterno text NOT NULL,
      ap_materno text NOT NULL,
      nombres text NOT NULL,
      genero character,
      fecha_nacimiento date,
      email text CHECK (email
      ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text),
  telefono text,
  id_carrera integer,
  id_modalidad integer,
  estatus text CHECK
      (estatus = ANY
      (ARRAY['activo'::text, 'baja_temp'::text, 'egresado'::text, 'desertor'::text])),
  fecha_ingreso date DEFAULT now
      (),
  CONSTRAINT estudiante_pkey PRIMARY KEY
      (id_estudiante),
  CONSTRAINT estudiante_id_carrera_fkey FOREIGN KEY
      (id_carrera) REFERENCES public.carrera
      (id_carrera),
  CONSTRAINT estudiante_id_modalidad_fkey FOREIGN KEY
      (id_modalidad) REFERENCES public.modalidad
      (id_modalidad)
);
      CREATE TABLE public.estudiante_factor
      (
        id_estudiante_factor integer NOT NULL DEFAULT nextval('estudiante_factor_id_estudiante_factor_seq'
        ::regclass),
  id_estudiante uuid,
  id_periodo integer,
  id_factor integer,
  id_subfactor integer,
  severidad integer CHECK
        (severidad >= 1 AND severidad <= 5),
  observacion text,
  fecha_registro date DEFAULT now
        (),
  CONSTRAINT estudiante_factor_pkey PRIMARY KEY
        (id_estudiante_factor),
  CONSTRAINT estudiante_factor_id_estudiante_fkey FOREIGN KEY
        (id_estudiante) REFERENCES public.estudiante
        (id_estudiante),
  CONSTRAINT estudiante_factor_id_periodo_fkey FOREIGN KEY
        (id_periodo) REFERENCES public.periodo
        (id_periodo),
  CONSTRAINT estudiante_factor_id_factor_fkey FOREIGN KEY
        (id_factor) REFERENCES public.factor
        (id_factor),
  CONSTRAINT estudiante_factor_id_subfactor_fkey FOREIGN KEY
        (id_subfactor) REFERENCES public.subfactor
        (id_subfactor)
);
        CREATE TABLE public.estudiante_unidad
        (
          id_estudiante_unidad integer NOT NULL DEFAULT nextval('estudiante_unidad_id_estudiante_unidad_seq'
          ::regclass),
  id_inscripcion integer,
  id_materia_unidad integer,
  calificacion numeric CHECK
          (calificacion >= 0::numeric AND calificacion <= 100::numeric),
  asistio boolean DEFAULT true,
  fecha_clase date DEFAULT CURRENT_DATE,
  tipo_evaluacion text DEFAULT 'examen'::text CHECK
          (tipo_evaluacion = ANY
          (ARRAY['examen'::text, 'tarea'::text, 'proyecto'::text, 'practica'::text, 'otro'::text])),
  observaciones text,
  CONSTRAINT estudiante_unidad_pkey PRIMARY KEY
          (id_estudiante_unidad),
  CONSTRAINT estudiante_unidad_id_inscripcion_fkey FOREIGN KEY
          (id_inscripcion) REFERENCES public.inscripcion
          (id_inscripcion),
  CONSTRAINT estudiante_unidad_id_materia_unidad_fkey FOREIGN KEY
          (id_materia_unidad) REFERENCES public.materia_unidad
          (id_materia_unidad)
);
          CREATE TABLE public.factor
          (
            id_factor integer NOT NULL DEFAULT nextval('factor_id_factor_seq'
            ::regclass),
  nombre text NOT NULL,
  descripcion text,
  CONSTRAINT factor_pkey PRIMARY KEY
            (id_factor)
);
            CREATE TABLE public.grupo
            (
              id_grupo integer NOT NULL DEFAULT nextval('grupo_id_grupo_seq'
              ::regclass),
  id_carrera integer,
  clave text NOT NULL,
  turno text,
  CONSTRAINT grupo_pkey PRIMARY KEY
              (id_grupo),
  CONSTRAINT grupo_id_carrera_fkey FOREIGN KEY
              (id_carrera) REFERENCES public.carrera
              (id_carrera)
);
              CREATE TABLE public.inscripcion
              (
                id_inscripcion integer NOT NULL DEFAULT nextval('inscripcion_id_inscripcion_seq'
                ::regclass),
  id_estudiante uuid,
  id_oferta integer,
  cal_final numeric CHECK
                (cal_final >= 0::numeric AND cal_final <= 100::numeric),
  aprobado boolean DEFAULT
                (cal_final >=
                (70)::numeric),
  asistencia_pct numeric CHECK
                (asistencia_pct >= 0::numeric AND asistencia_pct <= 100::numeric),
  intentos integer DEFAULT 1,
  CONSTRAINT inscripcion_pkey PRIMARY KEY
                (id_inscripcion),
  CONSTRAINT inscripcion_id_estudiante_fkey FOREIGN KEY
                (id_estudiante) REFERENCES public.estudiante
                (id_estudiante),
  CONSTRAINT inscripcion_id_oferta_fkey FOREIGN KEY
                (id_oferta) REFERENCES public.oferta
                (id_oferta)
);
                CREATE TABLE public.materia
                (
                  id_materia integer NOT NULL DEFAULT nextval('materia_id_materia_seq'
                  ::regclass),
  id_departamento integer,
  clave text NOT NULL,
  nombre text NOT NULL,
  creditos integer,
  CONSTRAINT materia_pkey PRIMARY KEY
                  (id_materia),
  CONSTRAINT materia_id_departamento_fkey FOREIGN KEY
                  (id_departamento) REFERENCES public.departamento
                  (id_departamento)
);
                  CREATE TABLE public.materia_unidad
                  (
                    id_materia_unidad integer NOT NULL DEFAULT nextval('materia_unidad_id_materia_unidad_seq'
                    ::regclass),
  id_materia integer,
  numero_unidad integer NOT NULL CHECK
                    (numero_unidad > 0),
  nombre_unidad text NOT NULL,
  descripcion text,
  peso numeric DEFAULT 1.0 CHECK
                    (peso > 0::numeric),
  CONSTRAINT materia_unidad_pkey PRIMARY KEY
                    (id_materia_unidad),
  CONSTRAINT materia_unidad_id_materia_fkey FOREIGN KEY
                    (id_materia) REFERENCES public.materia
                    (id_materia)
);
                    CREATE TABLE public.modalidad
                    (
                      id_modalidad integer NOT NULL DEFAULT nextval('modalidad_id_modalidad_seq'
                      ::regclass),
  nombre text NOT NULL,
  CONSTRAINT modalidad_pkey PRIMARY KEY
                      (id_modalidad)
);
                      CREATE TABLE public.oferta
                      (
                        id_oferta integer NOT NULL DEFAULT nextval('oferta_id_oferta_seq'
                        ::regclass),
  id_materia integer,
  id_periodo integer,
  id_grupo integer,
  CONSTRAINT oferta_pkey PRIMARY KEY
                        (id_oferta),
  CONSTRAINT oferta_id_materia_fkey FOREIGN KEY
                        (id_materia) REFERENCES public.materia
                        (id_materia),
  CONSTRAINT oferta_id_periodo_fkey FOREIGN KEY
                        (id_periodo) REFERENCES public.periodo
                        (id_periodo),
  CONSTRAINT oferta_id_grupo_fkey FOREIGN KEY
                        (id_grupo) REFERENCES public.grupo
                        (id_grupo)
);
                        CREATE TABLE public.periodo
                        (
                          id_periodo integer NOT NULL DEFAULT nextval('periodo_id_periodo_seq'
                          ::regclass),
  anio integer NOT NULL,
  etiqueta text NOT NULL,
  inicio date,
  fin date,
  CONSTRAINT periodo_pkey PRIMARY KEY
                          (id_periodo)
);
                          CREATE TABLE public.subfactor
                          (
                            id_subfactor integer NOT NULL DEFAULT nextval('subfactor_id_subfactor_seq'
                            ::regclass),
  id_factor integer,
  nombre text NOT NULL,
  descripcion text,
  CONSTRAINT subfactor_pkey PRIMARY KEY
                            (id_subfactor),
  CONSTRAINT subfactor_id_factor_fkey FOREIGN KEY
                            (id_factor) REFERENCES public.factor
                            (id_factor)
);