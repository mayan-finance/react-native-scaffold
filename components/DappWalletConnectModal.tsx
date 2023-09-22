import React from 'react';
import {WalletConnectModal} from '@walletconnect/modal-react-native';

const walletConnectMetaData = {
  name: 'Mayan Swap Scaffold',
  description:
    'Swap from any network with one click at the best rate via Solana',
  url: 'https://mayan.finance/',
  icons: ['https://cdn.mayan.finance/Logo.png'],
  redirect: {
    native: 'mayanmobilescaffold://',
  },
};

// visit: https://docs.walletconnect.com/2.0/web3modal/platforms/react-native
const PROJECT_ID = 'YOUR_PROJECT_ID';
export default function DappWalletConnectModal() {
  return (
    <WalletConnectModal
      projectId={PROJECT_ID}
      providerMetadata={walletConnectMetaData}
      sessionParams={{
        namespaces: {
          eip155: {
            methods: ['eth_sendTransaction'],
            chains: ['eip155:1'],
            events: ['chainChanged', 'accountsChanged'],
            rpcMap: {},
          },
        },
      }}
    />
  );
}
