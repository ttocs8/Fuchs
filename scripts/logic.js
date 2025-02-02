class Card
{
	constructor(imgsrc, suit, rank, value, isTrump) {
		this.imgsrc = imgsrc;
		this.suit = suit;
		this.rank = rank;
		this.value = value;
		this.isTrump = isTrump;
	}

	getImgSrc()
	{
		return this.imgsrc;
	}
}
const SuitsArray = ["eichel","grune","rote","schelle"];
const RanksArray = ["Ass","Zehner","Koenig","Ober","Bauer","Neuner","Achter"];

function DealCards(){
	const hand = []; 

	for(var i =0;i<6; i++){
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


$(document).ready(function(){
	var Hand = DealCards();
	
	for(var i = 0; i < 6; i++){
		var cardNum = "#card";
		cardNum += i+1;
		//console.log(cardNum);
		//console.log(Hand[i].getImgSrc());
		$(cardNum).prop("src", Hand[i].getImgSrc());
	}

});
	

