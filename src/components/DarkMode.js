import React, { createContext, useContext, useState, useEffect } from "react";

const DarkModeCtx = createContext(null);

const DarkModeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [componentMounted, setComponentMounted] = useState(false);
  const setMode = (mode) => {
    window.localStorage.setItem("theme", mode);
    setTheme(mode);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme");
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches &&
    !localTheme
      ? setMode("dark")
      : localTheme
      ? setTheme(localTheme)
      : setMode("light");
    setComponentMounted(true);
  }, []);

  // return [theme, toggleTheme, componentMounted];
  return (
    <DarkModeCtx.Provider value={[theme, toggleTheme, componentMounted]}>
      <div className={`app-container ${theme === "dark" ? "mode-dark" : ""}`}>
        {children}
      </div>
    </DarkModeCtx.Provider>
  );
};

export default DarkModeProvider;
export const useDarkMode = () => useContext(DarkModeCtx);
