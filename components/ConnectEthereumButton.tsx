import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import React, {ComponentProps, useState, useCallback} from 'react';
import {Button} from 'react-native';
import {alertAndLog} from '../util/alertAndLog';

type Props = Readonly<ComponentProps<typeof Button>>;

export default function ConnectEthereumButton(props: Props) {
  const {isOpen, open} = useWalletConnectModal();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const handleConnectPress = useCallback(async () => {
    try {
      if (isOpen) {
        return;
      }
      await open();
    } catch (err: any) {
      alertAndLog(
        'Error during connect',
        err?.message || 'Could not connect to WalletConnect',
      );
    } finally {
      setAuthorizationInProgress(false);
    }
  }, [open, isOpen]);
  return (
    <Button
      {...props}
      disabled={authorizationInProgress}
      onPress={handleConnectPress}
    />
  );
}
