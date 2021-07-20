let DappTokenSale = artifacts.require("./DappTokenSale");
let DappToken = artifacts.require("./DappToken");

contract("DappTokenSale", (accounts) => {
  let tokenPrice = 1000000000000;
  let buyer = accounts[1];
  let tokenSaleInstance, tokenInstance;
  let numberOfTokens = 10;
  let tokenAvailable = 750000;
  let admin = accounts[0];
  it("initialises the contract with the correct values", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return DappTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        // assert.equal(address, 0x0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        // assert.equal(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "token price is correct");
      });
  });

  it("facilitates token buying", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return DappTokenSale.deployed();
      })
      .then((tokenSaleInstance) => {
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokenAvailable,
          { from: admin }
        );
      })
      .then((receipt) => {
        let value = numberOfTokens * tokenPrice;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: value,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(receipt.logs[0].event, "Sell", "should be the Sell event");
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then((amount) => {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold"
        );
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), tokenAvailable - numberOfTokens);
        // Try to buy greater number of tokens
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        console.log(error.message);
        assert.equal(
          error.message.indexOf("revert") >= 0,
          "cannot purchase more tokens than available"
        );
      });
  });

  it("ends token sale", () => {
    return DappToken.deployed()
      .then((tokenInstance) => {
        return DappTokenSale.deployed();
      })
      .then((instance) => {
        tokenInstance = instance;
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((error) => {
        assert.equal(
          error.message.indexOf("revert") >= 0,
          "must be admin to end sale"
        );
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then((receipt) => {
        tokenInstance.balanceOf(admin);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          999990,
          "returns all unsold dapp tokens to admin"
        );
      });
  });
});
