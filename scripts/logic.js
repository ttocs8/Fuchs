class Card
{
	order = -1;
	constructor(imgsrc, suit, rank, value, isTrump) {
		this.imgsrc = imgsrc;
		this.suit = suit;
		this.rank = rank;
		this.value = value;
		this.isTrump = isTrump;
		this.order = ORDER.get(this.suit + this.rank);
	}

	getImgSrc()
	{
		return this.imgsrc;
	}

	getCardOrder()
	{
		return this.order;
	}
}

const ORDER = new Map();
ORDER.set("eichelOber", 1);
ORDER.set("gruneOber", 2);
ORDER.set("eichelBauer", 3);
ORDER.set("gruneBauer", 4);
ORDER.set("roteBauer", 5);
ORDER.set("schelleBauer", 6);
ORDER.set("roteAss", 7);
ORDER.set("roteZehner", 8);
ORDER.set("roteKoenig", 9);
ORDER.set("roteOber", 10);
ORDER.set("roteNeuner", 11);
ORDER.set("roteAchter", 12);
ORDER.set("eichelAss", 13);
ORDER.set("eichelZehner", 14);
ORDER.set("eichelKoenig", 15);
ORDER.set("eichelNeuner", 16);
ORDER.set("gruneAss", 17);
ORDER.set("gruneZehner", 18);
ORDER.set("gruneKoenig", 19);
ORDER.set("gruneNeuner", 20);
ORDER.set("schelleAss", 21);
ORDER.set("schelleZehner", 22);
ORDER.set("schelleKoenig", 23);
ORDER.set("schelleOber", 24);

const SuitsArray = ["eichel","grune","rote","schelle"];
const RanksArray = ["Ass","Zehner","Koenig","Ober","Bauer","Neuner","Achter"];

function DealCards(){
	const hand = []; 

	for(var i = 0; i < 6; i++){
		//pick suit
		var randSuitNum = Math.floor(Math.random()*SuitsArray.length);
		var suit = SuitsArray[randSuitNum];
		//console.log(suit);

		//pick rank
		var randRankNum = 0;
		if(suit.includes("rote"))
			randRankNum = Math.floor(Math.random()*RanksArray.length);
		else if(suit.includes("grune"))
			randRankNum = Math.floor(Math.random()* (RanksArray.length-2));
		else 
			randRankNum = Math.floor(Math.random()* (RanksArray.length-1));
		
		var rank = RanksArray[randRankNum];
		//console.log(rank);

		var imgSrc = "images/cards/" + suit + "/" + rank + ".png";
		var card = new Card(imgSrc,suit,rank,-1,false);
		
		hand.push(card);
		//console.log(card.getImgSrc());
	}
	
	

	return hand;
	
}

function hasDuplicates(a) {
	return _.uniq(a).length !== a.length; 
  }

$(document).ready(function(){
	var Hand = DealCards();
	
	while(hasDuplicates(Hand)){
		Hand = DealCards();
	}
	
	//set hand imgs to respective drawn values from Hand
	for(var i = 0; i < 6; i++){
		var cardNum = "#card";
		cardNum += i+1;
		$(cardNum).prop("src", Hand[i].getImgSrc());
	}

	$(document).on('keypress',function(e) {
		
			//R - sort cards
            if( e.which == 114 ) {
				//sort
				Hand.sort(function(a, b) {
					return a.order - b.order;
				  });
				  
				  //redraw cards
				  for(var i = 0; i < 6; i++){
					var cardNum = "#card";
					cardNum += i+1;
					//console.log(cardNum);
					//console.log(Hand[i].getImgSrc());
					$(cardNum).prop("src", Hand[i].getImgSrc());
				}
			
			}
		});
	

});
	

