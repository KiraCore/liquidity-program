import ReactDOM from 'react-dom';
import App from './App';

import { ChakraProvider } from '@chakra-ui/react';

import { UseWalletProvider } from 'use-wallet';
import { ETHEREUM_CHAIN_ID, ETHEREUM_RPC_URL } from 'src/config';
import { extendTheme } from '@chakra-ui/react';
import customTheme from 'src/theme';
import Fonts from 'src/fonts';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { wrapHistory } from 'oaf-react-router';

declare global {
  interface Window {
    web3: any;
    ethereum: any;
  }
}

const theme = extendTheme(customTheme);
const history = createBrowserHistory();
wrapHistory(history);

ReactDOM.render(
  <Router history={history}>
    <ChakraProvider theme={theme}>
      <Fonts />
      <UseWalletProvider
        chainId={ETHEREUM_CHAIN_ID}
        connectors={{
          walletconnect: { rpcUrl: ETHEREUM_RPC_URL },
        }}
      >
        <App />
      </UseWalletProvider>
    </ChakraProvider>
  </Router>,
  document.getElementById('root'),
);
