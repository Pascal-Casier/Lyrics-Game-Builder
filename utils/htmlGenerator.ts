import { ParsedLyrics } from '../types';

export const generateGameHTML = (
    title: string, 
    parsedData: ParsedLyrics, 
    audioBase64: string | null
): string => {

    // 1. Generate the HTML for the Lyrics Container
    let lyricsHTML = '<div class="paroles">';
    let currentParagraph = '<p>';
    
    parsedData.segments.forEach((seg) => {
        if (seg.type === 'newline') {
            currentParagraph += '</p><p>'; // Close and open new paragraph
        } else if (seg.type === 'text') {
            currentParagraph += seg.content;
        } else if (seg.type === 'gap') {
            currentParagraph += `<select id="${seg.wordId}" class="dropdown"></select>`;
        }
    });
    
    currentParagraph += '</p>';
    // Clean up empty paragraphs if double newlines occurred
    lyricsHTML += currentParagraph.replace('<p></p>', '') + '</div>';

    // 2. Generate the Javascript Data
    // We need to pass the `words` array which contains { id, reponse, options }
    const wordsData = parsedData.words.map(w => ({
        id: w.id,
        reponse: w.answer,
        options: w.options
    }));

    const jsonData = JSON.stringify(wordsData);

    // 3. Construct the full HTML string
    // This mimics the user's provided HTML structure and styles exactly.
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 2rem;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            width: 100%;
            background: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 {
            text-align: center;
            color: #4a69bd;
            font-size: 2.25rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }
        .audio-player {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
            width: 100%;
        }
        audio {
            width: 100%;
            max-width: 500px;
        }
        .paroles p {
            font-size: 1.125rem;
            margin: 1.5rem 0;
            line-height: 2;
        }
        .dropdown {
            display: inline-block;
            margin: 0 4px;
            padding: 6px 12px;
            border-radius: 8px;
            border: 2px solid #ccc;
            background-color: #f0f4f8;
            transition: all 0.2s ease-in-out;
            cursor: pointer;
            font-size: 1rem;
        }
        .dropdown:hover {
            border-color: #4a69bd;
            box-shadow: 0 0 5px rgba(74, 105, 189, 0.5);
        }
        .dropdown.correct {
            border-color: #28a745;
            background-color: #d4edda;
            color: #155724;
        }
        .dropdown.incorrect {
            border-color: #dc3545;
            background-color: #f8d7da;
            color: #721c24;
        }
        .boutons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        .bouton {
            padding: 12px 24px;
            font-size: 1rem;
            cursor: pointer;
            border: none;
            border-radius: 9999px;
            color: #fff;
            background-color: #4a69bd;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .bouton:hover {
            background-color: #2e529a;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .message-resultat {
            text-align: center;
            margin-top: 1.5rem;
            font-size: 1.25rem;
            font-weight: 700;
            transition: opacity 0.5s ease;
        }
        .popup, .intro-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            text-align: center;
            animation: popIn 0.3s ease-out;
            border: 2px solid #4a69bd;
            max-width: 90%;
            width: 400px;
        }
        @keyframes popIn {
            from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .popup-overlay, .intro-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }
        .popup-summary {
            font-size: 1rem;
            text-align: left;
            margin-top: 1rem;
        }
        .popup-summary p {
            margin: 0.5rem 0;
        }
        #gameContent {
            display: none;
        }
        .intro-popup input {
            padding: 8px;
            border: 2px solid #ccc;
            border-radius: 8px;
            margin-top: 1rem;
            width: 100%;
        }
    </style>
