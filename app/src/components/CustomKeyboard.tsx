import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, useWindowDimensions} from 'react-native';

// Finnish QWERTY layout with Å, Ä, Ö
const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

interface Props {
  onKeyPress: (letter: string) => void;
  onBackspace: () => void;
}

export default function CustomKeyboard({onKeyPress, onBackspace}: Props) {
  const {width: screenWidth} = useWindowDimensions();
  const keyMargin = 3;
  const maxKeysInRow = 11;
  const keyWidth = Math.floor((screenWidth - keyMargin * 2 * maxKeysInRow) / maxKeysInRow);
  const keyHeight = Math.max(44, keyWidth * 1.2);

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(letter => (
            <TouchableOpacity
              key={letter}
              style={[styles.key, {width: keyWidth, height: keyHeight, margin: keyMargin}]}
              onPress={() => onKeyPress(letter)}
              activeOpacity={0.6}>
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          ))}
          {rowIndex === 2 && (
            <TouchableOpacity
              style={[styles.key, styles.backspaceKey, {height: keyHeight, margin: keyMargin}]}
              onPress={onBackspace}
              activeOpacity={0.6}>
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#c4d4e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  key: {
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  backspaceKey: {
    width: 56,
    backgroundColor: '#bcc1c9',
  },
  keyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
