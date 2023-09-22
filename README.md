# Cross-chain Swap React Native dApp Scaffold

A ready-to-go template of cross-chain swap dApp with basic React UI components based on [Solana Mobile daApp Scaffold](https://github.com/solana-mobile/solana-mobile-dapp-scaffold).
It provides an interface to connect to locally installed wallet apps and perform cross-chain swaps between them.

This React Native dApp is only fully functional on Android.

## Featured Libarires
- [Mayan Swap SDK](https://github.com/mayan-finance/swap-sdk) for getting quotes and executing swaps
- [WalletConnect Modal](https://github.com/WalletConnect/modal-react-native) for connecting to EVM wallets
- [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/js/packages/mobile-wallet-adapter-protocol) for connecting to wallets and signing transactions/messages
- [web3.js](https://solana-labs.github.io/solana-web3.js/) for constructing transactions and an RPC `connection` client.

<table>
  <tr>
    <td align="center">
      <img src="https://cdn.mayan.finance/rn_sc_1.jpg" alt="Scaffold dApp Screenshot 1" width=300 />
    </td>
    <td align="center">
      <img src="https://cdn.mayan.finance/rn_sc_2.jpg" alt="Scaffold dApp Screenshot 2" width=300 />
    </td>
    <td align="center">
      <img src="https://cdn.mayan.finance/rn_sc_3.jpg" alt="Scaffold dApp Screenshot 3" width=300 />
    </td>
  </tr>
</table>

## Prerequisites

If you haven't setup a React Native development environment for Android, you'll need to do that first. Follow the [Prerequisite Setup Guide](https://docs.solanamobile.com/getting-started/development-setup).

Follow the guide to make sure you:
- setup your Android and React Native development environment.
- have an Android device or emulator.
- install an MWA compliant wallet app on your device/emulator.
- install a WalletConnect compliant wallet app on your device/emulator.
   
## Usage
1. Clone the project
- `git clone https://github.com/mayan-finance/swap-sdk.git`
2. Install dependencies
- `yarn install` or `npm install`
3. Launch the app on your Android device/emulator
- `npx react-native run-android`

## Flow
1. Connect to an evm wallet app
   - For evm wallets this will open WalletConnect modal to connect to a wallet app.
2. Connect to a Solana wallet app
    - To connect to a solana wallet app, this mobile dApp uses Solana mobile adapter.
3. Get a quote
    - Uses [quote function](https://github.com/mayan-finance/swap-sdk#getting-quote) of mayan swap SDK to get a quote.
4. Execute the swap
    - For swaps from Solana to EVM, dApp calls [swapFromSolana](https://github.com/mayan-finance/swap-sdk#swap-from-solana) function and passes the `signSolanaTransaction` param like this:
    ```js
        const mwaSignTransaction = useCallback(
        async (tx: Transaction) => {
          return await transact(async (wallet: Web3MobileWallet) => {
            authorizeSession(wallet);
            const signedTransactions = await wallet.signTransactions({
              transactions: [tx],
            });

            return signedTransactions[0];
          });
        },
        [authorizeSession],
      ); 
    ```
    - To swap from EVM to Solana, use [swapFromEvm](https://github.com/mayan-finance/swap-sdk#swap-from-evm). For ERC20 tokens make sure user has approved the token transfer before calling this function.


