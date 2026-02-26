require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    kurtosis: {
      url: "http://127.0.0.1:32003", // Puerto de tu nodo RPC en Kurtosis
      chainId: 585858,
    },
  },
};