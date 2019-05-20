'use strict'

var express = require('express');
var router = express.Router();
var hbs = require('hbs');
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));
const client = require('../config/dbConnection')

/* GET home page. */

router.get('/', async (req, res) => {

   const query =
      `SELECT 
         p.identificador,
         p.nombre,
         p.apellido,
         p.tipodoc,
         p.documento,
         p.fechanac,
         p.direccion,
         a.legajo,
         c.nombre as carrera
      FROM persona as p INNER JOIN alumno as a ON p.identificador = idpersona
      INNER JOIN inscripciones_carrera as ic ON ic.idalumno = a.identificador
      INNER JOIN carrera as c ON c.identificador = ic.idcarrera;`

   const { rows } = await client.query(query)
   res.render(
      'index',
      { titulo: 'IT Challenge JAVA', personas: rows }
   )
})

// Nuevo Alumno

router.get('/persona/nuevo', async (req, res) => {

   const query = `SELECT identificador, nombre FROM carrera;`
   const { rows } = await client.query(query)
   res.render('personaForm', { titulo: 'Registrar un alumno', persona: { fechanac: "" }, carreras: rows })
})

// Editar alumno

router.get('/persona/editar/:id', async (req, res) => {
   const { id } = req.params

   const query =
      `SELECT 
         p.identificador,
         p.nombre,
         p.apellido,
         p.tipodoc,
         p.documento,
         p.fechanac,
         p.direccion,
         a.legajo,
         c.identificador as carrera
      FROM persona as p INNER JOIN alumno as a ON p.identificador = idpersona
      INNER JOIN inscripciones_carrera as ic ON ic.idalumno = a.identificador
      INNER JOIN carrera as c ON c.identificador = ic.idcarrera
      WHERE $1 = p.identificador;`
   const { rows } = await client.query(query, [id])

   const query2 = `SELECT identificador, nombre FROM carrera;`
   const rowsC = (await client.query(query2)).rows
   res.render('personaForm', { titulo: 'Editar datos de un alumno', persona: rows[0], carreras: rowsC })
})

// Inscribir un alumno a curso/s

router.get('/persona/inscripcion-a-curso/:id', async (req, res) => {
   const { id } = req.params


   const query = `
      SELECT 
         p.identificador,
         p.nombre,
         p.apellido,
         a.legajo,
         a.identificador,
         c.identificador as carrera,
         c.nombre as nombre_carrera
      FROM persona as p INNER JOIN alumno as a ON p.identificador = idpersona
      INNER JOIN inscripciones_carrera as ic ON ic.idalumno = a.identificador
      INNER JOIN carrera as c ON c.identificador = ic.idcarrera
      WHERE $1 = p.identificador;`

   const alumno = (await client.query(query, [id])).rows[0]

   const query2 = `
      SELECT
         identificador,
         nombre 
      FROM curso
      WHERE ${alumno.carrera} = idcarrera`

   const { rows } = await client.query(query2)

   res.render('inscripcion-curso', { titulo1: 'Inscripción a Curso', alumno: alumno, cursos: rows })
})

// Registrar a un nuevo profesor

router.get('/persona/profesor/nuevo', async (req, res) => {

   const query = `SELECT identificador, nombre FROM curso`

   const { rows } = await client.query(query)

   res.render('personaProfForm', { cursos: rows })
})

// Informacion de un curso

router.get('/curso/info', async (req, res) => {

   const query = `SELECT identificador, nombre FROM curso`

   const { rows } = await client.query(query)

   res.render('cursoInfo', { cursos: rows, profesor: {}, alumnos: {}, titulo: 'Alumnos inscriptos y docente correspondiente al curso.' })
})

// Poner nota y/o estado de una materia a un alumno

router.get('/alumno/agregar-nota', (req, res) => {
   res.render('agregarNotas', { titulo: "Agregar nota y/o el estado del curso de un alumno." })
})

// Estado academico de un alumno

router.get('/alumno/estado-academico', (req, res) => {
   res.render('estadoAlumno', { titulo: 'Estado académico de un alumno.' })
})

// Eliminar un alumno

router.get('/persona/eliminar/:id', async (req, res) => {

   const { id } = req.params

   const query = `DELETE FROM persona WHERE identificador = $1`

   await client.query(query, [id])
   
   res.redirect('/')

})

module.exports = router;
