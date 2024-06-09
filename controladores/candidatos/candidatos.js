const db = require("../../extra/database")
const fs = require("node:fs/promises")
const path = require("path")

let candidatos = {}

candidatos.getPersons = async (req, res) => {
    try {
        const result = await db.query(`
            select cod_persona as key, cedula, nombres, apellidos
            from Personas
        `)

        res.json(result.rows ?? [])
    } catch(e) {
        console.error(e)
        res.status(500).json()
    }
}

candidatos.uploadPhoto = async (req, res) => {
    const { llave } = req.body
    res.json({ llave })
}

candidatos.removePhoto = async (req, res) => {
    const { llave } = req.body
    try {
        await fs.unlink(`./uploads/${llave}`)
        res.json()
    } catch(e) {
        console.log(e)
        res.status(500).json()
    }
}

candidatos.setCandidatos = async (req, res) => {
    const { candidatos, evento } = req.body
    try {
        await db.query('BEGIN')
        await db.query(`delete from candidatos where cod_evento = $1`,[evento])
        await db.query(
            `
                insert into candidatos(cod_persona, cod_evento, foto)
                SELECT 
                    (value->>'cod_persona')::int AS cod_persona,
                    $2, value->>'foto' AS foto
                FROM jsonb_array_elements($1::jsonb) AS elem(value)
            `, 
            [JSON.stringify(candidatos), evento]
        )
        await db.query('COMMIT')
        res.json()
    } catch(e) {
        await db.query('ROLLBACK')
        console.error(e)
        res.status(500).json()
    }
}

candidatos.getCandidates = async (req, res) => {
    const { evento } = req.params
    try {
        const result = await db.query(`
            select c.cod_persona, nombres, apellidos, foto
            from candidatos c
            join personas p on c.cod_persona = p.cod_persona
            where cod_evento = $1
            order by nombres, apellidos
        `, [evento])

        res.json(result.rows ?? [])
    } catch(e) {
        console.error(e)
        res.status(500).json()
    }
}

candidatos.getPhoto = async (req, res) => {
    const { llave } = req.params
    try {
        res.sendFile(path.resolve(`./uploads/${llave}`))
    } catch(e) {
        console.log(e)
        res.status(400).send('imagen no encontrada')
    }
}

module.exports = candidatos