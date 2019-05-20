--- ESTRUCTURAS DE DATOS PARA MODELO SIMPLIFICADO DE "Alumno inscriptos en varios cursos de una carrera" ----

drop table inscripciones_curso;
drop table inscripciones_carrera;
drop table curso;
drop table carrera;
drop table alumno;
drop table persona;
drop table estado_curso;
drop table profesor;


CREATE TABLE persona (
    identificador  serial PRIMARY KEY,
    tipodoc        char(5) NOT NULL,
    documento 	    bigint NOT NULL UNIQUE,
    nombre       varchar(40) NOT NULL,
    apellido       varchar(40) NOT NULL,
    fechanac		date NOT NULL,
    direccion   varchar(200) NOT NULL
);


CREATE TABLE alumno (
    identificador  serial PRIMARY KEY,
    idpersona	    integer REFERENCES persona (identificador) ON DELETE CASCADE UNIQUE,
    legajo 	    integer NOT NULL UNIQUE
);

CREATE TABLE profesor (
    identificador  serial PRIMARY KEY,
    idpersona	    integer REFERENCES persona (identificador) ON DELETE CASCADE UNIQUE,
    matricula     integer NOT NULL
    
);


CREATE TABLE carrera (
    identificador  serial PRIMARY KEY,
    nombre       varchar(40) NOT NULL,
    descripcion      varchar(250),
    fechadesde		date NOT NULL,
    fechahasta 	date
);


CREATE TABLE curso (
    identificador  serial PRIMARY KEY,
    idcarrera 		integer REFERENCES carrera (identificador) ON DELETE CASCADE,
    nombre       varchar(40) NOT NULL,
    descripcion      varchar(250),
    cupomaximo 	smallint NOT NULL,
    anio			smallint NOT NULL,
    idprofesor integer REFERENCES profesor (identificador)
);


CREATE TABLE inscripciones_carrera(
    idalumno 		integer REFERENCES alumno (identificador) ON DELETE CASCADE NOT NULL,
    idcarrera		integer REFERENCES carrera (identificador) ON DELETE CASCADE NOT NULL,
    fechainscripcion	varchar(10) NOT NULL DEFAULT to_char(CURRENT_DATE, 'dd-mm-yyyy')
);

CREATE TABLE inscripciones_curso(
    idalumno 		integer REFERENCES alumno (identificador) ON DELETE CASCADE NOT NULL,
    idcurso 		integer REFERENCES curso (identificador) ON DELETE CASCADE NOT NULL,
    fechainscripcion	varchar(10) NOT NULL DEFAULT to_char(CURRENT_DATE, 'dd-mm-yyyy')
);

CREATE TYPE estado AS ENUM ('n/a','libre', 'regular', 'aprobado');

CREATE TABLE estado_curso(
    idalumno integer REFERENCES alumno (identificador) ON DELETE CASCADE NOT NULL,
    idcurso  integer REFERENCES curso  (identificador) ON DELETE CASCADE NOT NULL,
    estadocurso   estado DEFAULT 'n/a',
    nota integer DEFAULT 0
);


   INSERT INTO carrera VALUES
    (1,'Ingenieria en sistema de información', 'Carrera a fines a programación y desarrollo de software en general','1960-01-01');

   INSERT INTO carrera VALUES
    (2,'Ingenieria civil', 'Carrera a fines a construcción, planificación y desarrollo de obras de desarrollo urbano','1980-01-01');


----- Insert de datos iniciales curso


  INSERT INTO curso VALUES
    (1,1,'Análisis matemático', 'Curso sobre el desarrollo avanzado de matemáticas', 5,2018);
    
  INSERT INTO curso VALUES
    (2,1,'Diseño de sistemas', 'Curso sobre diseño de componentes de sistemas de software', 3,2018);

  INSERT INTO curso VALUES
    (3,1,'Java', 'Curso sobre el lenguaje de programación JAVA', 4,2018);

  INSERT INTO curso VALUES
    (4,1,'Base de datos-SQL', 'Curso sobre tipos de base de datos y consultas sql', 10,2018);

  INSERT INTO curso VALUES
    (5,2,'Fisica básica', 'Curso sobre fundamentos base de física', 5,2018);

  INSERT INTO curso VALUES
    (6,2,'Dibujo', 'Curso sobre dibujo de planos', 10,2018);
