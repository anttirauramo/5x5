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

export interface VocabularyOption {
  label: string;
  gridSize: number;
  wordlistFile: string;
}

const VOCABULARIES: VocabularyOption[] = [
  {label: 'Suomi 3x3', gridSize: 3, wordlistFile: 'joukahainen_3.txt'},
  {label: 'Suomi 4x4', gridSize: 4, wordlistFile: 'joukahainen_4.txt'},
  {label: 'Suomi 5x5', gridSize: 5, wordlistFile: 'joukahainen_5.txt'},
  {label: 'Suomi 6x6', gridSize: 6, wordlistFile: 'joukahainen_6.txt'},
];

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
    backgroundColor: '#4a90d9',
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
    color: '#4a90d9',
    fontWeight: '600',
  },
});
