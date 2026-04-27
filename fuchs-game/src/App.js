import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// --- Constants & Data (Preserving Original deckTemplate) ---
const SUITS = ['Eichel', 'Grun', 'Rot', 'Schelle'];
const DECK_TEMPLATE = [
    { id: 0, suit: 'Eichel', rank: 'Ober', points: 4, trumpRank: 1 },
    { id: 1, suit: 'Grun', rank: 'Ober', points: 3, trumpRank: 2 },
    { id: 2, suit: 'Eichel', rank: 'Bauer', points: 2, trumpRank: 3 },
    { id: 3, suit: 'Grun', rank: 'Bauer', points: 2, trumpRank: 4 },
    { id: 4, suit: 'Rot', rank: 'Bauer', points: 2, trumpRank: 5 },
    { id: 5, suit: 'Schelle', rank: 'Bauer', points: 2, trumpRank: 6 },
    { id: 6, suit: 'Rot', rank: 'Ass', points: 11, trumpRank: 7 },
    { id: 7, suit: 'Rot', rank: 'Zehner', points: 10, trumpRank: 8 },
    { id: 8, suit: 'Rot', rank: 'Koenig', points: 4, trumpRank: 9 },
    { id: 9, suit: 'Rot', rank: 'Ober', points: 3, trumpRank: 10 },
    { id: 10, suit: 'Rot', rank: 'Neuner', points: 0, trumpRank: 11 },
    { id: 11, suit: 'Rot', rank: 'Achter', points: 0, trumpRank: 12 },
    { id: 12, suit: 'Eichel', rank: 'Ass', points: 11, trumpRank: null, rankOrder: 1 },
    { id: 13, suit: 'Eichel', rank: 'Zehner', points: 10, trumpRank: null, rankOrder: 2 },
    { id: 14, suit: 'Eichel', rank: 'Koenig', points: 4, trumpRank: null, rankOrder: 3 },
    { id: 15, suit: 'Eichel', rank: 'Neuner', points: 0, trumpRank: null, rankOrder: 4 },
    { id: 16, suit: 'Grun', rank: 'Ass', points: 11, trumpRank: null, rankOrder: 1 },
    { id: 17, suit: 'Grun', rank: 'Zehner', points: 10, trumpRank: null, rankOrder: 2 },
    { id: 18, suit: 'Grun', rank: 'Koenig', points: 4, trumpRank: null, rankOrder: 3 },
    { id: 19, suit: 'Grun', rank: 'Neuner', points: 0, trumpRank: null, rankOrder: 4 },
    { id: 20, suit: 'Schelle', rank: 'Ass', points: 11, trumpRank: null, rankOrder: 1 },
    { id: 21, suit: 'Schelle', rank: 'Zehner', points: 10, trumpRank: null, rankOrder: 2 },
    { id: 22, suit: 'Schelle', rank: 'Koenig', points: 4, trumpRank: null, rankOrder: 3 },
    { id: 23, suit: 'Schelle', rank: 'Ober', points: 3, trumpRank: null, rankOrder: 4 }
].map(card => ({
    ...card,
    image: `images/cards/${card.suit.toLowerCase()}/${card.rank}.png`
}));

// --- Utilities ---
const shuffle = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const sortHand = (a, b) => {
    const ta = a.trumpRank ?? Infinity;
    const tb = b.trumpRank ?? Infinity;
    if (ta !== tb) return ta - tb;
    const suitOrder = { Eichel: 0, Grun: 1, Schelle: 2 };
    const sa = suitOrder[a.suit] ?? 99;
    const sb = suitOrder[b.suit] ?? 99;
    if (sa !== sb) return sa - sb;
    const rankOrder = { Ass: 0, Zehner: 1, Koenig: 2, Ober: 3, Neuner: 4, Achter: 5, Bauer: 6 };
    return (rankOrder[a.rank] ?? 99) - (rankOrder[b.rank] ?? 99);
};

