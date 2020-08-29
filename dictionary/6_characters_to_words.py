import gzip

import pandas as pd
import ujson
from tqdm import tqdm

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

simplified_words = list(cedict["simplified"])
traditional_words = list(cedict["traditional"])


def characters_to_words(words):

    mapping = {}

    for word in tqdm(words):

        for character in word:

            if character in mapping:

                mapping[character].append(word)

            else:

                mapping[character] = [word]

    return mapping


simplified_char_to_word = characters_to_words(simplified_words)
traditional_char_to_word = characters_to_words(traditional_words)

with gzip.open(
    "./data/intermediate/simplified_char_to_word.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(simplified_char_to_word, f)

with gzip.open(
    "./data/intermediate/traditional_char_to_word.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(simplified_char_to_word, f)
