import gzip

import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

# =================================================
# Script purpose:
# Match segmented example sentences to CEDICT words
# =================================================

MAX_SENTENCES = 8

zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_segmented.feather"
)

simplified_wts = {}
traditional_wts = {}


def append_sentence(row):

    sentence_id = row.name
    simplified_words = row["simplified_segmented"].split(" ")
    traditional_words = row["traditional_segmented"].split(" ")

    for word in simplified_words:
        if word in simplified_wts:
            if len(simplified_wts[word]) < MAX_SENTENCES:
                simplified_wts[word].append(sentence_id)
        else:
            simplified_wts[word] = [sentence_id]

    for word in traditional_words:

        if word in traditional_wts:
            if len(traditional_wts[word]) < MAX_SENTENCES:
                traditional_wts[word].append(sentence_id)
        else:
            traditional_wts[word] = [sentence_id]


zh_translations.progress_apply(append_sentence, axis=1)


with gzip.open(
    "./data/intermediate/simplified_wts.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(simplified_wts, f)

with gzip.open(
    "./data/intermediate/traditional_wts.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(traditional_wts, f)
