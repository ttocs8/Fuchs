const suits = ["Eichel", "grun", "Rot", "Schelle"];
const values = [1, 2, 3, 4, 5, 6];
let deck = [];
let hands = [[], [], [], []];
let winnerPiles = [[], [], [], []];
let trick = [];
let currentPlayer = 1; // Left of dealer (player 0 is dealer)
let pointValues = {}; // custom values

document.getElementById("startGame").addEventListener("click", startGame);

function createDeck() {
  deck = [//id is also the order of power
    {id:1, imagePath:"images/cards/eichel/Ober.png", value:4, isTrumpf: true, suit:"eichel", rank:"Ober"},
    {id:2, imagePath:"images/cards/grun/Ober.png", value:3, isTrumpf: true, suit:"grun", rank:"Ober"},
    {id:3, imagePath:"images/cards/eichel/Bauer.png", value:2, isTrumpf: true, suit:"eichel", rank:"Bauer"},
    {id:4, imagePath:"images/cards/grun/Bauer.png", value:2, isTrumpf: true, suit:"grun", rank:"Bauer"},
    {id:5, imagePath:"images/cards/rot/Bauer.png", value:2, isTrumpf: true, suit:"rot", rank:"Bauer"},
    {id:6, imagePath:"images/cards/schelle/Bauer.png", value:2, isTrumpf: true, suit:"schelle", rank:"Bauer"},
    {id:7, imagePath:"images/cards/rot/Ass.png", value:11, isTrumpf: true, suit:"rot", rank:"Ass"},
    {id:8, imagePath:"images/cards/rot/Zehner.png", value:10, isTrumpf: true, suit:"rot", rank:"Zehner"},
    {id:9, imagePath:"images/cards/rot/Koenig.png", value:4, isTrumpf: true, suit:"rot", rank:"Koenig"},
    {id:10,imagePath:"images/cards/rot/Ober.png", value:3, isTrumpf: true, suit:"rot", rank:"Ober"},
    {id:11,imagePath:"images/cards/rot/Neuner.png", value:0, isTrumpf: true, suit:"rot", rank:"Neuner"},
    {id:12,imagePath:"images/cards/rot/Achter.png", value:0, isTrumpf: true, suit:"rot", rank:"Achter"},

    {id:13, imagePath:"images/cards/eichel/Ass.png", value:11, isTrumpf: false, suit:"eichel", rank:"Ass"},
    {id:14, imagePath:"images/cards/eichel/Zehner.png", value:10, isTrumpf: false, suit:"eichel", rank:"Zehner"},
    {id:15, imagePath:"images/cards/eichel/Koenig.png", value:4, isTrumpf: false, suit:"eichel", rank:"Koenig"},
    {id:16, imagePath:"images/cards/eichel/Neuner.png", value:0, isTrumpf: false, suit:"eichel", rank:"Neuner"},

    {id:17, imagePath:"images/cards/grun/Ass.png", value:11, isTrumpf: false, suit:"grun", rank:"Ass"},
    {id:18, imagePath:"images/cards/grun/Zehner.png", value:10, isTrumpf: false, suit:"grun", rank:"Zehner"},
    {id:19, imagePath:"images/cards/grun/Koenig.png", value:4, isTrumpf: false, suit:"grun", rank:"Koenig"},
    {id:20, imagePath:"images/cards/grun/Neuner.png", value:0, isTrumpf: false, suit:"grun", rank:"Neuner"},

    {id:21, imagePath:"images/cards/schelle/Ass.png", value:11, isTrumpf: false, suit:"schelle", rank:"Ass"},
    {id:22, imagePath:"images/cards/schelle/Zehner.png", value:10, isTrumpf: false, suit:"schelle", rank:"Zehner"},
    {id:23, imagePath:"images/cards/schelle/Koenig.png", value:4, isTrumpf: false, suit:"schelle", rank:"Koenig"},
    {id:24, imagePath:"images/cards/schelle/Ober.png", value:3, isTrumpf: false, suit:"schelle", rank:"Neuner"}
  ];

    // Register custom point values for use in scoring
  deck.forEach(card => {
    pointValues[card.id] = card.value;
  });
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCards() {
  hands = [[], [], [], []];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 3; k++) {
        hands[j].push(deck.pop());
      }
    }
  }
}

function renderHand() {
  const handDiv = document.getElementById("hand0");
  handDiv.innerHTML = "";
  hands[0].forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "card";

    const img = document.createElement("img");
    img.src = `images/cards/${card.suit}/${card.rank}.png`;
    img.alt = card.id;

    div.onclick = () => playCard(0, i);
    div.appendChild(img);
    handDiv.appendChild(div);
  });
}

function renderTrick() {
  const trickDiv = document.getElementById("trick");
  trickDiv.innerHTML = "";

  trick.forEach(play => {
    const wrapper = document.createElement("div");
    wrapper.className = "trick-card";

    const label = document.createElement("div");
    label.className = "player-label";
    label.textContent = `Player ${play.player}`;

    const img = document.createElement("img");
    img.src = `images/cards/${play.card.suit}/${play.card.rank}.png`;
    img.alt = play.card.id;
    img.className = "card";

    wrapper.appendChild(label);
    wrapper.appendChild(img);
    trickDiv.appendChild(wrapper);
  });
}

