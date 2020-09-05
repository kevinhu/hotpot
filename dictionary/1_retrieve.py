import zipfile

from utils import download_from_url

# =================================
# Script purpose:
# Download and unzip all raw files
# =================================

# Word frequency calculations from Beijing Language and Culture University
download_from_url(
    "http://bcc.blcu.edu.cn/downloads/resources/BCC_LEX_Zh.zip",
    "./data/raw/BCC_LEX_Zh.zip",
    overwrite=False,
)

# Word frequency calculations for blogs, converted to UTF-8
download_from_url(
    "https://www.plecoforums.com/download/blogs_wordfreq-release_utf-8-txt.2602/",
    "./data/raw/blogs_wordfreq-release_utf-8.txt",
    overwrite=False,
)

# CEDICT dictionary
download_from_url(
    "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip",
    "./data/raw/cedict_1_0_ts_utf-8_mdbg.zip",
    overwrite=True,
)

# CJKVI character decompositions
download_from_url(
    "https://raw.githubusercontent.com/cjkvi/cjkvi-ids/master/ids.txt",
    "./data/raw/cjkvi_ids.txt",
    overwrite=True,
)

# Word segmentation index for jieba
download_from_url(
    "https://github.com/fxsjy/jieba/raw/master/extra_dict/dict.txt.big",
    "./data/raw/dict.txt.big.txt",
    overwrite=True,
)

# FastText CommonCrawl word vectors
download_from_url(
    "https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.zh.300.bin.gz",
    "./data/raw/cc.zh.300.bin.gz",
    overwrite=True,
)

# Tencent word vectors
download_from_url(
    "https://ai.tencent.com/ailab/nlp/en/data/Tencent_AILab_ChineseEmbedding.tar.gz",
    "./data/raw/Tencent_AILab_ChineseEmbedding.tar.gz",
    overwrite=True,
)

print("Unzipping BCC_LEX_Zh.zip... ", end="")

with zipfile.ZipFile("./data/raw/BCC_LEX_Zh.zip", "r") as zip_ref:
    zip_ref.extractall("./data/raw/BCC_LEX_Zh")
    print("ok")

print("Unzipping cedict_1_0_ts_utf-8_mdbg.zip... ", end="")

with zipfile.ZipFile("./data/raw/cedict_1_0_ts_utf-8_mdbg.zip", "r") as zip_ref:
    zip_ref.extractall("./data/raw/cedict_1_0_ts_utf-8_mdbg")

    print("ok")

print("Unzipping Tencent_AILab_ChineseEmbedding.zip... ", end="")

with zipfile.ZipFile("./data/raw/Tencent_AILab_ChineseEmbedding.zip", "r") as zip_ref:
    zip_ref.extractall("./data/raw/Tencent_AILab_ChineseEmbedding")

    print("ok")
