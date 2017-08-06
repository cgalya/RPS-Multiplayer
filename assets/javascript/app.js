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

  database.ref("players").remove();
  database.ref("turn").remove();
  
  var playerNumber;	

  $(".playerOneOptions").hide();
  $(".playerTwoOptions").hide();

 
	  $("#submitBtn").on("click", function(event) {
	  	event.preventDefault();	  
	  	setPlayer();
  	})
	
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
				database.ref("turn").set(1);						
			} else {	
				$("#nameSpot").html("Hi " + nameInput + "! You are player 1.");	
				$("#nameDiv").hide();		
				database.ref("players/player1").set({					
					name: nameInput,
					losses: 0,
					wins: 0					
	  		});	
	  		playerNumber = 1;
			}
			$("#nameInput").val("");
			console.log(playerNumber);
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

// database.ref().on("value", function(snapshot) {
// 	var players = snapshot.val().players;
// 	var playerUno = players.player1;
// 	var playerDos = players.player2;
// 	if (playerNumber === 1) {
// 		if (snapshot.val().turn === 1) {
// 			$(".playerOneOptions").show();
// 	  	$("#yourTurn").html("It's your turn!");
// 		} else if (snapshot.val().turn === 2) {
// 			$(".playerOneOptions").hide();
// 			$("#yourTurn").html("Waiting for " + playerDos.name + " to choose");
// 	} 

// 	if (playerNumber === 2) {
// 		if (snapshot.val().turn === 1) {
//   		$("#yourTurn").html("Waiting for " + playerUno.name + " to choose");
//   		console.log(playerUno.name);
// 		} else if (snapshot.val().turn === 2) {
// 	  	$(".playerTwoOptions").show();
// 		}
// 	}
// 	}
	
// })


database.ref().on("value", function(snapshot) {
	var players = snapshot.val().players;
	var playerUno = players.player1;
	var playerDos = players.player2;

	if (snapshot.val().turn === 1) {
		if (playerNumber === 1) {
			$(".playerOneOptions").show();
			$("#yourTurn").html("It's your turn!");
		} else if (playerNumber === 2) {
			$("#yourTurn").html("Waiting for " + playerUno.name + " to choose...");
		}
	}
	
	if (snapshot.val().turn === 2) {
		if (playerNumber === 1) {
			$(".playerOneOptions").hide();
			$("#playerOneChoice").html(playerUno.choice);
		} else if (playerNumber === 2){
			$(".playerTwoOptions").show();
		}
	}

	if (snapshot.val().turn === 3) {
		if (playerNumber === 1) {
			//winner screen
			$("#playerTwoChoice").html(playerDos.choice);
		} else if (playerNumber === 2) {
			$("#playerOneChoice").html(playerUno.choice);
			//winner screen
			$("#playerTwoChoice").html(playerDos.choice);
		}
	}
})