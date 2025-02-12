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

//const RanksArray = ["Ass","Zehner","Koenig","Ober","Bauer","Neuner","Achter"];
const RanksArray = ["Ober","Bauer","Ass","Koenig","Zehner","Neuner","Achter"];
const SuitsArray = ["eichel","grune","rote","schelle"];


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
var theCalledCard = "undefined";
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

	if(theCalledCard.includes("_"))
		$("#callButton").hide();
}

function GAME()
{
	this.IsRunning = false;
	this.GAMESTATES = ["DEAL","CALL","TURN"]
	this.CURRENTSTATE = "init"
	

	//can be 1, 2, 3, or 4 where 1 is the User and the rest are bots
	this.DEALER = 0;

	this.CALLER = 0;

	//can be 1, 2, 3, or 4 where 1 is the User and the rest are bots
	this.CURRENT_PLAYER_OUT = 0;
	this.PLAY_ORDER = [false,false,false,false];
	this.PLAYORDERPOS = 0;

	this.shiftDealer = function(){
		if(this.DEALER < 4){
			this.DEALER++;
		}
		else
			this.DEALER = 1;

		if(this.DEALER > 3)
			this.CURRENT_PLAYER_OUT = 1;
		else
			this.CURRENT_PLAYER_OUT = this.DEALER + 1;
	}

	this.ChooseRandomDealer = function(){
		this.DEALER = Math.floor(Math.random() * (4  - 1 + 1)) + 1;

		if(this.DEALER > 3)
			this.CURRENT_PLAYER_OUT = 1;
		else
			this.CURRENT_PLAYER_OUT = this.DEALER + 1;
	}

	this.FindCaller = function(playerhand, bot1hand, bot2hand, bot3hand) {
		if(playerhand.cards.some(elem => elem.order === 1))
			this.CALLER = 1;
		else if(bot1hand.cards.some(elem => elem.order === 1))
			this.CALLER = 2;
		else if(bot2hand.cards.some(elem => elem.order === 1))
			this.CALLER = 3;
		else if(bot3hand.cards.some(elem => elem.order === 1))
			this.CALLER = 4;
	}
}

let playOrderCheck = arr => arr.every(v => v === true);

