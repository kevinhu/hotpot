# [hotpot](https://hotpot.kevinhu.io)

A static Chinese-English dictionary entirely hosted on GitHub Pages and Netlify. See it live at [https://hotpot.kevinhu.io](https://hotpot.kevinhu.io/).

## Overview

Chinese-English dictionaries are essential tools for learning the language. This project constructs a dictionary with the basic function of providing English definitions for Chinese words plus three powerful extensions:

1. Word frequency statistics
2. Word/character decomposition and etymology
3. Recommendations for related words
4. Examples of word usage in translated sentences

## How it works

### Dictionary construction

1. Retrieval of source data; performed by [`/dictionary/1_retrieve.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/1_retrieve.py):
   - Word definitions from [CEDICT](https://www.mdbg.net/chinese/dictionary?page=cedict)
   - Word frequencies from [BCC_LEX](https://challenges.hackingchinese.com/resources/stories/451-blcu-balanced-corpus-frequency-lists)
   - Word decompositions from [CJK (Chinese-Japanese-Korean) ideographic description sequences](https://github.com/cjkvi/cjkvi-ids)
   - Chinese word embeddings from [Tencent AI](https://ai.tencent.com/ailab/nlp/en/embedding.html)
   - Sentence segmentation index for the [jieba library](https://github.com/fxsjy/jieba)
   - Open Chinese-English translated sentences from [kaggle](https://www.kaggle.com/terrychanorg/translation2019zh)
2. Conversion of source data to Pandas-processable tables; [`/dictionary/2_to_tables.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/2_to_tables.py)
3. Filtering of translated sentences; [`/dictionary/3_filter_examples.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/3_filter_examples.py)
4. Segmentation of filtered translated sentences using `jieba`; [`/dictionary/4_segment_examples.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/4_segment_examples.py)
5. Extraction of segmented words from sentences to create a word -> example sentences mapping; [`/dictionary/5_words_to_sentences.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/5_words_to_sentences.py)
6. Computation of words-containing-words through Aho-Corasick on CEDICT; [`/dictionary/6_containing_words.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/6_containing_words.py)
7. Computation of related words by using nearest-neighbor search (via [annoy](https://github.com/spotify/annoy)) on FastText vectors; [`/dictionary/7_word2vec_similars.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/7_fasttext_similars.py)
8. Unification of previous outputs into single JSON files for each word ready for the frontend, split by simplified and traditional; [`/dictionary/8_unify.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/8_unify.py)
9. Construction of an index for search; [`/dictionary/9_client_search.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/9_client_search.py)

Considerations:

- Due to the size of the output of step 8, the outputs are hosted in a submodule ([kevinhu/dictionary-files](https://github.com/kevinhu/dictionary-files)) rather than in hotpot itself.
- The Chinese-English translated sentences are not included in [`/dictionary/1_retrieve.py`](https://github.com/kevinhu/hotpot/blob/master/dictionary/1_retrieve.py) because a Kaggle login is required for download.

### API

The API consists of a single serverless function hosted on Netlify that implements full-text search with [FlexSearch](https://github.com/nextapps-de/flexsearch).

1. We first prepare a FlexSearch index in [`/api/prepare_index.js`](https://github.com/kevinhu/hotpot/blob/master/api/prepare_index.js). This cuts down cold-start times to about a few seconds.
2. The actual serverless endpoint is then described in [`/api/search.js`](https://github.com/kevinhu/hotpot/blob/master/api/search.js).

### Client

The web client (a standard create-react-app) then takes the JSON files hosted on GitHub to render the entries. It also makes calls to the API for searching.

## Getting started

### Dictionary construction

1. Install Python dependencies with `poetry install`
2. Activate virtual environment with `poetry shell`

### API

1. Link the repository to your Netlify account and enable continuous deployments.
2. Change the search paths in the frontend to the correct URL.

### Client

1. Install JavaScript dependencies with `yarn install`
2. Start the client with `yarn start`
3. Deploy to GitHub Pages with `yarn deploy` (make sure the "homepage" parameter in [`package.json`](https://github.com/kevinhu/hotpot/blob/master/package.json) and [CNAME record](https://github.com/kevinhu/hotpot/tree/master/public/CNAME) in `/public` are configured correctly)

Note that the scraper and frontend are more or less independent with the exception of the final `.json` output.

