"""
Unpack the R words database from scripts/wordsources/words/data.

The data is stored as an R lazy-load database (Rdata.rdb + Rdata.rdx).
This script extracts the word list and prints it to stdout.

Usage:
    python unpack_rdata.py [length]

Arguments:
    length  - optional, output only words of this length

Outputs one word per line.
"""

import zlib
import sys
from pathlib import Path
import rdata


def main():
    length = int(sys.argv[1]) if len(sys.argv) > 1 else None

    data_dir = Path(__file__).parent / "wordsources" / "words" / "data"
    rdb_file = data_dir / "Rdata.rdb"

    if not rdb_file.exists():
        print(f"ERROR: Rdata.rdb not found in {data_dir}", file=sys.stderr)
        sys.exit(1)

    print("Reading R lazyload database...", file=sys.stderr)

    # Read the rdb file
    rdb_bytes = rdb_file.read_bytes()

    # Find zlib header (78 9c) and decompress
    zlib_offset = rdb_bytes.find(b'\x78\x9c')
    if zlib_offset < 0:
        print("ERROR: Could not find zlib compressed data", file=sys.stderr)
        sys.exit(1)

    decompressed = zlib.decompress(rdb_bytes[zlib_offset:])
    print(f"Decompressed {len(decompressed)} bytes", file=sys.stderr)

    # Parse the decompressed R serialized object
    parsed = rdata.parser.parse_data(decompressed)
    converted = rdata.conversion.convert(parsed)

    # Output the words
    if hasattr(converted, 'columns') and 'word' in converted.columns:
        if length:
            filtered = converted[converted['word_length'] == length]
            print(f"{len(filtered)} words of length {length} (of {len(converted)} total)", file=sys.stderr)
            for word in filtered['word']:
                print(word)
        else:
            print(f"{len(converted)} words found", file=sys.stderr)
            for word in converted['word']:
                print(word)
    elif isinstance(converted, dict):
        for key, value in converted.items():
            print(f"Variable '{key}': {type(value).__name__}", file=sys.stderr)
            if hasattr(value, '__iter__'):
                for item in value:
                    print(item)
    else:
        print(f"Unexpected type: {type(converted)}", file=sys.stderr)
        print(repr(converted)[:500])


if __name__ == "__main__":
    main()
