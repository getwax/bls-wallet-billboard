import { runAggregatorProxy } from "bls-wallet-aggregator-proxy";

runAggregatorProxy(
  "https://arbitrum-testnet.blswallet.org",
  (b) => b,
  8080,
  "0.0.0.0",
  () => {
    console.log("Proxying aggregator on port 8080");
  }
);
