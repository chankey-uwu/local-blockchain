require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    kurtosis: {
      url: "http://127.0.0.1:32003",
      chainId: 585858,
    },
    mainnet: {
      url: "https://eth-mainnet.g.alchemy.com/v2/mXaADGzvNO3m6igVuTT7-",
      chainId: 1
    },
  },
};