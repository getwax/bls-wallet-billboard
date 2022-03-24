import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { Billboard__factory } from "../typechain";
import loadConfig from "./loadConfig";

const provider = new ethers.providers.Web3Provider((window as any).ethereum);

const App: React.FunctionComponent = () => {
  const [billboardInfo, setBillboardInfo] = React.useState<{
    billboardHash: string;
    leaseExpiry: BigNumber;
    dailyRent: BigNumber;
  }>();

  React.useEffect(() => {
    (async () => {
      const billboard = Billboard__factory.connect(
        loadConfig().billboardAddress,
        provider
      );

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
              <div>
                <div>
                  Send ETH <input type="text" />
                </div>
                <div>
                  Billboard <input type="text" />
                </div>
                <div>
                  <button>Rent</button>
                </div>
              </div>
            </>
          )}

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
  );
};

export default App;
