export interface GameWord {
    id: string;
    answer: string;
    options: string[];
}

export interface ParsedSegment {
    type: 'text' | 'gap' | 'newline';
    content?: string;
    wordId?: string;
    answer?: string;
}

export interface ParsedLyrics {
    segments: ParsedSegment[];
    words: GameWord[];
}