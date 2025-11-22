import React, { useState, useEffect } from 'react';
import { Music, FileDown, Edit3, PlayCircle, UploadCloud } from 'lucide-react';
import { parseLyricsText } from './utils/parser';
import { generateGameHTML } from './utils/htmlGenerator';
import { GamePreview } from './components/GamePreview';
import { ParsedLyrics } from './types';

const App: React.FC = () => {
  // Default lyrics example
  const defaultLyrics = `Moi je n'étais *rien*
Et voilà qu'aujourd'hui
Je suis le gardien
Du sommeil de ses *nuits*
Je l'aime à *mourir*`;

  const [title, setTitle] = useState("Titre de la chanson");
  const [lyricsInput, setLyricsInput] = useState(defaultLyrics);
  const [parsedLyrics, setParsedLyrics] = useState<ParsedLyrics>({ segments: [], words: [] });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Update parsed lyrics whenever input changes
  useEffect(() => {
    const parsed = parseLyricsText(lyricsInput);
    setParsedLyrics(parsed);
  }, [lyricsInput]);

  // Handle Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);

      // Convert to Base64 for export
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAudioBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const htmlContent = generateGameHTML(title, parsedLyrics, audioBase64);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_game.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Music className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Lyrics Game Builder</h1>
          </div>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Télécharger HTML</span>
            <span className="sm:hidden">HTML</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'editor' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Edit3 size={18} />
              Éditeur
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'preview' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PlayCircle size={18} />
              Aperçu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration (Always visible on desktop if desired, or tabbed) */}
          {/* Actually, let's respect the tabs for mobile first design, but on large screens split view could be nice. 
              However, to keep it simple and focused based on the 'Tabs' UI above, we will switch views. 
           */}
          
          <div className={`lg:col-span-5 ${activeTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Edit3 size={18} className="text-indigo-500" />
                  Configuration du Jeu
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Titre de la chanson</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: Je l'aime à mourir"
                  />
                </div>

                {/* Audio Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fichier Audio (MP3)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors relative">
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>Téléverser un fichier</span>
                          <input id="file-upload" name="file-upload" type="file" accept="audio/*" className="sr-only" onChange={handleAudioUpload} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">MP3, WAV jusqu'à 10MB recommandé</p>
                    </div>
                  </div>
                  {audioFile && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <Music size={14} />
                      {audioFile.name}
                    </div>
                  )}
                </div>

                {/* Lyrics Input */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Paroles</label>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      Ajoutez * après un mot pour le cacher
                    </span>
                  </div>
                  <textarea
                    value={lyricsInput}
                    onChange={(e) => setLyricsInput(e.target.value)}
                    className="w-full h-96 px-4 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed resize-none"
                    placeholder="Collez les paroles ici..."
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Exemple: "Je l'aime à *mourir*" créera un trou pour le mot "mourir".
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className={`lg:col-span-7 ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
               <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <PlayCircle size={18} className="text-indigo-500" />
                    Aperçu du Jeu
                  </h2>
                  <span className="text-xs font-medium px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
                    {parsedLyrics.words.length} mots à trouver
                  </span>
               </div>
               <GamePreview 
                  parsedLyrics={parsedLyrics} 
                  audioUrl={audioPreviewUrl} 
               />
               <div className="mt-4 text-center text-sm text-slate-400">
                  Ceci est un aperçu. Cliquez sur "Télécharger HTML" pour obtenir le jeu final.
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;