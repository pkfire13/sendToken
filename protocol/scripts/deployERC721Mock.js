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
  const tokenName = 'Kyyaapp';
  const symbol = 'KAP';
  const initialAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  const ERC721Mock = await hre.ethers.getContractFactory('ERC721URIStorageMock');
  const erc721Mock = await ERC721Mock.deploy(tokenName, symbol);

  await erc721Mock.deployed();

  console.log('ERC721Mock Contract deployed to:', erc721Mock.address);
  //0xAbf389422480EbFA5dC2F9F5D356B7ba876c6b95
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