export default function FuchsGame() {
    const [gameState, setGameState] = useState({
        phase: 'menu', // menu, calling, gameplay, counting
        players: [
            { hand: [], score: 0, name: 'You' },
            { hand: [], score: 0, name: 'P2' },
            { hand: [], score: 0, name: 'P3' },
            { hand: [], score: 0, name: 'P4' }
        ],
        dealer: 0,
        caller: null,
        currentPlayer: null,
        trick: [],
        calledCard: null,
        partner: null,
        isFuchsGame: false,
        isFuchsImHaus: false,
        teams: null,
        wonTricks: [[], [], [], []],
        RotIsTrump: false,
        status: "Welcome to Fuchs",
        lastWinner: null,
        playedSuits: new Set()
    });

    // --- Original Logic Helpers ---
    const isTrump = useCallback((card, rotIsTrump) => {
        return card.trumpRank !== null || (rotIsTrump && card.suit === 'Rot');
    }, []);

    const getEffectiveSuit = useCallback((card, rotIsTrump) => {
        return isTrump(card, rotIsTrump) ? 'trump' : card.suit;
    }, [isTrump]);

    const beats = useCallback((card1, card2, rotIsTrump) => {
        const t1 = isTrump(card1, rotIsTrump);
        const t2 = isTrump(card2, rotIsTrump);
        if (t1 && t2) return (card1.trumpRank || 99) < (card2.trumpRank || 99);
        if (t1) return true;
        if (t2) return false;
        if (card1.suit !== card2.suit) return false;
        return card1.rankOrder < card2.rankOrder;
    }, [isTrump]);

    const isLegalPlay = useCallback((card, hand, trick, rotIsTrump, calledCard, playedSuits) => {
        if (trick.length === 0) return true;
        const leadCard = trick[0].card;
        const leadSuit = getEffectiveSuit(leadCard, rotIsTrump);
        const hasSuit = hand.some(c => getEffectiveSuit(c, rotIsTrump) === leadSuit);

        if (hasSuit && getEffectiveSuit(card, rotIsTrump) !== leadSuit) return false;
        if (!hasSuit) {
            const hasTrump = hand.some(c => isTrump(c, rotIsTrump));
            if (hasTrump && !isTrump(card, rotIsTrump)) return false;
        }
        
        // Rule about the "Called Ace" (Gsuchte) - logic parity with original
        if (calledCard && card.suit === calledCard.suit && card.rank === calledCard.rank) {
            if (getEffectiveSuit(card, rotIsTrump) !== leadSuit && trick.length > 0 && !playedSuits.has(card.suit)) {
                return false;
            }
        }

        return true;
    }, [getEffectiveSuit, isTrump]);

    // --- Game Actions ---
    const startGame = () => {
        const deck = shuffle(DECK_TEMPLATE);
        const newPlayers = gameState.players.map((p, i) => ({
            ...p,
            hand: deck.slice(i * 6, (i + 1) * 6).sort(sortHand)
        }));

        // Find who has Grosse Fuchs (Eichel Ober)
        const callerIndex = newPlayers.findIndex(p => p.hand.some(c => c.id === 0));
        
        setGameState(prev => ({
            ...prev,
            players: newPlayers,
            phase: 'calling',
            caller: callerIndex,
            currentPlayer: callerIndex,
            status: `${newPlayers[callerIndex].name} is calling...`,
            wonTricks: [[], [], [], []],
            trick: [],
            calledCard: null,
            partner: null,
            playedSuits: new Set(),
            isFuchsImHaus: newPlayers[callerIndex].hand.some(c => c.id === 0) && newPlayers[callerIndex].hand.some(c => c.id === 1)
        }));
    };

    const processCall = (callType, cardObject = null) => {
        let teams = null;
        let partner = null;
        let rotIsTrump = false;
        let isFuchsGame = false;

        if (callType === 'Rot_is_trump') {
            rotIsTrump = true;
            teams = { team1: [gameState.caller], team2: [0, 1, 2, 3].filter(p => p !== gameState.caller) };
        } else if (callType === 'fuchs_und_Rote') {
            isFuchsGame = true;
            rotIsTrump = true; // Traditionally Fuchs und Rote implies Rot is trump solo
            teams = { team1: [gameState.caller], team2: [0, 1, 2, 3].filter(p => p !== gameState.caller) };
        } else {
            // Partner call
            const called = cardObject;
            for (let p = 0; p < 4; p++) {
                if (p !== gameState.caller && gameState.players[p].hand.some(c => c.id === called.id)) {
                    partner = p;
                    teams = { team1: [gameState.caller, p], team2: [0, 1, 2, 3].filter(q => q !== gameState.caller && q !== p) };
                    break;
                }
            }
            isFuchsGame = gameState.players[gameState.caller].hand.some(c => c.id === 1) || 
                          (partner !== null && gameState.players[partner].hand.some(c => c.id === 1));
        }

        setGameState(prev => ({
            ...prev,
            phase: 'gameplay',
            calledCard: cardObject,
            partner,
            teams,
            RotIsTrump: rotIsTrump,
            isFuchsGame,
            currentPlayer: (prev.dealer + 1) % 4,
            status: (callType === 'Rot_is_trump' 
                ? "Rot ist Trumpf!" 
                : callType === 'fuchs_und_Rote' 
                    ? "Fuchs und Rote!" 
                    : `Called: ` + (prev.isFuchsImHaus ? "Fuchs im Haus - " : "") + `${cardObject.suit} ${cardObject.rank}`)
        }));
    };

    const playCard = (playerIndex, cardIndex) => {
        const player = gameState.players[playerIndex];
        const card = player.hand[cardIndex];

        if (!isLegalPlay(card, player.hand, gameState.trick, gameState.RotIsTrump, gameState.calledCard, gameState.playedSuits)) {
            setGameState(prev => ({ ...prev, status: "Illegal Play!" }));
            return;
        }

        const newHand = [...player.hand];
        newHand.splice(cardIndex, 1);

        const newPlayers = [...gameState.players];
        newPlayers[playerIndex] = { ...player, hand: newHand };

        const newTrick = [...gameState.trick, { player: playerIndex, card }];
        const newPlayedSuits = new Set(gameState.playedSuits);
        newPlayedSuits.add(getEffectiveSuit(card, gameState.RotIsTrump));

        setGameState(prev => ({
            ...prev,
            players: newPlayers,
            trick: newTrick,
            playedSuits: newPlayedSuits,
            currentPlayer: (prev.currentPlayer + 1) % 4,
            status: `${player.name} played ${card.suit} ${card.rank}`
        }));
    };

    // --- AI Logic ---
    useEffect(() => {
        if (gameState.phase === 'calling' && gameState.caller !== 0) {
            const timer = setTimeout(() => {
                const aiHand = gameState.players[gameState.caller].hand;
                const nonTrumpSuits = [...new Set(aiHand.filter(c => c.trumpRank == null).map(c => c.suit))];
                
                if (nonTrumpSuits.length > 0) {
                    const s = nonTrumpSuits[Math.floor(Math.random() * nonTrumpSuits.length)];
                    const possible = DECK_TEMPLATE.filter(c => c.suit === s && c.trumpRank == null && !aiHand.some(h => h.id === c.id));
                    const chosen = possible[Math.floor(Math.random() * possible.length)];
                    processCall('partner', chosen);
                } else {
                    processCall('Rot_is_trump');
                }
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (gameState.phase === 'gameplay' && gameState.currentPlayer !== 0 && gameState.trick.length < 4) {
            const timer = setTimeout(() => {
                const pIdx = gameState.currentPlayer;
                const hand = gameState.players[pIdx].hand;
                const legalIdx = hand.findIndex(c => isLegalPlay(c, hand, gameState.trick, gameState.RotIsTrump, gameState.calledCard, gameState.playedSuits));
                if (legalIdx !== -1) playCard(pIdx, legalIdx);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [gameState.phase, gameState.currentPlayer, gameState.trick.length]);

    // --- Trick Resolution ---
    useEffect(() => {
        if (gameState.trick.length === 4) {
            const timer = setTimeout(() => {
                const trick = gameState.trick;
                let highest = trick[0];
                for (let i = 1; i < trick.length; i++) {
                    if (beats(trick[i].card, highest.card, gameState.RotIsTrump)) {
                        highest = trick[i];
                    }
                }

                const winnerIdx = highest.player;
                const newWonTricks = [...gameState.wonTricks];
                newWonTricks[winnerIdx] = [...newWonTricks[winnerIdx], ...trick.map(t => t.card)];

                setGameState(prev => ({
                    ...prev,
                    wonTricks: newWonTricks,
                    trick: [],
                    currentPlayer: winnerIdx,
                    lastWinner: winnerIdx,
                    status: `${prev.players[winnerIdx].name} takes the trick!`
                }));

                if (gameState.players.every(p => p.hand.length === 0)) {
                    setGameState(prev => ({ ...prev, phase: 'counting' }));
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [gameState.trick]);

    // --- Scoring Logic (Preserved) ---
    const results = useMemo(() => {
        if (gameState.phase !== 'counting') return null;
        let t1Pts = 0, t2Points = 0;
        gameState.teams.team1.forEach(p => gameState.wonTricks[p].forEach(c => t1Pts += c.points));
        gameState.teams.team2.forEach(p => gameState.wonTricks[p].forEach(c => t2Points += c.points));
        const winTeam = t1Pts >= 61 ? 'team1' : 'team2';
        return { t1Pts, t2Points, winTeam };
    }, [gameState.phase, gameState.wonTricks, gameState.teams]);

    return (
        <div className="game-wrapper">
            {gameState.phase === 'menu' && (
                <div className="overlay">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="menu-card">
                        <h1>FUCHS</h1>
                        <button className="btn-primary" onClick={startGame}>Start New Game</button>
                    </motion.div>
                </div>
            )}

            {gameState.phase === 'counting' && results && (
                <div className="overlay">
                    <div className="end-panel">
                        <h2>{results.winTeam === 'team1' ? 'Victory!' : 'Defeat!'}</h2>
                        <div className="result-container">
                            <p>Team 1: {results.t1Pts} pts</p>
                            <p>Team 2: {results.t2Points} pts</p>
                        </div>
                        <button className="btn-primary" onClick={() => setGameState(prev => ({ ...prev, phase: 'menu', dealer: (prev.dealer + 1) % 4 }))}>Play Again</button>
                    </div>
                </div>
            )}

            <CallingModal 
                isOpen={gameState.phase === 'calling' && gameState.caller === 0}
                hand={gameState.players[0].hand}
                onCall={processCall}
                isFuchsImHaus={gameState.isFuchsImHaus}
            />

            <div className="board">
                <div className="status-bar">{gameState.status}</div>
                
                {/* Players */}
                {gameState.players.map((p, i) => (
                    <div key={i} className={`player-slot player-${i} ${gameState.currentPlayer === i ? 'active' : ''}`}>
                        <div className="player-info">
                            <span className="name">{p.name}</span>
                            {gameState.currentPlayer === i && gameState.phase === 'gameplay' && <span className="thinking"> (thinking...)</span>}
                        </div>
                        <div className="hand">
                            <AnimatePresence>
                                {p.hand.map((card, idx) => (
                                    <Card 
                                        key={card.id} 
                                        card={card} 
                                        hidden={i !== 0} 
                                        onClick={() => i === 0 && gameState.currentPlayer === 0 && playCard(0, idx)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}

                {/* Trick Area */}
                <div className="trick-area">
                    <AnimatePresence>
                        {gameState.trick.map((t, i) => (
                            <motion.div
                                key={t.card.id}
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`card played-card pos-${t.player}`}
                            >
                                <img src={t.card.image} alt="card" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function Card({ card, hidden, onClick }) {
    return (
        <motion.div 
            layout
            whileHover={{ y: -10 }}
            className={`card ${hidden ? 'back' : ''}`}
            onClick={onClick}
        >
            {!hidden && <img src={card.image} alt={card.rank} />}
        </motion.div>
    );
}

function CallingModal({ isOpen, hand, onCall, isFuchsImHaus }) {
    if (!isOpen) return null;

    const hasKleine = hand.some(c => c.id === 1);
    const suitsInHand = [...new Set(hand.filter(c => c.trumpRank == null).map(c => c.suit))];
    const partnerOptions = suitsInHand.flatMap(suit => 
        DECK_TEMPLATE.filter(c => c.suit === suit && c.trumpRank == null && !hand.some(h => h.id === c.id))
    );

    // Group hand by suit for better visual structure
    const groupedHand = hand.reduce((acc, card) => {
        const suit = card.trumpRank !== null ? 'Trumpf' : card.suit;
        if (!acc[suit]) acc[suit] = [];
        acc[suit].push(card);
        return acc;
    }, {});

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="overlay">
            <div className="modal-content">
                <h3>Make Your Call</h3>
                {isFuchsImHaus && <div className="badge">Fuchs im Haus!</div>}
                
                <motion.div 
                    className="hand-preview-fanned"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {Object.entries(groupedHand).map(([suit, cards]) => (
                        <div key={suit} className="suit-group">
                            <div className="suit-label">{suit}</div>
                            <div className="suit-cards">
                                {cards.map((c) => (
                                    <motion.div 
                                        key={c.id} 
                                        variants={cardVariants}
                                        className="mini-card-wrapper"
                                    >
                                        <img src={c.image} className="calling-mini-card" alt="preview" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>

                <div className="divider"></div>

                <div className="call-grid">
                    <button className="call-btn rot" onClick={() => onCall('Rot_is_trump')}>
                        Rot ist Trumpf
                    </button>
                    {hasKleine && (
                        <button className="call-btn rot" onClick={() => onCall('fuchs_und_Rote')}>
                            Fuchs und Rote
                        </button>
                    )}
                    {partnerOptions.map(opt => (
                        <button 
                            key={opt.id} 
                            className={`call-btn ${opt.suit.toLowerCase()}`}
                            onClick={() => onCall('partner', opt)}
                        >
                            {opt.suit} {opt.rank}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}