import sys
import re

if len(sys.argv) != 3:
    print(f"Usage: python {sys.argv[0]} <input_file> <length>")
    sys.exit(1)

filepath = sys.argv[1]
length = int(sys.argv[2])
seen_words = set()

with open(filepath, "r", encoding="utf-8") as f:
    types = []
    for line in f:
        [_, word, type, *rest] = line.split(",")

        if type in ["namn", "interjektion"]:
            continue

        # skip abbrevs
        if re.match(r"^[A-Z]*$", word):
            continue

        # skip expressions of multiple words
        if re.match(r".*[\s-].*", word):
            # print(f"Skipping multi-word expression or prefix: {word}", file=sys.stderr)
            continue

        if type not in types: 
            types.append(type)



        match = re.match(r"[A-Za-zÀ-ÖØ-öø-ÿ]+", word)
        if match and len(match.group()) == length:
            word = match.group().upper()
            if word not in seen_words:
                seen_words.add(word)
                print(word)

    print(f"Types found: {types}", file=sys.stderr)
