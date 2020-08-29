import config
import jieba
import pandas as pd
from tqdm import tqdm

tqdm.pandas()

jieba.set_dictionary("./data/raw/dict.txt.big.txt")

zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_filtered.feather",
)


def segment(sentence):
    return " ".join(jieba.cut_for_search(sentence, HMM=True))


zh_translations["chinese_segmented"] = zh_translations["chinese"].progress_apply(
    segment
)

zh_translations.to_feather(
    "./data/intermediate/zh_translations_segmented.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
