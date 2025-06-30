const PLAYER_COUNT = 4;
let deck = [];
let pointValues = {};

function createDeck() {
    deck = [
        { id: 1, imagePath: "images/cards/eichel/Ober.png", value: 4, isTrumpf: true, suit: "eichel", rank: "Ober" },
        { id: 2, imagePath: "images/cards/grun/Ober.png", value: 3, isTrumpf: true, suit: "grun", rank: "Ober" },
        { id: 3, imagePath: "images/cards/eichel/Bauer.png", value: 2, isTrumpf: true, suit: "eichel", rank: "Bauer" },
        { id: 4, imagePath: "images/cards/grun/Bauer.png", value: 2, isTrumpf: true, suit: "grun", rank: "Bauer" },
        { id: 5, imagePath: "images/cards/rot/Bauer.png", value: 2, isTrumpf: true, suit: "rot", rank: "Bauer" },
        { id: 6, imagePath: "images/cards/schelle/Bauer.png", value: 2, isTrumpf: true, suit: "schelle", rank: "Bauer" },
        { id: 7, imagePath: "images/cards/rot/Ass.png", value: 11, isTrumpf: true, suit: "rot", rank: "Ass" },
        { id: 8, imagePath: "images/cards/rot/Zehner.png", value: 10, isTrumpf: true, suit: "rot", rank: "Zehner" },
        { id: 9, imagePath: "images/cards/rot/Koenig.png", value: 4, isTrumpf: true, suit: "rot", rank: "Koenig" },
        { id: 10, imagePath: "images/cards/rot/Ober.png", value: 3, isTrumpf: true, suit: "rot", rank: "Ober" },
        { id: 11, imagePath: "images/cards/rot/Neuner.png", value: 0, isTrumpf: true, suit: "rot", rank: "Neuner" },
        { id: 12, imagePath: "images/cards/rot/Achter.png", value: 0, isTrumpf: true, suit: "rot", rank: "Achter" },

        { id: 13, imagePath: "images/cards/eichel/Ass.png", value: 11, isTrumpf: false, suit: "eichel", rank: "Ass" },
        { id: 14, imagePath: "images/cards/eichel/Zehner.png", value: 10, isTrumpf: false, suit: "eichel", rank: "Zehner" },
        { id: 15, imagePath: "images/cards/eichel/Koenig.png", value: 4, isTrumpf: false, suit: "eichel", rank: "Koenig" },
        { id: 16, imagePath: "images/cards/eichel/Neuner.png", value: 0, isTrumpf: false, suit: "eichel", rank: "Neuner" },

        { id: 17, imagePath: "images/cards/grun/Ass.png", value: 11, isTrumpf: false, suit: "grun", rank: "Ass" },
        { id: 18, imagePath: "images/cards/grun/Zehner.png", value: 10, isTrumpf: false, suit: "grun", rank: "Zehner" },
        { id: 19, imagePath: "images/cards/grun/Koenig.png", value: 4, isTrumpf: false, suit: "grun", rank: "Koenig" },
        { id: 20, imagePath: "images/cards/grun/Neuner.png", value: 0, isTrumpf: false, suit: "grun", rank: "Neuner" },

        { id: 21, imagePath: "images/cards/schelle/Ass.png", value: 11, isTrumpf: false, suit: "schelle", rank: "Ass" },
        { id: 22, imagePath: "images/cards/schelle/Zehner.png", value: 10, isTrumpf: false, suit: "schelle", rank: "Zehner" },
        { id: 23, imagePath: "images/cards/schelle/Koenig.png", value: 4, isTrumpf: false, suit: "schelle", rank: "Koenig" },
        { id: 24, imagePath: "images/cards/schelle/Ober.png", value: 3, isTrumpf: false, suit: "schelle", rank: "Neuner" }
    ];
    deck.forEach(c => pointValues[c.id] = c.value);
}

let players = [];
let hands = [[], [], [], []];
let piles = [[], [], [], []];
let dealer = 0;
let currentLeadSuit = null;
let trick = [];
let turnIndex = 0;
const localPlayerIndex = 0; // Always show your hand at the bottom
const statusDiv = document.getElementById("statusText");
statusDiv.innerHTML = 'Press Start to Play!';

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function deal() {
    shuffle(deck);
    let seat = dealer;
    for (let round = 0; round < 2; round++) {
        for (let i = 0; i < PLAYER_COUNT; i++) {
            seat = (seat + PLAYER_COUNT - 1) % PLAYER_COUNT;
            for (let c = 0; c < 3; c++) {
                hands[seat].push(deck.pop());
            }
        }
    }
}

