import config
import pandas as pd
import ujson
import re

# =================================================
# Script purpose:
# Prepare a small dictionary for client-side search
# =================================================

# truncate descriptions to save space
cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

# unify CEDICT and BCC_LEX
bcc_lex = pd.read_csv(f"./data/intermediate/bcc_lex.txt", sep="\t", index_col=0)
bcc_lex = bcc_lex.set_index("word", drop=False)
cedict = cedict.join(bcc_lex, on="simplified").fillna(-1)
cedict = cedict.drop("frequency", axis=1)

# use max-rank to impute missing ranks
cedict["rank"][cedict["rank"] == -1] = max(cedict["rank"])
cedict["rank"] = cedict["rank"].astype(int)

cedict["pinyin"] = cedict["pinyin"].apply(lambda x: x.lower())


def remove_pinyin_tone(string):
    return re.sub("([0-9])+(\s|$)", " ", string)[:-1]


# toneless pinyin for search
cedict["toneless_pinyin"] = cedict["pinyin"].apply(remove_pinyin_tone)


def format_definition(definition):

    # get rid of text in parentheses
    # definition = re.sub("\(.+\)", "", definition)

    # space out definitions
    definition = re.sub("/", "; ", definition)

    return definition


cedict["definition"] = cedict["definition"].apply(format_definition)


cedict["id"] = range(len(cedict))

search_data = cedict[
    [
        "pinyin",
        "toneless_pinyin",
        "simplified",
        "traditional",
        "definition",
        "rank",
        "id",
    ]
].to_dict(orient="index")

search_data = list(search_data.values())

print(f"Index size: {len(search_data)}")

with open("../api/search_data.json", "w") as f:
    f.write(ujson.dumps(search_data))
