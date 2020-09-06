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
cedict = cedict.sort_values("rank", ascending=True)

simplified_to_traditional = dict(zip(cedict["simplified"], cedict["traditional"]))
traditional_to_simplified = dict(zip(cedict["traditional"], cedict["simplified"]))

cedict_simplified_unique = cedict.drop_duplicates("simplified", keep="first").set_index(
    "simplified"
)
cedict_traditional_unique = cedict.drop_duplicates(
    "traditional", keep="first"
).set_index("traditional")

frequency_cols = ["rank", "normalized_rank", "fraction", "cumulative_fraction"]

# separate CEDICT into simplified and traditional
# group multi-definition words
cedict_simplified = cedict.groupby("simplified")[
    ["definition", "pinyin", "traditional"]
].agg(list)
cedict_simplified = cedict_simplified.join(
    cedict_simplified_unique[frequency_cols], on="simplified"
)
cedict_simplified.index.name = "word"
cedict_simplified["word"] = cedict_simplified.index
cedict_simplified = cedict_simplified.to_dict(orient="index")

cedict_traditional = cedict.groupby("traditional")[
    ["definition", "pinyin", "simplified"]
].agg(lambda x: sorted(list(set(x))))
cedict_traditional = cedict_traditional.join(
    cedict_traditional_unique[frequency_cols], on="traditional"
)
cedict_traditional.index.name = "word"
cedict_traditional["word"] = cedict_traditional.index
cedict_traditional = cedict_traditional.to_dict(orient="index")


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

embedded_words = set(embeddings_dists.index)

# iterator for each CEDICT row
def unify_word_info(word, cedict_entry, cedict_reference, kind):

    word_info = cedict_entry

    # if multiple characters, get definitions for each
    if len(word) > 1:
        characters = [cedict_reference.get(x, {"word": x}) for x in word]

        # fields to retain
        characters_fields = ["word", "definition", "pinyin"]

        # filter out other fields
        characters = [
            {key: value for key, value in x.items() if key in characters_fields}
            for x in characters
        ]

        word_info["characters"] = characters

    # if single character, fetch components and definitions
    elif len(word) == 1:
        components = cjkvi.get(word, {})

        # fields to retain
        component_fields = ["word", "definition", "pinyin"]

        if bool(components):

            # get definitions for decomposition characters
            components["decomposition_definitions"] = [
                cedict_reference.get(x, {"word": x})
                for x in components["decomposition"]
            ]

            # filter out other fields
            components["decomposition_definitions"] = [
                {key: value for key, value in x.items() if key in component_fields}
                for x in components["decomposition_definitions"]
            ]

        word_info["components"] = components

    # get containing words
    containing_words = []
    if kind == "simplified":
        containing_words = simplified_containing_words.get(word, [])
    elif kind == "traditional":
        containing_words = traditional_containing_words.get(word, [])

    # sort containing words by frequency
    containing_words = [cedict_reference[x] for x in containing_words]
    containing_words = sorted(
        containing_words, key=lambda x: x["fraction"], reverse=True
    )

    # keep top containing words
    containing_words = containing_words[:MAX_CONTAINING_WORDS]
    containing_words = [x for x in containing_words if x["word"] != word]

    # keep only fields of interest
    containing_words_fields = ["word", "definition", "pinyin"]
    containing_words = [
        {key: value for key, value in x.items() if key in containing_words_fields}
        for x in containing_words
    ]
    word_info["containing_words"] = containing_words

    # get IDs of sentences containing word
    sentence_ids = []
    if kind == "simplified":
        sentence_ids = simplified_wts.get(word, [])
    elif kind == "traditional":
        sentence_ids = traditional_wts.get(word, [])

    sentences = [zh_translations[x] for x in sentence_ids]

    if kind == "simplified":
        word_info["sentences"] = [
            {"english": x["english"], "chinese": x["simplified"]} for x in sentences
        ]
    elif kind == "traditional":
        word_info["sentences"] = [
            {"english": x["english"], "chinese": x["traditional"]} for x in sentences
        ]

    # get embedding-based related words
    if word in embedded_words:
        related = list(embeddings_nearest.loc[word])
    else:
        related = []

    if kind == "simplified":
        related = [traditional_to_simplified.get(x, x) for x in related]
    elif kind == "traditional":
        related = [simplified_to_traditional.get(x, x) for x in related]

    # get definitions of related words
    related = [{**cedict_reference[x], "word": x} for x in related]
    related = [x for x in related if x["word"] != word]

    # keep only fields of interest
    related_fields = ["word", "definition", "pinyin"]
    related = [
        {key: value for key, value in x.items() if key in related_fields}
        for x in related
    ]
    word_info["related"] = related

    with open(f"./data/dictionary-files/{kind}/{word}.json", "w",) as f:
        ujson.dump(word_info, f)


print("Creating simplified files")
try:
    for word, entry in tqdm(cedict_simplified.items()):
        unify_word_info(word, entry, cedict_simplified, "simplified")
except Exception as e:
    print(e)

print("Creating traditional files")
try:
    for word, entry in tqdm(cedict_traditional.items()):
        unify_word_info(word, entry, cedict_traditional, "traditional")
except Exception as e:
    print(e)
