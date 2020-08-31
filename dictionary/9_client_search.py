import config
import pandas as pd
import ujson

cedict = pd.read_csv(f"./data/intermediate/cedict.txt", sep="\t", index_col=0)

simplified_words = list(cedict["simplified"])
pinyin = list(cedict["pinyin"])

with open("../src/assets/simplified_words.json", "w") as f:
    f.write(ujson.dumps(simplified_words))

with open("../src/assets/pinyin.json", "w") as f:
    f.write(ujson.dumps(pinyin))

# cedict["simplified"].to_json("../src/assets/simplified_words.json")
# cedict["pinyin"].to_json("../src/assets/pinyin.json")
