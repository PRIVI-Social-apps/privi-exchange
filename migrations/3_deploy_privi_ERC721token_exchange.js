const ERC721TokenExchange = artifacts.require("ERC721TokenExchange");

module.exports = function(deployer, network) {
  if (network == "mainnet") {
    deployer.deploy(
      ERC721TokenExchange
    );
  } else {
    deployer.deploy(
      ERC721TokenExchange
    );
  }
};
