import { ethers } from "ethers";
import * as React from "react";

const provider = new ethers.providers.Web3Provider((window as any).ethereum);

const App: React.FunctionComponent = () => {
  const [blockNo, setBlockNo] = React.useState<number>();

  React.useEffect(() => {
    (async () => {
      setBlockNo(await provider.getBlockNumber());
    })().catch(console.error);
  }, []);

  return (
    <>
      <h1>Billboard Sample dApp</h1>

      <p>Block no {blockNo}</p>
    </>
  );
};

export default App;
