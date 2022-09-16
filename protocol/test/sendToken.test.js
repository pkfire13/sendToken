const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const {ZERO_ADDRESS} = constants;

const {expect, use} = require('chai');
const {ethers} = require('hardhat');
const {solidity} = require('ethereum-waffle');
const {ids} = require('webpack');
const ether = require('@openzeppelin/test-helpers/src/ether');
const balance = require('@openzeppelin/test-helpers/src/balance');

const toBigNumber = async (number) => {
  return ethers.BigNumber.from(number);
};

//ERC20 Test Params
const name = 'Kyyaapp';
const symbol = 'KAP';

describe('sendToken Contract Tests', function () {
  before(async function () {
    const initialBalance = await toBigNumber('100');

    [this.AccountA, this.AccountB, this.AccountC] = await ethers.getSigners();

    this.recipients = [this.AccountB.address, this.AccountC.address];

    this.trackerA = await balance.tracker(this.AccountA.address);
    this.trackerB = await balance.tracker(this.AccountB.address);
    this.trackerC = await balance.tracker(this.AccountC.address);

    this.provider = ethers.provider;

    //define sendToken contract
    let contract = await ethers.getContractFactory('SendToken');
    this.SendTokenContract = await contract.deploy();
    await this.SendTokenContract.deployed();

    //define ERC20 Contract
    contract = await ethers.getContractFactory('ERC20Mock');
    this.ERC20Contract = await contract.deploy(name, symbol, this.AccountA.address, initialBalance);
    await this.ERC20Contract.deployed();

    //define ERC721 Contract
    contract = await ethers.getContractFactory('ERC721URIStorageMock');
    this.ERC721Contract = await contract.deploy(name, symbol);
    await this.ERC721Contract.deployed();

    //mint ERC721 ids to AccountA
    await this.ERC721Contract.safeMint(this.AccountA.address, 1);
    await this.ERC721Contract.safeMint(this.AccountA.address, 2);

    //define ERC1155 Contract
    const uri = 'https:kyyaapp.io/{id}';
    contract = await ethers.getContractFactory('ERC1155URIStorageMock');
    this.ERC1155Contract = await contract.deploy(uri);
    await this.ERC1155Contract.deployed();

    //mint ERC1155 ids and amount
    const ids = [1, 2, 3, 4];
    const values = [3, 3, 3, 3];
    await this.ERC1155Contract.mintBatch(this.AccountA.address, ids, values);

    //connect
    this.userASendTokenContract = this.SendTokenContract.connect(this.AccountA);
    this.userAERC20Contract = this.ERC20Contract.connect(this.AccountA);
    this.userAERC721Contract = this.ERC721Contract.connect(this.AccountA);
    this.userAERC1155Contract = this.ERC1155Contract.connect(this.AccountA);
  });

  describe('sendNativeCoin Tests', async function () {
    const values = [ethers.utils.parseEther('5'), ethers.utils.parseEther('5')];
    const invalidValues = [5, 5, 5];

    describe('Revert Test Cases', async function () {
      it('should revert if length of _recipients does not equal length of _values', async function () {
        let revertMsg = "'SendToken: 1'";
        await expect(this.SendTokenContract.sendNativeCoin(this.recipients, invalidValues)).to.be.revertedWith(
          revertMsg
        );
      });
    });

    describe('Use Test Cases', async function () {
      it('should send native coins to recipients', async function () {
        //before
        // const BalanceA = await this.provider.getBalance(this.AccountA.address);
        const BalanceA = await this.trackerA.get();
        const BalanceB = await this.trackerB.get();
        const BalanceC = await this.trackerC.get();

        //after
        const receipt = await this.userASendTokenContract.sendNativeCoin(this.recipients, values, {
          value: ethers.utils.parseEther('10'),
        });
        let {delta, fees} = await this.trackerA.deltaWithFees();
        expect(delta.sub(fees)).to.be.bignumber.lessThan(ether('-10'));

        delta = await this.trackerB.delta();
        expect(delta).to.be.bignumber.equal(ether('5'));

        delta = await this.trackerC.delta();
        expect(delta).to.be.bignumber.equal(ether('5'));
      });
    });
  });

  describe('sendERC20Token Tests', async function () {
    const values = [5, 5];
    const invalidValues = [5, 5, 5];

    describe('Revert Test Cases', async function () {
      it('should revert if length of _recipients does not equal length of _values', async function () {
        let revertMsg = "'SendToken: 2'";
        await expect(
          this.SendTokenContract.sendERC20Token(this.ERC20Contract.address, this.recipients, invalidValues)
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if no approval is made before', async function () {
        //
        let revertMsg = "'ERC20: insufficient allowance'";
        await expect(
          this.userASendTokenContract.sendERC20Token(this.ERC20Contract.address, this.recipients, values)
        ).to.be.revertedWith(revertMsg);
      });
    });

    describe('Use Test Cases', async function () {
      it('should send ERC20 tokens to recipients', async function () {
        //before
        const BalanceA = await this.ERC20Contract.balanceOf(this.AccountA.address);
        const BalanceB = await this.ERC20Contract.balanceOf(this.AccountB.address);
        const BalanceC = await this.ERC20Contract.balanceOf(this.AccountC.address);

        //approve
        await this.userAERC20Contract.approve(this.SendTokenContract.address, 10);
        expect(await this.ERC20Contract.allowance(this.AccountA.address, this.SendTokenContract.address)).to.be.equal(
          10
        );

        //after
        await this.userASendTokenContract.sendERC20Token(this.ERC20Contract.address, this.recipients, values);

        expect(await this.ERC20Contract.balanceOf(this.AccountA.address)).to.be.bignumber.equal(90);
        expect(await this.ERC20Contract.balanceOf(this.AccountB.address)).to.be.bignumber.equal(5);
        expect(await this.ERC20Contract.balanceOf(this.AccountC.address)).to.be.bignumber.equal(5);
      });
    });
  });

  describe('sendERC721Token Tests', async function () {
    const ids = [1, 2];
    const invalidIds = [1, 2, 3];
    const invalidIds2 = [1, 100];

    describe('Revert Test Cases', async function () {
      it('should revert if length of _recipients does not equal length of _ids', async function () {
        let revertMsg = "'SendToken: 3'";
        await expect(
          this.userASendTokenContract.sendERC721Token(this.ERC721Contract.address, this.recipients, invalidIds)
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if the id does not exist in the ERC721 contract', async function () {
        //
        let revertMsg = "'ERC721: operator query for nonexistent token'";
        await this.userAERC721Contract.approve(this.SendTokenContract.address, 1);

        await expect(
          this.userASendTokenContract.sendERC721Token(this.ERC721Contract.address, this.recipients, invalidIds2)
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if no approval is made', async function () {
        let revertMsg = "'ERC721: transfer caller is not owner nor approved'";
        await expect(
          this.userASendTokenContract.sendERC721Token(this.ERC721Contract.address, this.recipients, ids)
        ).to.be.revertedWith(revertMsg);
      });
    });

    describe('Use Test Cases', async function () {
      it('should send ERC721 tokens to recipients', async function () {
        //before
        expect(await this.ERC721Contract.ownerOf(1)).to.equal(this.AccountA.address);
        expect(await this.ERC721Contract.ownerOf(2)).to.equal(this.AccountA.address);

        //approve
        // await this.userAERC721Contract.approve(this.SendTokenContract.address, 1);
        // await this.userAERC721Contract.approve(this.SendTokenContract.address, 2);
        await this.userAERC721Contract.setApprovalForAll(this.SendTokenContract.address, true);

        //transfer
        await this.userASendTokenContract.sendERC721Token(this.ERC721Contract.address, this.recipients, ids);

        //after
        expect(await this.ERC721Contract.ownerOf(1)).to.equal(this.AccountB.address);
        expect(await this.ERC721Contract.ownerOf(2)).to.equal(this.AccountC.address);
      });
    });
  });

  describe('sendERC1155Token Tests', async function () {
    const ids = [1, 2];
    const values = [3, 3];

    const invalidIds = [1, 2, 4];
    const invalidIds2 = [1, 440];
    const invalidValues = [3, 3, 3];
    const invalidValues2 = [8, 8];
    describe('Revert Test Cases', async function () {
      it('should revert if length of _recipients does not equal length of _ids', async function () {
        //
        let revertMsg = "'SendToken: 4'";
        await expect(
          this.userASendTokenContract.sendERC1155Token(
            this.ERC1155Contract.address,
            this.recipients,
            invalidIds,
            values
          )
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if the length of _ids != length of _values', async function () {
        let revertMsg = "'SendToken: 5'";
        await expect(
          this.userASendTokenContract.sendERC1155Token(
            this.ERC1155Contract.address,
            this.recipients,
            ids,
            invalidValues
          )
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if no approval has been made', async function () {
        //
        let revertMsg = "'ERC1155: caller is not owner nor approved'";
        await expect(
          this.userASendTokenContract.sendERC1155Token(this.ERC1155Contract.address, this.recipients, ids, values)
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if one id is nonexistent', async function () {
        //approve
        await this.userAERC1155Contract.setApprovalForAll(this.SendTokenContract.address, true);
        let revertMsg = "'ERC1155: insufficient balance for transfer'";
        await expect(
          this.userASendTokenContract.sendERC1155Token(
            this.ERC1155Contract.address,
            this.recipients,
            invalidIds2,
            values
          )
        ).to.be.revertedWith(revertMsg);
      });

      it('should revert if user request to transfer more than balance', async function () {
        let revertMsg = "'ERC1155: insufficient balance for transfer'";
        await expect(
          this.userASendTokenContract.sendERC1155Token(
            this.ERC1155Contract.address,
            this.recipients,
            ids,
            invalidValues2
          )
        ).to.be.revertedWith(revertMsg);
      });
    });

    describe('Use Test Cases', async function () {
      it('should send ERC1155 tokens to recipients', async function () {
        //before
        const addressA = this.AccountA.address;
        const addresses = [addressA, addressA, addressA, addressA];
        const allIds = [1, 2, 3, 4];
        const amt = await toBigNumber(3);
        const expected = [amt, amt, amt, amt];
        expect(await this.ERC1155Contract.balanceOfBatch(addresses, allIds)).to.deep.have.same.members(expected);

        //approve
        await this.userAERC1155Contract.setApprovalForAll(this.SendTokenContract.address, true);

        //transfer
        await this.userASendTokenContract.sendERC1155Token(this.ERC1155Contract.address, this.recipients, ids, values);

        //after
        const newExpected = [amt, amt];
        expect(await this.ERC1155Contract.balanceOfBatch(this.recipients, ids)).to.deep.have.same.members(newExpected);
      });
    });
  });
});
