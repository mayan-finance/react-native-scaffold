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
import {
  fetchQuote,
  Quote,
  swapFromEvm,
  swapFromSolana,
} from '@mayanfinance/swap-sdk';
import {useConnection} from './providers/ConnectionProvider';
import {Transaction} from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {Colors} from './Colors';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';

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
  selectedToken: {
    backgroundColor: Colors.primary,
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

const tokens = {
  solana: [
    {symbol: 'SOL', contract: '0x0000000000000000000000000000000000000000'},
    {symbol: 'USDC', contract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'},
    {symbol: 'USDT', contract: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'},
  ],
  ethereum: [
    {symbol: 'ETH', contract: '0x0000000000000000000000000000000000000000'},
    {symbol: 'USDC', contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'},
    {symbol: 'USDT', contract: '0xdac17f958d2ee523a2206206994597c13d831ec7'},
  ],
};
export default function Swap() {
  const {selectedAccount: solanaAccount, authorizeSession} = useAuthorization();
  const {address: ethereumAddress, provider: evmWalletProvider} =
    useWalletConnectModal();
  const [sourceChain, setSourceChain] = useState<'solana' | 'ethereum'>(
    'solana',
  );
  const [destinationChain, setDestinationChain] = useState<
    'solana' | 'ethereum'
  >('ethereum');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [timeout, setTimeout] = useState('5');
  const [amount, setAmount] = useState('');
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

  const destinationAddress = useMemo(() => {
    if (sourceChain === 'solana') {
      return ethereumAddress;
    }
    return solanaAccount?.publicKey.toBase58();
  }, [ethereumAddress, solanaAccount, sourceChain]);

  const isFormValid = useMemo(() => {
    return (
      !!destinationAddress &&
      !!fromToken &&
      !!toToken &&
      !!timeout &&
      !!amount &&
      !!solanaAccount &&
      !!ethereumAddress
    );
  }, [
    destinationAddress,
    fromToken,
    toToken,
    timeout,
    amount,
    solanaAccount,
    ethereumAddress,
  ]);

  const handleChangeChain = (
    mode: 'source' | 'destination',
    chain: 'solana' | 'ethereum',
  ) => {
    setFromToken('');
    setToToken('');
    if (mode === 'source') {
      setSourceChain(chain);
      setDestinationChain(chain === 'solana' ? 'ethereum' : 'solana');
    } else {
      setDestinationChain(chain);
      setSourceChain(chain === 'solana' ? 'ethereum' : 'solana');
    }
  };

  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={styles.form}>
      <View style={styles.field}>
        <Text>Source chain</Text>
        <View style={styles.tokenSuggestions}>
          <Pressable
            style={[
              styles.token,
              sourceChain === 'solana' && styles.selectedToken,
            ]}
            onPress={() => {
              handleChangeChain('source', 'solana');
            }}>
            <Text>Solana</Text>
          </Pressable>
          <Pressable
            style={[
              styles.token,
              sourceChain === 'ethereum' && styles.selectedToken,
            ]}
            onPress={() => {
              handleChangeChain('source', 'ethereum');
            }}>
            <Text>Ethereum</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.field}>
        <Text>Destination chain</Text>
        <View style={styles.tokenSuggestions}>
          <Pressable
            style={[
              styles.token,
              destinationChain === 'solana' && styles.selectedToken,
            ]}
            onPress={() => {
              handleChangeChain('destination', 'solana');
            }}>
            <Text>Solana</Text>
          </Pressable>
          <Pressable
            style={[
              styles.token,
              destinationChain === 'ethereum' && styles.selectedToken,
            ]}
            onPress={() => {
              handleChangeChain('destination', 'ethereum');
            }}>
            <Text>Ethereum</Text>
          </Pressable>
        </View>
      </View>
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
        <Text>From token</Text>
        <View style={styles.tokenSuggestions}>
          {tokens[sourceChain].map(token => (
            <Pressable
              key={token.contract}
              style={[
                styles.token,
                fromToken === token.contract && styles.selectedToken,
              ]}
              onPress={() => {
                setFromToken(token.contract);
              }}>
              <Text>{token.symbol}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text>To token</Text>
        <View style={styles.tokenSuggestions}>
          {tokens[destinationChain].map(token => (
            <Pressable
              key={token.contract}
              style={[
                styles.token,
                toToken === token.contract && styles.selectedToken,
              ]}
              onPress={() => {
                setToToken(token.contract);
              }}>
              <Text>{token.symbol}</Text>
            </Pressable>
          ))}
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
        <Text numberOfLines={1} ellipsizeMode="tail">
          {destinationAddress || 'NULL'}
        </Text>
      </View>

      <Pressable
        style={styles.button}
        disabled={!isFormValid || signingInProgress}
        onPress={async () => {
          try {
            setQuote(null);
            const fetchedQuote = await fetchQuote({
              amount: Number(amount),
              fromChain: sourceChain,
              toChain: destinationChain,
              fromToken: fromToken,
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
              const swapperAddress =
                sourceChain === 'solana'
                  ? solanaAccount?.publicKey.toBase58()
                  : ethereumAddress;
              if (signingInProgress || !swapperAddress || !destinationAddress) {
                return;
              }
              setSigningInProgress(true);
              let txHash = '';
              try {
                if (sourceChain === 'solana') {
                  txHash = await swapFromSolana(
                    quote,
                    swapperAddress,
                    destinationAddress,
                    Number(timeout) * 60,
                    null,
                    mwaSignTransaction,
                    connection,
                  );
                } else if (evmWalletProvider) {
                  const web3Provider = new ethers.providers.Web3Provider(
                    evmWalletProvider,
                  );
                  const trxResponse = await swapFromEvm(
                    quote,
                    destinationAddress,
                    Number(timeout) * 60,
                    null,
                    new ethers.providers.JsonRpcProvider(
                      'https://rpc.ankr.com/eth',
                    ),
                    web3Provider.getSigner(0),
                  );
                  txHash = trxResponse.hash;
                }
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
