import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, useWindowDimensions} from 'react-native';
import type {CellStatus} from '../../App';

const BAR_WIDTH = 16;
const BAR_BORDER_WIDTH = 1.5;

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
  typingDirection: 'horizontal' | 'vertical';
  onRowBarPress: (row: number) => void;
  onColBarPress: (col: number) => void;
}

export default function WordGrid({gridSize, letters, selectedCell, onCellPress, rowStatuses, colStatuses, typingDirection, onRowBarPress, onColBarPress}: Props) {
  const {width: screenWidth} = useWindowDimensions();
  const gridPadding = 20;
  const cellGap = 4;
  const sideSpace = (BAR_WIDTH + cellGap) * 2;
  const availableWidth = screenWidth - gridPadding * 2 - sideSpace;
  const cellSize = Math.floor((availableWidth - cellGap * (gridSize - 1)) / gridSize);

  const activeRow = selectedCell?.row ?? -1;
  const activeCol = selectedCell?.col ?? -1;

  const getColBarBorderColor = (col: number) =>
    typingDirection === 'vertical' && col === activeCol ? '#4a90d9' : 'transparent';

  const getRowBarBorderColor = (row: number) =>
    typingDirection === 'horizontal' && row === activeRow ? '#4a90d9' : 'transparent';

  return (
    <View style={styles.container}>
      {/* Top bar (column statuses) */}
      <View style={[styles.horizontalBarRow, {gap: cellGap}]}>
        {Array.from({length: gridSize}, (_, col) => (
          <TouchableOpacity
            key={col}
            style={[styles.horizontalBarWrapper, {width: cellSize}]}
            onPress={() => onColBarPress(col)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.horizontalBar,
                {
                  width: cellSize * 0.9,
                  backgroundColor: STATUS_COLORS[colStatuses[col]],
                  borderColor: getColBarBorderColor(col),
                },
              ]}>
              <Text style={styles.barArrow}>▼</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Middle section: left bar + grid + right bar */}
      <View style={styles.middleSection}>
        {/* Left bars (row statuses) */}
        <View style={styles.verticalBarColumn}>
          {Array.from({length: gridSize}, (_, row) => (
            <TouchableOpacity
              key={row}
              style={[styles.verticalBarWrapper, {height: cellSize}]}
              onPress={() => onRowBarPress(row)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.verticalBar,
                  {
                    height: cellSize * 0.9,
                    backgroundColor: STATUS_COLORS[rowStatuses[row]],
                    borderColor: getRowBarBorderColor(row),
                  },
                ]}>
                <Text style={styles.barArrow}>▶</Text>
              </View>
            </TouchableOpacity>
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
            <TouchableOpacity
              key={row}
              style={[styles.verticalBarWrapper, {height: cellSize}]}
              onPress={() => onRowBarPress(row)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.verticalBar,
                  {
                    height: cellSize * 0.9,
                    backgroundColor: STATUS_COLORS[rowStatuses[row]],
                    borderColor: getRowBarBorderColor(row),
                  },
                ]}/>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom bar (column statuses) */}
      <View style={[styles.horizontalBarRow, {gap: cellGap}]}>
        {Array.from({length: gridSize}, (_, col) => (
          <TouchableOpacity
            key={col}
            style={[styles.horizontalBarWrapper, {width: cellSize}]}
            onPress={() => onColBarPress(col)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.horizontalBar,
                {
                  width: cellSize * 0.9,
                  backgroundColor: STATUS_COLORS[colStatuses[col]],
                  borderColor: getColBarBorderColor(col),
                },
              ]}/>
          </TouchableOpacity>
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
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BAR_BORDER_WIDTH,
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
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BAR_BORDER_WIDTH,
  },
  barArrow: {
    fontSize: 9,
    color: '#4a90d9',
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
    borderColor: '#328ff2',
    backgroundColor: '#b8d3fd',
  },
  cellText: {
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
});
