import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
const chai = require('chai');
const BN = require('bn.js');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

describe("LeavingATip", function() {
    async function deployLeavingATipToken() {
        // Contracts are deployed using the first signer/account by default                                            
        const [owner, other] = await ethers.getSigners();

        const LeavingATip = await ethers.getContractFactory("LeavingATip");
        const testToken = deployTestToke();
        
        const tokenAddress = (await testToken).address;

        const leavingATip = await upgrades.deployProxy(LeavingATip, [[tokenAddress]], {
            initializer: "initialize",
        });

        await leavingATip.deployed();

        return { leavingATip, owner, testToken, other};
    }

    async function deployTestToke() {
        const TestToken = await ethers.getContractFactory("TestToken");
        const testToken = await TestToken.deploy();

        return testToken;
    }

    describe("Development", function() {
        it("Should set the right owner", async function() {
            const { leavingATip, owner } = await deployLeavingATipToken();

            expect(await leavingATip.owner()).to.equal(owner.address);
        });
    });

    describe("Leave", function() {
        it("should return 1000", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            const totalSupply = await (await testToken).totalSupply();
            const balance = await (await testToken).balanceOf(owner.address);

            expect(totalSupply).to.equal(balance);
        });

        it("should have 50", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            (await testToken).approve(owner.address, 50);
            (await testToken).transferFrom(owner.address, other.address, 50);        
            const balance = await (await testToken).balanceOf(other.address);

            expect(balance).to.equal(50);
        });

        it("should receive 50", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            const contractBalance1 = await (await testToken).balanceOf(leavingATip.address);
            const senderBalance1 = await (await testToken).balanceOf(owner.address);
            
            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test", 50, {from: owner.address});

            const contractBalance2 = await (await testToken).balanceOf(leavingATip.address);
            expect(contractBalance2).to.equal(contractBalance1.add(50));

            const senderBalance2 = await (await testToken).balanceOf(owner.address);
            expect(senderBalance2).to.equal(senderBalance1.sub(50))

            expect(tx.value.toString()).to.equal('0');
        });

        it("should receive tokenId: 0 and 1", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});
            expect(tx.value.toString()).to.equal('0');
        });

        it("should not leave tip equal and less than 0", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();
            let err = null
            try{
                await leavingATip.leave((await testToken).address, owner.address, "test", 0, {from: owner.address});
            } catch(e) {
                err = e;
            }
            expect(err instanceof Error).to.equal(true);

            err = null
            try{
                await leavingATip.leave((await testToken).address, owner.address, "test", -1, {from: owner.address});
            } catch(e) {
                err = e;
            }
            expect(err instanceof Error).to.equal(true);
        });

        it("should not send tip.", async function () {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            (await testToken).transfer(other.address, 50, {from: owner.address});
            const senderBalance1 = await (await testToken).balanceOf(other.address);
            await (await testToken).connect(other).approve(leavingATip.address, 50);
            let err = null;
            try {
                await leavingATip.connect(other).leave((await testToken).address, other.address, "test", 100);
            } catch(e) {
                err = e;
            }
            expect(err instanceof Error).to.equal(true);
        })
    });

    describe("take", function() {
        it("should take 50", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});

            const otherBalance1 = await (await testToken).balanceOf(other.address);
            await leavingATip.take((await testToken).address, "test", other.address);
            const otherBalance2 = await (await testToken).balanceOf(other.address);
            expect(otherBalance2).to.equal(otherBalance1.add(50));
        });

        it("should not take tip", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            let tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});
            const recipe = await tx.wait();
            await leavingATip.take((await testToken).address, "test", other.address);
            let error = null;
            try {
                await leavingATip.take((await testToken).address, "test", other.address);
            } catch(e) {
                error = e;
            }
            expect(error instanceof Error).to.equal(true);
        });

        it("test", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});

            const ownerBalance1 = await owner.getBalance();
            const otherBalance1 = await (await testToken).balanceOf(other.address);
            try{
                await leavingATip.take((await testToken).address, "test", other.address);
            } catch(e){}
            const ownerBalance2 = await owner.getBalance();
            const otherBalance2 = await (await testToken).balanceOf(other.address);            
        });
    });

    describe("utils", function() {
        it("should receive 50", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});

            const tip = await leavingATip.getAmountOfTip((await testToken).address, "test");

            expect(tip.toString()).to.equal('50');
        });

        it("should receive correct status", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});
            const isCompleted1 = await leavingATip.isCompleted((await testToken).address, "test");
            expect(isCompleted1).to.equal(false);

            const otherBalance1 = await (await testToken).balanceOf(other.address);
            await leavingATip.take((await testToken).address, "test", other.address);
            const otherBalance2 = await (await testToken).balanceOf(other.address);
            const isCompleted2 = await leavingATip.isCompleted((await testToken).address, "test");
            expect(isCompleted2).to.equal(true);
        })

        it("should fail to recevie tip in case using non-existent id.", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();
            let err = null;
            try{
                await leavingATip.take((await testToken).address, "foo", other.address);
            } catch(e) {
                err = e;
            }
            expect(err instanceof Error).to.equal(true);
        });

        it("should fail to implement function", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();
            let err = null;

            await (await testToken).approve(leavingATip.address, 50, {from: owner.address});
            const tx = await leavingATip.leave((await testToken).address, owner.address, "test",50, {from: owner.address});

            try{
                await leavingATip.take("0x326C977E6efc84E512bB9C30f76E30c160eD06FB", "test", other.address);
            } catch(e) {
                err = e;
            }
            expect(err instanceof Error).to.equal(true);
        })

        it("should receive correct result.", async function() {
            const { leavingATip, owner, testToken, other } = await deployLeavingATipToken();

            let result = await leavingATip.isSupportedTokenAddress((await testToken).address);
            expect(result).to.equal(true);

            result = await leavingATip.isSupportedTokenAddress("0x326C977E6efc84E512bB9C30f76E30c160eD06FB");
            expect(result).to.equal(false);

            await leavingATip.addSupportedTokenAddress("0x326C977E6efc84E512bB9C30f76E30c160eD06FB");

            result = await leavingATip.isSupportedTokenAddress("0x326C977E6efc84E512bB9C30f76E30c160eD06FB");
            expect(result).to.equal(true);
        })
    });
});