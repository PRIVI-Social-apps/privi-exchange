const ERC20TokenExchange = artifacts.require("ERC20TokenExchange");

module.exports = function(deployer, network) {
  if (network == "mainnet") {
    deployer.deploy(
      ERC20TokenExchange
    );
  } else {
    deployer.deploy(
      ERC20TokenExchange
    );
  }
};
