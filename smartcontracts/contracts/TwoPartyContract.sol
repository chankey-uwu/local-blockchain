// contracts/TwoPartySignature.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TwoPartySignature {
    address public partyA;
    address public partyB;
    bool public partyASigned;
    bool public partyBSigned;

    event ContractCreated(address indexed partyA, address indexed partyB);
    event PartySigned(address indexed party);

    constructor(address _partyA, address _partyB) {
        require(_partyA != address(0) && _partyB != address(0), "Invalid party addresses");
        partyA = _partyA;
        partyB = _partyB;
        emit ContractCreated(partyA, partyB);
    }

    receive() external payable {
        require(msg.sender == partyA || msg.sender == partyB, "Not authorized to sign");

        if (msg.sender == partyA) {
            require(!partyASigned, "Party A already signed");
            partyASigned = true;
        } else if (msg.sender == partyB) {
            require(!partyBSigned, "Party B already signed");
            partyBSigned = true;
        }

        emit PartySigned(msg.sender);
    }

    function isFullySigned() external view returns (bool) {
        return partyASigned && partyBSigned;
    }
}