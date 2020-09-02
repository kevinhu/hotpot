import gzip

import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

# =================================================
# Script purpose:
# Unify previous outputs into single JSONs per word
# =================================================

MAX_CONTAINING_WORDS = 16

# ---------------------
# Load previous outputs
# ---------------------

# merge CEDICT and BCC_LEX
cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

bcc_lex = pd.read_csv(f"./data/intermediate/bcc_lex.txt", sep="\t", index_col=0)
bcc_lex = bcc_lex.set_index("word", drop=False)
cedict = cedict.join(bcc_lex, on="simplified").fillna(-1)
cedict = cedict.drop("frequency", axis=1)

# separate CEDICT into simplified and traditional
cedict_simplified = cedict.set_index("simplified", drop=False)
cedict_simplified = cedict_simplified[~cedict_simplified.index.duplicated(keep="first")]
cedict_simplified = cedict_simplified.to_dict(orient="index")

cedict_traditional = cedict.set_index("traditional", drop=False)
cedict_traditional = cedict_traditional[
    ~cedict_traditional.index.duplicated(keep="first")
]
cedict_traditional = cedict_traditional.to_dict(orient="index")

# create simplified-traditional converters
simplified_to_traditional = dict(zip(cedict["simplified"], cedict["traditional"]))
traditional_to_simplified = dict(zip(cedict["traditional"], cedict["simplified"]))

# load CJKVI decompositions
cjkvi = pd.read_csv(f"./data/intermediate/cjkvi.txt", sep="\t", index_col=0)
cjkvi = cjkvi.set_index("character", drop=False).to_dict(orient="index")

# load simplified containing words
with gzip.open(
    "./data/intermediate/simplified_containing_words.json.zip", "rt", encoding="utf-8"
) as f:
    simplified_containing_words = ujson.loads(f.read())

# load traditional containing words
with gzip.open(
    "./data/intermediate/traditional_containing_words.json.zip", "rt", encoding="utf-8"
) as f:
    traditional_containing_words = ujson.loads(f.read())

# load simplified word-to-sentence
with gzip.open(
    "./data/intermediate/simplified_wts.json.zip", "rt", encoding="utf-8"
) as f:
    simplified_wts = ujson.loads(f.read())

# load traditional word-to-sentence
with gzip.open(
    "./data/intermediate/traditional_wts.json.zip", "rt", encoding="utf-8"
) as f:
    traditional_wts = ujson.loads(f.read())

# load translated sentence examples
zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_segmented.feather"
)
zh_translations = zh_translations.drop(
    [
        "index",
        "zh_length",
        "uniqueness",
        "simplified_segmented",
        "traditional_segmented",
    ],
    axis=1,
)
zh_translations = zh_translations.to_dict(orient="index")

# load nearest-embedding distances
embeddings_dists = pd.read_hdf(
    "./data/intermediate/embeddings_dists.h5", key="embeddings_dists",
)

# load nearest-embedding words
embeddings_nearest = pd.read_hdf(
    "./data/intermediate/embeddings_nearest.h5", key="embeddings_nearest",
)

