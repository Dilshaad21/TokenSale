const DappToken = artifacts.require("./DappToken.sol");
const DappTokenSale = artifacts.require("./DappTokenSale.sol");
module.exports = function (deployer) {
  let tokenPrice = 1000000000000;
  deployer.deploy(DappToken, 1000000).then(() => {
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};
