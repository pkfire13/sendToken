const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const {ZERO_ADDRESS} = constants;

const {expect, use} = require('chai');
const {ethers} = require('hardhat');
const {solidity} = require('ethereum-waffle');
const {ids} = require('webpack');
const ether = require('@openzeppelin/test-helpers/src/ether');

const toBigNumber = async (number) => {
  return ethers.BigNumber.from(number);
};

const name = 'Kyyaapp';
const symbol = 'KAP';

describe('ERC1155 Mock', function () {
  const URI = 'hello';
  before(async function () {
    [this.initAccount, this.AccountA, this.AccountB] = await ethers.getSigners();

    const ERC1155URIStorageMock = await ethers.getContractFactory('ERC1155URIStorageMock');
    this.contract = await ERC1155URIStorageMock.deploy(URI);
    await this.contract.deployed();

    this.userAContract = this.contract.connect(this.AccountA);
    this.userBContract = this.contract.connect(this.AccountB);
  });

  describe('Minting', async function () {
    const tokenId = 1;
    const amount = 2;

    it('able to mint', async function () {
      const myAddress = this.AccountA.address;
      this.contract.mint(myAddress, tokenId, amount);
      expect(await this.contract.balanceOf(myAddress, tokenId)).to.equal(amount);
    });

    const ids = [2, 3];
    const values = [2, 2];
    it('able to batch mint', async function () {
      const myAddress = this.AccountA.address;
      const addresses = [myAddress, myAddress];
      this.contract.mintBatch(this.AccountA.address, ids, values);

      // console.log('actual', await this.contract.balanceOfBatch(addresses, ids));
      const expected = [await toBigNumber(2), await toBigNumber(2)];
      // console.log('expected', expected);

      expect(await this.contract.balanceOfBatch(addresses, ids)).to.deep.have.same.members(expected);
    });
  });

  describe('URI', async function () {
    const newURI = 'bye';
    const tokenId = 1;

    it('able to setBaseURI', async function () {
      this.contract.setBaseURI(newURI);
    });

    it('able to set URI', async function () {
      await this.contract['setURI(uint256,string)'](tokenId, newURI);
      expect(await this.contract.uri(tokenId)).to.equal(newURI + newURI);
    });
  });

  describe('Transfer', async function () {
    const tokenId = 1;
    const amount = 2;

    it('able to transfer', async function () {
      //transfer 2 from A to B
      await this.userAContract.setApprovalForAll(this.AccountB.address, true);
      expect(
        await this.contract['isApprovedForAll(address,address)'](this.AccountA.address, this.AccountB.address)
      ).to.equal(true);
      await this.userBContract.safeTransferFrom(this.AccountA.address, this.AccountB.address, tokenId, amount, 0x0);
      expect(await this.contract.balanceOf(this.AccountB.address, tokenId)).to.equal(amount);
    });

    it('able to batch transfer', async function () {
      //
      const ids = [2, 3];
      const amounts = [2, 2];
      const addresses = [this.AccountB.address, this.AccountB.address];
      const zeroArray = [await toBigNumber(0), await toBigNumber(0)];

      expect(await this.contract['balanceOfBatch(address[],uint256[])'](addresses, ids)).to.deep.have.same.members(
        zeroArray
      );

      await this.userAContract['safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)'](
        this.AccountA.address,
        this.AccountB.address,
        ids,
        amounts,
        0x0
      );
      // console.log(await this.contract['balanceOfBatch(address[],uint256[])'](addresses, ids));
      const expectedValue = [await toBigNumber(2), await toBigNumber(2)];
      expect(await this.contract['balanceOfBatch(address[],uint256[])'](addresses, ids)).to.deep.have.same.members(
        expectedValue
      );
    });
  });
});
