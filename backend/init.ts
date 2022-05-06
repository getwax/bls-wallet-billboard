import fs from "fs";
import path from "path";

import { BlsWalletWrapper } from "bls-wallet-clients";
import { ethers } from "ethers";
import loadConfig from "./loadConfig";

(async () => {
  const config = loadConfig();

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

  let wallet: BlsWalletWrapper;

  if (config.privateBlsKey !== "0x0") {
    wallet = await BlsWalletWrapper.connect(
      config.privateBlsKey,
      config.verificationGateway,
      provider
    );
  } else {
    console.log("privateBlsKey not configured, generating...");

    const mnemonic = ethers.Wallet.createRandom().mnemonic;

    const node = ethers.utils.HDNode.fromMnemonic(mnemonic.phrase);

    const { privateKey } = node.derivePath("m/44'/60'/0'/0/0");

    wallet = await BlsWalletWrapper.connect(
      privateKey,
      config.verificationGateway,
      provider
    );

    config.privateBlsKey = privateKey;

    await fs.promises.writeFile(
      path.join(__dirname, "config.json"),
      JSON.stringify(config, null, 2)
    );

    console.log("set privateBlsKey:", privateKey);
  }

  const balance = await provider.getBalance(wallet.address);

  console.log("balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.eq(0)) {
    console.log("aggregator proxy requires funds");
  }

  console.log("aggregator proxy account address:", wallet.address);
})().catch((error) => {
  setTimeout(() => {
    throw error;
  });
});
