import re

import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

zh_translations = pd.read_feather("./data/intermediate/zh_translations.feather",)

# filter by sentence length

print("Applying length filter")
zh_translations["zh_length"] = zh_translations["chinese"].apply(len)

MIN_LENGTH = 8
MAX_LENGTH = 24

zh_translations = zh_translations[zh_translations["zh_length"] <= MAX_LENGTH]
zh_translations = zh_translations[zh_translations["zh_length"] >= MIN_LENGTH]

# filter out bad characters
with open("./data/raw/prohibited_characters.json", "r") as f:
    PROHIBITED_CHARACTERS = ujson.load(f)

print("Applying character filter")


def zh_filter(sentence):

    if re.search(r"|".join(PROHIBITED_CHARACTERS), sentence):
        return False
    return True


zh_translations = zh_translations[zh_translations["chinese"].progress_apply(zh_filter)]

# remove brackets manually due to weird regex bug
zh_translations = zh_translations[
    zh_translations["chinese"].apply(lambda x: "[" not in x and "]" not in x)
]

# filter for punctuation
zh_translations = zh_translations[
    zh_translations["chinese"].apply(lambda x: x.count("。") == 1 or x.count("？") == 1)
]

# filter out repetitive sentences
print("Applying repetitiveness filter")
zh_translations["uniqueness"] = zh_translations["chinese"].apply(
    lambda x: len(set(x)) / len(x)
)
MIN_UNIQUENESS_CUTOFF = 0.8
zh_translations = zh_translations[
    zh_translations["uniqueness"] >= MIN_UNIQUENESS_CUTOFF
]

zh_translations = zh_translations.reset_index()

zh_translations.to_feather(
    "./data/intermediate/zh_translations_filtered.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
