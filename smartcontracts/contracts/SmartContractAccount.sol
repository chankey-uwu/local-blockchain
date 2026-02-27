// contracts/SmartContractAccount.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SmartContractAccount {
    address public owner;
    event Received(address indexed sender, uint256 amount);
    event FallbackCalled(address indexed sender, uint256 amount, bytes data);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }

    function execute(address dest, uint256 value, bytes calldata data) external {
        require(msg.sender == owner, "Only owner can execute transactions");
        (bool success, ) = dest.call{value: value}(data);
        require(success, "Transaction failed");
    }
}