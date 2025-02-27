
const cardObjectDefinitions = [
    //id is also the order of power
    {id:1, imagePath:"images/cards/eichel/Ober.png", value:4, isTrumpf: true},
    {id:2, imagePath:"images/cards/grune/Ober.png", value:3, isTrumpf: true},
    {id:3, imagePath:"images/cards/eichel/Bauer.png", value:2, isTrumpf: true},
    {id:4, imagePath:"images/cards/grune/Bauer.png", value:2, isTrumpf: true},
    {id:5, imagePath:"images/cards/rote/Bauer.png", value:2, isTrumpf: true},
    {id:6, imagePath:"images/cards/schelle/Bauer.png", value:2, isTrumpf: true},
    {id:7, imagePath:"images/cards/rote/Ass.png", value:11, isTrumpf: true},
    {id:8, imagePath:"images/cards/rote/Zehner.png", value:10, isTrumpf: true},
    {id:9, imagePath:"images/cards/rote/Koenig.png", value:4, isTrumpf: true},
    {id:10,imagePath:"images/cards/rote/Ober.png", value:3, isTrumpf: true},
    {id:11,imagePath:"images/cards/rote/Neuner.png", value:0, isTrumpf: true},
    {id:12,imagePath:"images/cards/rote/Achter.png", value:0, isTrumpf: true},

    {id:13, imagePath:"images/cards/eichel/Ass.png", value:11, isTrumpf: false},
    {id:14, imagePath:"images/cards/eichel/Zehner.png", value:10, isTrumpf: false},
    {id:15, imagePath:"images/cards/eichel/Koenig.png", value:4, isTrumpf: false},
    {id:16, imagePath:"images/cards/eichel/Neuner.png", value:0, isTrumpf: false},

    {id:17, imagePath:"images/cards/grune/Ass.png", value:11, isTrumpf: false},
    {id:18, imagePath:"images/cards/grune/Zehner.png", value:10, isTrumpf: false},
    {id:19, imagePath:"images/cards/grune/Koenig.png", value:4, isTrumpf: false},
    {id:20, imagePath:"images/cards/grune/Neuner.png", value:0, isTrumpf: false},

    {id:21, imagePath:"images/cards/schelle/Ass.png", value:11, isTrumpf: false},
    {id:22, imagePath:"images/cards/schelle/Zehner.png", value:10, isTrumpf: false},
    {id:23, imagePath:"images/cards/schelle/Koenig.png", value:4, isTrumpf: false},
    {id:24, imagePath:"images/cards/schelle/Ober.png", value:3, isTrumpf: false}
]


const cardBackImgPath = 'images/card-back-blue.png';

const cardContainerElem = document.querySelector('.card-container');

let PlayerHandHTML = [];
let FauxDeckToShuffle = [];

const playGameButtonElem = document.getElementById("playGame");

const collapsedGridAreaTemplate = '"a a a" "a a a" "a a a"';
const cardCollectionCellClass = ".card-pos-a";

//let cards = []
class Card
{
	constructor(id, imagePath, value, isTrumpf) {
		this.order = id;
        this.id = id;
        this.imagePath = imagePath;
        this.value = value;
        this.isTrumpf = isTrumpf;
        //this.print();
	}

    print = function(){
        console.log(this);
    }
}

function Deck()
{
	this.cards = [];
    Object.entries(cardObjectDefinitions).forEach(
        ([key, cardInfo]) => this.cards.push(new Card(cardInfo.id, cardInfo.imagePath, cardInfo.value, cardInfo.isTrumpf))
       
    );
		
    this.printCards = function(){
        console.log(this.cards);
    }
	this.shuffle = function(){
		var j, x, i;
		for (i = this.cards.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = this.cards[i];
			this.cards[i] = this.cards[j];
			this.cards[j] = x;
		}
	}

	this.getCards = function(number) {
		if (typeof number === 'undefined') number = 1;
		var returnCards = [];
		for (var i = number; i > 0; i--) {
		  returnCards.push(this.cards.pop());
		}
		return returnCards;
	}

	this.getNumCards = function(){
		return this.cards.length;
	}
}

function createCards(theHand){
    for(i = 0; i < theHand.cards.length; i++)
    {
        createCard(theHand.cards[i],i);
    }
    // theHand.cards.forEach((cardItem)=>{
    //     createCard(cardItem);
    // });
}

function Hand()
{
	this.cards = [];

	this.deal = function(deck){
		this.cards = deck.getCards(6);
	}

	this.add = function(card){
		this.cards.push(card);
	}

    this.print =function(){
        console.log(this.cards);
    }
}


