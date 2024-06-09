const eventos = require('../../controladores/eventos/eventos')
const { verifyToken } = require('../../extra/jwt')

module.exports = (app) => {
    app.get("/api/eventos", verifyToken, eventos.getEventos)
    app.post("/api/eventos", verifyToken, eventos.setEventos)
    app.get("/api/get-current-events", verifyToken, eventos.getCurrentEvents)
}