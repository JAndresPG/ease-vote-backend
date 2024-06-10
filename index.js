const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Servidor ejecutandose en el puerto ${port}`)
});

require('./rutas/eventos/eventos')(app)
require('./rutas/auth/auth')(app)
require('./rutas/candidatos/candidatos')(app)
require('./rutas/votos/votos')(app)