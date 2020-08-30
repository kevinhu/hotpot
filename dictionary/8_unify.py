import gzip

import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

MAX_CONTAINING_WORDS = 16

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

bcc_lex = pd.read_csv(f"./data/intermediate/bcc_lex.txt", sep="\t", index_col=0)
bcc_lex = bcc_lex.set_index("word", drop=False)
cedict = cedict.join(bcc_lex, on="simplified").fillna(-1)
cedict = cedict.drop("frequency", axis=1)

cedict_simplified = cedict.set_index("simplified", drop=False)
cedict_simplified = cedict_simplified[~cedict_simplified.index.duplicated(keep="first")]
cedict_simplified = cedict_simplified.to_dict(orient="index")

cedict_traditional = cedict.set_index("traditional", drop=False)
cedict_traditional = cedict_traditional[
    ~cedict_traditional.index.duplicated(keep="first")
]
cedict_traditional = cedict_traditional.to_dict(orient="index")

simplified_to_traditional = dict(zip(cedict["simplified"], cedict["traditional"]))
traditional_to_simplified = dict(zip(cedict["traditional"], cedict["simplified"]))

cjkvi = pd.read_csv(f"./data/intermediate/cjkvi.txt", sep="\t", index_col=0)
cjkvi = cjkvi.set_index("character", drop=False).to_dict(orient="index")

with gzip.open(
    "./data/intermediate/simplified_containing_words.json.zip", "rt", encoding="utf-8"
) as f:
    simplified_char_to_word = ujson.loads(f.read())

with gzip.open(
    "./data/intermediate/traditional_containing_words.json.zip", "rt", encoding="utf-8"
) as f:
    traditional_char_to_word = ujson.loads(f.read())

with gzip.open(
    "./data/intermediate/simplified_wts.json.zip", "rt", encoding="utf-8"
) as f:
    simplified_wts = ujson.loads(f.read())

with gzip.open(
    "./data/intermediate/traditional_wts.json.zip", "rt", encoding="utf-8"
) as f:
    traditional_wts = ujson.loads(f.read())

zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_segmented.feather"
)
zh_translations = zh_translations.drop(
    ["zh_length", "uniqueness", "simplified_segmented", "traditional_segmented"], axis=1
)
zh_translations = zh_translations.to_dict(orient="index")


embeddings_dists = pd.read_hdf(
    "./data/intermediate/embeddings_dists.h5", key="embeddings_dists",
)

embeddings_nearest = pd.read_hdf(
    "./data/intermediate/embeddings_nearest.h5", key="embeddings_nearest",
)


def unify_word_info(cedict_row):

    word_info = {}

    word_simplified = cedict_row["simplified"]
    word_traditional = cedict_row["traditional"]

    word_info["simplified"] = word_simplified
    word_info["traditional"] = word_traditional
    word_info["definition"] = cedict_row["definition"]
    word_info["pinyin"] = cedict_row["pinyin"]

    is_character = len(word_simplified) == 1

    if len(word_simplified) > 1:
        word_info["simplified_characters"] = [
            cedict_simplified.get(x, {}) for x in word_simplified
        ]

        word_info["traditional_characters"] = [
            cedict_traditional.get(x, {}) for x in word_traditional
        ]

    if is_character:
        simplified_components = cjkvi.get(word_simplified, {})
        traditional_components = cjkvi.get(word_traditional, {})

        if bool(simplified_components):
            simplified_components["decomposition_definitions"] = [
                cedict_simplified.get(x, {"simplified": x})
                for x in simplified_components["decomposition"]
            ]

        if bool(traditional_components):
            traditional_components["decomposition_definitions"] = [
                cedict_traditional.get(x, {"traditional": x})
                for x in traditional_components["decomposition"]
            ]

        word_info["simplified_components"] = simplified_components
        word_info["traditional_components"] = traditional_components

    simplified_words = simplified_char_to_word.get(word_simplified, [])
    traditional_words = traditional_char_to_word.get(word_traditional, [])
    traditional_words_simplified = [
        traditional_to_simplified[x] for x in traditional_words
    ]

    containing_words = list(set(simplified_words + traditional_words_simplified))
    containing_words = [cedict_simplified[x] for x in containing_words]
    containing_words = sorted(
        containing_words, key=lambda x: x["fraction"], reverse=True
    )
    containing_words = containing_words[:MAX_CONTAINING_WORDS]
    containing_words = [
        x for x in containing_words if x["simplified"] != word_simplified
    ]
    word_info["containing_words"] = containing_words

    simplified_sentence_ids = simplified_wts.get(word_simplified, [])
    traditional_sentence_ids = traditional_wts.get(word_traditional, [])

    sentence_ids = set(simplified_sentence_ids + traditional_sentence_ids)

    word_info["sentences"] = [zh_translations[x] for x in sentence_ids]

    related = list(embeddings_nearest.loc[word_simplified])
    related = [traditional_to_simplified.get(x, x) for x in related]
    related = [{**cedict_simplified[x], "simplified": x} for x in related]
    related = [x for x in related if x["simplified"] != word_simplified]
    word_info["related"] = related

    with open(f"./data/dictionary-files/word_jsons/{word_simplified}.json", "w",) as f:
        # ujson.dump(word_info, f)
        f.write(ujson.dumps(word_info, indent=4))

    if word_simplified != word_traditional:

        with open(
            f"./data/dictionary-files/word_jsons/{word_traditional}.json", "w",
        ) as f:
            # ujson.dump(word_info, f)
            f.write(ujson.dumps(word_info, indent=4))


cedict.iloc[25000:25100].progress_apply(unify_word_info, axis=1)
