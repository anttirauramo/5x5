import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, useWindowDimensions} from 'react-native';

interface Props {
  gridSize: number;
  letters: string[][];
  selectedCell: {row: number; col: number} | null;
  onCellPress: (row: number, col: number) => void;
}

export default function WordGrid({gridSize, letters, selectedCell, onCellPress}: Props) {
  const {width: screenWidth} = useWindowDimensions();
  const gridPadding = 20;
  const cellGap = 4;
  const availableWidth = screenWidth - gridPadding * 2;
  const cellSize = Math.floor((availableWidth - cellGap * (gridSize - 1)) / gridSize);

  return (
    <View style={styles.container}>
      {Array.from({length: gridSize}, (_, row) => (
        <View key={row} style={[styles.row, {gap: cellGap}]}>
          {Array.from({length: gridSize}, (_, col) => {
            const isSelected =
              selectedCell?.row === row && selectedCell?.col === col;
            const letter = letters[row]?.[col] ?? '';
            return (
              <TouchableOpacity
                key={col}
                style={[
                  styles.cell,
                  {width: cellSize, height: cellSize},
                  isSelected && styles.cellSelected,
                ]}
                onPress={() => onCellPress(row, col)}
                activeOpacity={0.7}>
                <Text
                  style={[styles.cellText, {fontSize: cellSize * 0.6}]}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    borderColor: '#4a90d9',
    backgroundColor: '#e8f0fe',
  },
  cellText: {
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
});
