import config
import jieba
import pandas as pd
from tqdm import tqdm

tqdm.pandas()

# ===========================
# Script purpose:
# Segment translated examples
# ===========================

# use downloaded segmenting index
jieba.set_dictionary("./data/raw/dict.txt.big.txt")

zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_filtered.feather",
)

# use space delimiter to store segmented list as string
# (works because all sentence with English spaces were eliminated)
def segment(sentence):
    return " ".join(jieba.cut_for_search(sentence, HMM=True))


# process simplified sentences
zh_translations["simplified_segmented"] = zh_translations["simplified"].progress_apply(
    segment
)

# process traditional sentences
zh_translations["traditional_segmented"] = zh_translations[
    "traditional"
].progress_apply(segment)

zh_translations.to_feather(
    "./data/intermediate/zh_translations_segmented.feather",
    compression=config.FEATHER_COMPRESSION,
    compression_level=config.FEATHER_COMPRESSION_LEVEL,
)
