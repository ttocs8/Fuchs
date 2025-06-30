let running = false;

let currentPlayer = 0;
const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const suits = ['Eichel', 'Grun', 'Rot', 'Schelle'];
const PLAYER_COUNT = players.length;

let deck = [];
let deckDict = [];
let pointValues = {};

let caller = -1;

let hands = [[], [], [], []];
let piles = [[], [], [], []];

let trick = [];
let turnIndex = 0;

let partners = new Map();
//([
//   [0, -1],
//   [1, -1],
//   [2, -1],
//   [3, -1]
// ]);



function log(message) {
    const p = document.createElement('p');
    p.textContent = message;
    document.getElementById('log').appendChild(p);
    document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
}

function nextTurn(thePlayer = -1) {
    //SortHand(0);
    if (running) {
        document.getElementById("dealer").style.visibility = "hidden";
        if (thePlayer != -1) 
            currentPlayer = thePlayer - 1;
           
        const player = players[currentPlayer];
        console.log(`${player} does their action.`);

        // Advance to the next player
        currentPlayer = (currentPlayer + 1) % players.length;
        // if (player === -1) {
        //     const player = players[currentPlayer];
        //     console.log(`${player} does their action.`);

        //     // Advance to the next player
        //     currentPlayer = (currentPlayer + 1) % players.length;
        // }
        // else {
        //     currentPlayer = player;
        // }

        // Update turn display
        document.getElementById('turnDisplay').textContent = `${players[currentPlayer]}'s Turn `;
    }
}

function createDeck() {
    deck = [
        { id: 1, imagePath: "images/cards/eichel/Ober.png", value: 4, isTrumpf: true, suit: "Eichel", rank: "Ober" },
        { id: 2, imagePath: "images/cards/grun/Ober.png", value: 3, isTrumpf: true, suit: "Grun", rank: "Ober" },
        { id: 3, imagePath: "images/cards/eichel/Bauer.png", value: 2, isTrumpf: true, suit: "Eichel", rank: "Bauer" },
        { id: 4, imagePath: "images/cards/grun/Bauer.png", value: 2, isTrumpf: true, suit: "Grun", rank: "Bauer" },
        { id: 5, imagePath: "images/cards/rot/Bauer.png", value: 2, isTrumpf: true, suit: "Rot", rank: "Bauer" },
        { id: 6, imagePath: "images/cards/schelle/Bauer.png", value: 2, isTrumpf: true, suit: "Schelle", rank: "Bauer" },
        { id: 7, imagePath: "images/cards/rot/Ass.png", value: 11, isTrumpf: true, suit: "Rot", rank: "Ass" },
        { id: 8, imagePath: "images/cards/rot/Zehner.png", value: 10, isTrumpf: true, suit: "Rot", rank: "Zehner" },
        { id: 9, imagePath: "images/cards/rot/Koenig.png", value: 4, isTrumpf: true, suit: "Rot", rank: "Koenig" },
        { id: 10, imagePath: "images/cards/rot/Ober.png", value: 3, isTrumpf: true, suit: "Rot", rank: "Ober" },
        { id: 11, imagePath: "images/cards/rot/Neuner.png", value: 0, isTrumpf: true, suit: "Rot", rank: "Neuner" },
        { id: 12, imagePath: "images/cards/rot/Achter.png", value: 0, isTrumpf: true, suit: "Rot", rank: "Achter" },

        { id: 13, imagePath: "images/cards/eichel/Ass.png", value: 11, isTrumpf: false, suit: "Eichel", rank: "Ass" },
        { id: 14, imagePath: "images/cards/eichel/Zehner.png", value: 10, isTrumpf: false, suit: "Eichel", rank: "Zehner" },
        { id: 15, imagePath: "images/cards/eichel/Koenig.png", value: 4, isTrumpf: false, suit: "Eichel", rank: "Koenig" },
        { id: 16, imagePath: "images/cards/eichel/Neuner.png", value: 0, isTrumpf: false, suit: "Eichel", rank: "Neuner" },

        { id: 17, imagePath: "images/cards/grun/Ass.png", value: 11, isTrumpf: false, suit: "Grun", rank: "Ass" },
        { id: 18, imagePath: "images/cards/grun/Zehner.png", value: 10, isTrumpf: false, suit: "Grun", rank: "Zehner" },
        { id: 19, imagePath: "images/cards/grun/Koenig.png", value: 4, isTrumpf: false, suit: "Grun", rank: "Koenig" },
        { id: 20, imagePath: "images/cards/grun/Neuner.png", value: 0, isTrumpf: false, suit: "Grun", rank: "Neuner" },

        { id: 21, imagePath: "images/cards/schelle/Ass.png", value: 11, isTrumpf: false, suit: "Schelle", rank: "Ass" },
        { id: 22, imagePath: "images/cards/schelle/Zehner.png", value: 10, isTrumpf: false, suit: "Schelle", rank: "Zehner" },
        { id: 23, imagePath: "images/cards/schelle/Koenig.png", value: 4, isTrumpf: false, suit: "Schelle", rank: "Koenig" },
        { id: 24, imagePath: "images/cards/schelle/Ober.png", value: 3, isTrumpf: false, suit: "Schelle", rank: "Ober" }
    ];
    deck.forEach(c => pointValues[c.id] = c.value);
}

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

