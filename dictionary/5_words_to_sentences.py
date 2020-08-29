import gzip

import config
import pandas as pd
import ujson
from tqdm import tqdm

MAX_SENTENCES = 8

tqdm.pandas()

zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_segmented.feather"
)

words_to_sentences = {}


def append_sentence(row):

    sentence_id = row.name
    words = row["chinese_segmented"].split(" ")

    for word in words:
        if word in words_to_sentences:
            if len(words_to_sentences[word]) < MAX_SENTENCES:
                words_to_sentences[word].append(sentence_id)
        else:
            words_to_sentences[word] = [sentence_id]


zh_translations.progress_apply(append_sentence, axis=1)


with gzip.open(
    "./data/intermediate/words_to_sentences.json.zip", "wt", encoding="utf-8"
) as f:
    ujson.dump(words_to_sentences, f)
