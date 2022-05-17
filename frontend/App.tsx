import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { Billboard__factory } from "../typechain";
import loadConfig, { Config } from "./loadConfig";

const init = (() => {
  let data:
    | {
        provider: ethers.providers.Web3Provider;
        config: Config;
      }
    | undefined;

  return () => {
    if (!data) {
      data = {
        provider: new ethers.providers.Web3Provider((window as any).ethereum),
        config: loadConfig(),
      };
    }

    return data;
  };
})();

const App: React.FunctionComponent = () => {
  const { provider, config } = init();

  const [billboardInfo, setBillboardInfo] = React.useState<{
    billboardHash: string;
    leaseExpiry: BigNumber;
    dailyRent: BigNumber;
  }>();

  const [sendEthElement, setSendEthElement] =
    React.useState<HTMLInputElement | null>(null);

  const [billboardElement, setBillboardElement] =
    React.useState<HTMLInputElement | null>(null);

  const [progressMsg, setProgressMsg] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const setPreferredAggregatorResponse = await (
          window as any
        ).ethereum.request({
          method: "eth_setPreferredAggregator",
          params: [config.preferredAggregator],
        });

        if (setPreferredAggregatorResponse !== "ok") {
          throw new Error("Failed to set preferred aggregator");
        }
      } catch (error) {
        console.warn(
          "Failed to set preferred aggregator (are you not using Quill?)",
          error
        );
      }

      const billboard = Billboard__factory.connect(
        config.billboardAddress,
        provider
      );

      (window as any).billboard = billboard;

      setBillboardInfo({
        billboardHash: await billboard.billboardHash(),
        leaseExpiry: await billboard.leaseExpiry(),
        dailyRent: await billboard.dailyRent(),
      });
    })().catch(console.error);
  }, []);

  if (billboardInfo === undefined) {
    return <>Loading...</>;
  }

  const leaseExpiryDate = new Date(1000 * billboardInfo.leaseExpiry.toNumber());
  const leaseActive = Date.now() <= leaseExpiryDate.getTime();

  const effectiveBillboardHash = leaseActive
    ? billboardInfo.billboardHash
    : ethers.constants.HashZero;

  async function rent() {
    if (
      sendEthElement === null ||
      billboardElement === null ||
      billboardInfo === undefined
    ) {
      return;
    }

    setProgressMsg("Connecting...");

    try {
      await provider.send("eth_requestAccounts", []);

      const billboard = Billboard__factory.connect(
        config.billboardAddress,
        provider.getSigner()
      );

      setProgressMsg("Sending...");

      const tx = await billboard.rent(
        billboardElement.value,
        billboardInfo.dailyRent,
        {
          value: ethers.utils.parseEther(sendEthElement.value),
        }
      );

      setProgressMsg("Waiting for confirmation...");

      const recpt = await tx.wait();

      setProgressMsg(`Confirmed! ${recpt.transactionHash}`);
    } catch (error) {
      setProgressMsg(`Error: ${(error as Error).stack}`);
    }
  }

  return (
    <>
      <h1>Billboard Sample dApp</h1>

      {billboardInfo && (
        <>
          <div
            style={{
              border: "3px solid black",
              width: "80vw",
              height: "25vw",
              background: `url(billboards/${effectiveBillboardHash}.png) center no-repeat`,
              backgroundSize: "contain",
            }}
          />

          {leaseActive && (
            <div>
              This billboard will expire at {leaseExpiryDate.toString()}
            </div>
          )}

          {!leaseActive && (
            <>
              <div>
                Rent this billboard for the low low price of{" "}
                {ethers.utils.formatEther(billboardInfo.dailyRent)} ETH per day!
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                <div>
                  Send ETH &nbsp;
                  <input type="text" ref={setSendEthElement} />
                </div>
                <div>
                  Billboard <input type="text" ref={setBillboardElement} />
                </div>
                <div>
                  <button onClick={() => rent()}>Rent</button>
                </div>
                <div>{progressMsg}</div>
              </div>
              <div>
                <div>Available billboards</div>
                <div>
                  <a href="billboards/0x1d85c73c13ff284beab6c81f06dff8197093b29927fe1ab8394b6ac66eeb0460.png">
                    0x1d85c73c13ff284beab6c81f06dff8197093b29927fe1ab8394b6ac66eeb0460
                  </a>
                </div>
                <div>
                  <a href="billboards/0xdef55c3887e6fceb201e04f2c8d080109896b8cc9e30b33b6bf9803046e1b0da.png">
                    0xdef55c3887e6fceb201e04f2c8d080109896b8cc9e30b33b6bf9803046e1b0da
                  </a>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default App;
