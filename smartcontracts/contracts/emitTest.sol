// contracts/emitTest.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract emitTest {
    event PartySigned(address indexed party);

    function call() external {
        emit PartySigned(msg.sender);
    }
}