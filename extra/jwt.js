const jwt = require("jsonwebtoken")

const keyEncrypt = '$2a$06$/jfSFwvfvpqbH98jbGGFROl/z.Q9GeXw.vI4d30PviKFoVuXn9cxS'

const login = (data) => {
    return jwt.sign({
        data
    }, keyEncrypt, { expiresIn: '4h' });
}

const verifyToken = (req, res, next) => {
    const { authorization } = req.headers

    if(!authorization) {
        res.status(401).send()
        return
    }

    if(!authorization.startsWith('Bearer ')) {
        res.status(401).send()
        return
    }

    try {
        jwt.verify(authorization.replace('Bearer ', ''), keyEncrypt, (err, decoded) => {
            if(err) {
                res.status(401).json({ name: err.name })
                return
            }
            if(req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
                req.body = { ...req.body, ...decoded.data }
                next()
            } else {
                req.query = { ...req.query, ...decoded.data }
                next()
            }
        })
    } catch(e) {
        res.status(500).send()
    }
}

module.exports = {
    login,
    verifyToken
}