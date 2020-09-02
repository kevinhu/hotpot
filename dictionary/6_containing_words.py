import gzip

import ahocorasick
import pandas as pd
import ujson
from tqdm import tqdm

# ============================================
# Script purpose:
# Find words that contain a word within CEDICT
# ============================================


# speed up text search by using the Aho-Corasick algorithm
def characters_to_words(words):

    # see https://stackoverflow.com/questions/34816775/python-optimal-search-for-substring-in-list-of-strings

    mapping = {}

    auto = ahocorasick.Automaton()
    for word in words:
        auto.add_word(word, word)
    auto.make_automaton()

    for word in tqdm(words):
        for end_ind, found in auto.iter(word):
            if found in mapping:
                mapping[found].append(word)
            else:
                mapping[found] = [word]

    return mapping


cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

simplified_words = list(cedict["simplified"])
traditional_words = list(cedict["traditional"])

simplified_char_to_word = characters_to_words(simplified_words)
traditional_char_to_word = characters_to_words(traditional_words)

with gzip.open(
    "./data/intermediate/simplified_containing_words.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(simplified_char_to_word, f)

with gzip.open(
    "./data/intermediate/traditional_containing_words.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(traditional_char_to_word, f)