function findCaller(hands) {
    for (let i = 0; i < PLAYER_COUNT; i++) {
        for (let j = 0; j < hands[i].length; j++) {
            if (hands[i][j].id === 1)
                return i;
        }
    }
}

function getSuitsFromHand(hand) {
    let suitsInHand = [];

    for (let i = 0; i < suits.length; i++) {
        const suit = suits[i];
        if (hand.some(card => card.imagePath.includes(suit.toLocaleLowerCase())))
            suitsInHand.push(suit);
    }

    return suitsInHand;
}

function CallCard(currentPlayer) {
    let pickedCard = null;
    let currentPlayerHand = hands[currentPlayer];
    let nonTrumpCards = currentPlayerHand.filter(card => card.isTrumpf == false);
    let suitsInHand = getSuitsFromHand(nonTrumpCards);
    //non player - bots for now
    if (currentPlayer != 0) {

        if (nonTrumpCards.length < 1)
            return "Fuchs im Rote";
        else {
            checker = card => !suitsInHand.some(element => card.imagePath.includes(element));
            let cardsToPickFrom = deckDict.filter(checker).filter(card => card.isTrumpf == false);

            pickedCard = cardsToPickFrom[Math.floor(Math.random() * cardsToPickFrom.length)];
        }
        //pickedCard = nonTrumpCards[Math.floor(Math.random() * nonTrumpCards.length)];

        //return `${pickedCard.suit} ${pickedCard.rank}`;
        return pickedCard;

    }
    else { }//Client picks 

}

function renderHands() {
    for (let i = 0; i < 4; i++) {
        const playerDiv = document.getElementById(`player${i}`);
        playerDiv.innerHTML = '';

        hands[i].forEach((card, ci) => {
            const cardElem = document.createElement('div');
            cardElem.classList.add('card');
            cardElem.id = card.id;
            const img = document.createElement('img');
            img.src = card.imagePath; // Face up

            // if (i === 0) {
            //     img.src = card.imagePath; // Face up
            // } else {
            //     img.src = 'images/back.png'; // Face down
            //     cardElem.classList.add('hidden');
            // }

            cardElem.appendChild(img);
            playerDiv.appendChild(cardElem);

        });

        // const label = document.createElement('div');

        // if(i == 0){
        //     label.textContent="You";
        //     label.classList.add('name-label-top');
        // }
        // else if(i == 1){
        //     label.textContent="Player 2";
        //     label.classList.add('name-label-top');
        // }
        // else if(i == 2){
        //     label.textContent="Player 3";
        //     label.classList.add('name-label-side');
        // }
        // else if(i == 3){
        //     label.textContent="Player 4";
        //     label.classList.add('name-label-side');
        // }

        // playerDiv.appendChild(label);   

    }
}

function SortHand(player) {
    if (hands[player].length > 0) {

        //remove current hand set up
        let hand = Array.from(document.getElementById("player0").childNodes);
        let handDOM = document.getElementById("player0");

        while (handDOM.firstChild) {
            handDOM.removeChild(handDOM.lastChild);
        }

        //sort hand
        hand.sort(function (a, b) {
            return Number(a.id) - Number(b.id);
        });

        //redraw cards
        hand.forEach((card) => {
            const cardElem = document.createElement('div');
            cardElem.classList.add('card');
            cardElem.id = card.id;
            const img = document.createElement('img');
            img.src = card.children[0].currentSrc;


            cardElem.appendChild(img);
            handDOM.appendChild(cardElem);

        });


    }
}


function playCard(player, theCard) {
    hands[player] = hands[player].filter(function (obj) {
        return obj.id !== theCard.id;
    });
    trick.push({ player, theCard });
    renderHands();
    renderTrick();
    if (trick.length === PLAYER_COUNT) {
        setTimeout(resolveTrick, 800);
    }
    // if (trick.length === PLAYER_COUNT) {
    //     setTimeout(resolveTrick, 800);
    // } else {
    //     turnIndex = (turnIndex + 1) % PLAYER_COUNT;
    // }
    nextTurn();
}

