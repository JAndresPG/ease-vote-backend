const Easy_Vote = require("../build/contracts/EasyVote.json")

var easyVoteContract = {
  web3: null,
  easyVote: null,

  start: async function () {
    const { web3 } = this;

    try {
      // Get contract instance
      const networkId = await web3.eth.net.getId();
      this.easyVote = new web3.eth.Contract(
        Easy_Vote.abi,
        Easy_Vote.networks[networkId].address
      );

    } catch (error) {
      console.error("Could not connect to contract or chain");
    }
  },
  registrarVoto: async (votante, candidatos, procesoElectoral) => {
    try {
      const { registrarVoto } = this.easyVote.methods;
      await registrarVoto(votante, candidatos, procesoElectoral).call()
    } catch(e) {
        console.error("no se pudo registrar el voto", e)
    }
  },
  obtenerResultadoProcesoElectoral: async (procesoElectoral) => {
    try {
      const { obtenerResultadoProcesoElectoral } = this.easyVote.methods;
      const votos = await obtenerResultadoProcesoElectoral(procesoElectoral).call()
      return votos
    } catch (e) {
      console.error("No se pudo obtener los votos", e)
    }
  },

};

module.exports = {
  easyVoteContract
}