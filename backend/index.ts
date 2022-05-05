import { runAggregatorProxy } from "bls-wallet-aggregator-proxy";

import loadConfig from "./loadConfig";

const config = loadConfig();

runAggregatorProxy(
  config.upstreamAggregator,
  (b) => b,
  config.port,
  config.hostname,
  () => {
    console.log(
      `Proxying ${config.upstreamAggregator} on ${config.hostname}:${config.port}`
    );
  }
);
