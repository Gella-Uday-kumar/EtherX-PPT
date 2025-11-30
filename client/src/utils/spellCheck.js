// Basic English word dictionary (subset of common words)
const dictionary = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'has', 'let', 'put', 'say', 'she', 'too', 'use'
]);

// Common misspellings and their corrections
const commonCorrections = {
  'teh': 'the',
  'adn': 'and',
  'recieve': 'receive',
  'seperate': 'separate',
  'occured': 'occurred',
  'definately': 'definitely'
};

// Function to check if a word is in the dictionary
export const isWordInDictionary = (word) => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  return dictionary.has(cleanWord);
};

// Function to get spelling suggestions for a word
export const getSpellingSuggestions = (word) => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');

  // Check if it's a common misspelling
  if (commonCorrections[cleanWord]) {
    return [commonCorrections[cleanWord]];
  }

  // Simple suggestion algorithm: words that differ by one character
  const suggestions = [];
  for (const dictWord of dictionary) {
    if (Math.abs(dictWord.length - cleanWord.length) <= 1) {
      let diffCount = 0;
      const maxLen = Math.max(dictWord.length, cleanWord.length);
      for (let i = 0; i < maxLen; i++) {
        if (dictWord[i] !== cleanWord[i]) {
          diffCount++;
          if (diffCount > 1) break;
        }
      }
      if (diffCount <= 1) {
        suggestions.push(dictWord);
      }
    }
  }

  return suggestions.slice(0, 5); // Return up to 5 suggestions
};

// Function to check text for misspelled words
export const checkSpelling = (text) => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const misspelledWords = [];

  words.forEach((word, index) => {
    if (!isWordInDictionary(word)) {
      const suggestions = getSpellingSuggestions(word);
      misspelledWords.push({
        word: word,
        position: index,
        suggestions: suggestions
      });
    }
  });

  return misspelledWords;
};