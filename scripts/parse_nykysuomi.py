import sys
import re

if len(sys.argv) != 3:
    print(f"Usage: python {sys.argv[0]} <input_file> <length>")
    sys.exit(1)

filepath = sys.argv[1]
length = int(sys.argv[2])
seen_words = set()

with open(filepath, "r", encoding="utf-8") as f:
    for line in f:

        # skip interjections
        if re.match(r".*\sinterjektio.*", line):
            continue

        word = line.split("\t")[0].strip()

        # skip abbrevs
        if re.match(r"^[A-Z]+\s.*", word):
            continue

        # skip expressions of multiple words
        if re.match(r".* .*", word):
            print(f"Skipping multi-word expression: {word}", file=sys.stderr)
            continue


        match = re.match(r"[A-Za-zÀ-ÖØ-öø-ÿ]+", line)
        if match and len(match.group()) == length:
            word = match.group().upper()
            if word not in seen_words:
                seen_words.add(word)
                print(word)
