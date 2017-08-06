$(document).ready(function() {

var config = {
  apiKey: "AIzaSyCvrrVjIlwK9mjdlYSGwyuc5hjfPPglhH8",
  authDomain: "rps-multiplayer-91060.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-91060.firebaseio.com",
  projectId: "rps-multiplayer-91060",
  storageBucket: "",
  messagingSenderId: "83793136624"
};

firebase.initializeApp(config);

var database = firebase.database();

database.ref().remove();

var playerNumber;	
var playerName;
var someoneWins = $("#someoneWins");
var playerOneWins = 0;
var playerTwoWins = 0;
var playerOneLosses = 0;
var playerTwoLosses = 0;

//start by hiding rock, paper, scissor choices
$(".playerOneOptions").hide();
$(".playerTwoOptions").hide();

//disable name submit button until text is entered into text field
$("#submitBtn").prop('disabled', true);
$('#nameInput').keyup(function(){
  $("#submitBtn").prop('disabled', this.value == "" ? true : false);     
});
 
 //when the name submit button is clicked, call function setPlayer
$("#submitBtn").on("click", function(event) {
	event.preventDefault();	  
	setPlayer();
});

function setPlayer() {
	database.ref().once("value", function(snapshot) {
	var nameInput = $("#nameInput").val().trim();
		if (snapshot.child("players/player1").exists()) {				
			$("#nameSpot").html("Hi " + nameInput + "! You are player 2.");
			$("#nameDiv").hide();
			database.ref("players/player2").set({				
				name: nameInput,
				losses: 0,
				wins: 0					
			});		
			playerNumber = 2;
			playerName = nameInput;
			database.ref("turn").set(1);	
			database.ref("/players/player2").onDisconnect().remove();					
		} else {	
			$("#nameSpot").html("Hi " + nameInput + "! You are player 1.");	
			$("#nameDiv").hide();		
			database.ref("players/player1").set({					
				name: nameInput,
				losses: 0,
				wins: 0					
  		});	
  		playerNumber = 1;
  		playerName = nameInput;
  		database.ref("/players/player1").onDisconnect().remove();
		}
		$("#nameInput").val("");
		console.log(playerNumber);
		console.log(playerName);
	});
}

database.ref("players/player2").on("value", function(snapshot) {
	$("#playerTwoName").html(snapshot.val().name);
	$("#playerTwoStats").html("Wins: " + snapshot.val().wins + " Losses: " + snapshot.val().losses)
});

database.ref("players/player1").on("value", function(snapshot) {
	$("#playerOneName").html(snapshot.val().name);
	$("#playerOneStats").html("Wins: " + snapshot.val().wins + " Losses: " + snapshot.val().losses)
});

database.ref().on("value", function(snapshot) {
	var players = snapshot.val().players;
	var playerUno = players.player1;
	var playerDos = players.player2;

	if (snapshot.val().turn === 1) {
		if (playerNumber === 1) {
			$(".playerOneOptions").show();
			$("#yourTurn").html("It's your turn!");
			$("#playerOneChoice").attr("src", "");
			$("#playerTwoChoice").attr("src", "");
			someoneWins.html("");
		} else if (playerNumber === 2) {
			$("#yourTurn").html("Waiting for " + playerUno.name + " to choose...");
			$("#playerOneChoice").attr("src", "");
			$("#playerTwoChoice").attr("src", "");
			someoneWins.html("");
		}
	}
	
	if (snapshot.val().turn === 2) {
		if (playerNumber === 1) {
			$(".playerOneOptions").hide();
			$("#playerOneChoice").attr("src", "assets/images/" + playerUno.choice + ".png");
			$("#yourTurn").html("Waiting for " + playerDos.name + " to choose...");
		} else if (playerNumber === 2){
			$(".playerTwoOptions").show();
			$("#yourTurn").html("It's your turn!");
		}
	}

	if (snapshot.val().turn === 3) {

		if (playerNumber === 1) {
			someoneWins.html(snapshot.val().winner);
			$("#playerTwoChoice").attr("src", "assets/images/" + playerDos.choice + ".png");
			$("#yourTurn").html("");
		} else if (playerNumber === 2) {
			$("#playerOneChoice").attr("src", "assets/images/" + playerUno.choice + ".png");
			someoneWins.html(snapshot.val().winner);
			$("#playerTwoChoice").attr("src", "assets/images/" + playerDos.choice + ".png");
			$(".playerTwoOptions").hide();
			$("#yourTurn").html("");
		}
	}
});

$("#playerOneRock").on("click", function(event) {
	database.ref("players/player1/choice").set("rock");
	database.ref("turn").set(2);
  });

$("#playerOnePaper").on("click", function(event) {
	database.ref("players/player1/choice").set("paper");
	database.ref("turn").set(2);
  });

$("#playerOneScissors").on("click", function(event) {
	database.ref("players/player1/choice").set("scissors");
	database.ref("turn").set(2);
  });

$("#playerTwoRock").on("click", function(event) {
	database.ref("players/player2/choice").set("rock");
	database.ref("turn").set(3);
	compare();
  });

$("#playerTwoPaper").on("click", function(event) {
	database.ref("players/player2/choice").set("paper");
	database.ref("turn").set(3);
	compare();
  });

$("#playerTwoScissors").on("click", function(event) {
	database.ref("players/player2/choice").set("scissors");
	database.ref("turn").set(3);
	compare();
  });

function compare() {
	database.ref().once("value", function(snapshot) {
		var players = snapshot.val().players;
		var playerUno = players.player1;
		var playerDos = players.player2;
		if (playerUno.choice === "rock" && playerDos.choice === "paper") {			
			playerTwoWins++;
			playerOneLosses++;
			database.ref("players/player2/wins").set(playerTwoWins);
			database.ref("players/player1/losses").set(playerOneLosses);
			database.ref("winner").set(playerDos.name + " wins!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000);    
		} else if (playerUno.choice === "rock" && playerDos.choice === "scissors") {
			playerOneWins++;
			playerTwoLosses++;
			database.ref("players/player1/wins").set(playerOneWins);
			database.ref("players/player2/losses").set(playerTwoLosses);
			database.ref("winner").set(playerUno.name + " wins!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000); 
		} else if (playerUno.choice === "paper" && playerDos.choice === "rock") {
			playerOneWins++;
			playerTwoLosses++;
			database.ref("players/player1/wins").set(playerOneWins);
			database.ref("players/player2/losses").set(playerTwoLosses);
			database.ref("winner").set(playerUno.name + " wins!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000); 
		} else if (playerUno.choice === "paper" && playerDos.choice === "scissors") {
			playerTwoWins++;
			playerOneLosses++;
			database.ref("players/player2/wins").set(playerTwoWins);
			database.ref("players/player1/losses").set(playerOneLosses);
			database.ref("winner").set(playerDos.name + " wins!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000); 
		} else if (playerUno.choice === "scissors" && playerDos.choice === "rock") {
			playerTwoWins++;
			playerOneLosses++;
			database.ref("players/player2/wins").set(playerTwoWins);
			database.ref("players/player1/losses").set(playerOneLosses);
			database.ref("winner").set(playerDos.name + " wins!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000); 
		} else if (playerUno.choice === "scissors" && playerDos.choice === "paper") {
			playerOneWins++;
			playerTwoLosses++;
			database.ref("players/player1/wins").set(playerOneWins);
			database.ref("players/player2/losses").set(playerTwoLosses);
			database.ref("winner").set(playerUno.name + " wins!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000); 
		} else if (playerUno.choice === playerDos.choice) {
			database.ref("winner").set("it's a tie!");
			setTimeout(function() {
          database.ref("turn").set(1);
          },5000); 
		}
	})
}

database.ref("players").on("child_removed", function(snapshot) {
	var disconnectMessage = snapshot.val().name + " has disconnected.";
	database.ref("chat").set(disconnectMessage);
});

$("#chatSubmitBtn").on("click", function(event) {
	event.preventDefault();
	// database.ref("chat/message").set($("#chatInput").val().trim());
	// chat();
	var message = playerName + ": " + $("#chatInput").val().trim();
	database.ref().child("chat").set(message);
	$("#chatInput").val("");
});

database.ref("chat").on("value", function(snapshot) {
	var chatMessage = snapshot.val();
	var chatDiv = $("<div>" + chatMessage + "</div>");

	if (chatMessage.startsWith(playerName)) {
		chatDiv.addClass("colorOne");
	} else {
		chatDiv.addClass("colorTwo");
	}

	$("#chatArea").append(chatDiv);
});

});




