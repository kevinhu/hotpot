import gzip

import config
import pandas as pd
import ujson
from tqdm import tqdm

merged = {}

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t")
cjkvi = pd.read_csv(f"./data/intermediate/cjkvi.txt", sep="\t")

cjkvi = cjkvi.set_index("character")
cjkvi_characters = set(cjkvi.index)

with gzip.open(
    "./data/intermediate/simplified_char_to_word.json.zip", "rt", encoding="utf-8"
) as f:
    simplified_char_to_word = ujson.loads(f.read())

with gzip.open(
    "./data/intermediate/traditional_char_to_word.json.zip", "rt", encoding="utf-8"
) as f:
    traditional_char_to_word = ujson.loads(f.read())

with gzip.open(
    "./data/intermediate/words_to_sentences.json.zip", "rt", encoding="utf-8"
) as f:
    words_to_sentences = ujson.loads(f.read())

zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_segmented.feather"
)


def unify_word_info(word):

    word_simplified = word
