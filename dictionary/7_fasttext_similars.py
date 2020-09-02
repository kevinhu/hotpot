import config
import fasttext
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

# ============================================================
# Script function:
# Use nearest-neighbor word embeddings to find suggested words
# ============================================================

# number of nearest-neighbor words to save
NUM_NEAREST = 16

# python reduce_model.py ./data/raw/cc.zh.300.bin 100
zh_model = fasttext.load_model("./data/raw/cc.zh.100.bin")

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

# unify simplified+traditional words
words = list(set(cedict["simplified"]) | set(cedict["traditional"]))

# compute embeddings
embeddings = np.array(list(map(zh_model.get_word_vector, words)))

# construct K-D tree for fast queries
kdtree = cKDTree(embeddings, leafsize=NUM_NEAREST * 2)

# execute queries
dists, nearest_indices = kdtree.query(embeddings, k=1 + NUM_NEAREST, p=2, n_jobs=6)

# convert embedding distances and nearest-words to dataframe
embeddings_dists = pd.DataFrame(dists, index=words)
embeddings_nearest = pd.DataFrame(nearest_indices, index=words)
embeddings_nearest = embeddings_nearest.applymap(lambda x: words[x])

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
