$(document).ready(function() {

//initialize firebase
var config = {
  apiKey: "AIzaSyCvrrVjIlwK9mjdlYSGwyuc5hjfPPglhH8",
  authDomain: "rps-multiplayer-91060.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-91060.firebaseio.com",
  projectId: "rps-multiplayer-91060",
  storageBucket: "",
  messagingSenderId: "83793136624"
};

firebase.initializeApp(config);

//save reference to firebase in a variable
var database = firebase.database();

//set variables
var playerNumber;	
var playerName;
var someoneWins = $("#someoneWins");
var playerOneWins = 0;
var playerTwoWins = 0;
var playerOneLosses = 0;
var playerTwoLosses = 0;

 //when a player disconnects, delete turn, chat, and winner data from firebase
database.ref("turn").onDisconnect().remove();
database.ref("chat").onDisconnect().remove();
database.ref("winner").onDisconnect().remove();

//start by hiding rock, paper, scissor choices
$(".playerOneOptions").hide();
$(".playerTwoOptions").hide();

//disable name submit button until text is entered into text field
$("#submitBtn").prop('disabled', true);
$('#nameInput').keyup(function(){
  $("#submitBtn").prop('disabled', this.value == "" ? true : false);     
});

//disable chat submit button until text is entered into text field
$("#chatSubmitBtn").prop('disabled', true);
$('#chatInput').keyup(function(){
  $("#chatSubmitBtn").prop('disabled', this.value == "" ? true : false);     
});
 

//game object
var game = {

  listeners: function() {
    //listen for changes to player two data - write name, losses, and wins in html
    database.ref("players/player2").on("value", function(snapshot) {
      $("#playerTwoName").html(snapshot.val().name);
      $("#playerTwoStats").html("Wins: " + snapshot.val().wins + " Losses: " + snapshot.val().losses)
    });

    //listen for changes to player one data - write name, losses, and wins in html
    database.ref("players/player1").on("value", function(snapshot) {
      $("#playerOneName").html(snapshot.val().name);
      $("#playerOneStats").html("Wins: " + snapshot.val().wins + " Losses: " + snapshot.val().losses)
    });

    //listen for changes in firebase
    database.ref().on("value", function(snapshot) {
      //set variables to listen to specific nodes in firebase
      var players = snapshot.val().players;
      var playerUno = players.player1;
      var playerDos = players.player2;
      //if "turn" is 1, when it's player one's turn to choose, show/hide/write different elements for players one and two
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
      //if "turn" is 2, when it's player two's turn to choose
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
      //if "turn" is 3, when both players have chosen, display winner
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
  },
 
  clicks: function() {
    //when the name submit button is clicked, call function setPlayer
    $("#submitBtn").on("click", function(event) {
      event.preventDefault();   
      game.setPlayer();
    });
      //player one chooses rock, paper, or scissors, and change turn to 2
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

    //player two chooses rock, paper, or scissors, change turn to 3, and call compare function to determine winner
    $("#playerTwoRock").on("click", function(event) {
      database.ref("players/player2/choice").set("rock");
      database.ref("turn").set(3);
      game.compare();
    });

    $("#playerTwoPaper").on("click", function(event) {
      database.ref("players/player2/choice").set("paper");
      database.ref("turn").set(3);
      game.compare();
    });

    $("#playerTwoScissors").on("click", function(event) {
      database.ref("players/player2/choice").set("scissors");
      database.ref("turn").set(3);
      game.compare();
    });
 },
  

  //takes name that was entered and sets it to either player one or two in the database
  setPlayer: function() {
    database.ref().once("value", function(snapshot) {
    var nameInput = $("#nameInput").val().trim();
      //if player one already exists in firebase, set the name entered as player two
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
        //when player two disconnects, delete player two data
        database.ref("/players/player2").onDisconnect().remove(); 
      //if no player exists in firebase, set name entered as player one       
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
        //when player one disconnects, delete player one data
        database.ref("/players/player1").onDisconnect().remove();
      }
      //clear name input field
      $("#nameInput").val("");
      console.log(playerNumber);
      console.log(playerName);
    });
  },

  //compares the choices of players one and two and determines winner or tie
  compare: function() {
    database.ref().once("value", function(snapshot) {
      //set variables for players names in firebase
      var players = snapshot.val().players;
      var playerUno = players.player1;
      var playerDos = players.player2;
      //compare choices, increment wins and losses, display winner in html, wait five seconds then set "turn" to 1
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
      //if both choices are the same, it's a tie
      } else if (playerUno.choice === playerDos.choice) {
        database.ref("winner").set("It's a tie!");
        setTimeout(function() {
            database.ref("turn").set(1);
            },5000); 
      }
    })
  }
}

game.listeners();
game.clicks();


//object for chat portion
var chat = {

  clicks: function() {
    //when chat submit button is clicked, display contents of chat input box in chat area
    $("#chatSubmitBtn").on("click", function(event) {
      event.preventDefault();
      //display player's name before each message
      var message = playerName + ": " + $("#chatInput").val().trim();
      database.ref().child("chat").set(message);
      //clear chat input box
      $("#chatInput").val("");
    });
  },

  listeners: function() {
    //when a player disconnects, display disconnected message in chat
    database.ref("players").on("child_removed", function(snapshot) {
      var disconnectMessage = snapshot.val().name + " has disconnected.";
      database.ref("chat").set(disconnectMessage);
    });

    //listen for changes to "chat" data node in firebase
    database.ref("chat").on("value", function(snapshot) {
      var chatMessage = snapshot.val();
      var chatDiv = $("<div>" + chatMessage + "</div>");
      //use different colors for messages from each player
      if (chatMessage.startsWith(playerName)) {
        chatDiv.addClass("colorOne");
      } else {
        chatDiv.addClass("colorTwo");
      }
      //write messages in chat area
      $("#chatArea").append(chatDiv);
    });
  }
}

chat.clicks();
chat.listeners();


});
