'use strict'

const express = require('express');
const router = express.Router();

router.post('/persona/operar', async (req, res) => {
   const {
      tipodoc,
      documento,
      nombres,
      apellidos,
      fechanac,
      matricula,
      direccion,
      listCursos
   } = req.body

   if (!(tipodoc && documento && nombres && apellidos && fechanac && matricula && direccion && listCursos))
      return res.redirect('/persona/profesor/nuevo')

   const client = require('../config/dbConnection')

   const query1 = `INSERT INTO persona(tipodoc, documento, nombre, apellido, fechanac, direccion)
                  VALUES($1, $2, $3, $4, $5, $6) RETURNING identificador;`
   const ident = (await client.query(query1, [tipodoc, documento, nombres, apellidos, fechanac, direccion])).rows[0].identificador

   const query2 = `INSERT INTO profesor(idpersona, matricula) VALUES($1, $2) RETURNING identificador;`

   const idProf = (await client.query(query2, [ident, matricula])).rows[0].identificador

   const query3 = `UPDATE curso SET idprofesor = $1 WHERE identificador = $2`

   for (const curso of listCursos)
      await client.query(query3, [idProf, curso])
   res.redirect('/')
})

module.exports = router