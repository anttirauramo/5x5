"""
Count solutions in which every word (row and column) appears only once.

A solution is "fully unique" if no word is repeated across its rows and columns.

Usage:
    python fully_unique.py <solutions_file>

Example:
    python fully_unique.py solutions/joukahainen_5.txt
"""

import sys


def parse_solutions(filepath: str) -> list[list[str]]:
    """Parse a solutions file into a list of grids (each grid is a list of row words)."""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Skip the first line (metadata)
    solutions = []
    current = []
    for line in lines[1:]:
        stripped = line.strip()
        if stripped == "---":
            if current:
                solutions.append(current)
                current = []
        elif stripped:
            current.append(stripped)
    if current:
        solutions.append(current)

    return solutions


def get_all_words(grid: list[str]) -> list[str]:
    """Get all words in a grid: rows + columns."""
    rows = grid
    size = len(grid)
    cols = ["".join(grid[r][c] for r in range(size)) for c in range(size)]
    return rows + cols


def is_fully_unique(grid: list[str]) -> bool:
    """Check if all words (rows and columns) in the grid are unique."""
    words = get_all_words(grid)
    return len(words) == len(set(words))


def main():
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print(f"Usage: python {sys.argv[0]} <solutions_file> [--print-first]")
        sys.exit(1)

    filepath = sys.argv[1]
    print_first = "--print-first" in sys.argv

    solutions = parse_solutions(filepath)
    total = len(solutions)
    unique_count = 0
    first_unique = None

    for grid in solutions:
        if is_fully_unique(grid):
            unique_count += 1
            if first_unique is None:
                first_unique = grid

    print(f"Fully unique solutions: {unique_count} / {total}")

    if print_first and first_unique:
        print()
        for row in first_unique:
            print(row)


if __name__ == "__main__":
    main()