# iterator for each CEDICT row
def unify_word_info(cedict_row):

    word_info = {}

    word_simplified = cedict_row["simplified"]
    word_traditional = cedict_row["traditional"]

    # CEDICT info
    word_info["simplified"] = word_simplified
    word_info["traditional"] = word_traditional
    word_info["definition"] = cedict_row["definition"]
    word_info["pinyin"] = cedict_row["pinyin"]

    # frequency statistics
    word_info["rank"] = cedict_row["rank"]
    word_info["normalized_rank"] = cedict_row["normalized_rank"]
    word_info["fraction"] = cedict_row["fraction"]
    word_info["cumulative_fraction"] = cedict_row["cumulative_fraction"]

    # if multiple characters, get definitions for each
    if len(word_simplified) > 1:
        simplified_characters = [
            cedict_simplified.get(x, {"simplified": x}) for x in word_simplified
        ]

        traditional_characters = [
            cedict_traditional.get(x, {"traditional": x}) for x in word_traditional
        ]

        # fields to retain
        characters_fields = ["traditional", "simplified", "definition", "pinyin"]

        # filter out other fields
        simplified_characters = [
            {key: value for key, value in x.items() if key in characters_fields}
            for x in simplified_characters
        ]
        traditional_characters = [
            {key: value for key, value in x.items() if key in characters_fields}
            for x in traditional_characters
        ]

        word_info["simplified_characters"] = simplified_characters
        word_info["traditional_characters"] = traditional_characters

    # if single character, fetch components and definitions
    elif len(word_simplified) == 1:
        simplified_components = cjkvi.get(word_simplified, {})
        traditional_components = cjkvi.get(word_traditional, {})

        # fields to retain
        component_fields = ["traditional", "simplified", "definition", "pinyin"]

        if bool(simplified_components):

            # get definitions for decomposition characters
            simplified_components["decomposition_definitions"] = [
                cedict_simplified.get(x, {"simplified": x})
                for x in simplified_components["decomposition"]
            ]

            # filter out other fields
            simplified_components["decomposition_definitions"] = [
                {key: value for key, value in x.items() if key in component_fields}
                for x in simplified_components["decomposition_definitions"]
            ]

        if bool(traditional_components):

            # get definitions for decomposition characters
            traditional_components["decomposition_definitions"] = [
                cedict_traditional.get(x, {"traditional": x})
                for x in traditional_components["decomposition"]
            ]

            # filter out other fields
            traditional_components["decomposition_definitions"] = [
                {key: value for key, value in x.items() if key in component_fields}
                for x in traditional_components["decomposition_definitions"]
            ]

        word_info["simplified_components"] = simplified_components
        word_info["traditional_components"] = traditional_components

    # get containing words
    simplified_words = simplified_containing_words.get(word_simplified, [])
    traditional_words = traditional_containing_words.get(word_traditional, [])

    # normalize simplified-traditional containing words
    traditional_words_simplified = [
        traditional_to_simplified[x] for x in traditional_words
    ]

    # sort containing words by frequency
    containing_words = list(set(simplified_words + traditional_words_simplified))
    containing_words = [cedict_simplified[x] for x in containing_words]
    containing_words = sorted(
        containing_words, key=lambda x: x["fraction"], reverse=True
    )

    # keep top containing words
    containing_words = containing_words[:MAX_CONTAINING_WORDS]
    containing_words = [
        x for x in containing_words if x["simplified"] != word_simplified
    ]

    # keep only fields of interest
    containing_words_fields = ["traditional", "simplified", "definition", "pinyin"]
    containing_words = [
        {key: value for key, value in x.items() if key in containing_words_fields}
        for x in containing_words
    ]
    word_info["containing_words"] = containing_words

    # get IDs of sentences containing word
    simplified_sentence_ids = simplified_wts.get(word_simplified, [])
    traditional_sentence_ids = traditional_wts.get(word_traditional, [])

    sentence_ids = set(simplified_sentence_ids + traditional_sentence_ids)
    word_info["sentences"] = [zh_translations[x] for x in sentence_ids]

    # get embedding-based related words
    related = list(embeddings_nearest.loc[word_simplified])
    related = [traditional_to_simplified.get(x, x) for x in related]

    # get definitions of related words
    related = [{**cedict_simplified[x], "simplified": x} for x in related]
    related = [x for x in related if x["simplified"] != word_simplified]

    # keep only fields of interest
    related_fields = ["traditional", "simplified", "definition", "pinyin"]
    related = [
        {key: value for key, value in x.items() if key in related_fields}
        for x in related
    ]
    word_info["related"] = related

    with open(f"./data/dictionary-files/word_jsons/{word_simplified}.json", "w",) as f:
        ujson.dump(word_info, f)

    if word_simplified != word_traditional:

        with open(
            f"./data/dictionary-files/word_jsons/{word_traditional}.json", "w",
        ) as f:
            ujson.dump(word_info, f)


cedict.progress_apply(unify_word_info, axis=1)
