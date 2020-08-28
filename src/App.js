import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// Import pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

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

  // general link hover style
  const linkHover = `hover:text-blue-600 dark-hover:text-orange-500`;

  return (
    <Router>
      <WindowDimensionsProvider>
        <div
          className="text-center w-screen pt-8"
          style={{ marginBottom: "-1rem" }}
        >
          <DarkModeToggle
            onChange={toggleTheme}
            checked={theme === "dark"}
            size={"3rem"}
            speed={5}
          />
        </div>
        <Switch>
          {/* Public Routes */}
          <Route exact path="/">
            {<Home />}
          </Route>

          {/* Catch-all Route */}
          <Route path="/">
            <NotFound />
          </Route>
        </Switch>
        <div className="text-center pb-12 text-gray-800 dark:text-gray-200">
          Made by{" "}
          <a
            className={`underline ${linkHover}`}
            href="https://kevinhu.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kevin Hu
          </a>
          <br />
          <a
            className={`underline ${linkHover}`}
            href="https://github.com/kevinhu/huoguo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </a>{" "}
          on GitHub
        </div>
      </WindowDimensionsProvider>
    </Router>
  );
}

export default App;
