import React, { useState, useEffect } from 'react';
import { ParsedLyrics } from '../types';
import { Check, Eye, RefreshCw } from 'lucide-react';

interface GamePreviewProps {
  parsedLyrics: ParsedLyrics;
  audioUrl: string | null;
}

export const GamePreview: React.FC<GamePreviewProps> = ({ parsedLyrics, audioUrl }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'playing' | 'checked' | 'revealed'>('playing');
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  // Reset state when lyrics change
  useEffect(() => {
    setAnswers({});
    setStatus('playing');
    setScore(null);
  }, [parsedLyrics]);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    // If previously checked, reset status so styling clears until checked again
    if (status === 'checked') setStatus('playing');
  };

  const handleCheck = () => {
    let correctCount = 0;
    parsedLyrics.words.forEach(word => {
      if (answers[word.id] === word.answer) {
        correctCount++;
      }
    });
    setScore({ correct: correctCount, total: parsedLyrics.words.length });
    setStatus('checked');
  };

  const handleReveal = () => {
    const correctAnswers: Record<string, string> = {};
    parsedLyrics.words.forEach(word => {
      correctAnswers[word.id] = word.answer;
    });
    setAnswers(correctAnswers);
    setStatus('revealed');
  };

  const getSelectClass = (wordId: string, correctAnswer: string) => {
    const baseClass = "mx-1 px-3 py-1.5 border-2 rounded-lg text-sm md:text-base transition-all duration-200 cursor-pointer";
    const val = answers[wordId];
    
    if (status === 'playing') {
       return `${baseClass} bg-slate-50 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200`;
    }

    if (status === 'checked' || status === 'revealed') {
      if (val === correctAnswer) {
        return `${baseClass} bg-green-100 border-green-500 text-green-800`;
      } else {
        return `${baseClass} bg-red-100 border-red-500 text-red-800`;
      }
    }
    
    return baseClass;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 flex justify-center">
        {audioUrl ? (
          <audio controls src={audioUrl} className="w-full max-w-md rounded-full shadow-sm" />
        ) : (
          <div className="text-slate-400 italic bg-slate-100 px-4 py-2 rounded-full text-sm">
             Aucun fichier audio sélectionné
          </div>
        )}
      </div>

      <div className="space-y-4 leading-loose text-lg text-slate-800">
        {/* Render logic similar to HTML generation but in React */}
        {(() => {
           // Group segments by paragraph for proper rendering
           const paragraphs: React.ReactNode[][] = [];
           let currentParagraph: React.ReactNode[] = [];

           parsedLyrics.segments.forEach((seg, idx) => {
             if (seg.type === 'newline') {
                if (currentParagraph.length > 0) {
                    paragraphs.push(currentParagraph);
                    currentParagraph = [];
                }
             } else if (seg.type === 'text') {
                currentParagraph.push(<span key={idx}>{seg.content}</span>);
             } else if (seg.type === 'gap' && seg.wordId) {
                const word = parsedLyrics.words.find(w => w.id === seg.wordId);
                if (word) {
                    currentParagraph.push(
                        <select
                            key={idx}
                            value={answers[seg.wordId] || ''}
                            onChange={(e) => handleChange(seg.wordId!, e.target.value)}
                            className={getSelectClass(seg.wordId, word.answer)}
                        >
                            <option value="" disabled>---</option>
                            {word.options.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    );
                }
             }
           });
           if (currentParagraph.length > 0) paragraphs.push(currentParagraph);

           return paragraphs.map((p, idx) => (
             <p key={idx} className="mb-6 leading-[2.5]">{p}</p>
           ));
        })()}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleCheck}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Check size={20} />
          Vérifier mes réponses
        </button>
        <button
          onClick={handleReveal}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-full font-semibold transition-colors"
        >
          <Eye size={20} />
          Afficher les réponses
        </button>
      </div>

      {score !== null && status === 'checked' && (
        <div className={`mt-6 text-center p-4 rounded-lg ${score.correct === score.total ? 'bg-green-100 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
          <p className="text-xl font-bold">
            Vous avez {score.correct} sur {score.total} réponses correctes !
          </p>
        </div>
      )}
    </div>
  );
};