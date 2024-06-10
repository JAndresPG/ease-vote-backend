const { verifyToken } = require('../../extra/jwt')
const Web3 = require("web3").default
const db = require("../../extra/database")
const Easy_Vote = require("../../build/contracts/EasyVote.json")

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))

module.exports = async (app) => {

    try {
        // Get contract instance
        const networkId = await web3.eth.net.getId();
        const easyVote = new web3.eth.Contract(
            Easy_Vote.abi,
            Easy_Vote.networks[networkId].address
        );

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        app.post("/api/votos", verifyToken, async (req, res) => {
            const { id, candidatos, evento } = req.body
            try {
                const { registrarVoto } = easyVote.methods;
                await db.query('BEGIN')
                await db.query(`
                    insert into voto_evento(cod_persona, cod_evento)
                    values($1, $2)
                `, [id, evento])
                const gasEstimate = await registrarVoto(parseInt(id), candidatos.map(Number), evento).estimateGas({ from: account });
                await registrarVoto(parseInt(id), candidatos.map(Number), evento).send({ from: account, gas: gasEstimate })
                await db.query('COMMIT')
                res.json()
            } catch(e) {
                await db.query('ROLLBACK')
                console.error(e)
                res.status(500).json()
            }
        })

        app.get("/api/votos/:evento", verifyToken, async (req, res) => {
            const { evento } = req.params
            try {
                // const votos = await easyVoteContract.obtenerResultadoProcesoElectoral(evento)
                const { obtenerResultadoProcesoElectoral } = easyVote.methods;
                const votos = await obtenerResultadoProcesoElectoral(evento).call()

                // const result = await db.query(`
                //     SELECT p.nombres,
                //     elemento ->> 'votos' AS votos
                // FROM personas p
                // JOIN json_array_elements('[{"candidato":"9","votos":"1"}]') AS elemento
                // ON cast((elemento ->> 'candidato') as bigint) = p.cod_persona;
                // `, [])

                res.json({
                    candidatosVotos: votos.candidatosVotos.map(({candidato, votos}) => (
                        { candidato: candidato.toString(), votos: votos.toString()}
                    )),
                    votosEnBlanco: votos.votosEnBlanco.toString(),
                    votosNulos: votos.votosNulos.toString(),
                })
            } catch(e) {
                console.error(e)
                res.status(500).json()
            }
        })

    } catch (error) {
      console.error("Could not connect to contract or chain");
    }
    
}