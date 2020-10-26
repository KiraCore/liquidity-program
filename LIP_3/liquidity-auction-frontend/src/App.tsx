import React, { useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'
import DisclaimerModal from './components/DisclaimerModal'
import TopBar from './components/TopBar'
import ModalsProvider from './contexts/Modals'
import KiraProvider from './contexts/KiraProvider'
import useModal from './hooks/useModal'
import theme from './theme'
import Home from './views/Home'

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
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
          {/* <Route path="/farms">
            <Farms />
          </Route> */}
        </Switch>
      </Router>
      <Disclaimer />
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
          {/* <TransactionProvider>
            <FarmsProvider> */}
              <ModalsProvider>{children}</ModalsProvider>
            {/* </FarmsProvider>
          </TransactionProvider> */}
        </KiraProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

const Disclaimer: React.FC = () => {
  const markSeen = useCallback(() => {
    localStorage.setItem('disclaimer', 'seen')
  }, [])

  const [onPresentDisclaimerModal] = useModal(
    <DisclaimerModal onConfirm={markSeen} />,
  )

  useEffect(() => {
    
  }, [])

  return <div />
}

export default App
