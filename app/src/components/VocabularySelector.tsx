import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import WORDLISTS from '../generated/wordlists';

export interface VocabularyOption {
  label: string;
  gridSize: number;
  wordlistFile: string;
}

// Build vocabulary options dynamically from available wordlist files
function buildVocabularyOptions(): VocabularyOption[] {
  return Object.keys(WORDLISTS)
    .map(key => {
      const words = WORDLISTS[key];
      if (!words || words.length === 0) {return null;}
      const wordLength = words[0].length;
      // Derive display name from filename: "joukahainen_5" -> "Joukahainen 5x5"
      const parts = key.split('_');
      const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const label = `${name} ${wordLength}x${wordLength}`;
      return {
        label,
        gridSize: wordLength,
        wordlistFile: `${key}.txt`,
      };
    })
    .filter((opt): opt is VocabularyOption => opt !== null)
    .sort((a, b) => {
      const nameA = a.label.split(' ')[0];
      const nameB = b.label.split(' ')[0];
      if (nameA !== nameB) {return nameA.localeCompare(nameB);}
      return a.gridSize - b.gridSize;
    });
}

export const VOCABULARIES = buildVocabularyOptions();

interface Props {
  selected: VocabularyOption;
  onSelect: (option: VocabularyOption) => void;
  hasEnteredLetters: boolean;
}

export default function VocabularySelector({selected, onSelect, hasEnteredLetters}: Props) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleOptionPress = (option: VocabularyOption) => {
    if (option.label === selected.label) {
      setDropdownVisible(false);
      return;
    }

    if (hasEnteredLetters) {
      Alert.alert(
        'Vaihda sanasto',
        'Ruudukkoon syötetyt kirjaimet häviävät. Haluatko jatkaa?',
        [
          {text: 'Peruuta', style: 'cancel'},
          {
            text: 'Vaihda',
            onPress: () => {
              onSelect(option);
              setDropdownVisible(false);
            },
          },
        ],
      );
    } else {
      onSelect(option);
      setDropdownVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(true)}
        activeOpacity={0.7}>
        <Text style={styles.dropdownButtonText}>{selected.label}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}>
          <View style={styles.dropdownMenu}>
            <FlatList
              data={VOCABULARIES}
              keyExtractor={item => item.label}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    item.label === selected.label && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleOptionPress(item)}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      item.label === selected.label && styles.dropdownItemTextSelected,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7698db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 200,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemSelected: {
    backgroundColor: '#e8f0fe',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#7698db',
    fontWeight: '600',
  },
});
