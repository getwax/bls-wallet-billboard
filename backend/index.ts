import { runAggregatorProxy } from "bls-wallet-aggregator-proxy";

import loadConfig from "./loadConfig";

const config = loadConfig();

runAggregatorProxy(
  config.upstreamAggregator,
  (clientBundle) => {
    const isSponsored = clientBundle.operations.every((op) =>
      op.actions.every((action) =>
        config.sponsoredContracts.includes(action.contractAddress)
      )
    );

    if (!isSponsored) {
      return clientBundle;
    }

    // TODO: Augment with payment
    return clientBundle;
  },
  config.port,
  config.hostname,
  () => {
    console.log(
      `Proxying ${config.upstreamAggregator} on ${config.hostname}:${config.port}`
    );
  }
);
