// contracts/TwoPartyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TwoPartyContract {
    address public partyA;
    address public partyB;
    bool public partyASigned;
    bool public partyBSigned;
    bytes32 public messageA;
    bytes32 public messageB;
    string private constant text = "Deseo ante todo expresar a mis conciudadanos que los ultimos treinta anios de mi vida los consagre exclusivamente al altruismo y al efecto hice mi primer testamento en 1894, legando a la sociedad de Valparaiso una Universidad, pero en el transcurso del tiempo, la experiencia me demostro que aquello era un error y que era de importancia capital levantar al proletario de mi patria, concibiendo un plan, por el cual contribuyo, primeramente con mi obolo a la infancia, enseguida a la Escuela Primaria, de ella a la Escuela de Artes y Oficios y por ultimo al Colegio de Ingenieros, poniendo al alcance del desvalido meritorio llegar al mas alto grado del saber humano";

    constructor(address _partyA, address _partyB, uint randomSeed) {
        require(_partyA != address(0) && _partyB != address(0), "Invalid party addresses");
        partyA = _partyA;
        partyB = _partyB;
        partyASigned = false;
        partyBSigned = false;
        messageA = keccak256(abi.encodePacked(_partyA, _partyB, randomSeed));
        messageB = keccak256(abi.encodePacked(_partyB, _partyA, randomSeed));
    }

    function signAgreement(bytes32 _message) external {
        require(msg.sender == partyA || msg.sender == partyB, "Not authorized to sign");
        
        if (msg.sender == partyA) {
            require(!partyASigned, "Party A already signed");
            require(_message == messageA, "Invalid signature data for Party A");
            partyASigned = true;
        } else if (msg.sender == partyB) {
            require(!partyBSigned, "Party B already signed");
            require(_message == messageB, "Invalid signature data for Party B");
            partyBSigned = true;
        }
    }

    function isFullySigned() external view returns (string memory) {
        if (partyASigned && partyBSigned) {
            return text;
        } else {
            return "Contract not fully signed yet";
        }
    }
}