const EasyVote = artifacts.require("EasyVote");

module.exports = function (deployer, network, accounts) {
  // const trustedForwarderAddress  = '0xC38d9391016F10E5E22D3a7A29ac4Dd371087D5e';
  const trustedForwarderAddress  = accounts[0];
  deployer.deploy(EasyVote, trustedForwarderAddress);
};