import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {Section} from '../components/Section';
import ConnectButton from '../components/ConnectButton';
import AccountInfo from '../components/AccountInfo';
import {
  useAuthorization,
  Account,
} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import Swap from '../components/Swap';

export default function MainScreen() {
  const {connection} = useConnection();
  const {selectedAccount} = useAuthorization();
  const [balance, setBalance] = useState<number | null>(null);

  const fetchAndUpdateBalance = useCallback(
    async (account: Account) => {
      console.log('Fetching balance for: ' + account.publicKey);
      const fetchedBalance = await connection.getBalance(account.publicKey);
      console.log('Balance fetched: ' + fetchedBalance);
      setBalance(fetchedBalance);
    },
    [connection],
  );

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }
    fetchAndUpdateBalance(selectedAccount);
  }, [fetchAndUpdateBalance, selectedAccount]);

  return (
    <>
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {selectedAccount ? (
            <AccountInfo
              selectedAccount={selectedAccount}
              balance={balance}
              fetchAndUpdateBalance={fetchAndUpdateBalance}
            />
          ) : (
            <ConnectButton title="Connect wallet" />
          )}
          {selectedAccount ? (
            <>
              <Text style={{ fontSize: 20 }}>Swap from Solana to Avalanche</Text>
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