</head>
<body>

    <div id="introOverlay" class="intro-overlay"></div>
    <div id="introPopup" class="intro-popup">
        <h2 class="text-2xl font-bold mb-4 text-center">Bienvenue !</h2>
        <p class="mb-4 text-lg">Écoutez la chanson et complétez les paroles.</p>
        <p class="font-semibold mb-2">Votre nom :</p>
        <input type="text" id="playerNameInput" placeholder="Votre nom" class="mb-4">
        <button id="startButton" class="bouton">Commencer le jeu</button>
    </div>

    <div id="gameContent" class="container">
        <h1>${title}</h1>
        <div class="audio-player">
            <audio controls>
                ${audioBase64 ? `<source src="${audioBase64}" type="audio/mp3">` : '<!-- Pas d\'audio fourni -->'}
                Votre navigateur ne supporte pas l'élément audio.
            </audio>
        </div>
        
        ${lyricsHTML}
        
        <div class="boutons">
            <button id="checkButton" class="bouton">Vérifier mes réponses</button>
            <button id="showButton" class="bouton">Afficher les réponses</button>
        </div>

        <div id="resultat" class="message-resultat"></div>
    </div>

    <script>
        let playerName = "";

        document.addEventListener('DOMContentLoaded', () => {
            // INJECTED DATA
            const motsManquants = ${jsonData};

            // LOGIC
            const shuffleArray = array => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            };

            motsManquants.forEach(item => {
                const selectElement = document.getElementById(item.id);
                if (selectElement) {
                    const options = [...item.options];
                    // Ensure options are shuffled initially
                    shuffleArray(options); 
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.textContent = "---";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    selectElement.appendChild(defaultOption);

                    options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        selectElement.appendChild(optionElement);
                    });
                }
            });

            document.getElementById('startButton').addEventListener('click', () => {
                playerName = document.getElementById('playerNameInput').value.trim();
                document.getElementById('introPopup').style.display = 'none';
                document.getElementById('introOverlay').style.display = 'none';
                document.getElementById('gameContent').style.display = 'block';
            });

            document.getElementById('checkButton').addEventListener('click', () => {
                let reponsesCorrectes = 0;
                let reponsesIncorrectes = 0;
                motsManquants.forEach(item => {
                    const selectElement = document.getElementById(item.id);
                    if (selectElement) {
                        const estCorrect = selectElement.value === item.reponse;
                        selectElement.classList.remove('correct', 'incorrect');
                        if (estCorrect) {
                            reponsesCorrectes++;
                            selectElement.classList.add('correct');
                        } else {
                            reponsesIncorrectes++;
                            selectElement.classList.add('incorrect');
                        }
                    }
                });

                const tousRemplis = [...document.querySelectorAll('.dropdown')].every(select => select.value !== "");
                const message = document.getElementById('resultat');

                if (tousRemplis) {
                    const erreurs = motsManquants.length - reponsesCorrectes;
                    const date = new Date().toLocaleDateString('fr-FR');
                    message.textContent = \`Vous avez \${reponsesCorrectes} sur \${motsManquants.length} réponses correctes !\`;
                    message.className = 'message-resultat';

                    showPopup(playerName, reponsesCorrectes, erreurs, date);
                } else {
                    message.textContent = "Veuillez remplir toutes les options avant de vérifier.";
                    message.className = 'message-resultat incorrect';
                }
            });

            document.getElementById('showButton').addEventListener('click', () => {
                let messageDiv = document.getElementById('resultat');
                
                motsManquants.forEach(item => {
                    const selectElement = document.getElementById(item.id);
                    if (selectElement) {
                        selectElement.value = item.reponse;
                        selectElement.classList.remove('incorrect');
                        selectElement.classList.add('correct');
                    }
                });
                
                messageDiv.textContent = \`Les réponses ont été affichées.\`;
                messageDiv.className = 'message-resultat correct';
            });
        });

        function showPopup(nom, correct, erreurs, date) {
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            document.body.appendChild(overlay);

            const popup = document.createElement('div');
            popup.className = 'popup';
            popup.innerHTML = \`
                <h2 class="text-xl font-bold mb-2">Résumé du jeu</h2>
                <div class="popup-summary">
                    <p><strong>Nom :</strong> \${nom || 'Anonyme'}</p>
                    <p><strong>Date :</strong> \${date}</p>
                    <p><strong>Bonnes réponses :</strong> \${correct}</p>
                    <p><strong>Erreurs :</strong> \${erreurs}</p>
                </div>
                <div class="mt-4 flex gap-2 justify-center">
                    <button id="copyButton" class="bouton">Copier le résumé</button>
                    <button class="bouton" onclick="closePopup()">Fermer</button>
                </div>
            \`;
            document.body.appendChild(popup);

            document.getElementById('copyButton').addEventListener('click', () => {
                const summaryText = \`
                    Résumé du jeu :
                    Nom : \${nom || 'Anonyme'}
                    Date : \${date}
                    Bonnes réponses : \${correct}
                    Erreurs : \${erreurs}
                \`.trim();
                
                const tempInput = document.createElement('textarea');
                tempInput.value = summaryText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                showPopupConfirmation("Résumé copié !");
            });
        }

        function showPopupConfirmation(message) {
            const popup = document.querySelector('.popup');
            if (popup) {
                const confirmationDiv = document.createElement('div');
                confirmationDiv.textContent = message;
                confirmationDiv.style.marginTop = '10px';
                confirmationDiv.style.color = '#28a745';
                confirmationDiv.style.fontWeight = 'bold';
                popup.appendChild(confirmationDiv);
            }
        }

        window.closePopup = function() {
            const popup = document.querySelector('.popup');
            const overlay = document.querySelector('.popup-overlay');
            if (popup) popup.remove();
            if (overlay) overlay.remove();
        }
    </script>
</body>
</html>`;
};