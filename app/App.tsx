import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, StatusBar, ImageBackground, TouchableOpacity, Modal, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import VocabularySelector, {VocabularyOption, VOCABULARIES} from './src/components/VocabularySelector';
import WordGrid from './src/components/WordGrid';
import CustomKeyboard from './src/components/CustomKeyboard';
import FlowerAnimation from './src/components/FlowerAnimation';
import WORDLISTS from './src/generated/wordlists';

const DEFAULT_VOCABULARY: VocabularyOption = VOCABULARIES.find(v => v.wordlistFile === 'joukahainen_5.txt') || VOCABULARIES[0];

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

  // Detect grid completion (all rows and columns are green)
  const gridCompleted = useMemo(() => {
    return rowStatuses.every(s => s === 'green') && colStatuses.every(s => s === 'green');
  }, [rowStatuses, colStatuses]);

  const [showFlowerAnimation, setShowFlowerAnimation] = useState(false);

  // Trigger animation when grid is completed
  React.useEffect(() => {
    if (gridCompleted) {
      setShowFlowerAnimation(true);
    }
  }, [gridCompleted]);

  const [rulesVisible, setRulesVisible] = useState(false);

  const handleReset = useCallback(() => {
    if (letters.some(row => row.some(c => c !== ''))) {
      Alert.alert(
        'Tyhjennä ruudukko',
        'Haluatko poistaa kaikki kirjaimet?',
        [
          {text: 'Peruuta', style: 'cancel'},
          {
            text: 'Tyhjennä',
            onPress: () => {
              setLetters(createEmptyGrid(vocabulary.gridSize));
              setSelectedCell(null);
              setShowFlowerAnimation(false);
            },
          },
        ],
      );
    }
  }, [letters, vocabulary.gridSize]);

  const handleVocabularyChange = useCallback((option: VocabularyOption) => {
    setVocabulary(option);
    setLetters(createEmptyGrid(option.gridSize));
    setSelectedCell(null);
    setKeyboardVisible(false);
    setShowFlowerAnimation(false);
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

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setRulesVisible(true)} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Rules modal */}
        <Modal
          visible={rulesVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRulesVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setRulesVisible(false)}>
            <View style={styles.rulesModal}>
              <Text style={styles.rulesTitle}>Säännöt</Text>
              <Text style={styles.rulesText}>
                Täytä ruudukko kirjaimilla siten, että jokainen rivi ja sarake muodostaa sanan sanalistasta.
              </Text>
              <Text style={styles.rulesText}>
                Paina ruutua ja kirjoita kirjain näppäimistöllä. Rivin tai sarakkeen väripalkki muuttuu vihreäksi kun sana löytyy sanastosta, ja punaiseksi jos sanaa ei löydy.
              </Text>
              <Text style={styles.rulesText}>
                Peli on ratkaistu kun kaikki rivit ja sarakkeet ovat vihreitä!
              </Text>
              <TouchableOpacity
                style={styles.rulesCloseButton}
                onPress={() => setRulesVisible(false)}>
                <Text style={styles.rulesCloseText}>Sulje</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

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

        {/* Flower animation on grid completion */}
        <FlowerAnimation visible={showFlowerAnimation} />
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#95b5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 30,
    maxWidth: 340,
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  rulesText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    lineHeight: 22,
  },
  rulesCloseButton: {
    marginTop: 12,
    backgroundColor: '#95b5f5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  rulesCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
