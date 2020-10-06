import config
import fasttext
import numpy as np
import pandas as pd
from annoy import AnnoyIndex
from gensim.models import KeyedVectors
from scipy.spatial import cKDTree
from tqdm import tqdm

# ============================================================
# Script purpose:
# Use nearest-neighbor word embeddings to find suggested words
# ============================================================

# number of nearest-neighbor words to save
NUM_NEAREST = 16

# python reduce_model.py ./data/raw/cc.zh.300.bin 100
# zh_model = fasttext.load_model("./data/raw/cc.zh.100.bin")
tencent_vectors = KeyedVectors.load("data/intermediate/tencent_vectors", mmap="r")
vocab = set(tencent_vectors.wv.vocab.keys())

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

# unify simplified+traditional words
words = list(set(cedict["simplified"]) | set(cedict["traditional"]))

# compute embeddings
embedded_words = []
word_index = 0

nn_index = AnnoyIndex(200, "angular")

print("Constructing nn index")
for word in tqdm(words):
    if word in vocab:
        word_embedding = tencent_vectors.wv.word_vec(word)

        nn_index.add_item(word_index, word_embedding)
        embedded_words.append(word)

        word_index += 1

nn_index.build(256)

nearest_indices = []
nearest_dists = []

print("Retrieving nearest neighbors")
for word_idx, word in tqdm(enumerate(embedded_words), total=len(embedded_words),):
    indices, dists = nn_index.get_nns_by_item(
        word_idx, n=NUM_NEAREST + 1, include_distances=True
    )

    # remove query itself
    indices = indices[1:]
    dists = dists[1:]

    nearest_indices.append(indices)
    nearest_dists.append(dists)

# convert embedding distances and nearest-words to dataframe
print("Exporting results")
embeddings_dists = pd.DataFrame(nearest_dists, index=embedded_words)
embeddings_nearest = pd.DataFrame(nearest_indices, index=embedded_words)
embeddings_nearest = embeddings_nearest.applymap(lambda x: embedded_words[x])

embeddings_dists.to_hdf(
    "./data/intermediate/embeddings_dists.h5",
    key="embeddings_dists",
    complevel=config.HDF_COMPLEVEL,
    complib=config.HDF_COMPLIB,
    mode="w",
)

embeddings_nearest.to_hdf(
    "./data/intermediate/embeddings_nearest.h5",
    key="embeddings_nearest",
    complevel=config.HDF_COMPLEVEL,
    complib=config.HDF_COMPLIB,
    mode="w",
)
