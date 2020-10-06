import config
import opencc
import pandas as pd
import re
import ujson
from gensim.models import KeyedVectors
from tqdm import tqdm

tqdm.pandas()

# ===========================
# Script purpose:
# Convert raw files to tables
# ===========================

# ------
# CEDICT
# ------
print("Processing CEDICT... ", end="")

cedict = pd.read_csv(
    "./data/raw/cedict_1_0_ts_utf-8_mdbg/cedict_ts.u8",
    sep="\t",
    skiprows=30,
    names=["line"],
)

# split space-delimited definitions into parts
cedict = cedict["line"].str.split(" ", 2, expand=True)
cedict.columns = ["traditional", "simplified", "definition"]


def format_pinyin(pinyin):

    pinyin = re.sub("(^|\s)r5", " 'r", pinyin)
    if pinyin.startswith(" "):
        pinyin = pinyin[1:]

    return pinyin


# trim bracket separators
cedict["pinyin"] = cedict["definition"].apply(lambda x: x.split("]", 1)[0][1:])
cedict["pinyin"] = cedict["pinyin"].apply(format_pinyin)
cedict["definition"] = cedict["definition"].apply(lambda x: x.split("]", 1)[1][2:-1])

cedict.to_csv(f"./data/intermediate/cedict.txt", sep="\t")

print("ok")

# -------
# BCC_LEX
# -------
print("Processing BCC_LEX_Zh... ", end="")

bcc_lex = pd.read_csv(
    "./data/raw/blogs_wordfreq-release_utf-8.txt",
    encoding="utf-8",
    sep="\t",
    names=["word", "frequency"],
)

# normalize to simplified words only
simplified = set(cedict["simplified"])
bcc_lex = bcc_lex[bcc_lex["word"].isin(simplified)]

# compute frequency statistics
bcc_lex["rank"] = list(range(1, len(bcc_lex) + 1))
bcc_lex["normalized_rank"] = bcc_lex["rank"] / len(bcc_lex)
bcc_lex["fraction"] = bcc_lex["frequency"] / bcc_lex["frequency"].sum()
bcc_lex["cumulative_fraction"] = bcc_lex["fraction"].cumsum()

bcc_lex.to_csv(f"./data/intermediate/bcc_lex.txt", sep="\t")

print("ok")

# -----
# CJKVI
# -----
print("Processing CJKVI... ", end="")

cjkvi = pd.read_csv(
    "./data/raw/cjkvi_ids.txt",
    sep="\t",
    skiprows=2,
    names=["unicode", "character", "decomposition"],
)

# keep first decomposition for characters with multiple
cjkvi["decomposition"] = cjkvi["decomposition"].str.split("[").str[0]

INVALID_CHARACTERS = [
    "⓪",
    "①",
    "②",
    "③",
    "④",
    "⑤",
    "⑥",
    "⑦",
    "⑧",
    "⑨",
    "⑩",
    "⑪",
    "⑫",
    "⑬",
    "⑭",
    "⑮",
    "⑯",
    "⑰",
    "⑱",
    "⑲",
    "⑳",
    "㉑",
    "㉒",
    "㉓",
    "㉔",
    "㉕",
    "㉖",
    "㉗",
    "㉘",
    "㉙",
    "㉚",
    "㉛",
    "㉜",
    "㉝",
    "㉞",
    "㉟",
    "㊱",
    "㊲",
    "㊳",
    "㊴",
    "㊵",
    "㊶",
    "㊷",
    "㊸",
    "㊹",
    "㊺",
    "㊻",
    "㊼",
    "㊽",
    "㊾",
    "㊿",
]


def replace_all(text):
    for char in INVALID_CHARACTERS:
        if char in text:
            text = text.replace(char, "")

    return text


cjkvi["decomposition"] = cjkvi["decomposition"].apply(replace_all)

cjkvi.to_csv(f"./data/intermediate/cjkvi.txt", sep="\t")

print("ok")

# --------------------
# Tencent word vectors
# --------------------

tencent_vectors = KeyedVectors.load_word2vec_format(
    "data/raw/Tencent_AILab_ChineseEmbedding/Tencent_AILab_ChineseEmbedding.txt",
    binary=False,
)

tencent_vectors.save("data/intermediate/tencent_vectors")

# -----------------
# Translated corpus
# -----------------
print("Processing translated corpus... ")

zh_translation_json = []

# read line-delimited JSON
with open("./data/raw/translation2019zh/translation2019zh_train.json", "r") as f:

    k = 0

    for line in tqdm(f):
        line_json = ujson.loads(line)

        zh_translation_json.append(line_json)

zh_translations = pd.DataFrame(zh_translation_json)

# normalize to simplified and traditional versions
s2t_converter = opencc.OpenCC("s2t.json")
t2s_converter = opencc.OpenCC("t2s.json")

print("Converting to simplified...")
zh_translations["simplified"] = zh_translations["chinese"].progress_apply(
    t2s_converter.convert
)

print("Converting to traditional...")
zh_translations["traditional"] = zh_translations["chinese"].progress_apply(
    s2t_converter.convert
)

# remove original mixed chinese
zh_translations = zh_translations.drop("chinese", axis=1)

# save to efficient feather format
zh_translations.to_feather(
    "./data/intermediate/zh_translations.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
print("ok")
