import { ParsedLyrics, ParsedSegment, GameWord } from '../types';

export const parseLyricsText = (text: string): ParsedLyrics => {
  const segments: ParsedSegment[] = [];
  const foundWords: string[] = [];
  const words: GameWord[] = [];
  let wordCount = 0;

  // Split by newlines first to preserve paragraph structure
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    // Regex to match words ending with an asterisk, e.g., word* or "word"*
    // We catch punctuation before the asterisk as part of the word if needed, 
    // but usually we want to strip non-alphanumeric for the "Answer" logic while keeping display clean.
    
    // Strategy: Split by space, then check each token.
    // This is a simple parser. For more complex punctuation handling, regex tokenization is better.
    
    // Regex explanation: 
    // ([^*]+)\*  -> Capture anything that isn't an asterisk, followed by an asterisk.
    const tokens = line.split(/(\S+\*)/g); 

    tokens.forEach((token) => {
      if (!token) return;

      if (token.endsWith('*')) {
        wordCount++;
        const rawWord = token.slice(0, -1); // Remove asterisk
        // Clean the word for the answer key (remove punctuation like commas, quotes if they were included)
        // For this simple app, we assume the user puts the asterisk right after the word they want hidden.
        // E.g. "Hello*" -> answer "Hello". "Hello,*" -> answer "Hello," (might be tricky).
        // Let's try to be smart: if there is punctuation at the end, keep it in text, hide the word.
        // For simplicity based on the user request: "The word followed by asterisk is the word to find".
        
        const id = `mot${wordCount}`;
        
        // Add to game logic
        foundWords.push(rawWord);
        
        segments.push({
          type: 'gap',
          wordId: id,
          answer: rawWord
        });
      } else {
        segments.push({
          type: 'text',
          content: token
        });
      }
    });

    if (lineIndex < lines.length - 1) {
      segments.push({ type: 'newline' });
    }
  });

  // Generate game words with options (distractors)
  // The distractors are other words found in the text to make it tricky but relevant.
  let distinctWords = Array.from(new Set(foundWords));

  // Map back to create the GameWord objects
  // We re-loop through segments to ensure we map the IDs correctly
  segments.forEach(seg => {
    if (seg.type === 'gap' && seg.wordId && seg.answer) {
      // Create options: The correct answer + 2 random others from the distinct list
      const otherWords = distinctWords.filter(w => w !== seg.answer);
      
      // Shuffle other words
      const shuffledOthers = otherWords.sort(() => 0.5 - Math.random());
      
      // Take top 2, or fewer if not enough distinct words
      const distractors = shuffledOthers.slice(0, 2);
      
      const options = [seg.answer!, ...distractors];
      
      // Shuffle options so the answer isn't always first
      const shuffledOptions = options.sort(() => 0.5 - Math.random());

      words.push({
        id: seg.wordId,
        answer: seg.answer,
        options: shuffledOptions
      });
    }
  });

  return { segments, words };
};