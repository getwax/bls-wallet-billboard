import { ethers } from "ethers";
import * as React from "react";
import { Billboard__factory } from "../typechain";
import loadConfig from "./loadConfig";

const provider = new ethers.providers.Web3Provider((window as any).ethereum);

const App: React.FunctionComponent = () => {
  const [blockNo, setBlockNo] = React.useState<number>();
  const [billboardHash, setBillboardHash] = React.useState<string>();

  React.useEffect(() => {
    (async () => {
      setBlockNo(await provider.getBlockNumber());

      const billboard = Billboard__factory.connect(
        loadConfig().billboardAddress,
        provider
      );

      console.log(billboard.address);

      setBillboardHash(await billboard.billboardHash());
    })().catch(console.error);
  }, []);

  return (
    <>
      <h1>Billboard Sample dApp</h1>

      <p>Block no {blockNo}</p>
      <p>Billboard hash {billboardHash}</p>
    </>
  );
};

export default App;
