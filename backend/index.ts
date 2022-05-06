import { ethers, BigNumber } from "ethers";
import { runAggregatorProxy } from "bls-wallet-aggregator-proxy";
import {
  Aggregator,
  BlsWalletWrapper,
  AggregatorUtilities__factory,
  initBlsWalletSigner,
} from "bls-wallet-clients";

import loadConfig from "./loadConfig";

(async () => {
  const config = loadConfig();

  const sponsoredContracts = config.sponsoredContracts.map((sc) =>
    sc.toLowerCase()
  );

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const utils = AggregatorUtilities__factory.connect(
    config.aggregatorUtilities,
    provider
  );

  const blsWalletSigner = await initBlsWalletSigner({
    chainId: config.chainId,
  });

  const wallet = await BlsWalletWrapper.connect(
    config.privateBlsKey,
    config.verificationGateway,
    provider
  );

  const upstreamAggregator = new Aggregator(config.upstreamAggregator);

  runAggregatorProxy(
    config.upstreamAggregator,
    async (clientBundle) => {
      const isSponsored = clientBundle.operations.every((op) =>
        op.actions.every((action) =>
          sponsoredContracts.includes(action.contractAddress.toLowerCase())
        )
      );

      if (!isSponsored) {
        return clientBundle;
      }

      const fees = await upstreamAggregator.estimateFee(
        blsWalletSigner.aggregate([
          clientBundle,
          wallet.sign({
            nonce: await wallet.Nonce(),
            actions: [
              {
                // Use send of 1 wei to measure fee that includes our payment
                ethValue: 1,
                contractAddress: utils.address,
                encodedFunction:
                  utils.interface.encodeFunctionData("sendEthToTxOrigin"),
              },
            ],
          }),
        ])
      );

      if (!fees.successes.every((s) => s) || fees.feeType !== "ether") {
        return clientBundle;
      }

      const remainingFee = BigNumber.from(fees.feeRequired).sub(
        fees.feeDetected
      );

      // pay a bit more than expected to increase chances of success
      const paymentAmount = remainingFee.add(remainingFee.div(10));

      const paymentBundle = wallet.sign({
        nonce: await wallet.Nonce(),
        actions: [
          {
            ethValue: paymentAmount,
            contractAddress: utils.address,
            encodedFunction:
              utils.interface.encodeFunctionData("sendEthToTxOrigin"),
          },
        ],
      });

      return blsWalletSigner.aggregate([clientBundle, paymentBundle]);
    },
    config.port,
    config.hostname,
    () => {
      console.log(
        `Proxying ${config.upstreamAggregator} on ${config.hostname}:${config.port}`
      );
    }
  );
})().catch((error) => {
  setTimeout(() => {
    throw error;
  });
});
