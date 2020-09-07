import re

import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

# ==========================
# Script purpose:
# Filter translated examples
# ==========================

ALLOWED_ENDINGS = ["。", "？", "！"]
MIN_LENGTH = 8
MAX_LENGTH = 24
MIN_UNIQUENESS = 0.8

zh_translations = pd.read_feather("./data/intermediate/zh_translations.feather",)

# --------------------------
# Remove language duplicates
# --------------------------
print("Removing duplicates")
zh_translations = zh_translations.drop_duplicates(
    subset=["simplified", "traditional", "english"], keep="first"
)

# -------------------------
# Filter by sentence length
# -------------------------
print("Applying length filter")
zh_translations["zh_length"] = zh_translations["simplified"].apply(len)


zh_translations = zh_translations[zh_translations["zh_length"] <= MAX_LENGTH]
zh_translations = zh_translations[zh_translations["zh_length"] >= MIN_LENGTH]

# filter out bad characters
with open("./data/raw/prohibited_characters.json", "r") as f:
    PROHIBITED_CHARACTERS = ujson.load(f)

# ----------------------------------------
# Filter out sentences with bad characters
# ----------------------------------------
print("Applying character filter")


def character_filter(sentence):

    if re.search(r"|".join(PROHIBITED_CHARACTERS), sentence):
        return False
    return True


zh_translations = zh_translations[
    zh_translations["simplified"].progress_apply(character_filter)
]

# remove brackets manually due to weird regex bug
zh_translations = zh_translations[
    zh_translations["simplified"].apply(lambda x: "[" not in x and "]" not in x)
]

# -----------------------------------------
# Filter out sentences with bad punctuation
# -----------------------------------------


zh_translations = zh_translations[
    zh_translations["simplified"].apply(lambda x: x[-1] in ALLOWED_ENDINGS)
]

# -------------------------------
# Filter out repetitive sentences
# -------------------------------
print("Applying repetitiveness filter")
zh_translations["uniqueness"] = zh_translations["simplified"].apply(
    lambda x: len(set(x)) / len(x)
)

zh_translations = zh_translations[zh_translations["uniqueness"] >= MIN_UNIQUENESS]

# ---------------------------
# Export to intermediate file
# ---------------------------
zh_translations = zh_translations.reset_index()

zh_translations.to_feather(
    "./data/intermediate/zh_translations_filtered.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
