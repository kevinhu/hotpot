import React, { useState, useRef, useEffect } from "react";

// location management
import { useHistory, useLocation, Link } from "react-router-dom";
import queryString from "query-string";

// themes and components
import { useDarkMode } from "../components/DarkMode";
import { linkHover, linkHoverScale, borderPrimaryColor } from "../themes";

// other utilities
import { pinyinify, numberWithCommas } from "../utilities";
var _ = require("lodash");

const Navbar = () => {
  // dark mode functions
  const [theme, toggleTheme, componentMounted] = useDarkMode();

  // enable location and history
  let history = useHistory();
  let location = useLocation();

  var [searchWord, setSearchWord] = useState(""); // current text in search box
  let [results, setResults] = useState([]); // preview search results
  let [searchFocused, setSearchFocused] = useState(false); // if search box is focused

  // parse search parameters and get mode
  let queryParams = queryString.parse(location.search);
  let modeParam = queryParams["mode"];

  const updateSearch = (event) => {
    event.persist();
    setSearchFocused(true);
    setSearchWord(event.target.value);

    executeSearch(event.target.value);
  };

  // search while typing handler
  const executeSearch = useRef(
    _.debounce((query) => {
      // if query is just whitespace
      if (!query.replace(/\s/g, "").length) {
        setResults([]);
        return;
      }
      fetch(
        `https://hotpot-search.kevinhu.io/.netlify/functions/search?query=${query}&limit=4`
      )
        .then((response) => {
          return response.json();
        })
        .then((body) => {
          setResults(body);
        });
    }, 160)
  ).current;

  // handle search submit event
  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchFocused(false);
    history.push(`/results?search=${searchWord}&mode=${modeParam}`);
  };

  // handlers for detecting clicks outside of search input and suggestions
  // see https://medium.com/@pitipatdop/little-neat-trick-to-capture-click-outside-with-react-hook-ba77c37c7e82
  const searchContainer = useRef();

  const checkSearchFocus = (e) => {
    if (searchContainer.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setSearchFocused(false);
  };

  // initial calls
  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", checkSearchFocus);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", checkSearchFocus);
    };
  }, []);

  const toggleMode = () => {
    queryParams["mode"] =
      queryParams["mode"] === "simplified" ? "traditional" : "simplified";

    let location_split = location.pathname.split("/");
    location_split = location_split.filter((x) => x !== "");

    if (location_split[0] === "word") {
      const temp = queryParams["alt"];
      queryParams["alt"] = location_split[1];
      location_split[1] = temp;

      history.push(
        `/${location_split.join("/")}/?${queryString.stringify(queryParams)}`
      );
    }

    if (location_split[0] === "results") {
      history.push(
        `/${location_split.join("/")}/?${queryString.stringify(queryParams)}`
      );
    }
  };

  return (
    <div
      className={`shadow-lg w-full md:w-3/4 flex mx-auto bg-white dark:bg-dark-800 border-2 ${borderPrimaryColor}`}
      style={{
        marginTop: "-2px",
      }}
    >
      {/* Logo and link to home */}
      <Link
        to={`/?mode=${modeParam}`}
        className={`hidden md:block font-semibold english-serif px-6 py-2 red text-2xl`}
      >
        hotpot
      </Link>
      {/* Simplified-traditional toggle */}
      <div
        onClick={toggleMode}
        className={`flex-none chinese-serif py-3 text-xl px-2 cursor-pointer select-none bg-black text-white dark:bg-gray-800 dark:text-gray-500`}
      >
        {modeParam === "simplified" ? "简体" : "繁体"}
      </div>
      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className={`chinese-serif bg-transparent outline-none w-full`}
      >
        <div className="w-full h-full relative" ref={searchContainer}>
          {/* Search input box */}
          <input
            className={`px-4 chinese-serif bg-transparent outline-none w-full h-full border-l-2 border-r-2 ${borderPrimaryColor}`}
            type="text"
            placeholder={`Search ${numberWithCommas(118639)} words`}
            value={searchWord}
            onChange={updateSearch}
            onFocus={() => setSearchFocused(true)}
            onClick={() => {}}
          ></input>
          {/* Render search results */}
          {results.length > 0 && searchWord !== "" && searchFocused && (
            <div
              className={`shadow-lg z-10 absolute text-left bg-white dark:bg-dark-800 border-2 w-full ${borderPrimaryColor}`}
            >
              {results.map((result, index) => {
                return (
                  <Link
                    to={`/word/${result[modeParam]}?mode=${modeParam}`}
                    onClick={() => setSearchFocused(false)}
                    className={`${linkHover} ${linkHoverScale} block bg-white dark:bg-dark-500 dark-hover:bg-dark-800`}
                    key={index}
                  >
                    <div className={`py-1 px-3`}>
                      <div className="font-semibold">
                        {/* Result character */}
                        <div className="text-xl inline chinese-serif">
                          {modeParam === "simplified"
                            ? result["simplified"]
                            : result["traditional"]}
                        </div>
                        {/* Pinyin */}
                        <div className="pl-2 inline text-gray-700 dark:text-gray-300 english-serif">
                          {pinyinify(result["pinyin"])}
                        </div>
                      </div>
                      {/* Definition */}
                      <div className="text-gray-700 dark:text-gray-300 english-serif">
                        {result["definition"]}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </form>
      {/* Dark mode toggle */}
      <div
        onClick={toggleTheme}
        checked={theme === "dark"}
        className={`chinese-serif py-2 text-2xl px-2 cursor-pointer select-none dark:text-gray-400`}
      >
        {theme === "dark" ? "暗" : "光"}
      </div>
    </div>
  );
};

export default Navbar;
