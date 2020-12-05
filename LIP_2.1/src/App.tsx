import React, { useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'
import DisclaimerModal from './components/DisclaimerModal'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import KiraProvider from './contexts/KiraProvider'
import useModal from './hooks/useModal'
import theme from './theme'
import Farms from './views/Farms'
import Home from './views/Home'

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true);
  }, [setMobileMenu])

  return (
    <Providers>
      <Router>
        <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
        {/* <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} /> */}
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/pools">
            <Farms />
          </Route>
        </Switch>
      </Router>
    </Providers>
  )
}

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider
        chainId={42}
        connectors={{
          walletconnect: { rpcUrl: 'https://api.infura.io/v1/jsonrpc/kovan' },
        }}
      >
        <KiraProvider>
          <FarmsProvider>
            <ModalsProvider>{children}</ModalsProvider>
          </FarmsProvider>
        </KiraProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

export default App
