"""
Find all words in a word list that match another word when reversed.

Usage:
    python find_palindromes.py <wordlist_file>

Example:
    python find_palindromes.py wordlists/joukahainen_5.txt
"""

import sys


def find_palindromes(filepath: str) -> list[tuple[str, str]]:
    with open(filepath, "r", encoding="utf-8") as f:
        words = sorted(set(line.strip().upper() for line in f if line.strip()))

    matches = []
    for i, word in enumerate(words):
        reversed_word = word[::-1]
        if word == reversed_word:
            matches.append((word, reversed_word))
        elif reversed_word in words[i + 1:]:
            matches.append((word, reversed_word))

    return matches


def main():
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <wordlist_file>")
        sys.exit(1)

    filepath = sys.argv[1]
    matches = find_palindromes(filepath)

    print(f"Found {len(matches)} words that match a word when reversed:\n")
    for word, reversed_word in matches:
        if word == reversed_word:
            print(f"  {word} (palindrome)")
        else:
            print(f"  {word} <-> {reversed_word}")


if __name__ == "__main__":
    main()
