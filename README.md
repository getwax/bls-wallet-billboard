# BLS Wallet Billboard

Example dApp for [bls-wallet](https://github.com/jzaki/bls-wallet) which pays
for user transactions¹.

¹It's just a vanilla dApp and doesn't pay for user transactions yet.

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
yarn hardhat run scripts/deploy.ts # note deployed address (the hex string)
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
