import React, { useState, useRef } from "react";
import { useHistory, Link } from "react-router-dom";

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

  var [searchWord, setSearchWord] = useState("");
  let [results, setResults] = useState([]);

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
        `https://huoguo-search.kevinhu.io/.netlify/functions/search?query=${query}`
      )
        .then((response) => {
          return response.json();
        })
        .then((body) => {
          setResults(body);
        });
    }, 160)
  ).current;

  const handleChange = (event) => {
    event.persist();
    setSearchWord(event.target.value);

    executeSearch(event.target.value);
  };

  // search box style
  const searchBoxSizing =
    "w-full md:w-2/3 xl:w-1/2 absolute mx-auto text-center py-12";
  const searchBoxAesthetics = "border-2 bg-white dark:bg-gray-800";
  const searchBoxStyle = `${searchBoxSizing} ${searchBoxAesthetics} ${borderPrimaryColor}`;

  return (
    <div
      className={`w-full md:w-3/4 flex mx-auto bg-white dark:bg-gray-800 border-2 ${borderPrimaryColor}`}
      style={{
        marginTop: "-2px",
      }}
    >
      <Link
        to="/"
        className={`english-serif px-6 py-2 red text-2xl border-r-2 ${borderSecondaryColor}`}
      >
        huoguo
      </Link>
      <form
        onSubmit={handleSubmit}
        className="chinese-serif px-6 bg-transparent outline-none w-full"
      >
        <div className="w-full h-full relative">
          <input
            className="chinese-serif bg-transparent outline-none w-full h-full"
            type="text"
            placeholder={`Search 118639 words`}
            value={searchWord}
            onChange={handleChange}
          ></input>
          {results.length > 0 && searchWord !== "" && (
            <div
              className={`absolute text-left bg-white dark:bg-gray-800 border-2 border-black w-full ${borderSecondaryColor}`}
            >
              {results.map((result, index) => {
                return (
                  <Link
                    to={`/word/${result["simplified"]}`}
                    className={linkHover}
                    key={index}
                  >
                    <div className="flex items-center">
                      <div className="p-2 text-xl font-semibold">
                        {result["simplified"]}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {pinyinify(result["pinyin"])}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {result["definition"]}
                        </div>
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
        className={`chinese-serif py-2 text-2xl px-2 cursor-pointer select-none border-l-2 ${borderSecondaryColor}`}
      >
        {theme === "dark" ? "暗" : "光"}
      </div>
    </div>
  );
};

export default Navbar;
