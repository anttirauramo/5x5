import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export interface VocabularyOption {
  label: string;
  gridSize: number;
}

const VOCABULARIES: VocabularyOption[] = [
  {label: 'Suomi 3x3', gridSize: 3},
  {label: 'Suomi 4x4', gridSize: 4},
  {label: 'Suomi 5x5', gridSize: 5},
  {label: 'Suomi 6x6', gridSize: 6},
];

interface Props {
  selected: VocabularyOption;
  onSelect: (option: VocabularyOption) => void;
}

export default function VocabularySelector({selected, onSelect}: Props) {
  return (
    <View style={styles.container}>
      {VOCABULARIES.map(option => (
        <TouchableOpacity
          key={option.label}
          style={[
            styles.option,
            selected.label === option.label && styles.optionSelected,
          ]}
          onPress={() => onSelect(option)}>
          <Text
            style={[
              styles.optionText,
              selected.label === option.label && styles.optionTextSelected,
            ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  optionSelected: {
    backgroundColor: '#4a90d9',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
});