loadGame();
function loadGame(){
    /////DECK
    var deck = new Deck();
    deck.shuffle();

    /////PLAYER HANDS
    var playerHand = new Hand();
    playerHand.deal(deck);
    playerHand.cards.sort(function(a, b) {
        return a.order - b.order;
    });

    var playerHasGrosseFuchs = playerHand.cards.some(elem => elem.id === 1);
    if(playerHasGrosseFuchs){
       //player needs to call
    }   
    

    //HTML / DOM
    createCards(playerHand);

    PlayerHandHTML = document.querySelectorAll('.card');

    playGameButtonElem.addEventListener('click', ()=>startGame());

}

function startGame(){
   initializeNewGame();
   startRound();
}

function initializeNewGame(){

}

function startRound(){
    initializeNewRound();
    collectCards();
    flipCards(true);
}

function initializeNewRound(){

}

function collectCards(){
    transformGridArea(collapsedGridAreaTemplate);
    addCardsToGridAreaCell(cardCollectionCellClass);
}

function transformGridArea(areas){
    cardContainerElem.style.gridTemplateAreas = areas;
}

function addCardsToGridAreaCell(collPositionClassName){
    const cellPositionElem = document.querySelector(collPositionClassName);

    PlayerHandHTML.forEach((card, index) => {
        addChildElement(cellPositionElem, card);
    })
}
function flipCard(card, flipToBack){
    const innerCardElem = card.childNodes[0];

    if(flipToBack && !innerCardElem.classList.contains('flip-it')){
        innerCardElem.classList.add('flip-it');
    }
    else if(innerCardElem.classList.contains('flip-it')){
        innerCardElem.classList.remove('flip-it');
    }
}

function flipCards(flipToBack){
    PlayerHandHTML.forEach((card, index)=>{
        setTimeout(() => {
            flipCard(card,flipToBack);
        }, index * 100);
    })
}

/* <div class="card">
    <div class="card-inner">
        <div class="card-front">
            <img src="images/cards/eichel/Ober.png" alt="" class="card-img">
        </div>
        <div class="card-back">
            <img src="images/card-back-Blue.png" alt="" class="card-img">
        </div>
    </div>

</div>  */
function createCard(cardItem,i){
    //create div element that make up a card
    const cardElem = createElement('div');
    const cardInnerElem = createElement('div');
    const cardFrontElem = createElement('div');
    const cardBackElem = createElement('div');

    //create front and back iamge elems for a card
    const cardFrontImg = createElement('img');
    const cardBackImg = createElement('img');

    //add class and id to card element
    addClassToElement(cardElem, 'card');
    addIdToElement(cardElem, cardItem.id);

    //add calss to inner card element
    addClassToElement(cardInnerElem,'card-inner');

    //add class to front card element
    addClassToElement(cardFrontElem, 'card-front');
    //add class to back card element
    addClassToElement(cardBackElem, 'card-back');

    //add src attribute and appropriate value to img element - back of card
    addSrcToImageElement(cardBackImg, cardBackImgPath);
    //add src attribute and appropriate value to img element - front of card
    addSrcToImageElement(cardFrontImg, cardItem.imagePath);

    //assign class to back image element of back of card
    addClassToElement(cardBackImg, 'card-img')
    //assign class to front image element of front of card
    addClassToElement(cardFrontImg, 'card-img')

    //add front image elem as a child to front card element
    addChildElement(cardFrontElem, cardFrontImg);
    //add back image elem as a child to back card element
    addChildElement(cardBackElem, cardBackImg);

    //add front and back card elems as child to inner card elem
    addChildElement(cardInnerElem, cardFrontElem);
    addChildElement(cardInnerElem, cardBackElem);

    //add inner card as a child to card elem
    addChildElement(cardElem, cardInnerElem);

    //add card elem as child elem to appropriate grid cell
    addCardToGridCell(cardElem,i);
};

function createElement(elemType){
    return document.createElement(elemType);
}

function addClassToElement(elem, className){
    elem.classList.add(className);
}

function addIdToElement(elem, id){
    elem.id = id;
}

function addSrcToImageElement(imgElem, src){
    imgElem.src = src;
}

function addChildElement(parentElem, childElem){
    parentElem.appendChild(childElem);
}

function addCardToGridCell(card,i){
    const cardPositionCalssName = mapCardToGridCell(i);

    const cardPosElem = document.querySelector(cardPositionCalssName);

    addChildElement(cardPosElem, card);
}

function mapCardToGridCell(i){
    if(i == 0)
    {
        return '.card-pos-a'
    }
    else if(i == 1)
    {
        return '.card-pos-b'
    }
    else if(i == 2)
    {
        return '.card-pos-c'
    }
    else if(i == 3)
    {
        return '.card-pos-d'
    }
    else if(i == 4)
    {
        return '.card-pos-e'
    }
    else if(i == 5)
    {
        return '.card-pos-f'
    }

}


