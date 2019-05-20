'use strict'

let express = require('express');
let router = express.Router();

router.post('/persona/operar', async (req, res, next) => {
   const client = require('../config/dbConnection')

   const {
      id,
      tipodoc,
      documento,
      nombres,
      apellidos,
      fechanac,
      legajo,
      direccion,
      carrera
   } = req.body

   if (!(tipodoc && documento && nombres && apellidos && fechanac && legajo && direccion && carrera))
      return res.redirect('/persona/nuevo')
   
   if (req.body.id === '') { // Registrar un alumno
      const idPersona = (await client.query(`
         INSERT INTO persona(tipodoc, documento, nombre, apellido, fechanac, direccion) 
         VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING identificador;`,
         [
            tipodoc,
            documento,
            nombres,
            apellidos,
            fechanac,
            direccion
         ]
      )).rows[0].identificador
      
      const idAlumno = (await client.query(`
         INSERT INTO alumno(idpersona, legajo) 
         VALUES ($1,$2) RETURNING identificador;`,
         [
            idPersona,
            legajo
         ]
      )).rows[0].identificador
      
      await client.query(
         `INSERT INTO inscripciones_carrera VALUES ($1, $2)`,
         [
            idAlumno,
            carrera
         ]
      )

      res.redirect('/')
   
   } else { // Editar datos de alumno

      const q1 = `
      UPDATE persona 
      SET tipodoc = $1, documento = $2, nombre = $3, apellido = $4, fechanac = $5, direccion = $6 
      WHERE identificador = $7;`
      await client.query(q1,
         [
            tipodoc,
            documento,
            nombres,
            apellidos,
            fechanac,
            direccion,
            id
         ]
      )
      const q2 = "UPDATE alumno SET legajo = $1 WHERE idpersona = $2;"
      await client.query(q2, [legajo, id])
      const q3 = `
      UPDATE inscripciones_carrera SET idcarrera = $1
      WHERE idalumno = (SELECT a.identificador FROM persona as p INNER JOIN alumno as a ON p.identificador = a.idpersona WHERE p.identificador = $2);`

      await client.query(q3, [carrera, id])
      res.redirect('/')
   }
})

module.exports = router;