import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, useWindowDimensions} from 'react-native';
import type {CellStatus} from '../../App';

const BAR_WIDTH = 8;

const STATUS_COLORS: Record<CellStatus, string> = {
  white: '#e0e0e0',
  green: '#4caf50',
  red: '#f44336',
};

interface Props {
  gridSize: number;
  letters: string[][];
  selectedCell: {row: number; col: number} | null;
  onCellPress: (row: number, col: number) => void;
  rowStatuses: CellStatus[];
  colStatuses: CellStatus[];
}

export default function WordGrid({gridSize, letters, selectedCell, onCellPress, rowStatuses, colStatuses}: Props) {
  const {width: screenWidth} = useWindowDimensions();
  const gridPadding = 20;
  const cellGap = 4;
  // Account for the two side bars + gaps between bars and grid
  const sideSpace = (BAR_WIDTH + cellGap) * 2;
  const availableWidth = screenWidth - gridPadding * 2 - sideSpace;
  const cellSize = Math.floor((availableWidth - cellGap * (gridSize - 1)) / gridSize);
  const gridWidth = cellSize * gridSize + cellGap * (gridSize - 1);

  return (
    <View style={styles.container}>
      {/* Top bar (column statuses) */}
      <View style={[styles.horizontalBarRow, {marginLeft: BAR_WIDTH - cellGap, gap: cellGap}]}>
        {Array.from({length: gridSize}, (_, col) => (
          <View key={col} style={[styles.horizontalBarWrapper, {width: cellSize}]}>
            <View
              style={[
                styles.horizontalBar,
                {width: cellSize * 0.9, backgroundColor: STATUS_COLORS[colStatuses[col]]},
              ]}
            />
          </View>
        ))}
      </View>

      {/* Middle section: left bar + grid + right bar */}
      <View style={styles.middleSection}>
        {/* Left bars (row statuses) */}
        <View style={styles.verticalBarColumn}>
          {Array.from({length: gridSize}, (_, row) => (
            <View key={row} style={[styles.verticalBarWrapper, {height: cellSize}]}>
              <View
                style={[
                  styles.verticalBar,
                  {height: cellSize * 0.9, backgroundColor: STATUS_COLORS[rowStatuses[row]]},
                ]}
              />
            </View>
          ))}
        </View>

        {/* Grid cells */}
        <View style={styles.grid}>
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

        {/* Right bars (row statuses) */}
        <View style={styles.verticalBarColumn}>
          {Array.from({length: gridSize}, (_, row) => (
            <View key={row} style={[styles.verticalBarWrapper, {height: cellSize}]}>
              <View
                style={[
                  styles.verticalBar,
                  {height: cellSize * 0.9, backgroundColor: STATUS_COLORS[rowStatuses[row]]},
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Bottom bar (column statuses) */}
      <View style={[styles.horizontalBarRow, {marginLeft: BAR_WIDTH - cellGap, gap: cellGap}]}>
        {Array.from({length: gridSize}, (_, col) => (
          <View key={col} style={[styles.horizontalBarWrapper, {width: cellSize}]}>
            <View
              style={[
                styles.horizontalBar,
                {width: cellSize * 0.9, backgroundColor: STATUS_COLORS[colStatuses[col]]},
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  horizontalBarRow: {
    flexDirection: 'row',
  },
  horizontalBarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalBar: {
    height: BAR_WIDTH,
    borderRadius: 2,
  },
  middleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verticalBarColumn: {
    gap: 4,
  },
  verticalBarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalBar: {
    width: BAR_WIDTH,
    borderRadius: 2,
  },
  grid: {
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
