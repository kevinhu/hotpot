import React, { useState, useRef, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import queryString from "query-string";

import { pinyinify, numberWithCommas } from "../utilities";

// Import dark mode
import { useDarkMode } from "../components/DarkMode";

import {
  linkHover,
  textPrimaryColor,
  textSecondaryColor,
  borderPrimaryColor,
  borderSecondaryColor,
} from "../themes";

var _ = require("lodash");

const Navbar = () => {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  let history = useHistory();
  let location = useLocation();

  var [searchWord, setSearchWord] = useState("");
  let [results, setResults] = useState([]);
  let [searchFocused, setSearchFocused] = useState(false);

  let queryParams = queryString.parse(location.search);
  let modeParam = queryParams["mode"];

  if (modeParam !== "simplified" && modeParam !== "traditional") {
    queryParams["mode"] = "simplified";
    history.push(`${location.pathname}/?${queryString.stringify(queryParams)}`);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    history.push(`/word?word=${searchWord}`);
  };

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

  // search box style
  const searchBoxSizing =
    "w-full md:w-2/3 xl:w-1/2 absolute mx-auto text-center py-12";
  const searchBoxAesthetics = "border-2 bg-white dark:bg-gray-800";
  const searchBoxStyle = `${searchBoxSizing} ${searchBoxAesthetics} ${borderPrimaryColor}`;

  // handlers for detecting clicks outside of search input and suggestions
  // see https://medium.com/@pitipatdop/little-neat-trick-to-capture-click-outside-with-react-hook-ba77c37c7e82
  const searchContainer = useRef();

  const handleChange = (event) => {
    event.persist();
    setSearchWord(event.target.value);

    executeSearch(event.target.value);
  };

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleClick = (e) => {
    if (searchContainer.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setSearchFocused(false);
  };

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
  };

  return (
    <div
      className={`shadow-lg w-full md:w-3/4 flex mx-auto bg-white dark:bg-dark-800 border-2 ${borderPrimaryColor}`}
      style={{
        marginTop: "-2px",
      }}
    >
      <Link to="/" className={`english-serif px-6 py-2 red text-2xl`}>
        hotpot
      </Link>
      <div
        onClick={toggleMode}
        className={`flex-none chinese-serif py-3 text-xl px-2 cursor-pointer select-none border-l-2 ${borderSecondaryColor}`}
      >
        {modeParam === "simplified" ? "简体" : "繁体"}
      </div>
      <form
        onSubmit={handleSubmit}
        className={`chinese-serif bg-transparent outline-none w-full`}
      >
        <div className="w-full h-full relative" ref={searchContainer}>
          <input
            className={`px-6 chinese-serif bg-transparent outline-none w-full h-full border-l-2 border-r-2 ${borderSecondaryColor}`}
            type="text"
            placeholder={`Search ${numberWithCommas(118639)} words`}
            value={searchWord}
            onChange={handleChange}
            onFocus={() => setSearchFocused(true)}
            onClick={() => {}}
          ></input>
          {results.length > 0 && searchWord !== "" && searchFocused && (
            <div
              className={`shadow-lg z-10 absolute text-left bg-white dark:bg-dark-800 border-2 w-full ${borderPrimaryColor}`}
            >
              {results.map((result, index) => {
                return (
                  <Link
                    to={`/word/${result["simplified"]}?mode=${modeParam}`}
                    className={linkHover}
                    key={index}
                  >
                    <div
                      className={`p-2 ${
                        index != 0 && "border-t-2"
                      } border-gray-300 dark:border-gray-800`}
                    >
                      <div className="font-semibold">
                        <div className="text-xl inline chinese-serif">
                          {result["simplified"]}
                        </div>
                        <div className="pl-2 inline text-gray-700 dark:text-gray-300 english-serif">
                          {pinyinify(result["pinyin"])}
                        </div>
                      </div>
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
      <div
        onClick={toggleTheme}
        checked={theme === "dark"}
        className={`chinese-serif py-2 text-2xl px-2 cursor-pointer select-none`}
      >
        {theme === "dark" ? "暗" : "光"}
      </div>
    </div>
  );
};

export default Navbar;
