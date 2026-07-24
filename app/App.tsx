import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import VocabularySelector, {VocabularyOption} from './src/components/VocabularySelector';
import WordGrid from './src/components/WordGrid';
import CustomKeyboard from './src/components/CustomKeyboard';

const DEFAULT_VOCABULARY: VocabularyOption = {label: 'Suomi 5x5', gridSize: 5};

function createEmptyGrid(size: number): string[][] {
  return Array.from({length: size}, () => Array(size).fill(''));
}

function App(): React.JSX.Element {
  const [vocabulary, setVocabulary] = useState<VocabularyOption>(DEFAULT_VOCABULARY);
  const [letters, setLetters] = useState<string[][]>(createEmptyGrid(DEFAULT_VOCABULARY.gridSize));
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleVocabularyChange = useCallback((option: VocabularyOption) => {
    setVocabulary(option);
    setLetters(createEmptyGrid(option.gridSize));
    setSelectedCell(null);
    setKeyboardVisible(false);
  }, []);

  const handleCellPress = useCallback((row: number, col: number) => {
    setSelectedCell({row, col});
    setKeyboardVisible(true);
  }, []);

  const handleKeyPress = useCallback(
    (letter: string) => {
      if (!selectedCell) {return;}
      setLetters(prev => {
        const updated = prev.map(r => [...r]);
        updated[selectedCell.row][selectedCell.col] = letter;
        return updated;
      });
      // Advance to next cell
      const {row, col} = selectedCell;
      const gridSize = vocabulary.gridSize;
      const nextCol = col + 1;
      if (nextCol < gridSize) {
        setSelectedCell({row, col: nextCol});
      } else if (row + 1 < gridSize) {
        setSelectedCell({row: row + 1, col: 0});
      } else {
        setSelectedCell(null);
        setKeyboardVisible(false);
      }
    },
    [selectedCell, vocabulary.gridSize],
  );

  const handleBackspace = useCallback(() => {
    if (!selectedCell) {return;}
    const {row, col} = selectedCell;
    // If current cell has a letter, clear it
    if (letters[row][col]) {
      setLetters(prev => {
        const updated = prev.map(r => [...r]);
        updated[row][col] = '';
        return updated;
      });
    } else {
      // Move back to previous cell and clear it
      const prevCol = col - 1;
      if (prevCol >= 0) {
        setSelectedCell({row, col: prevCol});
        setLetters(prev => {
          const updated = prev.map(r => [...r]);
          updated[row][prevCol] = '';
          return updated;
        });
      } else if (row - 1 >= 0) {
        const newRow = row - 1;
        const newCol = vocabulary.gridSize - 1;
        setSelectedCell({row: newRow, col: newCol});
        setLetters(prev => {
          const updated = prev.map(r => [...r]);
          updated[newRow][newCol] = '';
          return updated;
        });
      }
    }
  }, [selectedCell, letters, vocabulary.gridSize]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Ad banner placeholder */}
        <View style={styles.adBanner}>
          <Text style={styles.adBannerText}>Ad Banner</Text>
        </View>

        {/* Vocabulary selector */}
        <VocabularySelector selected={vocabulary} onSelect={handleVocabularyChange} />

        {/* Word grid */}
        <View style={styles.gridContainer}>
          <WordGrid
            gridSize={vocabulary.gridSize}
            letters={letters}
            selectedCell={selectedCell}
            onCellPress={handleCellPress}
          />
        </View>

        {/* Keyboard */}
        {keyboardVisible && (
          <View style={styles.keyboardContainer}>
            <CustomKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  adBanner: {
    height: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  adBannerText: {
    color: '#999',
    fontSize: 14,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardContainer: {
    marginTop: 'auto',
  },
});

export default App;
