import config
import pandas as pd
import ujson
from tqdm import tqdm

tqdm.pandas()

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)
zh_translations = pd.read_feather(
    "./data/intermediate/zh_translations_filtered.feather"
)

simplified_words = set(cedict["simplified"])
traditional_words = set(cedict["traditional"])

simplified_counts = dict(zip(cedict["simplified"], [0] * len(cedict)))
traditional_counts = dict(zip(cedict["traditional"], [0] * len(cedict)))

MAX_WORD_LENGTH = max(
    (max(cedict["simplified"].apply(len)), max(cedict["traditional"].apply(len)))
)

print(f"Max word length: {MAX_WORD_LENGTH}")


def append_counts(sentence):

    for length in range(1, MAX_WORD_LENGTH):

        for i in range(len(sentence) - length + 1):

            substring = sentence[i : i + length]

            if substring in simplified_words:

                simplified_counts[substring] += 1

            if substring in traditional_words:

                traditional_counts[substring] += 1


zh_translations["chinese"].progress_apply(append_counts)

simplified_counts = pd.Series(simplified_counts)
traditional_counts = pd.Series(traditional_counts)

simplified_counts.name = "simplified_count"
traditional_counts.name = "traditional_count"

simplified_counts.to_csv("./data/intermediate/simplified_counts.txt", sep="\t")
traditional_counts.to_csv("./data/intermediate/traditional_counts.txt", sep="\t")
