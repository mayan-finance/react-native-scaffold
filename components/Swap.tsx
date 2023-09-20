import React, {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useAuthorization} from './providers/AuthorizationProvider';
import {alertAndLog} from '../util/alertAndLog';
import {fetchQuote, Quote, swapFromSolana} from '@mayanfinance/swap-sdk';
import {useConnection} from './providers/ConnectionProvider';
import {Transaction} from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {Colors} from './Colors';

const styles = StyleSheet.create({
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  input: {
    width: '100%',
    marginTop: 4,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 8,
  },
  field: {
    marginBottom: 16,
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    paddingHorizontal: 8,
    width: '100%',
  },
  tokenSuggestions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 6,
  },
  token: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  quote: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
});
export default function Swap() {
  const {selectedAccount, authorizeSession} = useAuthorization();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [fromMint, setFromMint] = useState('');
  const [toToken, setToToken] = useState('');
  const [timeout, setTimeout] = useState('5');
  const [amount, setAmount] = useState('0.05');
  const [quote, setQuote] = useState<Quote | null>(null);
  const {connection} = useConnection();
  const [signingInProgress, setSigningInProgress] = useState(false);

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

  const isFormValid = useMemo(() => {
    return (
      !!destinationAddress &&
      !!fromMint &&
      !!toToken &&
      !!timeout &&
      !!amount &&
      !!selectedAccount
    );
  }, [destinationAddress, fromMint, toToken, timeout, amount, selectedAccount]);

  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={styles.form}>
      <View style={styles.field}>
        <Text>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount to swap"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      <View style={styles.field}>
        <Text>From mint</Text>
        <TextInput
          style={styles.input}
          placeholder="From mint address"
          value={fromMint}
          onChangeText={setFromMint}
        />
        <View style={styles.tokenSuggestions}>
          <Pressable
            style={styles.token}
            onPress={() => {
              setFromMint('0x0000000000000000000000000000000000000000');
            }}>
            <Text>SOL</Text>
          </Pressable>
          <Pressable
            style={styles.token}
            onPress={() => {
              setFromMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
            }}>
            <Text>USDC</Text>
          </Pressable>
          <Pressable
            style={styles.token}
            onPress={() => {
              setFromMint('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
            }}>
            <Text>USDT</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.field}>
        <Text>To token</Text>
        <TextInput
          style={styles.input}
          placeholder="To token contract"
          value={toToken}
          onChangeText={setToToken}
        />
        <View style={styles.tokenSuggestions}>
          <Pressable
            style={styles.token}
            onPress={() => {
              setToToken('0x0000000000000000000000000000000000000000');
            }}>
            <Text>Avax</Text>
          </Pressable>
          <Pressable
            style={styles.token}
            onPress={() => {
              setToToken('0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e');
            }}>
            <Text>USDC</Text>
          </Pressable>
          <Pressable
            style={styles.token}
            onPress={() => {
              setToToken('0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7');
            }}>
            <Text>USDT</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.field}>
        <Text>Timeout</Text>
        <TextInput
          style={styles.input}
          placeholder="Timeout in minutes"
          value={timeout}
          onChangeText={setTimeout}
        />
      </View>
      <View style={styles.field}>
        <Text>Destination address</Text>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          value={destinationAddress}
          onChangeText={setDestinationAddress}
        />
      </View>

      <Pressable
        style={styles.button}
        disabled={!isFormValid || signingInProgress}
        onPress={async () => {
          try {
            setQuote(null);
            const fetchedQuote = await fetchQuote({
              amount: Number(amount),
              fromChain: 'solana',
              toChain: 'avalanche',
              fromToken: fromMint,
              toToken: toToken,
              slippage: 5,
            });
            setQuote(fetchedQuote);
          } catch (err: any) {
            alertAndLog('Error during fetching quote', err?.message);
          }
        }}>
        <Text>Fetch quote</Text>
      </Pressable>
      {quote && (
        <>
          <View style={styles.quote}>
            <Text>Expected amount out:</Text>
            <Text>{quote.expectedAmountOut}</Text>
          </View>
          <Pressable
            style={styles.button}
            disabled={signingInProgress}
            onPress={async () => {
              const swapperAddress = selectedAccount?.publicKey.toBase58();
              if (signingInProgress || !swapperAddress) {
                return;
              }
              setSigningInProgress(true);
              try {
                const txHash = await swapFromSolana(
                  quote,
                  swapperAddress,
                  destinationAddress,
                  timeout * 60,
                  null,
                  mwaSignTransaction,
                  connection,
                );
                alertAndLog(
                  'Swap successfully submitted!',
                  `${txHash.slice(0, 6)} ...`,
                );
              } catch (err: any) {
                alertAndLog('Error during swap', err?.message);
              } finally {
                setSigningInProgress(false);
              }
            }}>
            <Text>Swap</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
