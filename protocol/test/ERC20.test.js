const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const {ZERO_ADDRESS} = constants;

const {expect, use} = require('chai');
const {ethers} = require('hardhat');
const {solidity} = require('ethereum-waffle');
const {ids} = require('webpack');
const ether = require('@openzeppelin/test-helpers/src/ether');
use(solidity);

const toBigNumber = async (number) => {
  return ethers.BigNumber.from(number);
};

const toWei = async (number) => {
  return await ethers.utils.parseEther(number.toString());
};

const name = 'Kyyaapp';
const symbol = 'Kap';
const initialBalance = toWei('100');

describe('ERC20 Mock', function () {
  before(async function () {
    [this.initAccount, this.AccountA, this.AccountB] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
    this.token = await ERC20Mock.deploy(name, symbol, this.initAccount.address, initialBalance);
    await this.token.deployed();
  });

  describe('Basic', async function () {
    it('has a name', async function () {
      expect(await this.token.name()).to.equal(name);
    });

    it('has a symbol', async function () {
      expect(await this.token.symbol()).to.equal(symbol);
    });

    it('has 18 decimals', async function () {
      expect(await this.token.decimals()).to.be.equal(18);
    });
  });

  describe('Minting', () => {
    it('minted', async function () {
      const amt = await toWei(200);
      this.token.mint(this.AccountA.address, amt);
      //   console.log(await this.token.balanceOf(this.toAccount.address));
      expect(await this.token.balanceOf(this.AccountA.address)).to.equal(amt);
    });
  });

  describe('Transfer', () => {
    //transfer 50 from initaccount to toAccount

    it('transfered', async function () {
      const amt = await toWei(50);
      const expectedAmount = await toWei(250);
      this.token.transferInternal(this.initAccount.address, this.AccountA.address, amt);
      expect(await this.token.balanceOf(this.AccountA.address)).to.equal(expectedAmount);
    });
  });

  describe('Approve', () => {
    it('approve', async function () {
      const amt = await toWei(25);
      await this.token.approveInternal(this.initAccount.address, this.initAccount.address, amt);
      expect(await this.token.allowance(this.initAccount.address, this.initAccount.address)).to.equal(amt);

      this.token.transferFrom(this.initAccount.address, this.AccountB.address, amt);
      expect(await this.token.balanceOf(this.AccountB.address)).to.equal(amt);
    });
  });
});
