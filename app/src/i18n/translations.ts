export type Language = 'fi' | 'sv' | 'en';

export interface Translations {
  // Toolbar / Reset
  resetTitle: string;
  resetMessage: string;
  resetCancel: string;
  resetConfirm: string;

  // Rules dialog
  rulesTitle: string;
  rulesText1: string;
  rulesText2: string;
  rulesText3: string;
  rulesClose: string;

  // Vocabulary change confirmation
  vocabChangeTitle: string;
  vocabChangeMessage: string;
  vocabChangeCancel: string;
  vocabChangeConfirm: string;

  // Last word dialog
  lastWordTitle: string;
  lastWordExplanation: string;
  lastWordExplanationRevealed: string;
  lastWordRevealButton: string;
  lastWordNotAvailable: string;
  lastWordClose: string;

  // Licenses
  licensesTitle: string;
}

const fi: Translations = {
  resetTitle: 'Tyhjennä ruudukko',
  resetMessage: 'Haluatko poistaa kaikki kirjaimet?',
  resetCancel: 'Peruuta',
  resetConfirm: 'Tyhjennä',

  rulesTitle: 'Säännöt',
  rulesText1: 'Täytä ruudukko kirjaimilla siten, että jokainen rivi ja sarake muodostaa sanan sanalistasta.',
  rulesText2: 'Paina ruutua ja kirjoita kirjain näppäimistöllä. Rivin tai sarakkeen väripalkki muuttuu vihreäksi kun sana löytyy sanastosta, ja punaiseksi jos sanaa ei löydy.',
  rulesText3: 'Peli on ratkaistu kun kaikki rivit ja sarakkeet ovat vihreitä!',
  rulesClose: 'Sulje',

  vocabChangeTitle: 'Vaihda sanasto',
  vocabChangeMessage: 'Ruudukkoon syötetyt kirjaimet häviävät. Haluatko jatkaa?',
  vocabChangeCancel: 'Peruuta',
  vocabChangeConfirm: 'Vaihda',

  lastWordTitle: 'Päivän viimeinen sana',
  lastWordExplanation: 'Alla oleva painike näyttää sanan, jota voit käyttää viimeisellä rivillä tai sarakkeella. Tälle sanalle löytyy vähintään yksi ratkaisu.',
  lastWordExplanationRevealed: 'Tässä on sana, jota voit käyttää viimeisellä rivillä tai sarakkeella. Tälle sanalle löytyy vähintään yksi ratkaisu.',
  lastWordRevealButton: 'Näytä sana',
  lastWordNotAvailable: 'Tälle sanastolle ei ole saatavilla päivän viimeistä sanaa.',
  lastWordClose: 'Sulje',

  licensesTitle: 'Lisenssit',
};

const sv: Translations = {
  resetTitle: 'Rensa rutnätet',
  resetMessage: 'Vill du ta bort alla bokstäver?',
  resetCancel: 'Avbryt',
  resetConfirm: 'Rensa',

  rulesTitle: 'Regler',
  rulesText1: 'Fyll i rutnätet med bokstäver så att varje rad och kolumn bildar ett ord från ordlistan.',
  rulesText2: 'Tryck på en ruta och skriv en bokstav med tangentbordet. Färgfältet vid raden eller kolumnen blir grönt när ordet finns i ordlistan, och rött om det inte finns.',
  rulesText3: 'Spelet är löst när alla rader och kolumner är gröna!',
  rulesClose: 'Stäng',

  vocabChangeTitle: 'Byt ordlista',
  vocabChangeMessage: 'Bokstäverna i rutnätet försvinner. Vill du fortsätta?',
  vocabChangeCancel: 'Avbryt',
  vocabChangeConfirm: 'Byt',

  lastWordTitle: 'Dagens sista ord',
  lastWordExplanation: 'Knappen nedan visar ett ord som du kan använda på sista raden eller kolumnen. Det finns minst en lösning för detta ord.',
  lastWordExplanationRevealed: 'Här är ett ord som du kan använda på sista raden eller kolumnen. Det finns minst en lösning för detta ord.',
  lastWordRevealButton: 'Visa ord',
  lastWordNotAvailable: 'Inget dagens sista ord tillgängligt för denna ordlista.',
  lastWordClose: 'Stäng',

  licensesTitle: 'Licenser',
};

const en: Translations = {
  resetTitle: 'Clear grid',
  resetMessage: 'Do you want to remove all letters?',
  resetCancel: 'Cancel',
  resetConfirm: 'Clear',

  rulesTitle: 'Rules',
  rulesText1: 'Fill the grid with letters so that each row and column forms a word from the word list.',
  rulesText2: 'Tap a cell and type a letter using the keyboard. The color bar next to a row or column turns green when the word is found in the word list, and red if it is not.',
  rulesText3: 'The puzzle is solved when all rows and columns are green!',
  rulesClose: 'Close',

  vocabChangeTitle: 'Change word list',
  vocabChangeMessage: 'The letters in the grid will be lost. Do you want to continue?',
  vocabChangeCancel: 'Cancel',
  vocabChangeConfirm: 'Change',

  lastWordTitle: 'Word of the day',
  lastWordExplanation: 'The button below reveals a word you can use on the last row or column. There is at least one solution for this word.',
  lastWordExplanationRevealed: 'Here is a word you can use on the last row or column. There is at least one solution for this word.',
  lastWordRevealButton: 'Show word',
  lastWordNotAvailable: 'No word of the day available for this word list.',
  lastWordClose: 'Close',

  licensesTitle: 'Licenses',
};

const TRANSLATIONS: Record<Language, Translations> = {fi, sv, en};

/**
 * Map wordlist keys to languages.
 * Keys starting with 'nykysuomi' or 'joukahainen' -> Finnish
 * Keys starting with 'eng' -> English
 * Keys starting with 'svenska' or 'sv' -> Swedish
 * Default: Finnish
 */
export function getLanguageForWordlist(wordlistKey: string): Language {
  if (wordlistKey.startsWith('eng')) {return 'en';}
  if (wordlistKey.startsWith('svenska') || wordlistKey.startsWith('sv_')) {return 'sv';}
  return 'fi';
}

export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language];
}

export interface LicenseInfo {
  description: string;
  license: string;
  url?: string;
}

/**
 * Get license info for a given wordlist key.
 */
export function getLicenseForWordlist(wordlistKey: string): LicenseInfo | null {
  if (wordlistKey.startsWith('nykysuomi')) {
    return {
      description: 'Kotimaisten kielten keskuksen julkaisema Kielitoimiston sanakirjan hakusanoihin perustuva sanalista.',
      license: 'CC BY 4.0',
      url: 'https://kaino.kotus.fi/sanat/nykysuomi/',
    };
  }
  if (wordlistKey.startsWith('svenska') || wordlistKey.startsWith('sv_')) {
    return {
      description: 'SAOL - Svenska Akademiens ordlista',
      license: 'Freely available',
      url: 'https://www.gu.se/svenska-spraket/saol-svenska-akademiens-ordlista',
    };
  }
  if (wordlistKey.startsWith('eng')) {
    return {
      description: 'English word list published in english-words project.',
      license: 'Unlicense',
      url: 'https://github.com/dwyl/english-words'
    };
  }
  return null;
}
