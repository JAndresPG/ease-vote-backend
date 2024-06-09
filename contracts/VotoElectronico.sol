// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importación de la interfaz ERC2771Context
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

// Declaración del contrato que utiliza ERC2771Forwarder
contract VotoElectronico is ERC2771Context {
    
    // Estructura para representar un voto
    struct Voto {
        uint256 votante;
        uint256[] candidatos;
        uint256 procesoElectoral;
    }

    // Estructura para representar el resultado de un proceso electoral
    struct ResultadoProcesoElectoral {
        uint256[] candidatos;
        uint256[] votosPorCandidato;
        uint256 votosEnBlanco;
        uint256 votosNulos;
    }
    
    // Mapeo para almacenar los votos por índice
    mapping(uint256 => mapping(uint256 => Voto)) public votos;
    // Mapeo para contar los votos por candidato en cada proceso electoral
    mapping(uint256 => mapping(uint256 => uint256)) public votosPorCandidato; // votosPorCandidato[procesoElectoral][candidato] = count
    // Mapeo para contar votos en blanco por proceso electoral
    mapping(uint256 => uint256) public votosEnBlanco; // votosEnBlanco[procesoElectoral] = count
    // Mapeo para contar votos nulos por proceso electoral
    mapping(uint256 => uint256) public votosNulos; // votosNulos[procesoElectoral] = count
    
    // Constructor para inicializar el forwarder
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}
    
    // Función para registrar un voto
    function registrarVoto(uint256 _votante, uint256[] memory _candidatos, uint256 _procesoElectoral) public {
        _registerVoto(_votante, _candidatos, _procesoElectoral);
    }
    
    // Función interna para registrar un voto
    function _registerVoto(uint256 _votante, uint256[] memory  _candidatos, uint256 _procesoElectoral) internal {
        votos[_votante][_procesoElectoral] = Voto(_votante, _candidatos, _procesoElectoral);

        // Contabilizar el voto según sea en blanco, nulo o válido
        if (_candidatos.length == 0) {
            votosEnBlanco[_procesoElectoral] += 1;
        } else if (_candidatos.length > 1) {
            votosNulos[_procesoElectoral] += 1;
        } else {
            votosPorCandidato[_procesoElectoral][_candidatos[0]] += 1;
        }
    }

    // Función para obtener el número de votos por candidato en un proceso electoral
    function obtenerVotosPorCandidato(uint256 _procesoElectoral, uint256 _candidato) public view returns (uint256) {
        return votosPorCandidato[_procesoElectoral][_candidato];
    }
    
    // Función para obtener el número de votos en blanco en un proceso electoral
    function obtenerVotosEnBlanco(uint256 _procesoElectoral) public view returns (uint256) {
        return votosEnBlanco[_procesoElectoral];
    }
    
    // Función para obtener el número de votos nulos en un proceso electoral
    function obtenerVotosNulos(uint256 _procesoElectoral) public view returns (uint256) {
        return votosNulos[_procesoElectoral];
    }

    // Función para obtener el resultado completo de un proceso electoral
    function obtenerResultadoProcesoElectoral(uint256 _procesoElectoral) public view returns (ResultadoProcesoElectoral memory) {
        // Crear arrays temporales para almacenar candidatos y sus votos
        uint256[] memory candidatos;
        uint256[] memory votosCandidatos;

        // Contar el número de candidatos
        uint256 count = 0;
        for (uint256 i = 0; i < 256; i++) {
            if (votosPorCandidato[_procesoElectoral][i] > 0) {
                count++;
            }
        }

        // Inicializar los arrays con el tamaño correcto
        candidatos = new uint256[](count);
        votosCandidatos = new uint256[](count);

        // Rellenar los arrays con los datos de los candidatos y sus votos
        uint256 index = 0;
        for (uint256 i = 0; i < 256; i++) {
            if (votosPorCandidato[_procesoElectoral][i] > 0) {
                candidatos[index] = i;
                votosCandidatos[index] = votosPorCandidato[_procesoElectoral][i];
                index++;
            }
        }

        // Crear y devolver la estructura con el resultado del proceso electoral
        return ResultadoProcesoElectoral({
            candidatos: candidatos,
            votosPorCandidato: votosCandidatos,
            votosEnBlanco: votosEnBlanco[_procesoElectoral],
            votosNulos: votosNulos[_procesoElectoral]
        });
    }
}