function BotCall(stich, bot1Hand, bot2Hand, bot3Hand) {
	switch (TheGame.CALLER) {
		case 2:
			console.log("PLAYER 2 CALLING ...")
			setTimeout(function(){
				var cardSuitDecision = bot1Hand.cards.find(elem => elem.isTrump === false);
				var cardToCall = "*";
				while (cardToCall.includes("*") || (cardToCall.includes(cardSuitDecision.suit) || cardToCall.includes(cardSuitDecision.rank))) {
					var inx = Math.floor(Math.random() * ((CARDINFOMAP.size - 1) - 12 + 1)) + 12;
					cardToCall = Array.from(CARDINFOMAP.keys())[inx];
				}

				var suit = cardToCall.substring(0, cardToCall.lastIndexOf("_"));
				var rank = cardToCall.substring(cardToCall.lastIndexOf("_") + 1, cardToCall.length);
				var imgsrc = "images/cards/" + suit + "/" + rank + ".png";


				$("#TheCalledCard").attr('src', imgsrc);
				theCalledCard = imgsrc.substring(imgsrc.split("/", 2).join("/").length + 1, imgsrc.length - 4).replace("/", "_");

				$("#CALLED_CARD_TEXT").text("PLAYER 2 CALLED CARD");

				TheGame.CURRENTSTATE = "TURNS";
				console.log("CURRENT STATE: " + TheGame.CURRENTSTATE);
				//BOT PLAY
				BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
				
			},3000);
			break;
		case 3:
			console.log("PLAYER 3 CALLING ...")
			setTimeout(function(){
				var cardSuitDecision = bot2Hand.cards.find(elem => elem.isTrump === false);
				var cardToCall = "*";
				while (cardToCall.includes("*") || (cardToCall.includes(cardSuitDecision.suit) || cardToCall.includes(cardSuitDecision.rank))) {
					var inx = Math.floor(Math.random() * ((CARDINFOMAP.size - 1) - 12 + 1)) + 12;
					cardToCall = Array.from(CARDINFOMAP.keys())[inx];
				}

				var suit = cardToCall.substring(0, cardToCall.lastIndexOf("_"));
				var rank = cardToCall.substring(cardToCall.lastIndexOf("_") + 1, cardToCall.length);
				var imgsrc = "images/cards/" + suit + "/" + rank + ".png";


				$("#TheCalledCard").attr('src', imgsrc);
				theCalledCard = imgsrc.substring(imgsrc.split("/", 2).join("/").length + 1, imgsrc.length - 4).replace("/", "_");

				$("#CALLED_CARD_TEXT").text("PLAYER 3 CALLED CARD");

				TheGame.CURRENTSTATE = "TURNS";
				console.log("CURRENT STATE: " + TheGame.CURRENTSTATE);
				//BOT PLAY
				BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
			},3000);
			break;
		case 4:
			console.log("PLAYER 4 CALLING ...")
			setTimeout(function(){
				var cardSuitDecision = bot3Hand.cards.find(elem => elem.isTrump === false);
				var cdsuit = cardSuitDecision.suit;
				var cardToCall = "*";
				while (cardToCall.includes("*") || (cardToCall.includes(cdsuit) || cardToCall.includes(cardSuitDecision.rank))) {
					var inx = Math.floor(Math.random() * ((CARDINFOMAP.size - 1) - 12 + 1)) + 12;
					cardToCall = Array.from(CARDINFOMAP.keys())[inx];
				}

				var suit = cardToCall.substring(0, cardToCall.lastIndexOf("_"));
				var rank = cardToCall.substring(cardToCall.lastIndexOf("_") + 1, cardToCall.length);
				var imgsrc = "images/cards/" + suit + "/" + rank + ".png";


				$("#TheCalledCard").attr('src', imgsrc);
				theCalledCard = imgsrc.substring(imgsrc.split("/", 2).join("/").length + 1, imgsrc.length - 4).replace("/", "_");

				$("#CALLED_CARD_TEXT").text("PLAYER 4 CALLED CARD");

				TheGame.CURRENTSTATE = "TURNS";
				console.log("CURRENT STATE: " + TheGame.CURRENTSTATE);
				//BOT PLAY
				BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
			},3000);
			break;
		default:
			break;
	}
}

