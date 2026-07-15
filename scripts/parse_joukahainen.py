import os 
import sys
import xml.etree.ElementTree as ET
import io

ALLOWED_CLASSES = ["adjective", "adverb", "conjunction","noun","verb"]
DISALLOWED_STYLES = ["it", "dialect", "confusing", "foreign", "old", "international", "incorrect", "nature"]

def is_allowed_class(word):
    for c in word.iter('classes'): 
        for cs in c.iter('wclass'):
            if cs.text in ALLOWED_CLASSES:
                return True
    return False

def is_allowed_style(word):
    for c in word.iter('style'): 
        for cs in c.iter('flag'):
            if cs.text in DISALLOWED_STYLES:
                return False
    return True

def is_voikko(word):
    for c in word.iter('application'): 
        for cs in c.iter('flag'):
            if cs.text == 'not_voikko':
                return False
    return True

def parse_joukahainen(word_length, output_file_name):
    cwd = os.getcwd()
    with io.open(os.path.join(cwd, output_file_name), "w", encoding="utf8") as output_file:
        tree = ET.parse(os.path.join(cwd, "wordlists", "joukahainen.xml"))
        root = tree.getroot()

        for word in root.iter('word'):
            if is_allowed_class(word) and is_allowed_style(word) and is_voikko(word):
                for form in word.findall('forms/form'):
                    if len(form.text) == word_length:
                        print(f"{form.text}")
                        output_file.write(form.text.upper()+"\n")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} word_length output_file_name")
        exit(-1)

    word_length = int(sys.argv[1])
    output_file_name = sys.argv[2]

    print(f"{word_length}, output_file_name={output_file_name}")

    parse_joukahainen(word_length, output_file_name)