function playCard(playerIndex, cardIndex) {
  if (playerIndex !== currentPlayer) return; // Not this player's turn
  if (trick.some(entry => entry.player === playerIndex)) return; // Already played this trick

  const card = hands[playerIndex].splice(cardIndex, 1)[0];

  // Get source element and trick container for animation start/end
  const handDiv = document.getElementById(`hand${playerIndex}`);
  const cardDiv = handDiv.children[cardIndex];
  const trickDiv = document.getElementById("trick");

  // Clone the card div to animate independently
  const animCard = cardDiv.cloneNode(true);
  animCard.style.position = "absolute";
  animCard.style.zIndex = 1000;

  // Get bounding rectangles for animation start and end positions
  const startRect = cardDiv.getBoundingClientRect();
  const endRect = trickDiv.getBoundingClientRect();

  // Set initial position
  animCard.style.left = `${startRect.left}px`;
  animCard.style.top = `${startRect.top}px`;
  animCard.style.width = `${startRect.width}px`;
  animCard.style.height = `${startRect.height}px`;

  document.body.appendChild(animCard);

  // Remove the card from hand visually immediately to avoid duplicates
  renderHand();

  // Animate to center trick position
  animCard.animate([
    { transform: `translate(0, 0) scale(1)`, opacity: 1 },
    { 
      transform: `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px) scale(0.7)`,
      opacity: 1
    }
  ], {
    duration: 600,
    easing: "ease-in-out",
    fill: "forwards"
  }).onfinish = () => {
    // After animation finishes:
    trick.push({ player: playerIndex, card });
    animCard.remove();
    renderTrick();

    // Next player logic
    currentPlayer = (currentPlayer + 1) % 4;

    if (trick.length === 4) {
      setTimeout(resolveTrick, 1000);
    } else {
      setTimeout(() => botPlay(currentPlayer), 500);
    }
  };
}

function botPlay() {
  if (currentPlayer === 0) return; // Human's turn

  const hand = hands[currentPlayer];
  if (hand.length === 0) return;

  // Play first available card
  playCard(currentPlayer, 0);
}

function resolveTrick() {
  let winningPlay = trick[0];
  for (let play of trick) {
    if (play.card.value > winningPlay.card.value) {
      winningPlay = play;
    }
  }

  // Animate cards flying to winner pile
  const winnerPileDiv = document.getElementById(`winnerPile${winningPlay.player}`);
  const trickDiv = document.getElementById("trick");

  const animPromises = trick.map((play, index) => {
    return new Promise(resolve => {
      // Get card img elements inside trickDiv
      const cardImg = trickDiv.children[index].querySelector("img");
      const cardRect = cardImg.getBoundingClientRect();
      const winnerRect = winnerPileDiv.getBoundingClientRect();

      // Clone card to animate
      const animCard = cardImg.cloneNode(true);
      animCard.style.position = "absolute";
      animCard.style.zIndex = 1000;
      animCard.style.left = `${cardRect.left}px`;
      animCard.style.top = `${cardRect.top}px`;
      animCard.style.width = `${cardRect.width}px`;
      animCard.style.height = `${cardRect.height}px`;
      document.body.appendChild(animCard);

      const animation = animCard.animate([
        { transform: `translate(0, 0) scale(1)`, opacity: 1 },
        { 
          transform: `translate(${winnerRect.left - cardRect.left}px, ${winnerRect.top - cardRect.top}px) scale(0.6)`,
          opacity: 1
        }
      ], {
        duration: 700,
        easing: "ease-in-out",
        fill: "forwards"
      });

      animation.onfinish = () => {
        animCard.remove();
        resolve();
      };
    });
  });

  Promise.all(animPromises).then(() => {
    // After all animations done, move cards to winner pile array
    winnerPiles[winningPlay.player].push(...trick.map(p => p.card));
    trick = [];
    currentPlayer = (winningPlay.player + 1) % 4;
    renderTrick();
    renderHand();

    if (hands[0].length === 0) {
      endGame();
    } else if (currentPlayer !== 0) {
      setTimeout(() => botPlay(currentPlayer), 800);
    }
  });

  // Show winner message immediately
  const trickWinnerDiv = document.getElementById("trickWinner");
  trickWinnerDiv.textContent = `Player ${winningPlay.player} won the trick!`;
  setTimeout(() => {
    trickWinnerDiv.textContent = "";
  }, 1500);
}

function endGame() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>Game Over</h2>";

  winnerPiles.forEach((pile, i) => {
    const total = pile.reduce((sum, c) => sum + pointValues[c.id], 0);
    const div = document.createElement("div");
    div.textContent = `Player ${i}: ${total} points`;
    resultsDiv.appendChild(div);
  });
}

function startGame() {
  createDeck();
  shuffleDeck();
  dealCards();
  trick = [];
  winnerPiles = [[], [], [], []];
  currentPlayer = 1;
  renderHand();
  renderTrick();
  document.getElementById("results").innerHTML = "";
  if (currentPlayer !== 0) {
    setTimeout(() => botPlay(), 800);
  }
}