function resolveTrick() {
    // let win = trick.reduce((best, cur) => {
    //     if (!best) return cur;
    //     let a = best.theCard, b = cur.theCard;
    //     let suitA = a.isTrumpf ? 'trumpf' : a.suit;
    //     let suitB = b.isTrumpf ? 'trumpf' : b.suit;
    //     if (suitB === suitA) {
    //         return b.id > a.id ? cur : best;
    //     }
    //     if (suitB === 'trumpf') return cur;
    //     return best;
    // }, null);
    trick.sort((a,b) => a.theCard.id - b.theCard.id)
    let winPlayer = trick[0].player
    let winCard = trick[0].theCard
    piles[winPlayer].push(...trick.map(t => t.theCard));
    trick = [];
    //currentLeadSuit = null;
    log(`Player ${winPlayer+1} won the Stich`);

    renderTrick();
    if (hands.some(h => h.length > 0)) {
        renderHands();

    } else {
        let scores = piles.map(p => p.reduce((s, c) => s + pointValues[c.id], 0));
        let [a, b] = partners.entries().next().value;
        let team1 = [a, b];
        let team2 = [0, 1, 2, 3].filter(p => !team1.includes(p));

        let SCORE1 = scores[team1[0]] + scores[team1[1]];
        let SCORE2 = scores[team2[0]] + scores[team2[1]];
        //log("Game Over!\nScores:\n" + scores.map((s, i) => `Player ${i + 1}: ${s}`).join("\n"));
        log("Game Over!");
        log(`Team 1: ${SCORE1}`)
        log(`Team 2: ${SCORE2}`);
       
        return;
    }
    

    nextTurn(winPlayer);
}

function setRemainingPartners(partnersMap) {

    // Extract the one existing pair
    const [firstPlayer, partnerPlayer] = partnersMap.entries().next().value;

    // Mutual partnership
    partnersMap.set(partnerPlayer, firstPlayer);

    // Find the two remaining players
    const allPlayers = [0, 1, 2, 3];
    const remainingPlayers = allPlayers.filter(p => p !== firstPlayer && p !== partnerPlayer);

    // Assign them to each other
    partnersMap.set(remainingPlayers[0], remainingPlayers[1]);
    partnersMap.set(remainingPlayers[1], remainingPlayers[0]);
}

function startGame() {
    //SET UP
    running = true;
    document.getElementById('start-btn').style.visibility = 'hidden';
    document.getElementById('sortButton').style.visibility = 'visible';
    document.getElementById('log').style.visibility = "visible";
    document.getElementById('table').style.visibility = "visible";
    document.getElementById("table-container").style.top = "5vh";
    document.getElementById("table-container").style.left = "-15vw";
    document.getElementById('trickArea').textContent = "";

    dealer = Math.floor(Math.random() * 4);

    createDeck();
    deckDict = deck.slice();
    //document.getElementById('turnDisplay').textContent = "Dealing...";
    document.getElementById('dealer').textContent = "";

    //DEAL CARDS - DEALER IS CHOSEN RANDOMLY - USERS NEED NOT WORRY
    deal();

    //CALLING PHASE
    caller = findCaller(hands);
    
    // Update turn display
    //document.getElementById('turnDisplay').textContent = `${players[caller]} is Calling... `;

    let calledCard = CallCard(caller);
    log(`${players[caller]} called ${calledCard.suit} ${calledCard.rank}`);
   // document.getElementById('turnDisplay').textContent = `${players[caller]} called  ${calledCard.suit} ${calledCard.rank}`;

    //Find and set this games' partners
    for (let i = 0; i < hands.length; i++) {
        for (let j = 0; j < hands[i].length; j++) {
            if(hands[i][j].id == calledCard.id)
                partners.set(i,caller);
        }
    }

    setRemainingPartners(partners);
    console.log(partners)


    turnIndex = (dealer + PLAYER_COUNT - 1) % PLAYER_COUNT;
    currentPlayer = turnIndex;


    document.getElementById('dealer').textContent = `${players[currentPlayer]} is out`;

    console.log("CURRENT PLAYER: " + (currentPlayer + 1));

    renderHands();
}


function renderTrick() {
    let area = document.getElementById('trickArea');
    let trickCards = document.getElementById("trickArea");

    while (trickCards.firstChild) {
        trickCards.removeChild(trickCards.lastChild);
    }

    trick.forEach((t, i) => {
        let div = document.createElement('div');
        div.className = 'card trick-card';
        div.style.top = `${10 + i * 20}px`;
        div.style.left = `${10 + i * 20}px`;
        let img = document.createElement('img');
        img.src = t.theCard.imagePath;
        img.alt = `${t.theCard.suit} ${t.theCard.rank}`;
        div.appendChild(img);
        area.appendChild(div);
    });
}

$(document).ready(function () {
    if (!running)
        document.getElementById("table-container").style.left = "-15vw";

    $(document).on("click", ".card", function () {
        let player = Number($(this).parent().attr('id').slice(-1));
        if (currentPlayer === player) {
            let clickedID = Number($(this).attr('id'));
            let cardclicked = hands[player].find(function (card) {
                return card.id === clickedID;
            });
            console.log(cardclicked);

            if (trick.length < 4)
                playCard(player, cardclicked);

        }
    });


});



//document.getElementById('start-btn').onclick = startGame;
