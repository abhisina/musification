import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { Home } from './components/Home';
import { Config } from './components/Config';
import { Video } from './components/Video';
import { About } from './components/About';
import { NoMatch } from './components/NoMatch';
import { Footer } from './components/Footer';
import Container from 'react-bootstrap/Container';
import { MusicServiceClient } from './pb/service_grpc_web_pb';

export const MusicServiceContext = React.createContext();

function App() {
  var musicService = new MusicServiceClient('http://' + window.location.hostname + ':8000');
  return (
    <>
      <BrowserRouter>
        <Header/>
        <Banner/>
        <MusicServiceContext.Provider value={musicService}>
          <Container className="box-height-100">
              <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/config" component={Config}/>
                <Route path="/video" component={Video}/>
                <Route path="/about" component={About}/>
                <Route component={NoMatch}/>
              </Switch>
          </Container>
        </MusicServiceContext.Provider>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