function BotPlay(stich, bot1Hand, bot2Hand, bot3Hand) {
	if(playOrderCheck(TheGame.PLAY_ORDER)) {
		console.log("STICH OVER - EVERYONE WENT");
		return;
	}
	if(TheGame.CURRENTSTATE.includes("TURNS")){
		switch (TheGame.CURRENT_PLAYER_OUT) {
			case 1:
				break;
			case 2:
				if(!TheGame.PLAY_ORDER[1]){
					setTimeout(function () {
						//if hand contains the latest stich card - play that one
						var cardToPlay = stich.cards[stich.cards.length - 1];

						if (!typeof cardToPlay === 'undefined') {
							var cardToPlay = bot1Hand.cards.find(x => x.suit === cardToFind.suit);
							stich.add(cardToPlay);
						}
						else {
							var cardIndxToPick = Math.floor(Math.random() * 5);

							//add to stich
							stich.add(bot1Hand.cards[cardIndxToPick]);
							$("#stich").append("<img id=\"bot1card\"  class=\"botcard\" src=" + bot1Hand.cards[cardIndxToPick].imgsrc + " />");
							$("#bot1card").hide().animate({ left: 5000, opacity: "show" }, 1500);
							bot1Hand.cards.splice(cardIndxToPick, 1);
						}

						TheGame.PLAYORDERPOS = TheGame.CURRENT_PLAYER_OUT - 1;
						TheGame.PLAY_ORDER[TheGame.PLAYORDERPOS] = true;
						console.log(TheGame.PLAY_ORDER);
						TheGame.CURRENT_PLAYER_OUT++;
						
						console.log(TheGame.CURRENT_PLAYER_OUT);
						

						BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
						
					}, 4000);
				}
				
				break;
			case 3:
				if(!TheGame.PLAY_ORDER[2]){
					setTimeout(function () {
						//if hand contains the latest stich card - play that one
						var cardToPlay = stich.cards[stich.cards.length - 1];

						if (!typeof cardToPlay === 'undefined') {
							var cardToPlay = bot2Hand.cards.find(x => x.suit === cardToFind.suit);
							stich.add(cardToPlay);
						}
						else {
							var cardIndxToPick = Math.floor(Math.random() * 5);

							//add to stich
							stich.add(bot2Hand.cards[cardIndxToPick]);
							$("#stich").append("<img id=\"bot2card\"  class=\"botcard\" src=" + bot2Hand.cards[cardIndxToPick].imgsrc + " />");
							$("#bot2card").hide().animate({ left: 5000, opacity: "show" }, 1500);

							bot2Hand.cards.splice(cardIndxToPick, 1);
						}
						TheGame.PLAYORDERPOS = TheGame.CURRENT_PLAYER_OUT - 1;
						TheGame.PLAY_ORDER[TheGame.PLAYORDERPOS] = true;
						console.log(TheGame.PLAY_ORDER);
						TheGame.CURRENT_PLAYER_OUT++;
						console.log(TheGame.CURRENT_PLAYER_OUT);
					
						BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
					}, 4000);

				}
				break;
			case 4:
				if(!TheGame.PLAY_ORDER[3]){
					setTimeout(function () {
						//if hand contains the latest stich card - play that one
						var cardToPlay = stich.cards[stich.cards.length - 1];

						if (!typeof cardToPlay === 'undefined') {
							var cardToPlay = bot3Hand.cards.find(x => x.suit === cardToFind.suit);
							stich.add(cardToPlay);
						}
						else {
							var cardIndxToPick = Math.floor(Math.random() * 5);

							//add to stich
							stich.add(bot3Hand.cards[cardIndxToPick]);
							$("#stich").append("<img id=\"bot3card\"  class=\"botcard\" src=" + bot3Hand.cards[cardIndxToPick].imgsrc + " />");
							$("#bot3card").hide().animate({ left: 5000, opacity: "show" }, 1500);

							bot3Hand.cards.splice(cardIndxToPick, 1);
						}
						TheGame.PLAYORDERPOS = TheGame.CURRENT_PLAYER_OUT - 1;
						TheGame.PLAY_ORDER[TheGame.PLAYORDERPOS] = true;
						console.log(TheGame.PLAY_ORDER);
						TheGame.CURRENT_PLAYER_OUT = 1;
						console.log(TheGame.CURRENT_PLAYER_OUT);
						
						BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
					}, 4000);
				}
				
				break;
			default:
				break;
		}
	}
}

var TheGame = new GAME();



