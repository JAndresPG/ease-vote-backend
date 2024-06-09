const db = require("../../extra/database")
const { login } = require("../../extra/jwt")

let auth = {}

auth.getUserData = async (req, res) => {
    const { id } = req.body
    
    try {
        const result = await db.query(`
            select cod_persona as id, cedula, nombres, apellidos, correo, cod_perfil
            from Personas
            where Cod_Persona = $1
        `, [ id ])

        if((result.rows ?? []).length <= 0) {
            res.status(401).json()
            return
        }

        res.json(result.rows[0])
    } catch(e) {
        res.status(500).json()
    }
}

auth.login = async (req, res) => {
    const { cedula, password } = req.body
    if(!cedula || !password) {
        res.status(400).json()
        return
    }
    try {
        const result = await db.query(`
            select cod_persona as id
            from Personas
            where Cedula = $1 and Contrasena = crypt($2, Contrasena)
        `, [cedula, password])

        if((result.rows ?? []).length <= 0) {
            res.status(401).json()
            return
        }

        const token = login(result.rows[0])

        res.json({ token })
    } catch(e) {
        console.log(e)
        res.status(500).json()
    }
}

auth.register = async (req, res) => {
    const { cedula, nombres, apellidos, correo, password, repassword } = req.body

    if(!cedula || !nombres || !apellidos || !correo || !password) {
        res.status(400).json()
        return
    }

    if(password != repassword) {
        res.status(400).json("Las contraseñas no coinciden")
        return
    }

    try {
        await db.query(
            `insert into personas(Cedula, Nombres, Apellidos, Correo, Contrasena, Cod_Perfil)
             values($1, $2, $3, $4, $5, 2)`, 
            [cedula, nombres, apellidos, correo, password]
        )

        res.json()
    } catch(e) {
        console.log(e)
        res.status(500).json()
    }
}

module.exports = auth