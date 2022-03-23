import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, waffle } from "hardhat";

const provider = waffle.provider;

async function expectReject(promise: Promise<unknown>, message?: string) {
  try {
    await promise;
  } catch {
    return;
  }

  throw new Error(message ?? "Expected promise to reject but it didn't");
}

describe("Billboard", function () {
  it("Basic usage", async function () {
    const Billboard = await ethers.getContractFactory("Billboard");
    const billboard = await Billboard.deploy(ethers.utils.parseEther("1.0"));
    await billboard.deployed();

    const signers = await ethers.getSigners();

    const [owner, client] = signers.slice(1);

    // Can set owner
    await (await billboard.setOwner(owner.address)).wait();
    expect(await billboard.owner()).to.eq(owner.address);

    // After setting owner, can't set owner again (only owner can setOwner)
    await expectReject(billboard.setOwner(client.address));

    expect(await billboard.billboardHash()).to.eq(ethers.constants.HashZero);
    expect(await billboard.leaseExpiry()).to.eq(BigNumber.from(0));

    const ownerInitialBalance = await provider.getBalance(owner.address);

    const threeDays = 3 * 86_400;

    const billboardHash = ethers.utils.keccak256(
      new TextEncoder().encode("example")
    );

    const expectedDailyRent = ethers.utils.parseEther("1.0");

    // Fails because we forgot to pay
    await expectReject(
      billboard.connect(client).rent(billboardHash, expectedDailyRent)
    );

    const tx = await (
      await billboard.connect(client).rent(billboardHash, expectedDailyRent, {
        value: expectedDailyRent.mul(3),
      })
    ).wait();

    const blockTimestamp = (await provider.getBlock(tx.blockHash)).timestamp;

    expect(await billboard.billboardHash()).to.eq(billboardHash);

    const ownerPayment = (await provider.getBalance(owner.address)).sub(
      ownerInitialBalance
    );

    expect(ownerPayment).to.eq(expectedDailyRent.mul(3));
    expect(await billboard.leaseExpiry()).to.eq(blockTimestamp + threeDays);
  });
});
