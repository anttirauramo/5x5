import argparse
from pathlib import Path


def normalize_word(line: str) -> str:
    return "".join(line.strip().split())


def parse_blocks(text: str):
    blocks = []
    current = []

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.startswith("find_solutions"):
            continue

        if line == "---":
            if current:
                blocks.append(current)
                current = []
            continue

        if line:
            current.append(line)

    if current:
        blocks.append(current)

    return blocks


def extract_last_words(block):
    words = [normalize_word(line) for line in block if normalize_word(line)]
    if not words:
        return None

    size = len(words)
    if any(len(w) < size for w in words):
        return None

    last_col = "".join(w[size - 1] for w in words)
    last_row = words[size - 1]
    return last_col, last_row


def collect_unique_pairs(file_path: Path):
    content = file_path.read_text(encoding="utf-8")
    pairs = set()

    for block in parse_blocks(content):
        pair = extract_last_words(block)
        if pair is not None:
            pairs.add(pair)

    return pairs


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Read word square solutions and collect unique "
            "(last_column_word, last_row_word) pairs."
        )
    )
    parser.add_argument("solutions_file", help="Path to solutions text file")
    parser.add_argument("--print-pairs", action="store_true", help="Print the unique word pairs")
    args = parser.parse_args()

    pairs = collect_unique_pairs(Path(args.solutions_file))

    if args.print_pairs:
        for pair in sorted(pairs):
            print(pair)

    different = {p for p in pairs if p[0] != p[1]}

    print(f"{len(pairs)} unique (last_column_word, last_row_word) pairs found, of which {len(different)} have different words")


if __name__ == "__main__":
    main()
