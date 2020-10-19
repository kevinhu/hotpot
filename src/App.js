import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

// Import global components
import Navbar from './components/Navbar';

// Import pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Word from './pages/Word';
import Results from './pages/Results';

// Import reset scroll component
import ScrollToTop from './components/ScrollToTop';

// Import dark mode
import DarkModeProvider from './components/DarkMode';

// Global CSS
import './App.css';

// Window dimensions
import WindowDimensionsProvider from './components/WindowDimensionsProvider';

function App() {
  return (
    <HashRouter basename="/">
      <ScrollToTop />
      <WindowDimensionsProvider>
        <DarkModeProvider>
          <Route
            render={({ location }) => {
              return !['/'].includes(location.pathname) && <Navbar />;
            }}
          />
          <Switch>
            {/* Public Routes */}
            <Route exact path="/">
              {<Home />}
            </Route>

            <Route path="/word/:word">{<Word />}</Route>

            <Route path="/results">{<Results />}</Route>

            {/* Catch-all Route */}
            <Route path="/">
              <NotFound />
            </Route>
          </Switch>
        </DarkModeProvider>
      </WindowDimensionsProvider>
    </HashRouter>
  );
}

export default App;
