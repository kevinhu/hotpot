import zipfile

from utils import download_from_url

download_from_url(
    "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip",
    "./data/raw/cedict_1_0_ts_utf-8_mdbg.zip",
    overwrite=True,
)
download_from_url(
    "https://raw.githubusercontent.com/cjkvi/cjkvi-ids/master/ids.txt",
    "./data/raw/cjkvi_ids.txt",
    overwrite=True,
)

download_from_url(
    "https://github.com/fxsjy/jieba/raw/master/extra_dict/dict.txt.big",
    "./data/raw/dict.txt.big.txt",
    overwrite=True,
)

print("Unzipping cedict_1_0_ts_utf-8_mdbg.zip... ", end="")

with zipfile.ZipFile("./data/raw/cedict_1_0_ts_utf-8_mdbg.zip", "r") as zip_ref:
    zip_ref.extractall("./data/raw/cedict_1_0_ts_utf-8_mdbg")

    print("ok")
