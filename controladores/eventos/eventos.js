const db = require("../../extra/database")

let eventos = {}

eventos.getEventos = async (req, res) => {
    try {
        const result = await db.query(`
            select Cod_Evento as key, nombre, to_char(inicio, 'DD/MM/YYYY HH24:MI') as inicio, to_char(fin, 'DD/MM/YYYY HH24:MI') as fin
            from Eventos
            order by inicio DESC
        `)

        res.json(result.rows ?? [])
    } catch(e) {
        console.error(e)
        res.status(500).json()
    }
}

eventos.setEventos = async (req, res) => {
    const { nombre, inicio, fin } = req.body
    try {
        await db.query(
            `insert into Eventos(Nombre, Inicio, Fin) values($1, $2::timestamp, $3::timestamp)`, 
            [nombre, inicio, fin]
        )
        res.json()
    } catch(e) {
        console.error(e)
        res.status(500).json()
    }
}

eventos.getCurrentEvents = async (req, res) => {
    const { id } = req.query
    try {
        const eventos = await db.query(`
            select cod_evento, nombre, fin
            from eventos e
            where now() between e.inicio and e.fin and not exists(
                select 1
                from voto_evento ve 
                where ve.cod_persona = $1 and e.cod_evento = ve.cod_evento
            )
            order by e.fin
        `, [id])

        res.json(eventos.rows ?? [])
    } catch(e) {
        console.error(e)
        res.status(500).json()
    }
}

module.exports = eventos