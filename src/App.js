import React, { useEffect, useState } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";

// Import global components
import Navbar from "./components/Navbar";

// Import pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Word from "./pages/Word";

// Import reset scroll component
import ScrollToTop from "./components/ScrollToTop";

// Import dark mode
import { useDarkMode } from "./components/DarkMode";
import DarkModeToggle from "react-dark-mode-toggle";

// Global CSS
import "./App.css";

// Window dimensions
import WindowDimensionsProvider from "./components/WindowDimensionsProvider";

function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();

  if (theme === "dark") {
    document.documentElement.classList.add("mode-dark");
  } else {
    document.documentElement.classList.remove("mode-dark");
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  if (loading || !componentMounted) {
    return <div />;
  }

  const linkHover = `hover:text-blue-600 dark-hover:text-orange-500`;

  return (
    <HashRouter basename="/">
      <ScrollToTop />
      <WindowDimensionsProvider>
        <Route
          render={({ location }) => {
            return !["/"].includes(location.pathname) && <Navbar />;
          }}
        />
        {/*<div
          className="text-center w-screen pt-8"
          style={{ marginBottom: "-1rem" }}
        >
          <DarkModeToggle
            onChange={toggleTheme}
            checked={theme === "dark"}
            size={"3rem"}
            speed={5}
          />
        </div>*/}
        <Switch>
          {/* Public Routes */}
          <Route exact path="/">
            {<Home />}
          </Route>

          <Route path="/word">{<Word />}</Route>

          {/* Catch-all Route */}
          <Route path="/">
            <NotFound />
          </Route>
        </Switch>
      </WindowDimensionsProvider>
    </HashRouter>
  );
}

export default App;
