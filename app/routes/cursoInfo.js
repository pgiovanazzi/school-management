'use strict'

const express = require('express');
const router = express.Router();

router.post('/info/consulta', async (req, res) => {
   const client = require('../config/dbConnection')

   const cursoId  = req.body.cursos

   const query = `SELECT identificador, nombre FROM curso`

   const { rows } = await client.query(query)

   const query1 = `
                  SELECT p.nombre, p.apellido FROM persona as p 
                  INNER JOIN profesor as pro ON pro.idpersona = p.identificador
                  INNER JOIN curso as c ON pro.identificador = c.idprofesor 
                  WHERE c.identificador = $1`
   
   const profesor = (await client.query(query1, [cursoId])).rows[0]

   console.log(profesor)

   const query2 = `
                  SELECT p.nombre, p.apellido FROM persona as p
                  INNER JOIN alumno as a ON a.idpersona = p.identificador
                  INNER JOIN inscripciones_curso as ic ON a.identificador = ic.idalumno
                  WHERE ic.idcurso = $1`

   const alumnos = (await client.query(query2, [cursoId])).rows
   console.log(alumnos)
   
   var nombreCurso;
   for (const curso of rows) {
      if (cursoId == curso.identificador)
         nombreCurso = curso.nombre
   }
   res.render('cursoInfo', {
      profesor: profesor, alumnos: alumnos, cursos: rows, cursoNom: nombreCurso, titulo: 'Alumnos inscriptos y docente correspondiente al curso.'})

})


module.exports = router