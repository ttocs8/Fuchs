const CARDINFOMAP = new Map();

// suit_rank, [order, value, trumpf]
CARDINFOMAP.set("eichel_Ober", [1,4,true]);
CARDINFOMAP.set("grune_Ober", [2,3,true]);
CARDINFOMAP.set("eichel_Bauer", [3,2,true]);
CARDINFOMAP.set("grune_Bauer", [4,2,true]);
CARDINFOMAP.set("rote_Bauer", [5,2,true]);
CARDINFOMAP.set("schelle_Bauer", [6,2,true]);
CARDINFOMAP.set("rote_Ass", [7,11,true]);
CARDINFOMAP.set("rote_Zehner", [8,10,true]);
CARDINFOMAP.set("rote_Koenig", [9,4,true]);
CARDINFOMAP.set("rote_Ober", [10,3,true]);
CARDINFOMAP.set("rote_Neuner", [11,0,true]);
CARDINFOMAP.set("rote_Achter", [12,0,true]);

CARDINFOMAP.set("eichel_Ass", [13,11,false]);
CARDINFOMAP.set("eichel_Zehner", [14,10,false]);
CARDINFOMAP.set("eichel_Koenig", [15,4,false]);
CARDINFOMAP.set("eichel_Neuner", [16,0,false]);

CARDINFOMAP.set("grune_Ass", [17,11,false]);
CARDINFOMAP.set("grune_Zehner", [18,10,false]);
CARDINFOMAP.set("grune_Koenig", [19,4,false]);
CARDINFOMAP.set("grune_Neuner", [20,0,false]);

CARDINFOMAP.set("schelle_Ass", [21,11,false]);
CARDINFOMAP.set("schelle_Zehner", [22,10,false]);
CARDINFOMAP.set("schelle_Koenig", [23,4,false]);
CARDINFOMAP.set("schelle_Ober", [24,3,false]);

const RanksArray = ["Ass","Zehner","Koenig","Ober","Bauer","Neuner","Achter"];

class Card
{
	order = -1;
	value = -1;
	imgsrc = "undefined";
	constructor(suit, rank, value) {
		
		this.suit = suit;
		this.rank = rank;
		this.value = value;
		this.imgsrc = "images/cards/" + suit + "/" + rank + ".png";
		this.order = CARDINFOMAP.get(this.suit + "_" + this.rank)[0];
		this.isTrump = CARDINFOMAP.get(this.suit + "_" + this.rank)[2];
		if(this.isTrump)
			this.suit = "trumpf"
	}
}

function Deck()
{
	this.cards = [];
	for (let [key, value] of CARDINFOMAP) {
		suit = key.substring(0, key.indexOf("_"));
		rank = key.split('_').pop();
		val = value[1];
		this.cards.push(new Card(suit,rank,val));
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

function Hand()
{
	this.cards = [];

	this.deal = function(deck){
		this.cards = deck.getCards(6);
	}

	this.add = function(card){
		this.cards.push(card);
	}
}

function toggleCallButton(theHand) {
	$(".callCardSuit").hide();
	var hasGrosseFuchs = theHand.cards.some(elem => elem.order === 1);

	if (!hasGrosseFuchs){
		$("#callButton").hide();
		$(".callCardSuit").hide();
	}
	else {
		$("#callButton").show();
		
	}
}

$(document).ready(function(){
	/////DECK
	var deck = new Deck();
	deck.shuffle();
	//console.log(deck.getNumCards());

	/////PLAYER HANDS
	var playerHand = new Hand();
	playerHand.deal(deck);
	//console.log(deck.getNumCards());

	/////STICH
	var stich = new Hand();
	
	//Show call button if you have grosse fuchs
	toggleCallButton(playerHand);
	$("#UI_CALL_CARD_container").hide();

	$(".card").draggable({
		revert: true
	});
	
	$("#stich").droppable({
		accept: '.card',
		drop: function(event, ui) {
			ui.draggable.draggable({disabled: true});

			//add card to stich
			$(this).append($(ui.draggable));
			var cardToProcess = $(ui.draggable).attr('src');

			var card = playerHand.cards.find(x => x.imgsrc === cardToProcess);
			stich.add(card);

			//remove card from players Hand
			playerHand.cards = playerHand.cards.filter(e => e.order !== card.order)

			toggleCallButton(playerHand);
		}
	});

	
	//set hand imgs to respective drawn values from Hand
	for(var i = 0; i < 6; i++){
		var cardNum = "#card";
		cardNum += i+1;
		$(cardNum).prop("src", playerHand.cards[i].imgsrc);
	}

	$("#sortButton").click(function(){	
		if(playerHand.cards.length > 0) {
			var hand = $("#hand").children().toArray();

			//sort
			playerHand.cards.sort(function(a, b) {
				return a.order - b.order;
			});

			//redraw cards
			for(var i = 0; i < hand.length; i++){
				$(hand[i]).prop("src", playerHand.cards[i].imgsrc);
			}
		}
	});

	var callButtonToggle = false;
	var calledCardSuit = "undefined";
	var calledCardRank = "undefined";
	var theCalledCard = null;

	$("#callButton").click(function(){	
		calledCardSuit = "undefined";
		calledCardRank = "undefined";
		theCalledCard = null;
	
		if(!callButtonToggle){
				callButtonToggle = true;
				$("#UI_CALL_CARD_container").show();
				$("#UI_CALL_CARD_menu").show();
				$(".callCardSuit").show();
		

		}
		else {
				callButtonToggle = false;
				$("#UI_CALL_CARD_container").hide();
		}
	
	});

	$(".callCardSuit").click(function(){	
		
			var cardSrc = $(this).attr('src');
			var suit = cardSrc.substring(cardSrc.indexOf("_")+1, cardSrc.length-4);
			if(suit.includes("selected"))
				suit = suit.substring(0,suit.indexOf("_"));

			var callCardsSuits = $("#callSuitOptions").children().toArray();

			if(!cardSrc.includes("selected")){
				$(this).attr('src', "images/call_" + suit + "_selected.png");
				
				var otherCallSuits = callCardsSuits.filter(x => !x.src.includes(suit));
				otherCallSuits.forEach(element => {
					if(element.src.includes("selected")){
						var tempsuit = element.src.substring(element.src.indexOf("_")+1, element.src.length-4);
						var tempsuit2 = tempsuit.substring(0,tempsuit.indexOf("_"));
						$(element).attr('src',"images/call_" + tempsuit2 + ".png");
					}
				});
			}else
			{
				$(this).attr('src', "images/call_" + suit + ".png");
			}

			switch(suit) {
				case "eichel":
					//change to select image
					var dir = "images\\cards\\eichel\\";
					for(i = 0; i < RanksArray.length-1; i++){
						$(".callCardRanks").attr('src', dir + RanksArray[i] + ".png");
					}
					
				  break;
				case "grune":
				  // code block
				  break;
				case "rote":
				  // code block
				  break;
				case "schelle":
				  // code block
				  break;
				default:
				  // code block
			  }
	
			
			//var calledCardDir = "images/card"

	});

	$("#CLOSE").click(function(){
		$("#UI_CALL_CARD_container").hide();
		callButtonToggle = false;
	});
});