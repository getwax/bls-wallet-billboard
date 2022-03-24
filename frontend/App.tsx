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
  const leaseActive = Date.now() > leaseExpiryDate.getTime();

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
            }}
          />

          <div>{leaseExpiryDate.toString()}</div>
        </>
      )}
    </>
  );
};

export default App;
