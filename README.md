# [huoguo](https://huoguo.kevinhu.io)

A static Chinese-English dictionary entirely hosted on GitHub Pages. See it live at [https://huoguo.kevinhu.io](https://huoguo.kevinhu.io/).

## Overview

Chinese-English dictionaries are essential tools for learning the language. This project constructs a dictionary with the essential function of providing English definitions for Chinese words plus three powerful extensions:

1. Word frequency statistics
2. Word/character decomposition and etymology
3. Recommendations for related words
4. Examples of word usage in sentences along with translations

## How it works

1. Retrieval of source data (performed by `/dictionary/1_retrieve.py`):
   - Word definitions from [CEDICT](https://www.mdbg.net/chinese/dictionary?page=cedict)
   - Word frequencies from [BCC_LEX](https://challenges.hackingchinese.com/resources/stories/451-blcu-balanced-corpus-frequency-lists)
   - Word decompositions from [CJK (Chinese-Japanese-Korean) ideographic description sequences](https://github.com/cjkvi/cjkvi-ids)
   - Chinese word embeddings from [FastText](https://fasttext.cc/docs/en/crawl-vectors.html) on Common Crawl and Wikipedia
   - Sentence segmentation index for the [jieba library](https://github.com/fxsjy/jieba)
   - Open Chinese-English translated sentences from [kaggle](https://www.kaggle.com/terrychanorg/translation2019zh)
2. Conversion of source data to Pandas-processable tables (`/dictionary/2_to_tables.py`)
3. Filtering of translated sentences (`/dictionary/3_filter_examples.py`)
4. Segmentation of filtered translated sentences using `jieba` (`/dictionary/4_segment_examples.py`)
5. Extraction of segmented words from sentences to create a word -> example sentences mapping (`/dictionary/5_words_to_sentences.py`)
6. Computation of words-containing-words through Aho-Corasick on CEDICT (`/dictionary/6_containing_words.py`)
7. Computation of related words by using nearest-neighbor search on FastText vectors (`/dictionary/7_fasttext_similars.py`)
8. Unification of previous outputs into single JSON files for each word ready for the frontend, split by simplified and traditional (`/dictionary/8_unify.py`)
9. Construction of a reduced dictionary for client-side search (`/dictionary/9_client_search.py`)
10. The web client (a standard create-react-app) takes the JSON files hosted on GitHub to render the entries

Considerations:

- Due to the size of the output of step 8, the outputs are hosted in a submodule ([kevinhu/dictionary-files](https://github.com/kevinhu/dictionary-files)) rather than in huoguo itself.
- The Chinese-English translated sentences are not included in `/dictionary/1_retrieve.py` because a Kaggle login is required for download.

## Getting started

### Dictionary construction

1. Install Python dependencies with `poetry install`
2. Activate virtual environment with `poetry shell`

### Frontend

1. Install JavaScript dependencies with `yarn install`
2. Start the client with `yarn start`
3. Deploy to GitHub Pages with `yarn deploy` (make sure `package.json` URL and CNAME record are configured correctly)

Note that the scraper and frontend are more or less independent with the exception of the final `.json` output.

