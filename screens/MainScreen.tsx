import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {Section} from '../components/Section';
import ConnectSolanaButton from '../components/ConnectSolanaButton';
import AccountInfo from '../components/AccountInfo';
import {
  useAuthorization,
  Account,
} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import Swap from '../components/Swap';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import ConnectEthereumButton from "../components/ConnectEthereumButton";

export default function MainScreen() {
  const {connection} = useConnection();
  const {selectedAccount: solanaAccount} = useAuthorization();
  const {address: etheruemAddress} = useWalletConnectModal();

  return (
    <>
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {solanaAccount ? (
            <View>
              <Text numberOfLines={1} ellipsizeMode="tail">
                Solana address: {solanaAccount.publicKey.toBase58()}
              </Text>
            </View>
          ) : (
            <ConnectSolanaButton title="Connect Solana Wallet" />
          )}
          <View style={{ height: 16 }} />
          {etheruemAddress ? (
            <View>
              <Text numberOfLines={1} ellipsizeMode="tail">
                Ethereum address: {etheruemAddress}
              </Text>
            </View>
          ) : (
            <ConnectEthereumButton title="Connect Ethereum Wallet" />
          )}
          <View style={{ height: 16 }} />
          {!!(solanaAccount && etheruemAddress) ? (
            <>
              <Text style={{fontSize: 20}}>Swap between Solana and Ethereum</Text>
              <View style={styles.divider} />
              <Swap />
            </>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    padding: 16,
    flex: 1,
  },
  scrollContainer: {
    height: '100%',
  },
  buttonGroup: {
    flexDirection: 'column',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F1F0',
    marginVertical: 8,
    width: '100%',
  },
});
