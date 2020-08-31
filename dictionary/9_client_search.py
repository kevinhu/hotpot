import config
import pandas as pd
import ujson

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

bcc_lex = pd.read_csv(f"./data/intermediate/bcc_lex.txt", sep="\t", index_col=0)
bcc_lex = bcc_lex.set_index("word", drop=False)
cedict = cedict.join(bcc_lex, on="simplified").fillna(-1)
cedict = cedict.drop("frequency", axis=1)

cedict["rank"][cedict["rank"] == -1] = max(cedict["rank"])
cedict["rank"] = cedict["rank"].astype(int)

cedict["toneless_pinyin"] = [
    "".join([y[:-1] for y in x.split(" ")]) for x in cedict["pinyin"]
]
cedict["short_definition"] = cedict["definition"].apply(lambda x: x[:32])

search_data = cedict[
    ["toneless_pinyin", "simplified", "traditional", "short_definition", "rank",]
].to_dict(orient="index")

search_data = list(search_data.values())

with open("../src/assets/search_data.json", "w") as f:
    f.write(ujson.dumps(search_data))
