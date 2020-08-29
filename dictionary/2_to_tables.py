import config
import pandas as pd
import ujson
from tqdm import tqdm

print("Processing CEDICT... ", end="")

cedict = pd.read_csv(
    "./data/raw/cedict_1_0_ts_utf-8_mdbg/cedict_ts.u8",
    sep="\t",
    skiprows=30,
    names=["line"],
)

cedict = cedict["line"].str.split(" ", 2, expand=True)
cedict.columns = ["simplified", "traditional", "definition"]

cedict.to_csv(f"./data/intermediate/cedict.txt", sep="\t")

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

    for line in tqdm(f,total=):
        line_json = ujson.loads(line)

        zh_translation_json.append(line_json)

zh_translations = pd.DataFrame(zh_translation_json)

zh_translations.to_feather(
    "./data/intermediate/zh_translations.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
print("ok")
