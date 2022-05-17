# BLS Wallet Billboard

Example dApp for [bls-wallet](https://github.com/jzaki/bls-wallet) which can pay
for user transactions.

## Prerequisites

- Nodejs
- Yarn
- Metamask

## Development Instructions

```
git clone git@github.com:voltrevo/bls-wallet-billboard
cd bls-wallet-billboard
yarn
yarn hardhat node
yarn hardhat run scripts/deploy.ts --network gethDev # note deployed address (the hex string)
cp frontend/config.example.json frontend/config.json
# Change billboardAddress in config.json to the address from running deploy.ts
yarn webpack serve
```

Then open http://localhost:9000.

If needed, change the metamask network to localhost and refresh.

It should look like this:

![Initial screen](./docs/images/initial-screen.png)

Import one of the test accounts that's initially displayed when running
`yarn hardhat node`.

Fill in these values:

```
Send ETH:  0.0005
Billboard: 0x1d85c73c13ff284beab6c81f06dff8197093b29927fe1ab8394b6ac66eeb0460
(Or copy and paste your billboard of choice from the available billboards.)
```

**Important**: I'm about to tell you to send a transaction through metamask.
Please be wary of following instructions like this. It's up to you to ensure
you only authorize metamask to do something you want to do.

Click **Rent** and follow the prompts from metamask.

It should say 'Confirmed' and provide a transaction hash. If so, reload and
you should get something like this:

![Dogs screen](./docs/images/dogs-screen.png)

If you reload again after the listed expiry time, it'll revert back to 'your
ad here'. You may then wish to try the other billboard, and get a result like
this:

![Cats screen](./docs/images/cats-screen.png)

### Paying for User Transactions

If the user is using a BLS-based wallet like Quill, they may need to pay an
aggregator when submitting their transactions.

An optional backend is included in this project which can proxy another
aggregator and insert transactions that pay the required fees on behalf of the
user.

1. Start by copying the example config:

```sh
cp backend/config.example.json backend/config.json
```

2. Set `sponsoredContracts` to the billboard address deployed previously:

```json
{
  ...
  "sponsoredContracts": ["0x...(the billboard you deployed)"],
  ...
}
```

3. Provide addresses for the relevant `verificationGateway` and `aggregatorUtilities`. ([This may help](https://github.com/web3well/bls-wallet/tree/main/contracts/networks).)
4. Ensure `chainId` and `rpcUrl` match the network you're using.
5. Run `yarn ts-node backend/init.ts`. This will create the BLS wallet that will sign the payment transactions. You should see a message that the aggregator proxy requires funds for this.
6. Send some ETH to the account described above.
7. Run `yarn ts-node backend/init.ts` again. Ensure the balance displayed correctly reflects the ETH you sent.
8. Set `preferredAggregator` in `frontend/config.json` to point to the proxy started above, e.g.

```json
{
  "preferredAggregator": "http://localhost:3501",
  "billboardAddress": "0x...(configured previously)"
}
```

Once that's done, wallets that support `eth_setPreferredAggregator` (such as Quill) should be able to rent the billboard without any transaction fees (in this example, the user still pays the actual rent, just not the fee associated with paying that rent).
