import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, StatusBar, ImageBackground, TouchableOpacity, Modal, Alert, FlatList, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import VocabularySelector, {VocabularyOption, VOCABULARIES} from './src/components/VocabularySelector';
import WordGrid from './src/components/WordGrid';
import CustomKeyboard from './src/components/CustomKeyboard';
import FlowerAnimation from './src/components/FlowerAnimation';
import SOLUTION_COUNTS from './src/generated/solutionCounts';
import {getWordlist} from './src/utils/wordlists';
import {getLastWordOfTheDay, getLastWordInfo, hasLastWords} from './src/utils/lastWords';
import {saveSolvedGrid, loadSolvedGrids, SolvedGrid} from './src/utils/solvedGrids';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {getLanguageForWordlist, getTranslations, getLicenseForWordlist} from './src/i18n/translations';

const DEFAULT_VOCABULARY: VocabularyOption = VOCABULARIES.find(v => v.wordlistFile === 'nykysuomi_5.txt') || VOCABULARIES[0];

function createEmptyGrid(size: number): string[][] {
  return Array.from({length: size}, () => Array(size).fill(''));
}

export type CellStatus = 'white' | 'green' | 'red';

function App(): React.JSX.Element {
  const [vocabulary, setVocabulary] = useState<VocabularyOption>(DEFAULT_VOCABULARY);
  const [letters, setLetters] = useState<string[][]>(createEmptyGrid(DEFAULT_VOCABULARY.gridSize));
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number}>({row: 0, col: 0});
  const [typingDirection, setTypingDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  // Load wordlist from bundled module
  const wordlistKey = vocabulary.wordlistFile.replace('.txt', '');
  const language = getLanguageForWordlist(wordlistKey);
  const t = getTranslations(language);

  const wordSet = useMemo(() => {
    const words = getWordlist(wordlistKey);
    return new Set(words.map(w => w.toUpperCase()));
  }, [wordlistKey]);

  const lastWordAvailable = hasLastWords(wordlistKey);

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
  const letterChangeRef = React.useRef(false);

  // Reset animation on any letter change
  const handleLettersChange = useCallback((newLetters: string[][]) => {
    setLetters(newLetters);
    setShowFlowerAnimation(false);
    letterChangeRef.current = true;
  }, []);

  // Trigger animation on completion after a letter change
  React.useEffect(() => {
    if (gridCompleted && letterChangeRef.current) {
      letterChangeRef.current = false;
      setShowFlowerAnimation(true);
      saveSolvedGrid(letters, vocabulary.wordlistFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridCompleted, letters]);

  const [rulesVisible, setRulesVisible] = useState(false);
  const [lastWordVisible, setLastWordVisible] = useState(false);
  const [lastWordRevealed, setLastWordRevealed] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [solvedGrids, setSolvedGrids] = useState<SolvedGrid[]>([]);
  const [foundCount, setFoundCount] = useState(0);

  // Load found count on mount and when vocabulary changes
  React.useEffect(() => {
    loadSolvedGrids().then(grids => {
      const count = grids.filter(g => g.wordlistFile === vocabulary.wordlistFile).length;
      setFoundCount(count);
    });
  }, [vocabulary.wordlistFile, showFlowerAnimation]);

  const handleOpenHistory = useCallback(async () => {
    const grids = await loadSolvedGrids();
    setSolvedGrids(grids);
    setHistoryVisible(true);
  }, []);

  const handleReset = useCallback(() => {
    if (letters.some(row => row.some(c => c !== ''))) {
      Alert.alert(
        t.resetTitle,
        t.resetMessage,
        [
          {text: t.resetCancel, style: 'cancel'},
          {
            text: t.resetConfirm,
            onPress: () => {
              setLetters(createEmptyGrid(vocabulary.gridSize));
              setSelectedCell({row: 0, col: 0});
              setShowFlowerAnimation(false);
            },
          },
        ],
      );
    }
  }, [letters, vocabulary.gridSize, t]);

  const handleVocabularyChange = useCallback((option: VocabularyOption) => {
    setVocabulary(option);
    setLetters(createEmptyGrid(option.gridSize));
    setSelectedCell({row: 0, col: 0});
    setShowFlowerAnimation(false);
  }, []);

  const handleCellPress = useCallback((row: number, col: number) => {
    setSelectedCell({row, col});
  }, []);

  const handleKeyPress = useCallback(
    (letter: string) => {
      const updated = letters.map(r => [...r]);
      updated[selectedCell.row][selectedCell.col] = letter;
      handleLettersChange(updated);
      // Advance to next cell based on typing direction
      const {row, col} = selectedCell;
      const gridSize = vocabulary.gridSize;
      if (typingDirection === 'horizontal') {
        const nextCol = col + 1;
        if (nextCol < gridSize) {
          setSelectedCell({row, col: nextCol});
        }
      } else {
        const nextRow = row + 1;
        if (nextRow < gridSize) {
          setSelectedCell({row: nextRow, col});
        }
      }
    },
    [selectedCell, vocabulary.gridSize, letters, handleLettersChange, typingDirection],
  );

  const handleBackspace = useCallback(() => {
    const {row, col} = selectedCell;
    if (letters[row][col]) {
      const updated = letters.map(r => [...r]);
      updated[row][col] = '';
      handleLettersChange(updated);
    } else {
      if (typingDirection === 'horizontal') {
        const prevCol = col - 1;
        if (prevCol >= 0) {
          setSelectedCell({row, col: prevCol});
          const updated = letters.map(r => [...r]);
          updated[row][prevCol] = '';
          handleLettersChange(updated);
        }
      } else {
        const prevRow = row - 1;
        if (prevRow >= 0) {
          setSelectedCell({row: prevRow, col});
          const updated = letters.map(r => [...r]);
          updated[prevRow][col] = '';
          handleLettersChange(updated);
        }
      }
    }
  }, [selectedCell, letters, vocabulary.gridSize, handleLettersChange, typingDirection]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ImageBackground
        source={require('./assets/background.png')}
        style={styles.background}
        imageStyle={{opacity: 0.5}}
        resizeMode="cover">
        <View style={styles.container}>
        {/* Ad banner */}
        <View style={styles.adBanner}>
          <BannerAd
            unitId="ca-app-pub-1462213173248963/1907027897"
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>

        {/* Vocabulary selector */}
        <VocabularySelector
          selected={vocabulary}
          onSelect={handleVocabularyChange}
          hasEnteredLetters={letters.some(row => row.some(c => c !== ''))}
          vocabChangeTitle={t.vocabChangeTitle}
          vocabChangeMessage={t.vocabChangeMessage}
          vocabChangeCancel={t.vocabChangeCancel}
          vocabChangeConfirm={t.vocabChangeConfirm}
        />

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}>✘</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => { setLastWordRevealed(false); setLastWordVisible(true); }} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}>🗓︎</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleOpenHistory} activeOpacity={0.7}>
            <Text style={styles.toolbarButtonText}>✔</Text>
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
              <Text style={styles.rulesTitle}>{t.rulesTitle}</Text>
              <Text style={styles.rulesText}>{t.rulesText1}</Text>
              <Text style={styles.rulesText}>{t.rulesText2}</Text>
              <Text style={styles.rulesText}>{t.rulesText3}</Text>
              {getLicenseForWordlist(wordlistKey) && (
                <>
                  <Text style={[styles.rulesTitle, {fontSize: 16, marginTop: 14}]}>{t.licensesTitle}</Text>
                  <Text style={styles.rulesText}>
                    {getLicenseForWordlist(wordlistKey)!.description}
                  </Text>
                  <Text style={[styles.rulesText, {fontStyle: 'italic'}]}>
                    {getLicenseForWordlist(wordlistKey)!.license}
                  </Text>
                  {getLicenseForWordlist(wordlistKey)!.url && (
                    <TouchableOpacity onPress={() => Linking.openURL(getLicenseForWordlist(wordlistKey)!.url!)}>
                      <Text style={styles.licenseLink}>{getLicenseForWordlist(wordlistKey)!.url}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              <TouchableOpacity
                style={styles.rulesCloseButton}
                onPress={() => setRulesVisible(false)}>
                <Text style={styles.rulesCloseText}>{t.rulesClose}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Päivän viimeinen sana modal */}
        <Modal
          visible={lastWordVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLastWordVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLastWordVisible(false)}>
            <View style={styles.rulesModal}>
              <Text style={styles.rulesTitle}>{t.lastWordTitle}</Text>
              {lastWordAvailable ? (
                <>
                  <Text style={styles.rulesText}>
                    {lastWordRevealed ? t.lastWordExplanationRevealed : t.lastWordExplanation}
                  </Text>
                  {lastWordRevealed ? (
                    <View style={styles.lastWordContainer}>
                      <Text style={styles.lastWordText}>
                        {getLastWordOfTheDay(wordlistKey)}
                      </Text>
                      <Text style={styles.lastWordIndex}>
                        #{(getLastWordInfo(wordlistKey)?.index ?? 0) + 1}/{getLastWordInfo(wordlistKey)?.count ?? 0}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.rulesCloseButton}
                      onPress={() => setLastWordRevealed(true)}>
                      <Text style={styles.rulesCloseText}>{t.lastWordRevealButton}</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.rulesText}>
                  {t.lastWordNotAvailable}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.rulesCloseButton, {marginTop: 16}]}
                onPress={() => setLastWordVisible(false)}>
                <Text style={styles.rulesCloseText}>{t.lastWordClose}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* History modal */}
        <Modal
          visible={historyVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setHistoryVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setHistoryVisible(false)}>
            <View style={[styles.rulesModal, styles.historyModal]}>
              <Text style={styles.rulesTitle}>{t.rulesClose === 'Close' ? 'Solutions Found' : t.rulesClose === 'Stäng' ? 'Hittade lösningar' : 'Löydetyt ratkaisut'}</Text>
              {solvedGrids.length === 0 ? (
                <Text style={styles.rulesText}>
                  {language === 'en' ? 'No solutions found yet.' : language === 'sv' ? 'Inga lösningar hittade ännu.' : 'Ei löydettyjä ratkaisuja.'}
                </Text>
              ) : (
                <FlatList
                  data={solvedGrids}
                  keyExtractor={(item, index) => `${item.solvedAt}-${index}`}
                  style={styles.historyList}
                  renderItem={({item}) => (
                    <View style={styles.historyItem}>
                      <View style={styles.historyGrid}>
                        {item.grid.map((row, rowIdx) => (
                          <Text key={rowIdx} style={styles.historyGridRow}>
                            {row.join('')}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.historyMeta}>
                        <Text style={styles.historyMetaText}>
                          {item.wordlistFile.replace('.txt', '')}
                        </Text>
                        <Text style={styles.historyMetaDate}>
                          {new Date(item.solvedAt).toLocaleString('fi-FI', {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              )}
              <TouchableOpacity
                style={[styles.rulesCloseButton, {marginTop: 12}]}
                onPress={() => setHistoryVisible(false)}>
                <Text style={styles.rulesCloseText}>{t.rulesClose}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Solution counter */}
        <View style={styles.solutionCounter}>
          <Text style={styles.solutionCounterText}>
            {foundCount} / {SOLUTION_COUNTS[wordlistKey] ?? '?'}
          </Text>
        </View>

        {/* Word grid */}
        <View style={styles.gridContainer}>
          <WordGrid
            gridSize={vocabulary.gridSize}
            letters={letters}
            selectedCell={selectedCell}
            onCellPress={handleCellPress}
            rowStatuses={rowStatuses}
            colStatuses={colStatuses}
            typingDirection={typingDirection}
            onRowBarPress={(row) => { setTypingDirection('horizontal'); setSelectedCell({row, col: 0}); }}
            onColBarPress={(col) => { setTypingDirection('vertical'); setSelectedCell({row: 0, col}); }}
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
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  lastWordContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    marginTop: 8,
  },
  lastWordText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 4,
  },
  lastWordIndex: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  historyModal: {
    maxHeight: '70%',
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  historyGrid: {
    marginRight: 12,
  },
  historyGridRow: {
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 2,
    color: '#333',
  },
  historyMeta: {
    flex: 1,
  },
  historyMetaText: {
    fontSize: 12,
    color: '#666',
  },
  historyMetaDate: {
    fontSize: 12,
    color: '#4a90d9',
    marginTop: 2,
    fontWeight: '400',
  },
  licenseLink: {
    fontSize: 13,
    color: '#4a90d9',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  solutionCounter: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  solutionCounterText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
});

export default App;
