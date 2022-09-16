// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  const uri = 'https:kyyaapp.com';

  const ERC1155Mock = await hre.ethers.getContractFactory('ERC1155URIStorageMock');
  const erc1155Mock = await ERC1155Mock.deploy(uri);

  await erc1155Mock.deployed();

  console.log('ERC1155Mock Contract deployed to:', erc1155Mock.address);
  //0x57a29e44dd447fdDE59EA42DfC72F09Fd81Af1f0
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
