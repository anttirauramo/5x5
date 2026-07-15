import io
import os
import re
import multiprocessing
import sys
import time
import datetime
import logging
from logging.handlers import QueueHandler, QueueListener

PROCESSES = 12
SHOW_SOLUTIONS = False
WORKER_LOGGER = None


def create_solution_logger(solutions_file, cwd):
    logpath = os.path.join(cwd, solutions_file)
    solution_logger = logging.getLogger("solution_writer")
    solution_logger.handlers.clear()
    solution_logger.propagate = False
    solution_logger.setLevel(logging.INFO)
    ch = logging.FileHandler(logpath, encoding="utf-8")
    ch.setFormatter(logging.Formatter("%(message)s"))
    solution_logger.addHandler(ch)
    return solution_logger


def init_worker_logger(log_queue):
    global WORKER_LOGGER
    WORKER_LOGGER = logging.getLogger("solution_worker")
    WORKER_LOGGER.handlers.clear()
    WORKER_LOGGER.propagate = False
    WORKER_LOGGER.setLevel(logging.INFO)
    WORKER_LOGGER.addHandler(QueueHandler(log_queue))


def recurse_rows(
    all_words,
    words_by_last_char,
    valid_prefixes,
    word_length,
    rows,
    col_prefixes,
    last_row,
    last_col,
):
    depth = len(rows)
    local_solution_count = 0

    for row in words_by_last_char.get(last_col[depth], []):
        if depth == word_length - 2:
            # Last interior row: last_row is known, so check full columns directly
            if all(
                col_prefixes[i] + row[i] + last_row[i] in all_words
                for i in range(word_length)
            ):
                local_solution_count += 1
                WORKER_LOGGER.info("\n".join(rows + [row, last_row]) + "\n---")
                if SHOW_SOLUTIONS:
                    print("---\n" + "\n".join(rows + [row, last_row]) + "\n---")
        else:
            # Check column prefixes, short-circuit on first invalid
            new_col_prefixes = []
            valid = True
            for i in range(word_length):
                cp = col_prefixes[i] + row[i]
                if cp not in valid_prefixes:
                    valid = False
                    break
                new_col_prefixes.append(cp)
            if valid:
                rows.append(row)
                local_solution_count += recurse_rows(
                    all_words,
                    words_by_last_char,
                    valid_prefixes,
                    word_length,
                    rows,
                    new_col_prefixes,
                    last_row,
                    last_col,
                )
                rows.pop()

    return local_solution_count


def find_with_last_words(
    all_words,
    words_by_last_char,
    valid_prefixes,
    word_length,
    last_row,
    last_col,
):
    return recurse_rows(
        all_words,
        words_by_last_char,
        valid_prefixes,
        word_length,
        [],
        [""] * word_length,
        last_row,
        last_col,
    )


def find_solutions(wordlist, solutions_file):
    start_time = time.time()
    all_words = []
    word_length = 0

    cwd = os.getcwd()
    f = io.open(os.path.join(cwd, wordlist), "r", encoding="utf8")
    for word in f.readlines():
        word = word.strip()
        if word[0] != "#":
            all_words.append(word)
            if word_length == 0:
                word_length = len(word)
    f.close()
    print(f"read {len(all_words)} words, length {word_length}")

    all_words = set(all_words)

    last_characters = []
    for word in all_words:
        last_character = word[-1]
        if last_character not in last_characters:
            print(f"{word} -> {last_character}")
            last_characters.append(last_character)

    last_character_re = f"^[{''.join(last_characters)}]*$"
    print(f"last characters re: {last_character_re}")
    last_character_regexp = re.compile(last_character_re)

    words_with_last_characters_only = []
    for word in all_words:
        if last_character_regexp.search(word):
            words_with_last_characters_only.append(word)
    print(
        f"words_with_last_characters_only: {", ".join(words_with_last_characters_only)}"
    )

    words_by_last_char = {}
    valid_prefixes = set()
    for word in all_words:
        words_by_last_char.setdefault(word[-1], []).append(word)
        for k in range(1, word_length):
            valid_prefixes.add(word[:k])

    log_queue = multiprocessing.Queue()
    pool = multiprocessing.Pool(
        processes=PROCESSES, initializer=init_worker_logger, initargs=(log_queue,)
    )
    job_count = 0
    results = []

    solution_logger = create_solution_logger(solutions_file, cwd)
    file_handler = solution_logger.handlers[0]
    log_listener = QueueListener(log_queue, file_handler)
    log_listener.start()
    solution_logger.info(f"find_solutions.py {datetime.datetime.now()}\n---")

    for last_row in words_with_last_characters_only:
        for last_col in words_with_last_characters_only:
            if last_row[-1] == last_col[-1]:
                job_count += 1

                results.append(
                    pool.apply_async(
                        find_with_last_words,
                        (
                            all_words,
                            words_by_last_char,
                            valid_prefixes,
                            word_length,
                            last_row,
                            last_col,
                            
                        ),
                    )
                )

    print(f"Pooled {job_count} jobs in {PROCESSES} processes\n...")

    result_count = 0
    solution_count = 0
    try:
        for result in results:
            count = result.get()
            result_count += 1
            solution_count += count
            print(
                "\033[FPROGRESS: "
                + "{:.4f}".format(round(100.0 * result_count / job_count, 4))
                + f"% ({solution_count} solutions)      "
            )
    finally:
        pool.close()
        pool.join()
        log_listener.stop()
        file_handler.close()

    print(
        f"All done, {solution_count} solutions found. "
        + f"Time elapsed: {datetime.timedelta(seconds=time.time() - start_time)}"
    )


# 3x3: 238 solutions found, 0.476 sec
# 4x4: 25853 solutions found, 436 sec, optimized 63.9 sec with 25837 solutions (?!?!)
#      22964 solutions, 48 sec.
# 5x5: n. 12 tunnissa mun pelikoneella 0.3129% kandidaateista käsitelty, 30 ratkaisua
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: find_solutions.py <wordlist> <solutions file>")
        sys.exit(1)
    wordlist = sys.argv[1]
    solutions_file = sys.argv[2]
    find_solutions(wordlist, solutions_file)
