const CARDINFOMAP = new Map();
CARDINFOMAP.set("eichel_Ober", [1,4]);
CARDINFOMAP.set("grune_Ober", [2,3]);
CARDINFOMAP.set("eichel_Bauer", [3,2]);
CARDINFOMAP.set("grune_Bauer", [4,2]);
CARDINFOMAP.set("rote_Bauer", [5,2]);
CARDINFOMAP.set("schelle_Bauer", [6,2]);
CARDINFOMAP.set("rote_Ass", [7,11]);
CARDINFOMAP.set("rote_Zehner", [8,10]);
CARDINFOMAP.set("rote_Koenig", [9,4]);
CARDINFOMAP.set("rote_Ober", [10,3]);
CARDINFOMAP.set("rote_Neuner", [11,0]);
CARDINFOMAP.set("rote_Achter", [12,0]);
CARDINFOMAP.set("eichel_Ass", [13,11]);
CARDINFOMAP.set("eichel_Zehner", [14,10]);
CARDINFOMAP.set("eichel_Koenig", [15,4]);
CARDINFOMAP.set("eichel_Neuner", [16,0]);
CARDINFOMAP.set("grune_Ass", [17,11]);
CARDINFOMAP.set("grune_Zehner", [18,10]);
CARDINFOMAP.set("grune_Koenig", [19,4]);
CARDINFOMAP.set("grune_Neuner", [20,0]);
CARDINFOMAP.set("schelle_Ass", [21,11]);
CARDINFOMAP.set("schelle_Zehner", [22,10]);
CARDINFOMAP.set("schelle_Koenig", [23,4]);
CARDINFOMAP.set("schelle_Ober", [24,3]);

class Card
{
	order = -1;
	value = -1;
	imgsrc = "undefined";
	constructor(suit, rank, value, isTrump) {
		
		this.suit = suit;
		this.rank = rank;
		this.value = value;
		this.imgsrc = "images/cards/" + suit + "/" + rank + ".png";
		this.order = CARDINFOMAP.get(this.suit + "_" + this.rank)[0];
		this.isTrump = isTrump;
	}

	getImgSrc()
	{
		return this.imgsrc;
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
}


$(document).ready(function(){
	
	var deck = new Deck();
	deck.shuffle();
	var Hand = deck.getCards(6);
	
	//set hand imgs to respective drawn values from Hand
	for(var i = 0; i < 6; i++){
		var cardNum = "#card";
		cardNum += i+1;
		$(cardNum).prop("src", Hand[i].imgsrc);
	}

	$("#sortButton").click(function(){		
		//sort
		Hand.sort(function(a, b) {
			return a.order - b.order;
		});

		for(var i = 0; i < 6; i++){
			var cardNum = "#card";
			cardNum += i+1;
			$(cardNum).prop("src", Hand[i].imgsrc);
		}
	});

	
});
	

