const auth = require('../../controladores/auth/auth')
const { verifyToken } = require('../../extra/jwt')

module.exports = (app) => {
    app.post("/login", auth.login)
    app.post("/register", auth.register)
    app.post("/get-user-data", verifyToken, auth.getUserData)
}