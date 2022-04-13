import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { Billboard, Billboard__factory } from "../typechain";
import loadConfig from "./loadConfig";

const provider = new ethers.providers.Web3Provider((window as any).ethereum);
const config = loadConfig();

const App: React.FunctionComponent = () => {
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

  const billboardRef = React.useRef<Billboard>();

  const refreshBillboard = React.useCallback(async () => {
    if (!billboardRef.current) {
      billboardRef.current = Billboard__factory.connect(
        config.billboardAddress,
        provider
      );
    }
    const billboard = billboardRef.current;

    const [billboardHash, leaseExpiry, dailyRent] = await Promise.all([
      billboard.billboardHash(),
      billboard.leaseExpiry(),
      billboard.dailyRent(),
    ]);

    setBillboardInfo({
      billboardHash,
      leaseExpiry,
      dailyRent,
    });
  }, []);

  const handleNewBlock = React.useCallback(
    async (blockNumber: number) => {
      try {
        console.debug(`new block ${blockNumber}`);
        await refreshBillboard();
      } catch (err) {
        console.error(err);
      }
    },
    [refreshBillboard]
  );

  React.useEffect(() => {
    (async () => {
      await refreshBillboard();
    })().catch(console.error);
  }, [refreshBillboard]);

  React.useEffect(() => {
    provider.on("block", handleNewBlock);

    return () => {
      provider.off("block", handleNewBlock);
    };
  }, [handleNewBlock]);

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

      await refreshBillboard();

      setProgressMsg("");
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
              background: `url(/billboards/${effectiveBillboardHash}.png) center no-repeat`,
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
                  <a href="/billboards/0x1d85c73c13ff284beab6c81f06dff8197093b29927fe1ab8394b6ac66eeb0460.png">
                    0x1d85c73c13ff284beab6c81f06dff8197093b29927fe1ab8394b6ac66eeb0460
                  </a>
                </div>
                <div>
                  <a href="/billboards/0xdef55c3887e6fceb201e04f2c8d080109896b8cc9e30b33b6bf9803046e1b0da.png">
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
