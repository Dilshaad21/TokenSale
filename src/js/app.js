App = {
  web3Provider: null,
  account: 0x0,
  init: function () {
    console.log("App initialised...");
    return App.initWeb3();
  },
  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      let web3 = Web3();
      web3.setProvider(
        new Web3.providers.HttpProvider("http://localhost:7545")
      );
      //   web3 = new Web3(App.web3Provider);
      App.web3 = web3;
    }
    return App.initContracts();
  },
  contracts: {
    DappTokenSale: null,
  },
  initContracts: function () {
    $.getJSON("DappTokenSale.json", function (dappTokenSale) {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
        console.log("Dapp token sale address", dappTokenSale);
      });
    }).done(() => {
      $.getJSON("DappToken.json", function (dappToken) {
        App.contracts.DappToken = TruffleContract(dappToken);
        App.contracts.DappToken.setProvider(App.web3Provider);
        App.contracts.DappToken.deployed().then(function (dappToken) {
          console.log("Dapp token  address", dappToken);
        });
        App.listenForEvents();
        return App.render();
      });
    });
  },
  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.DappTokenSale.deployed().then(function (instance) {
      instance
        .Sell(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("event triggered", event);
          App.render();
        });
    });
  },
  loading: false,
  tokenPrice: 1000000000000,
  render: async function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    let loader = $("#loader");
    let content = $("#content");
    loader.show();
    content.hide();

    // web3.eth.getAccounts().then(function (accounts) {
    //   console.log(accounts);
    //   //   App.account = accounts[0];
    //   //   $("#accountAddress").html("Your Account: " + account);
    // });
    App.contracts.DappTokenSale.deployed()
      .then((instance) => {
        dappTokenSaleInstance = instance;
        console.log(instance);
        return dappTokenSaleInstance.tokenPrice();
      })
      .then((tokenPrice) => {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(
          web3.fromWei(App.tokenPrice, "ether").toNumber()
        );
        return dappTokenSaleInstance.tokensSold();
      })
      .then((tokensSold) => {
        App.tokensSold = tokensSold.toNumber();
        // App.tokensSold = 500000;
        $(".tokens-sold").html(App.tokensSold);
        $(".tokens-available").html(App.tokensAvailable);

        let progressPercent = 100 * (App.tokensSold / App.tokensAvailable);
        $("#progress").css("width", progressPercent + "%");

        // Load token contract
        App.contracts.DappToken.deployed()
          .then((instance) => {
            dappTokenInstance = instance;
            console.log(App.account);
            return dappTokenInstance.balanceOf(App.account);
          })
          .then((balance) => {
            $(".dapp-balance").html(balance.toNumber());
            App.loading = false;
            loader.hide();
            content.show();
          });
      });

    App.loading = false;
    loader.hide();
    content.show();
  },
  buyTokens: function () {
    $("#content").hide();
    $("#loader").show();
    var numberOfTokens = $("#numberOfTokens").val();
    App.contracts.DappTokenSale.deployed()
      .then(function (instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000, // Gas limit
        });
      })
      .then(function (result) {
        console.log("Tokens bought...");
        $("form").trigger("reset"); // reset number of tokens in form
        // Wait for Sell event
      });
  },
  tokensAvailable: 750000,
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
