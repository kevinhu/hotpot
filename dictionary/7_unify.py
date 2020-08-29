import gzip

import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

cedict_simplified = cedict.set_index("simplified")
cedict_simplified = cedict_simplified[~cedict_simplified.index.duplicated(keep="first")]
cedict_simplified = cedict_simplified.to_dict(orient="index")

cedict_traditional = cedict.set_index("traditional")
cedict_traditional = cedict_traditional[
    ~cedict_traditional.index.duplicated(keep="first")
]
cedict_traditional = cedict_traditional.to_dict(orient="index")

cjkvi = pd.read_csv(f"./data/intermediate/cjkvi.txt", sep="\t", index_col=0)
cjkvi = cjkvi.set_index("character").to_dict(orient="index")

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

zh_translations = zh_translations.to_dict(orient="index")


def unify_word_info(cedict_row):

    word_info = {}

    word_simplified = cedict_row["simplified"]
    word_traditional = cedict_row["traditional"]

    word_info["simplified"] = word_simplified
    word_info["traditional"] = word_traditional
    word_info["definition"] = cedict_row["definition"]
    word_info["pinyin"] = cedict_row["pinyin"]

    is_character = len(word_simplified) == 1

    word_info["simplified_characters"] = [
        cedict_simplified.get(x, {}) for x in word_simplified
    ]
    word_info["traditional_characters"] = [
        cedict_simplified.get(x, {}) for x in word_traditional
    ]

    if is_character:
        word_info["simplified_components"] = cjkvi.get(word_simplified, {})
        word_info["traditional_components"] = cjkvi.get(word_traditional, {})

    word_info["simplified_words"] = simplified_char_to_word.get(word_simplified, [])
    word_info["traditional_words"] = traditional_char_to_word.get(word_traditional, [])

    simplified_sentence_ids = words_to_sentences.get(word_simplified, [])
    traditional_sentence_ids = words_to_sentences.get(word_traditional, [])

    word_info["simplified_sentences"] = [
        zh_translations[x] for x in simplified_sentence_ids
    ]
    word_info["traditional_sentences"] = [
        zh_translations[x] for x in traditional_sentence_ids
    ]

    with open(f"./data/dictionary-files/word_jsons/{word_simplified}.json", "w",) as f:
        ujson.dump(word_info, f)

    if word_simplified != word_traditional:

        with open(
            f"./data/dictionary-files/word_jsons/{word_traditional}.json", "w",
        ) as f:
            ujson.dump(word_info, f)


cedict.progress_apply(unify_word_info, axis=1)
