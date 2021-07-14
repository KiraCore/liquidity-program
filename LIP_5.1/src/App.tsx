import { Flex } from '@chakra-ui/layout';
import { Switch, Route } from 'react-router-dom';

import Header from 'src/components/layout/Header';
import Footer from 'src/components/layout/Footer';
import MainContent from 'src/pages/MainContent';
import MyCollection from 'src/pages/MyCollection';
import { useQueries } from './hooks/useQueries';
import { useWallet } from 'use-wallet';

function App() {
  const { account } = useWallet();
  const data = useQueries(account);

  return (
    <Flex direction="column" width="100%">
      <Header data={data} />
      <Switch>
        <Route exact path="/mycollection" render={(props) => <MyCollection data={data} {...props} />} />
        <Route render={(props) => <MainContent data={data} {...props} />} />
      </Switch>
      <Footer />
    </Flex>
  );
}

export default App;
