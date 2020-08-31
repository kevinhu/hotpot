import config
import opencc
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

print("Processing CEDICT... ", end="")

cedict = pd.read_csv(
    "./data/raw/cedict_1_0_ts_utf-8_mdbg/cedict_ts.u8",
    sep="\t",
    skiprows=30,
    names=["line"],
)

cedict = cedict["line"].str.split(" ", 2, expand=True)
cedict.columns = ["traditional", "simplified", "definition"]

cedict["pinyin"] = cedict["definition"].apply(lambda x: x.split("]", 1)[0][1:])
cedict["definition"] = cedict["definition"].apply(lambda x: x.split("]", 1)[1][2:-1])

cedict.to_csv(f"./data/intermediate/cedict.txt", sep="\t")

print("ok")

print("Processing BCC_LEX_Zh... ", end="")

bcc_lex = pd.read_csv(
    "./data/raw/blogs_wordfreq-release_utf-8.txt",
    encoding="utf-8",
    sep="\t",
    names=["word", "frequency"],
)

simplified = set(cedict["simplified"])
bcc_lex = bcc_lex[bcc_lex["word"].isin(simplified)]

bcc_lex["rank"] = list(range(1, len(bcc_lex) + 1))
bcc_lex["normalized_rank"] = bcc_lex["rank"] / len(bcc_lex)
bcc_lex["fraction"] = bcc_lex["frequency"] / bcc_lex["frequency"].sum()
bcc_lex["cumulative_fraction"] = bcc_lex["fraction"].cumsum()

bcc_lex.to_csv(f"./data/intermediate/bcc_lex.txt", sep="\t")

print("ok")

print("Processing CJKVI... ", end="")

cjkvi = pd.read_csv(
    "./data/raw/cjkvi_ids.txt",
    sep="\t",
    skiprows=2,
    names=["unicode", "character", "decomposition"],
)

cjkvi.to_csv(f"./data/intermediate/cjkvi.txt", sep="\t")

print("ok")

print("Processing translated corpus... ")

zh_translation_json = []

with open("./data/raw/translation2019zh/translation2019zh_train.json", "r") as f:

    k = 0

    for line in tqdm(f):
        line_json = ujson.loads(line)

        zh_translation_json.append(line_json)

zh_translations = pd.DataFrame(zh_translation_json)

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

zh_translations = zh_translations.drop("chinese", axis=1)

zh_translations.to_feather(
    "./data/intermediate/zh_translations.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
print("ok")
