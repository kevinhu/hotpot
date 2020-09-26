import config
import pandas as pd
import ujson

# =================================================
# Script purpose:
# Prepare a small dictionary for client-side search
# =================================================

# truncate descriptions to save space
MAX_DESCRIPTION_LENGTH = 64

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

# unify CEDICT and BCC_LEX
bcc_lex = pd.read_csv(f"./data/intermediate/bcc_lex.txt", sep="\t", index_col=0)
bcc_lex = bcc_lex.set_index("word", drop=False)
cedict = cedict.join(bcc_lex, on="simplified").fillna(-1)
cedict = cedict.drop("frequency", axis=1)

# use max-rank to impute missing ranks
cedict["rank"][cedict["rank"] == -1] = max(cedict["rank"])
cedict["rank"] = cedict["rank"].astype(int)

# toneless pinyin for search
cedict["toneless_pinyin"] = [
    "".join([y[:-1] for y in x.split(" ")]) for x in cedict["pinyin"]
]

# truncate definitions
cedict["short_definition"] = cedict["definition"].apply(
    lambda x: x[:MAX_DESCRIPTION_LENGTH]
)

search_data = cedict[
    [
        "pinyin",
        "toneless_pinyin",
        "simplified",
        "traditional",
        "short_definition",
        "rank",
    ]
].to_dict(orient="index")

search_data = list(search_data.values())

with open("../api/search_data.json", "w") as f:
    f.write(ujson.dumps(search_data))
