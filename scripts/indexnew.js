const players = ['Player', 'Bot 1', 'Bot 2', 'Bot 3'];
let currentPlayerIndex = 0;
let playerCanPlay = true;

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHand = [];
let stichCards = [];

const contStichButton = document.querySelector('#contiue-stich-button');
contStichButton.style.setProperty('display', 'none')

const winnerTextElem = document.querySelector('#winner-text');


function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push(`${value}${suit}`);
        }
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    playerHand = deck.splice(0, 6);
    displayPlayerHand();
}

function displayPlayerHand() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    playerHand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('player-card');
        cardDiv.textContent = card;
        if (playerCanPlay) {
            cardDiv.addEventListener('click', () => playPlayerCard(index));
        }
        handContainer.appendChild(cardDiv);
    });
}

function playPlayerCard(cardIndex) {
    if (!playerCanPlay) return;
    playerCanPlay = false;
    const card = playerHand.splice(cardIndex, 1)[0];
    displayPlayerHand();
    playCard(0, card);
}

function botTurns() {
    if (stichCards.length < 4 && currentPlayerIndex != 0) {
        setTimeout(() => {
            playCard(currentPlayerIndex, deck.pop());
        }, 1000);
    }
    else if(stichCards.length < 4 && currentPlayerIndex == 0)
    {
        playerCanPlay = true;
        displayPlayerHand();
    }

}

function playCard(playerIndex, cardValue) {
    stichCards.push({ playerIndex, cardValue });
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = cardValue;
    document.getElementById('stich').appendChild(card);
    
    let board = document.getElementById('game-board');
    let startX = 0, startY = 0;
    let centerX = board.clientWidth / 2 - card.clientWidth / 2;
    let centerY = board.clientHeight / 2 - card.clientHeight / 2;
    let offset = Math.min(board.clientWidth, board.clientHeight) * 0.12;
    
    switch (playerIndex) {
        case 0: startX = centerX; startY = board.clientHeight - card.clientHeight - 10; centerY += offset; break;
        case 1: startX = 10; startY = centerY; centerX -= offset; break;
        case 2: startX = centerX; startY = 10; centerY -= offset; break;
        case 3: startX = board.clientWidth - card.clientWidth - 10; startY = centerY; centerX += offset; break;
    }
    
    card.style.left = `${startX}px`;
    card.style.top = `${startY}px`;
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = `translate(${centerX - startX}px, ${centerY - startY}px)`;            
    }, 50);
    
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

    if (stichCards.length < 4) {
        botTurns();
    } else {
        setTimeout(() => {
        contStichButton.style.removeProperty('display');
        }, 1000);
    }
}

function determineWinner() {
    let winningCard = stichCards.reduce((max, card) => 
        values.indexOf(card.cardValue.slice(0, -1)) > values.indexOf(max.cardValue.slice(0, -1)) ? card : max
    );
    winnerTextElem.innerHTML = players[winningCard.playerIndex] + " won the stich!";

    animateStichToWinner(winningCard.playerIndex);
    
}

function animateStichToWinner(winnerIndex) {
    var tempStichcards = stichCards;
    const winnerElement = document.getElementById(`player-${winnerIndex + 1}`);
    const winnerRect = winnerElement.getBoundingClientRect();

    document.querySelectorAll("#stich .card").forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = `translate(${(winnerRect.left - card.getBoundingClientRect().left)}px, ${winnerRect.top - card.getBoundingClientRect().top}px)`;
            card.style.opacity = '0';
        }, index * 200);
    });

    setTimeout(() => {
        document.getElementById('stich').innerHTML = '';
        document.getElementById('winner-text').innerHTML = '';
        stichCards = [];
    }, 1000);

    currentPlayerIndex = winnerIndex;
    if(winnerIndex == 0)
    {
        playerCanPlay = true;
        
        for(const stichCard of tempStichcards){
            const card = document.createElement('div');
            card.classList.add('stiche-card');
            card.textContent = stichCard.cardValue;
            setTimeout(() => {
                card.style.opacity = '1';
                document.getElementById('player-stiche').appendChild(card);
            },800);
        }
        
    }
    else
    {
    
        playerCanPlay = false;
        setTimeout(() => {
            botTurns();
        },2000);
    }



    contStichButton.style.setProperty('display', 'none');
    if(winnerIndex == 0)
    {
        playerCanPlay = true;
        displayPlayerHand();
    }

}


createDeck();
dealCards();
