import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, StatusBar, ImageBackground} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import VocabularySelector, {VocabularyOption} from './src/components/VocabularySelector';
import WordGrid from './src/components/WordGrid';
import CustomKeyboard from './src/components/CustomKeyboard';
import WORDLISTS from './src/generated/wordlists';

const DEFAULT_VOCABULARY: VocabularyOption = {label: 'Suomi 5x5', gridSize: 5, wordlistFile: 'joukahainen_5.txt'};

function createEmptyGrid(size: number): string[][] {
  return Array.from({length: size}, () => Array(size).fill(''));
}

export type CellStatus = 'white' | 'green' | 'red';

function App(): React.JSX.Element {
  const [vocabulary, setVocabulary] = useState<VocabularyOption>(DEFAULT_VOCABULARY);
  const [letters, setLetters] = useState<string[][]>(createEmptyGrid(DEFAULT_VOCABULARY.gridSize));
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Load wordlist from bundled module
  const wordSet = useMemo(() => {
    const key = vocabulary.wordlistFile.replace('.txt', '');
    const words = WORDLISTS[key] || [];
    return new Set(words.map(w => w.toUpperCase()));
  }, [vocabulary]);

  // Compute row statuses
  const rowStatuses: CellStatus[] = useMemo(() => {
    const gridSize = vocabulary.gridSize;
    return Array.from({length: gridSize}, (_, row) => {
      const cells = letters[row] ?? [];
      if (cells.length < gridSize || cells.some(c => c === '')) {
        return 'white';
      }
      const word = cells.join('');
      return wordSet.has(word) ? 'green' : 'red';
    });
  }, [letters, wordSet, vocabulary.gridSize]);

  // Compute column statuses
  const colStatuses: CellStatus[] = useMemo(() => {
    const gridSize = vocabulary.gridSize;
    return Array.from({length: gridSize}, (_, col) => {
      const cells = letters.map(row => row[col] ?? '');
      if (cells.length < gridSize || cells.some(c => c === '')) {
        return 'white';
      }
      const word = cells.join('');
      return wordSet.has(word) ? 'green' : 'red';
    });
  }, [letters, wordSet, vocabulary.gridSize]);

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
    if (letters[row][col]) {
      setLetters(prev => {
        const updated = prev.map(r => [...r]);
        updated[row][col] = '';
        return updated;
      });
    } else {
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
      <ImageBackground
        source={require('./assets/background.png')}
        style={styles.background}
        imageStyle={{opacity: 0.5}}
        resizeMode="cover">
        <View style={styles.container}>
        {/* Ad banner placeholder */}
        <View style={styles.adBanner}>
          <Text style={styles.adBannerText}>Ad Banner</Text>
        </View>

        {/* Vocabulary selector */}
        <VocabularySelector
          selected={vocabulary}
          onSelect={handleVocabularyChange}
          hasEnteredLetters={letters.some(row => row.some(c => c !== ''))}
        />

        {/* Word grid */}
        <View style={styles.gridContainer}>
          <WordGrid
            gridSize={vocabulary.gridSize}
            letters={letters}
            selectedCell={selectedCell}
            onCellPress={handleCellPress}
            rowStatuses={rowStatuses}
            colStatuses={colStatuses}
          />
        </View>

        {/* Keyboard */}
        <View style={styles.keyboardContainer}>
          <CustomKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
        </View>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
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
