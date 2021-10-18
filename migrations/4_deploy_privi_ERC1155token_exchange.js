const ERC1155TokenExchange = artifacts.require("ERC1155TokenExchange");

module.exports = function(deployer, network) {
  if (network == "mainnet") {
    deployer.deploy(
      ERC1155TokenExchange
    );
  } else {
    deployer.deploy(
      ERC1155TokenExchange
    );
  }
};