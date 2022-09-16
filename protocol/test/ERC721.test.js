const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const {ZERO_ADDRESS} = constants;

const {expect, use} = require('chai');
const {ethers} = require('hardhat');
const {solidity} = require('ethereum-waffle');
const {ids} = require('webpack');
const ether = require('@openzeppelin/test-helpers/src/ether');
use(solidity);

const name = 'Kyyaapp';
const symbol = 'KAP';

describe('ERC721Mock', () => {
  before(async function () {
    [this.initAccount, this.AccountA, this.AccountB] = await ethers.getSigners();

    const ERC721Mock = await ethers.getContractFactory('ERC721URIStorageMock');
    this.contract = await ERC721Mock.deploy(name, symbol);
    await this.contract.deployed();

    this.user1Contract = this.contract.connect(this.initAccount);
    this.userAContract = this.contract.connect(this.AccountA);
    this.userBContract = this.contract.connect(this.AccountB);
  });

  describe('Basic', async function () {
    it('has a name', async function () {
      expect(await this.contract.name()).to.equal(name);
    });

    it('has a symbol', async function () {
      expect(await this.contract.symbol()).to.equal(symbol);
    });

    it('has baseUri;', async function () {
      expect(await this.contract.baseURI()).to.equal('');
    });
  });

  describe('Minting', async function () {
    it('able to mint', async function () {
      const tokenId = 1;
      this.contract.safeMint(this.AccountA.address, tokenId);
      expect(await this.contract.exists(tokenId)).to.equal(true);
      expect(await this.contract.ownerOf(tokenId)).to.equal(this.AccountA.address);
    });
  });

  describe('URI', async function () {
    const baseURI = 'hello';
    const tokenURI = 'bye';
    it('able to set baseURI', async function () {
      this.contract.setBaseURI(baseURI);
      expect(await this.contract.baseURI()).to.equal(baseURI);
    });

    it('set tokenURI', async function () {
      const tokenId = 1;
      this.contract.setTokenURI(tokenId, tokenURI);
      expect(await this.contract.tokenURI(tokenId)).to.equal(baseURI + tokenURI);
    });
  });

  describe('Burn', async function () {
    const tokenId = 2;
    beforeEach(async function () {
      this.contract.safeMint(this.AccountA.address, tokenId);
    });

    it('able to burn', async function () {
      this.contract.burn(tokenId);
      expect(await this.contract.exists(tokenId)).to.equal(false);
    });
  });
});
