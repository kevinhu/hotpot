import React, { useEffect, useState } from 'react';

// location management
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

// themes and components
import { Link, useParams } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import Loading from '../components/Loading';
import Footer from '../components/Footer';
import PinyinCharacter from '../components/PinyinCharacter.js';
import NotFound from '../assets/not_found.svg';
import {
  linkHover,
  linkHoverScale,
  textPrimaryColor,
  textSecondaryColor,
  borderPrimaryColor,
  borderSecondaryColor,
} from '../themes';

// other utilities
import {
  pinyinify,
  removeDuplicates,
  getCharacterLength,
  ordinalSuffixOf,
} from '../utilities';

const IDEOGRAPHIC_DESCRIPTIONS = [
  '⿰',
  '⿱',
  '⿲',
  '⿳',
  '⿴',
  '⿵',
  '⿶',
  '⿷',
  '⿸',
  '⿹',
  '⿺',
  '⿻',
];

const MAX_OTHER_DESCRIPTION_LENGTH = 64;

const Word = () => {
  // enable location and history
  let history = useHistory();
  let location = useLocation();
  let params = useParams();

  // parse search parameters and get mode and query
  let queryParams = queryString.parse(location.search);
  let modeParam = queryParams['mode'];
  let wordParam = params['word'];

  // resolve other modes
  if (modeParam !== 'simplified' && modeParam !== 'traditional') {
    modeParam = 'simplified';
    history.replace(`/word/${encodeURI(wordParam)}/?mode=${modeParam}`);
  }

  // keep track of other mode
  let otherMode;

  if (modeParam === 'simplified') {
    otherMode = 'traditional';
  } else {
    otherMode = 'simplified';
  }

  const { pathname } = location;

  // reset scroll when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // keep track
  const [word, setWord] = useState(); // current word to display
  const [wordMode, setWordMode] = useState(); // current mode
  const [wordData, setWordData] = useState(); // word data object
  const [loading, setLoading] = useState(false); // whether or not page is loading
  const [progress, setProgress] = useState(0); // top progress bar percentage

  // initial calls
  useEffect(() => {
    if (wordParam && modeParam && !loading) {
      // if word or mode changes, and we are not currently loading
      if (wordParam !== word || modeParam !== wordMode) {
        setLoading(true);
        setProgress(0);

        // get word data
        fetch(
          `https://raw.githubusercontent.com/kevinhu/dictionary-files/master/${modeParam}/${wordParam}.json`
        )
          .then((response) => {
            setProgress(50);
            if (response.status === 404) {
              setProgress(100);
              setWord(wordParam);
              setWordMode(modeParam);
              setWordData(undefined);
              setLoading(false);
              return;
            }
            return response.json();
          })
          .then((data) => {
            setProgress(100);
            setWord(wordParam);
            setWordMode(modeParam);
            setWordData(data);

            if (modeParam === 'simplified') {
              const alt = data['traditional'][0];
              history.replace(
                `/word/${encodeURI(
                  wordParam
                )}/?mode=${modeParam}&alt=${encodeURI(alt)}`
              );
            } else if (modeParam === 'traditional') {
              const alt = data['simplified'][0];
              history.replace(
                `/word/${encodeURI(
                  wordParam
                )}/?mode=${modeParam}&alt=${encodeURI(alt)}`
              );
            }
            setLoading(false);
          });
      }
    }
  }, [wordParam, modeParam, loading, word, wordMode, history]);

  // if no word data
  if (!wordData) {
    // if not loading, assume word not found
    if (!loading) {
      return (
        <div className="text-center w-full h-full p-12">
          <img
            alt="Word not found."
            className="py-12 w-1/2 md:w-1/3 m-auto select-none"
            src={NotFound}
          ></img>
          <div className="text-lg select-none mb-6">Word not found.</div>
        </div>
      );
    }
    // otherwise, render the loading spinner
    else {
      return <Loading />;
    }
  }

  // get type of word
  const wordType = wordData['traditional'] ? 'simplified' : 'traditional';

  // whether word has a single pinyin
  const singlePinyin =
    removeDuplicates(wordData['pinyin'].map((x) => x.toLowerCase())).length ===
    1;

  const wordLength = getCharacterLength(wordData['word']);

  // size of title characters
  let mainSize = 0;

  // adjust size of title characters by length
  if (wordLength < 3) {
    mainSize = 6;
  } else if (wordLength < 6) {
    mainSize = 4;
  } else if (wordLength < 9) {
    mainSize = 3;
  } else {
    mainSize = 2;
  }

  // subsection header style
  const sectionHeaderStyle = `english-serif text-xl font-semibold ${textPrimaryColor}`;

  return (
    <div
      className={`w-full ${
        modeParam === 'simplified' ? 'chinese-serif-sc' : 'chinese-serif-tc'
      }`}
    >
      {/* Top loading stripe */}
      <LoadingBar
        color="#f11946"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {/* Word info container */}
      <div className="w-full text-center pt-16">
        {/* Word text */}
        <div className="w-3/4 mx-auto flex justify-center flex-wrap pb-8">
          {getCharacterLength(wordData['word']) === 1 ? (
            <PinyinCharacter
              character={wordData['word']}
              pinyin={singlePinyin ? pinyinify(wordData['pinyin'][0]) : ''}
              characterSize={`${mainSize}rem`}
              pinyinSize={`${mainSize / 3}rem`}
              className="px-1"
            />
          ) : (
            wordData['characters'] &&
            wordData['characters'].map((character, index) => {
              return (
                <PinyinCharacter
                  character={character['word']}
                  pinyin={
                    singlePinyin
                      ? pinyinify(wordData['pinyin'][0].split(' ')[index])
                      : ''
                  }
                  characterSize={`${mainSize}rem`}
                  pinyinSize={`${mainSize / 3}rem`}
                  className="px-1"
                  key={index}
                />
              );
            })
          )}
        </div>

        {/* Other mode characters */}
        <div className="mx-auto pb-2" style={{ width: 'max-content' }}>
          <div
            className={`border-b-2 ${borderSecondaryColor} ${textSecondaryColor}`}
          >
            {wordType === 'simplified' ? 'Traditional' : 'Simplified'}
          </div>
          {wordType === 'simplified' &&
            removeDuplicates(wordData['traditional']).map(
              (traditional, index) => (
                <Link
                  to={`/word/${encodeURI(traditional)}/?mode=${otherMode}`}
                  className={`${textPrimaryColor} ${linkHover} 
											}`}
                  key={index}
                >
                  <div
                    className="inline px-2 text-2xl chinese-serif-tc"
                    key={index}
                  >
                    {traditional}
                  </div>
                </Link>
              )
            )}
          {wordType === 'traditional' &&
            removeDuplicates(wordData['simplified']).map(
              (simplified, index) => (
                <Link
                  to={`/word/${encodeURI(simplified)}/?mode=${otherMode}`}
                  className={`${textPrimaryColor} ${linkHover} 
											}`}
                  key={index}
                >
                  <div
                    className="inline px-2 text-2xl chinese-serif-sc"
                    key={index}
                  >
                    {simplified}
                  </div>
                </Link>
              )
            )}
        </div>
      </div>

      {/* Container for word definitions, usage, etc. */}
      <div
        className={`shadow-xl w-full md:w-3/4 flex flex-wrap mx-auto mb-12 bg-white border-2 dark:bg-dark-800 ${borderPrimaryColor}`}
      >
        {/* Word definitions, characters, and example sentences */}
        <div className={`w-full md:w-2/3 border-r-2 ${borderSecondaryColor}`}>
          {/* Word definitions */}
          <div className={`p-6 border-b-2 ${borderSecondaryColor}`}>
            <div className={sectionHeaderStyle}>
              {wordData['definition'].length > 1 ? 'Definitions' : 'Definition'}
            </div>
            {wordData['definition'].map((definition, index) => (
              <div className="py-1 leading-5" key={index}>
                <div className="inline font-bold">{index + 1}. </div>
                <div className={`inline font-semibold ${textPrimaryColor}`}>
                  ({pinyinify(wordData['pinyin'][index])}){' '}
                </div>
                <div className={`inline ${textSecondaryColor}`}>
                  {definition.replace(/\//g, '; ')}
                </div>
              </div>
            ))}
          </div>
          {/* Word characters/components */}
          <div
            className={`p-6 pr-2 border-b-2 ${borderSecondaryColor} ${textPrimaryColor}`}
          >
            <div className={sectionHeaderStyle}>
              {getCharacterLength(wordData['word']) > 1
                ? 'Characters'
                : 'Components'}
            </div>
            {getCharacterLength(wordData['word']) > 1
              ? wordData['characters'].map((character, index) => {
                  return (
                    <Link
                      to={`/word/${encodeURI(
                        character['word']
                      )}/?mode=${modeParam}`}
                      className={`block bg-white dark:bg-dark-800 -ml-4 p-4 dark-hover:bg-dark-800 ${linkHover} ${linkHoverScale} ${
                        !character['definition'] && 'disabled-link'
                      }`}
                      key={index}
                    >
                      <div className={`flex items-center`}>
                        <div className="text-4xl pr-4 leading-8">
                          {character['word']}
                        </div>

                        <div>
                          <div className="text-xl font-semibold">
                            {character['pinyin'] &&
                              pinyinify(
                                removeDuplicates(
                                  character['pinyin'].map((x) =>
                                    x.toLowerCase()
                                  )
                                )
                                  .sort()
                                  .join(' / ')
                              )}
                          </div>
                          <div
                            className={`${textSecondaryColor} leading-5 break-all`}
                          >
                            {character['definition'] &&
                              character['definition'].join(' | ')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              : 'decomposition_definitions' in wordData['components'] &&
                wordData['components']['decomposition_definitions'].map(
                  (character, index) => {
                    if (!IDEOGRAPHIC_DESCRIPTIONS.includes(character['word'])) {
                      return (
                        <Link
                          to={`/word/${encodeURI(
                            character['word']
                          )}/?mode=${modeParam}`}
                          className={`block bg-white dark:bg-dark-800 dark-hover:bg-dark-800 -ml-4 p-4 ${linkHover} ${linkHoverScale} ${
                            !character['definition'] && 'disabled-link'
                          }`}
                          key={index}
                        >
                          <div className={`flex items-center`}>
                            <div className="text-4xl pr-4 leading-8">
                              {character['word']}
                            </div>

                            <div>
                              <div className="text-xl font-semibold">
                                {character['pinyin'] &&
                                  pinyinify(
                                    removeDuplicates(
                                      character['pinyin'].map((x) =>
                                        x.toLowerCase()
                                      )
                                    )
                                      .sort()
                                      .join(' / ')
                                  )}
                              </div>
                              <div
                                className={`${textSecondaryColor} leading-5 break-all`}
                              >
                                {character['definition'] &&
                                  character['definition'].join(' | ')}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    } else {
                      return '';
                    }
                  }
                )}
          </div>
          {/* Word example sentences */}
          <div className={`p-6 ${textPrimaryColor}`}>
            <div className={sectionHeaderStyle} key={-1}>
              Example sentences
            </div>
            {wordData['sentences'].length === 0 &&
              'No example sentences found.'}
            {wordData['sentences'].map((sentence, index) => {
              let sentenceSplit = sentence['chinese'].split(wordData['word']);
              let splitLen = sentenceSplit.length;

              let sentenceJoin = sentenceSplit.map((text, index) => {
                if (index < splitLen - 1) {
                  return (
                    <React.Fragment key={index}>
                      {text}
                      <div className="red inline">{wordData['word']}</div>
                    </React.Fragment>
                  );
                } else {
                  return text;
                }
              });

              return (
                <div className="py-3" key={index}>
                  <div className="text-xl">{sentenceJoin}</div>
                  <div className={textSecondaryColor}>
                    {sentence['english']}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Word statistics, containing words, and related words */}
        <div
          className={`w-full md:w-1/3 border-t-2 md:border-none ${borderSecondaryColor}`}
        >
          {/* Word statistics */}
          <div className={`p-6 border-b-2 ${borderSecondaryColor}`}>
            <div className={sectionHeaderStyle}>Statistics</div>

            {wordData['rank'] !== -1 ? (
              <div>
                <div className={`font-bold inline ${textPrimaryColor}`}>
                  {wordData['rank']}
                  <sup>{ordinalSuffixOf(wordData['rank'])}</sup>
                </div>{' '}
                <div className={`inline ${textSecondaryColor}`}>
                  most frequent word
                </div>
              </div>
            ) : (
              <div className={textSecondaryColor}>Word rank unavailable.</div>
            )}

            {wordData['fraction'] !== -1 ? (
              <div>
                <div className={`font-bold inline ${textPrimaryColor}`}>
                  {(wordData['fraction'] * 100).toPrecision(2)}%
                </div>{' '}
                <div className={`inline ${textSecondaryColor}`}>
                  of all words
                </div>
              </div>
            ) : (
              <div className={textSecondaryColor}>
                Word fraction unavailable.
              </div>
            )}
          </div>
          {/* Containing words */}
          <div
            className={`p-6 pr-2 border-b-2 ${borderSecondaryColor} ${textPrimaryColor}`}
          >
            <div className={sectionHeaderStyle}>Containing words</div>
            {wordData['containing_words'].length === 0 &&
              'No containing words found.'}
            {wordData['containing_words'].map((contain_word, index) => {
              let wordPinyin = contain_word['pinyin'][0].split(' ');

              let displayWord = contain_word['word']
                .split('')
                .map((character, index) => {
                  return (
                    <PinyinCharacter
                      character={character}
                      pinyin={pinyinify(wordPinyin[index])}
                      characterSize="1.5rem"
                      pinyinSize="0.75rem"
                      key={index}
                    />
                  );
                });

              return (
                <div className="pt-1" key={index}>
                  <Link
                    to={`/word/${encodeURI(
                      contain_word['word']
                    )}/?mode=${modeParam}`}
                    className={`${linkHover} ${linkHoverScale} block bg-white dark:bg-dark-800 dark-hover:bg-dark-800 -ml-4 p-4 -mb-4`}
                  >
                    <div className={`flex flex-wrap text-xl`}>
                      {displayWord}
                    </div>

                    <div
                      className={`${textSecondaryColor} break-all leading-5`}
                    >
                      {contain_word['definition'][0].length >
                      MAX_OTHER_DESCRIPTION_LENGTH
                        ? contain_word['definition'][0].substring(
                            0,
                            MAX_OTHER_DESCRIPTION_LENGTH
                          ) + '...'
                        : contain_word['definition'][0]}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {/* Related words */}
          <div className="p-6 pr-2">
            <div className={`${sectionHeaderStyle} ${textPrimaryColor}`}>
              See also
            </div>
            {wordData['related'].length === 0 && 'No related words found.'}
            {wordData['related'].map((related_word, index) => {
              let wordPinyin = related_word['pinyin'][0].split(' ');

              let displayWord = related_word['word']
                .split('')
                .map((character, index) => {
                  return (
                    <PinyinCharacter
                      character={character}
                      pinyin={pinyinify(wordPinyin[index])}
                      characterSize="1.5rem"
                      pinyinSize="0.75rem"
                      key={index}
                    />
                  );
                });

              return (
                <div className={`pt-1 ${textPrimaryColor}`} key={index}>
                  <Link
                    to={`/word/${encodeURI(
                      related_word['word']
                    )}/?mode=${modeParam}`}
                    className={`${linkHover} ${linkHoverScale} block bg-white dark:bg-dark-800 dark-hover:bg-dark-800 -ml-4 p-4 -mb-4`}
                  >
                    <div className={`flex flex-wrap text-xl`}>
                      {displayWord}
                    </div>

                    <div
                      className={`${textSecondaryColor}  break-all leading-5`}
                    >
                      {related_word['definition'][0].length >
                      MAX_OTHER_DESCRIPTION_LENGTH
                        ? related_word['definition'][0].substring(
                            0,
                            MAX_OTHER_DESCRIPTION_LENGTH
                          ) + '...'
                        : related_word['definition'][0]}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Word;
