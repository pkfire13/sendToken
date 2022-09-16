// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

const toBigNumber = async (number) => {
  return ethers.BigNumber.from(number);
};

const toWei = async (number) => {
  return await ethers.utils.parseEther(number.toString());
};

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  const tokenName = 'Kyyaapp';
  const symbol = 'KAP';
  const initialBalance = await toWei(200);
  const initialAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  const ERC20Mock = await hre.ethers.getContractFactory('ERC20Mock');
  const erc20Mock = await ERC20Mock.deploy(tokenName, symbol, initialAccount, initialBalance);

  await erc20Mock.deployed();

  console.log('ERC20Mock Contract deployed to:', erc20Mock.address);
  //0x01b7Fe03c295C7829D82538C8A81Df9389dEcc8D
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
