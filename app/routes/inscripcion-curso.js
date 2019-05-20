'use strict'

const express = require('express');
const router = express.Router();
const client = require('../config/dbConnection')

router.post('/curso/inscripto', async (req, res) => {

   const {
      list,
      id,
   } = req.body

   if (!list)
      return res.status(500).send({ message: 'Sin cursos inscriptos.'})
   
   const query = `INSERT INTO inscripciones_curso(idalumno, idcurso) VALUES ($1, $2)`

   
   for (const curso of list)
      await client.query(query, [id, curso])
   res.redirect('/')

})

router.post('/agregar-nota/buscar', async (req, res) => {

   const {
      buscaDNI
   } = req.body

   const query = `
               SELECT 
                  p.nombre, 
                  p.apellido, 
                  p.documento, 
                  a.legajo,
                  a.identificador,
                  c.nombre AS carrera
               FROM persona AS p
               INNER JOIN alumno AS a ON a.idpersona = p.identificador
               INNER JOIN inscripciones_carrera as ic ON ic.idalumno = a.identificador
               INNER JOIN carrera AS c ON ic.idcarrera = c.identificador
               WHERE p.documento = $1`

   const alumno = (await client.query(query, [buscaDNI])).rows[0]

   const query2 = `
      SELECT c.nombre, c.identificador
      FROM curso as c
      INNER JOIN carrera as ca ON ca.identificador = c.idcarrera
      INNER JOIN inscripciones_carrera as ic ON ic.idcarrera = ca.identificador
      INNER JOIN alumno as a ON a.identificador = ic.idalumno
      WHERE a.identificador = $1`

   const { rows } = await client.query(query2, [alumno.identificador])

   res.render('agregarNotas', { alumno: alumno, cursos: rows, titulo: "Agregar nota y/o el estado del curso de un alumno." })
})

router.post('/agregar-nota/ponerNota', async (req, res) => {

   const {
      idAlumno,
      cursosID,
      notas,
      estados
   } = req.body


   for (let index = 0; index < cursosID.length; index++) {
      if (estados[index]) {
         const query = `INSERT INTO estado_curso VALUES($1, $2, $3, $4)`
         await client.query(query, [idAlumno, cursosID[index], estados[index], +notas[index]])
      } else {
         const query = `INSERT INTO estado_curso(idalumno, idcurso, nota) VALUES($1, $2, $3)`
         await client.query(query, [idAlumno, cursosID[index], +notas[index]])
      }
   }

   res.redirect('/')
})

router.post('/estado-academico/buscar', async (req, res) => {
   const { buscaDNI } = req.body


   const query = `
               SELECT 
                  p.nombre, 
                  p.apellido, 
                  p.documento, 
                  a.legajo,
                  a.identificador,
                  c.nombre AS carrera
               FROM persona AS p
               INNER JOIN alumno AS a ON a.idpersona = p.identificador
               INNER JOIN inscripciones_carrera AS ic ON ic.idalumno = a.identificador
               INNER JOIN carrera AS c ON ic.idcarrera = c.identificador
               WHERE p.documento = $1`

   const alumno = (await client.query(query, [buscaDNI])).rows[0]

   const query2 = `
               SELECT 
                  c.nombre
               FROM 
                  curso as c
               INNER JOIN inscripciones_curso as ic ON ic.idcurso = c.identificador
               INNER JOIN estado_curso as ec ON ec.idcurso = c.identificador
               INNER JOIN alumno as a ON ec.idalumno = a.identificador
               WHERE ec.estadocurso = 'n/a' AND a.identificador = $1;`
   
   const cursosAct = (await client.query(query2, [alumno.identificador])).rows

   const query3 = `
               SELECT 
                  c.nombre,
                  ec.estadocurso,
                  ec.nota
               FROM curso as c
               INNER JOIN estado_curso as ec ON ec.idcurso = c.identificador
               INNER JOIN alumno as a ON ec.idalumno = a.identificador
               WHERE ec.estadocurso > 'n/a' AND a.identificador = $1`

   const cursosAnt = (await client.query(query3, [alumno.identificador])).rows

   var sum = 0, cont = 0

   for (const elem of cursosAnt) {
      if (elem.estadocurso == 'aprobado') {
         cont++
         sum += elem.nota
      }
   }

   const promedio = sum / cont

   res.render('estadoAlumno', { alumno: alumno, cursosAct: cursosAct, cursosAnt: cursosAnt, promedio: +promedio, titulo: 'Estado académico de un alumno.'})

})

module.exports = router