$(document).ready(function(){
	
		
	//TheGame.shiftDealerAndFirstOut();
	TheGame.CURRENTSTATE = "DEAL";
	console.log("CURRENT STATE: " + TheGame.CURRENTSTATE);
	/////DECK
	var deck = new Deck();
	deck.shuffle();

	/////PLAYER HANDS
	var playerHand = new Hand();
	playerHand.deal(deck);

	var bot1Hand = new Hand();
	bot1Hand.deal(deck)
	console.log(bot1Hand.cards);

	var bot2Hand = new Hand();
	bot2Hand.deal(deck)
	console.log(bot2Hand.cards);

	var bot3Hand = new Hand();
	bot3Hand.deal(deck)
	console.log(bot3Hand.cards);

	console.log("Dealt all hands");

	/////STICH
	var stich = new Hand();

	//Choose Dealer / select Out
	TheGame.ChooseRandomDealer();

	TheGame.CURRENTSTATE = "CALL";
	console.log("CURRENT STATE: " + TheGame.CURRENTSTATE);
	TheGame.FindCaller(playerHand, bot1Hand, bot2Hand, bot3Hand);

	

	//Whoever has grosse fuchs calls
	if(TheGame.CALLER != 1){
		BotCall(stich,bot1Hand, bot2Hand, bot3Hand);
		//console.log(TheGame.CURRENT_PLAYER_OUT);
	}
	else {
		console.log(TheGame.CURRENT_PLAYER_OUT);
		var callButtonToggle = false;

		$("#callButton").click(function(){	
			
			theCalledCard = "undefined";
		
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

					switch(suit) {
						case "eichel":
							$("#callrank" + RanksArray.length).hide();
							var dir = "images/cards/eichel/";
							for(i = 0; i < RanksArray.length - 1; i++){
								$("#callrank" + (i + 1)).show();
								$("#callrank" + (i + 1)).attr('src', dir + RanksArray[i] + ".png");
							}
						break;
						case "grune":
							$("#callrank" + RanksArray.length).hide();
							var dir = "images/cards/grune/";
							for(i = 0; i < RanksArray.length - 1; i++){
								$("#callrank" + (i + 1)).show();
								$("#callrank" + (i + 1)).attr('src', dir + RanksArray[i] + ".png");
							}
						break;
						case "rote":
							var dir = "images/cards/rote/";
							for(i = 0; i < RanksArray.length; i++){
								$("#callrank" + (i + 1)).show();
								$("#callrank" + (i + 1)).attr('src', dir + RanksArray[i] + ".png");
							}
						break;
						case "schelle":
							var dir = "images/cards/schelle/";
							$("#callrank" + RanksArray.length).hide();
							for(i = 0; i < RanksArray.length - 1; i++){
								
								$("#callrank" + (i + 1)).show();
								$("#callrank" + (i + 1)).attr('src', dir + RanksArray[i] + ".png");
							}
						break;
						default:
						// code block
					}
				}else
				{
					console.log("CLEAR CARDS");
					$(this).attr('src', "images/call_" + suit + ".png");
					for(i = 0; i < RanksArray.length; i++){
						$("#callrank" + (i + 1)).hide();
					}
				}
				
				//var calledCardDir = "images/card"

		});

		$("#CLOSE").click(function(){
			$("#UI_CALL_CARD_container").hide();
			callButtonToggle = false;
			for(i = 0; i < RanksArray.length; i++){
				$("#callrank" + (i + 1)).hide();
			}
		});

		$(".callCardRanks").click(function(){
			var cardSrc = $(this).attr('src');
			$("#CALLED_CARD_TEXT").text("YOU CALLED CARD");
			$("#TheCalledCard").attr('src', cardSrc);

			theCalledCard = cardSrc.substring(cardSrc.split("/", 2).join("/").length+1,cardSrc.length-4).replace("/","_");
			$("#callButton").hide();
			$("#UI_CALL_CARD_container").hide();
			callButtonToggle = false;
			for(i = 0; i < RanksArray.length; i++){
				$("#callrank" + (i + 1)).hide();
			}

			TheGame.CURRENTSTATE = "TURNS";
			console.log(TheGame.CURRENT_PLAYER_OUT);
			BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
		});
	}

	


	



	$("#UI_CALL_CARD_container").hide();

	toggleCallButton(playerHand);
	
	$(".card").draggable({
		revert: true
	});
	
	$("#stich").droppable({
		accept: '.card',
		drop: function(event, ui) {
			if(playOrderCheck(TheGame.PLAY_ORDER)){
				console.log("STICH OVER - EVERYONE WENT");
				return;
			}
			if(TheGame.CURRENTSTATE.includes("TURNS") && theCalledCard.includes("_") && TheGame.CURRENT_PLAYER_OUT == 1){
				ui.draggable.draggable({disabled: true});

				//add card to stich
				$(this).append($(ui.draggable));
				var cardToProcess = $(ui.draggable).attr('src');

				var card = playerHand.cards.find(x => x.imgsrc === cardToProcess);
				stich.add(card);

				//remove card from players Hand
				playerHand.cards = playerHand.cards.filter(e => e.order !== card.order)

				toggleCallButton(playerHand);

				TheGame.PLAYORDERPOS = TheGame.CURRENT_PLAYER_OUT - 1;
				TheGame.PLAY_ORDER[TheGame.PLAYORDERPOS] = true;
				console.log(TheGame.PLAY_ORDER);
				//next players turn
				TheGame.CURRENT_PLAYER_OUT++;
				TheGame.PLAYORDERPOS++;
				console.log(TheGame.CURRENT_PLAYER_OUT);

				

				if(TheGame.CURRENTSTATE.includes("TURNS"));
					BotPlay(stich, bot1Hand, bot2Hand, bot3Hand);
			}
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

	
});




