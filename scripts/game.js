window.onload = function () {

    const suits = ['eichel', 'grun', 'rot', 'schelle'];
    const ranks = ['Ober', 'Bauer', 'ass', 'Zehner', 'Koenig', 'Neuner', 'Achter'];

    const deckTemplate = [
        // ────────────────────────────────────────────────
        // Trump hierarchy order (strongest → weakest)
        // ────────────────────────────────────────────────
        { id: 0, suit: 'eichel', rank: 'Ober', points: 4, trumpRank: 1 },  // 1. Grosse Fuchs 
        { id: 1, suit: 'grun', rank: 'Ober', points: 3, trumpRank: 2 },  // 2. Kleiner Fuchs 
        { id: 2, suit: 'eichel', rank: 'Bauer', points: 2, trumpRank: 3 },  // 3. Eichel Bauer
        { id: 3, suit: 'grun', rank: 'Bauer', points: 2, trumpRank: 4 },  // 4. Grun Bauer
        { id: 4, suit: 'rot', rank: 'Bauer', points: 2, trumpRank: 5 },  // 5. Rot Bauer
        { id: 5, suit: 'schelle', rank: 'Bauer', points: 2, trumpRank: 6 },  // 6. Schelle Bauer
        { id: 6, suit: 'rot', rank: 'Ass', points: 11, trumpRank: 7 },  // 7. Rot Ass
        { id: 7, suit: 'rot', rank: 'Zehner', points: 10, trumpRank: 8 },  // 8. Rot Zehner
        { id: 8, suit: 'rot', rank: 'Koenig', points: 4, trumpRank: 9 },  // 9. Rot König
        { id: 9, suit: 'rot', rank: 'Ober', points: 3, trumpRank: 10 },  // 10. Rot Ober
        { id: 10, suit: 'rot', rank: 'Neuner', points: 0, trumpRank: 11 },  // 11. Rot Neiner
        { id: 11, suit: 'rot', rank: 'Achter', points: 0, trumpRank: 12 },  // 12. Rot Achter

        // ────────────────────────────────────────────────
        // Non-trump cards (ordered roughly by suit strength)
        // ────────────────────────────────────────────────
        { id: 12, suit: 'eichel', rank: 'Ass', points: 11, trumpRank: null, rankOrder: 1 },
        { id: 13, suit: 'eichel', rank: 'Zehner', points: 10, trumpRank: null, rankOrder: 2 },
        { id: 14, suit: 'eichel', rank: 'Koenig', points: 4, trumpRank: null, rankOrder: 3 },
        { id: 15, suit: 'eichel', rank: 'Neuner', points: 0, trumpRank: null, rankOrder: 4 },

        { id: 16, suit: 'grun', rank: 'Ass', points: 11, trumpRank: null, rankOrder: 1 },
        { id: 17, suit: 'grun', rank: 'Zehner', points: 10, trumpRank: null, rankOrder: 2 },
        { id: 18, suit: 'grun', rank: 'Koenig', points: 4, trumpRank: null, rankOrder: 3 },
        { id: 19, suit: 'grun', rank: 'Neuner', points: 0, trumpRank: null, rankOrder: 4 },

        { id: 20, suit: 'schelle', rank: 'Ass', points: 11, trumpRank: null, rankOrder: 1 },
        { id: 21, suit: 'schelle', rank: 'Zehner', points: 10, trumpRank: null, rankOrder: 2 },
        { id: 22, suit: 'schelle', rank: 'Koenig', points: 4, trumpRank: null, rankOrder: 3 },
        { id: 23, suit: 'schelle', rank: 'Ober', points: 3, trumpRank: null, rankOrder: 4 }
    ];

    deckTemplate.forEach(card => {
        card.image = `images/cards/${card.suit}/${card.rank}.png`; // your images
    });

    let gameState = {
        phase: 'dealing',
        players: [
            { hand: [], score: 0, name: 'You' },
            { hand: [], score: 0, name: 'Player 2' },
            { hand: [], score: 0, name: 'Player 3' },
            { hand: [], score: 0, name: 'Player 4' }
        ],
        dealer: 0,
        caller: 0,
        currentPlayer: 0,
        trick: [],
        calledCard: null,
        partner: null,
        isFuchsGame: false,
        announcements: [],
        teams: null,
        wonTricks: [[], [], [], []],
        rotIsTrump: false,
        callerHasCalled: false,
        playedSuits: new Set()
    };

    // Modal controls
    const modal = document.getElementById('popup-modal');
    const modalMessage = document.getElementById('popup-message');
    const closeBtn = document.querySelector('.close');
    const callOptionsDiv = document.getElementById('call-options');
    const confirmCallBtn = document.getElementById('confirm-call');

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

    function showPopup(message, options = null, callback = null) {
        modalMessage.textContent = message;
        callOptionsDiv.innerHTML = '';
        confirmCallBtn.style.display = 'none';

        if (options) {
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.textContent = opt.label;
                btn.onclick = () => {
                    modal.style.display = 'none';
                    callback(opt.value);
                };
                callOptionsDiv.appendChild(btn);
            });
        } else if (callback) {
            confirmCallBtn.style.display = 'inline-block';
            confirmCallBtn.onclick = () => {
                modal.style.display = 'none';
                callback();
            };
        } else {
            setTimeout(() => {
                modal.style.display = 'none';
                if (callback) callback();
            }, 2800);
        }
        modal.style.display = 'block';
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const sortHand = (a, b) => {
        const ta = a.trumpRank ?? Infinity;
        const tb = b.trumpRank ?? Infinity;
        if (ta !== tb) return ta - tb;
        const suitOrder = { eichel: 0, grun: 1, schelle: 2 };
        const sa = suitOrder[a.suit] ?? 99;
        const sb = suitOrder[b.suit] ?? 99;
        if (sa !== sb) return sa - sb;
        const rankOrder = { Ass: 0, Zehner: 1, Koenig: 2, Ober: 3, Neuner: 4, Achter: 5, Bauer: 6 };
        return (rankOrder[a.rank] ?? 99) - (rankOrder[b.rank] ?? 99);
    };

    function deal() {
        let deck = shuffle([...deckTemplate]);
        for (let i = 0; i < 4; i++) {
            gameState.players[i].hand = deck.splice(0, 6);
        }
        for (let p = 0; p < 4; p++) {
            if (gameState.players[p].hand.some(c => c.suit === 'eichel' && c.rank === 'Ober')) {
                gameState.currentPlayer = p;
                break;
            }
        }
        for (let i = 0; i < 4; i++) {
            console.log(gameState.players[i].hand);
        }
        gameState.phase = 'calling';
        updateStatus(`Player ${gameState.currentPlayer + 1} has the Fuchs and is calling.`);
        gameState.caller = gameState.currentPlayer;
        showPopup(`Calling Phase\nPlayer ${gameState.currentPlayer + 1} is calling the game!`);
        setTimeout(handleCalling, 1200);
    }

    function renderHands() {
        // Your hand - visible
        const yourHand = document.getElementById('player0-hand');
        yourHand.innerHTML = '';
        gameState.players[0].hand.sort(sortHand);
        gameState.players[0].hand.forEach((card, idx) => {
            const div = document.createElement('div');
            div.className = 'card';
            if (gameState.phase === 'gameplay' && gameState.currentPlayer === 0) {
                div.onclick = () => playCard(idx);
            }
            const img = document.createElement('img');
            img.src = card.image;
            div.appendChild(img);
            yourHand.appendChild(div);
        });

        // Opponents - show card backs + count
        [1, 2, 3].forEach(p => {
            const handDiv = document.getElementById(`player${p}-hand`);
            handDiv.innerHTML = '';
            const count = gameState.players[p].hand.length;
            document.getElementById(`player${p}-count`).textContent = `${count} card${count !== 1 ? 's' : ''}`;

            for (let i = 0; i < 1; i++) {
                const back = document.createElement('div');
                back.className = 'card card-back';
                handDiv.appendChild(back);
            }
        });
    }

    function renderTrick() {
        const trickDiv = document.getElementById('trick');
        trickDiv.innerHTML = '';
        gameState.trick.forEach(t => {
            const c = document.createElement('div');
            c.className = 'card';
            const img = document.createElement('img');
            img.src = t.card.image;
            c.appendChild(img);
            trickDiv.appendChild(c);
        });
    }

    function updateStatus(isStartStatus, text) {
        isStartStatus ? document.getElementById('start-status').textContent = text : document.getElementById('status').textContent = text;
        console.log(text);
    }

    function handleCalling() {
        // For simplicity, assume player 0 is human, others AI
        if (gameState.currentPlayer !== 0) {
            // AI calling logic (stub)
            aiCall();
            return;
        }
        // Show call button for human
        // document.getElementById('call-button').style.display = 'block';
        updateStatus(false, 'Make your call: Choose a card to call or special call.');
        // Need UI for selecting call type, e.g., dropdown or buttons
        // For now, stub with console prompt
        const call = prompt('Enter call: e.g., "rot_ass" or "rot_is_trump" or "fuchs_und_rote"');
        processCall(call);
    }

    function processCall(call) {
        if (call === "ai") {
            // Find partner who has the called card
            for (let p = 0; p < 4; p++) {
                if (p !== gameState.currentPlayer && gameState.players[p].hand.some(c => c.suit === gameState.calledCard.suit && c.rank === gameState.calledCard.rank)) {
                    gameState.partner = p;
                    gameState.teams = { team1: [gameState.currentPlayer, p], team2: [0, 1, 2, 3].filter(q => q !== gameState.currentPlayer && q !== p) };
                    break;
                }
            }
        }
        else if (call === 'rot_is_trump') {
            gameState.rotIsTrump = true;
            gameState.teams = { team1: [gameState.currentPlayer], team2: [0, 1, 2, 3].filter(p => p !== gameState.currentPlayer) };
            gameState.isFuchsGame = false;
        } else if (call === 'fuchs_und_rote') {
            gameState.isFuchsGame = true;
            gameState.teams = { team1: [gameState.currentPlayer], team2: [0, 1, 2, 3].filter(p => p !== gameState.currentPlayer) };
        } else {
            // Normal call, parse suit_rank
            const [suit, rank] = call.split('_');
            gameState.calledCard = { suit, rank };
            // Find partner who has the called card
            for (let p = 0; p < 4; p++) {
                if (p !== gameState.currentPlayer && gameState.players[p].hand.some(c => c.suit === suit && c.rank === rank)) {
                    gameState.partner = p;
                    gameState.teams = { team1: [gameState.currentPlayer, p], team2: [0, 1, 2, 3].filter(q => q !== gameState.currentPlayer && q !== p) };
                    break;
                }
            }
            // Check if partner has Kleiner Fuchs, then it's Fuchs game
            if (gameState.players[gameState.partner].hand.some(c => c.suit === 'grun' && c.rank === 'Ober')) {
                gameState.isFuchsGame = true;
            }
            // If caller has both Fuchs and Kleiner, announce Fuchs im Haus
            if (gameState.players[gameState.currentPlayer].hand.some(c => c.suit === 'grun' && c.rank === 'Ober')) {
                gameState.isFuchsGame = true;
                updateStatus(false, 'Fuchs im Haus');
            }
        }
        gameState.callerHasCalled = true;

        // Proceed to gameplay
        gameState.phase = 'gameplay';
        gameState.currentPlayer = (gameState.dealer + 1) % 4; // Left of dealer starts
        //document.getElementById('call-button').style.display = 'none';
        playTurn();
    }

    // AI call stub
    function aiCall() {
        let aihand = gameState.players[gameState.caller];
        let hasKleine = aihand.hand.some(c => c.trumpRank === 2);
        // let nonTrumpSuits = [...new Set(hand.filter(c => !c.isTrump).map(c => c.suit))];

        let nonTrumpSuits = [...new Set(aihand.hand.filter(c => c.trumpRank == null).map(c => c.suit))];
        let announcement = '';
        if (hasKleine) announcement = ' (Fuchs im Haus)';
        if (nonTrumpSuits.length > 0) {
            let s = nonTrumpSuits[Math.floor(Math.random() * nonTrumpSuits.length)];
            let suitCards = deckTemplate.filter(c => c.suit === s && c.trumpRank == null);
            let handInSuit = aihand.hand.filter(c => c.suit === s);
            let possible = suitCards.filter(c => !handInSuit.some(h => h.id === c.id));
            let g = possible[Math.floor(Math.random() * possible.length)];
            for (let p = 0; p < 4; p++) {
                if (p !== gameState.caller && gameState.players[p].hand.some(c => c.id === g.id)) {
                    partner = p;
                    break;
                }
            }
            isFuchsGame = hasKleine || (partner !== null && gameState.players[partner].hand.some(c => c.id === 1));
            if (isFuchsGame && partner !== null) announcement = ' (Hat Fuchs)';
            const [suit, rank] = `${g.suit}_${g.rank}`.split("_");
            gameState.calledCard = { suit, rank };
            updateStatus(false, `Player ${gameState.currentPlayer + 1} called: ${g.suit} ${g.rank}`);
            showPopup(`Player ${gameState.currentPlayer + 1} called: ${g.suit} ${g.rank}`);

        } else {
            //TODO:FIX this - entirely broken atm 
            partner = null;
            gameState.isFuchsGame = hasKleine;
            const aloneType = hasKleine ? 'Fuchs und Rote' : 'Rot ist Trumpf';
            updateStatus(false, `Player ${gameState.currentPlayer + 1} called: ${g.suit} ${g.rank}`);
            showPopup(`Player ${gameState.currentPlayer + 1}  plays alone: ${aloneType}`);
        }

        processCall("ai");

    }

    function playTurn() {
        renderHands();
        renderTrick();
        if (gameState.currentPlayer !== 0) {
            setTimeout(aiPlay, 1400 + Math.random() * 800);
            return;
        }
        updateStatus(false, "Your turn – click a card to play");
    }

    function isLegalPlay(card, hand, trick) {
        if (!gameState.callerHasCalled) return false;
        if (trick.length === 0) return true;
        let leadCard = trick[0].card;
        let leadSuit = getEffectiveSuit(leadCard);
        let hasSuit = hand.some(c => getEffectiveSuit(c) === leadSuit);
        if (hasSuit && getEffectiveSuit(card) !== leadSuit) return false;
        if (!hasSuit) {
            let hasTrump = hand.some(c => c.trumpRank != null);
            if (hasTrump && card.trumpRank == null) return false;
        }
        let currentHigh = getCurrentHigh(trick);
        if ((leadCard.suit !== card.suit && canBeat(hand, currentHigh, leadSuit)) && !beats(card, currentHigh)) return false;

        let gerufeneID = deckTemplate.find(card => gameState.calledCard.rank === card.rank && gameState.calledCard.suit === card.suit).id;
        if (gameState.calledCard && card.id === gerufeneID && getEffectiveSuit(card) !== leadSuit && trick.length > 0 && !gameState.playedSuits.has(card.suit)) return false;
        return true;
    }

    function getEffectiveSuit(card) {
        return card.trumpRank != null ? 'trump' : card.suit;
    }

    function getCurrentHigh(trick) {
        let high = trick[0].card;
        for (let i = 1; i < trick.length; i++) {
            if (beats(trick[i].card, high)) high = trick[i].card;
        }
        return high;
    }

    function beats(card1, card2) {
        if (card1.trumpRank == null && card2.trumpRank == null) {
            if (card1.suit !== card2.suit) return false;
            return card1.rankOrder < card2.rankOrder;
        }
        if (card1.trumpRank != null && card2.trumpRank != null) return card1.trumpRank < card2.trumpRank;
        if (card1.trumpRank != null) return true;
        return false;
    }

    function canBeat(hand, currentHigh, leadSuit) {
        return hand.some(c => getEffectiveSuit(c) === getEffectiveSuit(currentHigh) && beats(c, currentHigh));
    }

    function playCard(index) {
        if (gameState.currentPlayer !== 0) return;
        const hand = gameState.players[0].hand;
        const card = gameState.players[0].hand[index];

        if (isLegalPlay(card, hand, gameState.trick)) {
            gameState.players[0].hand.splice(index, 1)[0];
            gameState.trick.push({ player: 0, card });
            renderHands();
            renderTrick();
            nextPlayer();
        }
        else {
            // hand.splice(index,0,card);
            alert('Illegal play');
        }
    }

    function aiPlay() {
        const p = gameState.currentPlayer;
        const hand = gameState.players[p].hand;
        if (hand.length === 0) return;
        let card = null;

        for (let c of hand) {
            if (isLegalPlay(c, hand, gameState.trick)) {
                card = c;
                break;
            }
        }
        hand.splice(hand.indexOf(card), 1);
        console.log("Player " + (p + 1) + " attempting to play " + card.suit + " " + card.rank)
        updateStatus(false, "Player " + (p + 1) + " played " + card.suit + " " + card.rank);

        gameState.trick.push({ player: p, card });
        renderHands();
        renderTrick();
        nextPlayer();

    }

    function nextPlayer() {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % 4;
        if (gameState.trick.length < 4) {
            playTurn();
        } else {
            setTimeout(resolveTrick, 1000);
        }
    }

    function resolveTrick() {
        const winner = determineTrickWinner(gameState.trick);
        showPopup(`Player ${winner + 1} wins the stich!`);
        gameState.wonTricks[winner].push(...gameState.trick.map(t => t.card));
        gameState.trick.forEach(({ card }) => {
            if (card.trumpRank != null) gameState.playedSuits.add(card.suit);
        });
        gameState.trick = [];
        document.getElementById('trick').innerHTML = '';
        gameState.currentPlayer = winner;
        if (allHandsEmpty()) {
            gameState.phase = 'counting';
            countPoints();
        } else {
            setTimeout(playTurn, 1000); // Delay after resolving
        }
    }

    // Determine trick winner
    function determineTrickWinner(trick) {
        let leadSuit = trick[0].card.suit;
        let isTrumpLed = isTrump(trick[0].card);
        let highest = { player: trick[0].player, card: trick[0].card };
        for (let i = 1; i < trick.length; i++) {
            const card = trick[i].card;
            const isCurrentTrump = isTrump(card);
            const isHighestTrump = isTrump(highest.card);
            if (isCurrentTrump && !isHighestTrump) {
                highest = { player: trick[i].player, card };
            } else if (isCurrentTrump && isHighestTrump) {
                if (getTrumpRank(card) < getTrumpRank(highest.card)) { // Lower rank is higher value
                    highest = { player: trick[i].player, card };
                }
            } else if (!isCurrentTrump && !isHighestTrump && card.suit === leadSuit) {
                if (getRankValue(card) > getRankValue(highest.card)) {
                    highest = { player: trick[i].player, card };
                }
            }
        }
        updateStatus(false, "WINNER: Player " + (highest.player + 1) + " takes the stich");
        return highest.player;
    }

    // Is trump
    function isTrump(card) {
        return card.trumpRank !== null || (gameState.rotIsTrump && card.suit === 'rot');
    }

    // Get trump rank (lower number higher)
    function getTrumpRank(card) {
        return card.trumpRank;
    }

    // Get non-trump rank value (higher better)
    function getRankValue(card) {
        const rankOrder = ['Ass', 'Zehner', 'Koenig', 'Ober', 'Neuner', 'Achter', 'Bauer'];
        return rankOrder.length - rankOrder.indexOf(card.rank);
    }

    // Render trick
    function renderTrick() {
        const container = document.getElementById('trick');
        container.innerHTML = '';
        gameState.trick.forEach(t => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');
            const img = document.createElement('img');
            img.src = t.card.image;
            cardEl.appendChild(img);
            container.appendChild(cardEl);
        });
    }

    // Check if all hands empty
    function allHandsEmpty() {
        return gameState.players.every(p => p.hand.length === 0);
    }

    // Count points
    function countPoints() {
        document.getElementById('PLAYAREA').style.visibility = "hidden";
        document.getElementById('start-status').style.visibility = "visible";

        let team1Points = 0;
        let team2Points = 0;
        gameState.teams.team1.forEach(p => {
            gameState.wonTricks[p].forEach(card => team1Points += card.points);
        });
        gameState.teams.team2.forEach(p => {
            gameState.wonTricks[p].forEach(card => team2Points += card.points);
        });
        let winnerTeam = team1Points >= 61 ? 'team1' : 'team2';
        let baseScore = gameState.isFuchsGame ? 3 : 1;
        if (winnerTeam === 'team2') baseScore = -baseScore; // Loser pays
        // Apply multipliers for kontra etc., stub
        // No water if loser <30
        if (winnerTeam === 'team1' && team2Points < 30) baseScore += 1;
        else if (winnerTeam === 'team2' && team1Points < 30) baseScore -= 1;
        // Durch etc., more logic needed
        gameState.teams.team1.forEach(p => gameState.players[p].score += baseScore);
        showPopup(`Game over.  P${gameState.teams.team1[0] + 1} and  P${gameState.teams.team1[1] + 1} points: ${team1Points},  P${gameState.teams.team2[0] + 1} and  P${gameState.teams.team2[1] + 1}: ${team2Points}. `);
        updateStatus(true, `Game over.  P${gameState.teams.team1[0] + 1} and  P${gameState.teams.team1[1] + 1} points: ${team1Points}, P${gameState.teams.team2[0] + 1} and  P${gameState.teams.team2[1] + 1}: ${team2Points}. `);
        // Reset for next round
        gameState.dealer = (gameState.dealer + 1) % 4;
        gameState.phase = 'dealing';
    }

    document.getElementById('PLAYAREA').style.visibility = "hidden";
    document.getElementById('start-game').onclick = () => {
        document.getElementById('start-game').style.visibility = "hidden";
        document.getElementById('start-status').style.visibility = "hidden";

        document.getElementById('PLAYAREA').style.visibility = "visible";
        deal();
        renderHands();
    };

};