function renderHands() {
    for (let i = 0; i < 4; i++) {
        const playerDiv = document.getElementById(`player${i}`);
        playerDiv.innerHTML = '';

        hands[i].forEach((card, ci) => {
            const cardElem = document.createElement('div');
            cardElem.classList.add('card');

            const img = document.createElement('img');

            if (i === localPlayerIndex) {
                img.src = card.imagePath; // Face up
                cardElem.addEventListener('click', () => {
                    playCard(i, ci);
                });
            } else {
                img.src = 'images/back.png'; // Face down
                cardElem.classList.add('hidden');
            }

            cardElem.appendChild(img);
            playerDiv.appendChild(cardElem);
          
        });
         
        const label = document.createElement('div');
        label.classList.add('name-label');
        if(i == 0)
            label.textContent="You";
        else if(i == 1)
            label.textContent="Player 2";
        else if(i == 2)
            label.textContent="Player 3";
        else if(i == 3)
            label.textContent="Player 4";

        playerDiv.appendChild(label);   
        
    }
}

function renderTrick() {
    let area = document.getElementById('trickArea');
    trick.forEach((t, i) => {
        let div = document.createElement('div');
        div.className = 'card trick-card';
        div.style.top = `${10 + i * 20}px`;
        div.style.left = `${10 + i * 20}px`;
        let img = document.createElement('img');
        img.src = t.card.imagePath;
        img.alt = `${t.card.suit } ${t.card.rank}`;
        div.appendChild(img);
        area.appendChild(div);
    });
}



function attemptPlay(player, cardIdx) {
    if (player !== turnIndex) return;
    let card = hands[player][cardIdx];
    if (trick.length === 0) {
        currentLeadSuit = card.isTrumpf ? 'trumpf' : card.suit;
    } else {
        let first = trick[0].card;
        let needSuit = first.isTrumpf ? 'trumpf' : first.suit;
        // enforce follow suit/trump rules
        let hasSuit = hands[player].some(c => (needSuit === 'trumpf' ? c.isTrumpf : c.suit === needSuit));
        if (hasSuit) {
            let ok = needSuit === 'trumpf' ? card.isTrumpf : card.suit === needSuit;
            if (!ok) return alert('Must follow suit/trump!');
        }
    }
    playCard(player, cardIdx);
}

function playCard(player, ci) {
    let card = hands[player].splice(ci, 1)[0];
    trick.push({ player, card });
    renderHands();
    renderTrick();
    if (trick.length === PLAYER_COUNT) {
        setTimeout(resolveTrick, 800);
    } else {
        turnIndex = (turnIndex + 1) % PLAYER_COUNT;
    }
}


function resolveTrick() {
    let win = trick.reduce((best, cur) => {
        if (!best) return cur;
        let a = best.card, b = cur.card;
        let suitA = a.isTrumpf ? 'trumpf' : a.suit;
        let suitB = b.isTrumpf ? 'trumpf' : b.suit;
        if (suitB === suitA) {
            return b.card.id > a.id ? cur : best;
        }
        if (suitB === 'trumpf') return cur;
        return best;
    }, null);
    piles[win.player].push(...trick.map(t => t.card));
    trick = [];
    currentLeadSuit = null;
    turnIndex = (win.player + PLAYER_COUNT - 1) % PLAYER_COUNT;
    renderTrick();
    checkRound();
}

function checkRound() {
    if (hands.some(h => h.length > 0)) {
        renderHands();
    } else {
        endGame();
    }
}

function endGame() {
    let scores = piles.map(p => p.reduce((s, c) => s + pointValues[c.id], 0));
    alert("Game Over!\nScores:\n" +
        scores.map((s, i) => `Player ${i + 1}: ${s}`).join("\n"));
}

function startGame() {
    statusDiv.innerHTML='';
    document.getElementById('start-btn').style.visibility = 'hidden';
    createDeck();
    hands = [[], [], [], []];
    piles = [[], [], [], []];
    dealer = Math.floor(Math.random() * 4);
    turnIndex = (dealer + PLAYER_COUNT - 1) % PLAYER_COUNT;
    deal();
    renderHands();
}

document.getElementById('start-btn').onclick = startGame;
