
var dataObject,
    serviceURL = "https://jsonblob.com/api/jsonBlob/574c63aae4b01190df708c1e",
    notificationURL = "https://pushpad.xyz/projects/1042/notifications",
    notificationAuthToken = "ed5c3eb9e6cd1a101b728ffab3256f10",
    lastPick,
    currentPlayerID,
    chosenCardSubmit,
    cardValidationResult,
    getLastTime,
    updatedTime,
    hours;

function loadCardFeed() {
  $('#feed-table').empty();
  for(var i = dataObject.chosenCards.length-1; i > -1; --i){
    addCardToList(dataObject.chosenCards[i]);
  }
}

function addCardToList(cardInfo) {
    var dateTime = new Date(cardInfo.pickTime).toLocaleString();
    dateTime = dateTime.replace('/2016, ', ' at ');
    var cardText = '<span class="draft-player">' + cardInfo.player + '</span>' + ' picked ' + '<span class="draft-card">' + cardInfo.cardName + '</span>' + ' on ' + dateTime;
    $('#feed-table').append('<tr><td>' + cardText + '</tr></td>');
}

var createPlayerCardList = function(playerName, cards){
    var tableID = 'decklist-';
    tableID += playerName.toLowerCase();

    $('#' + tableID + ' .table').empty();
    cards.forEach(function(card){
        $('#' + tableID + ' .table').append('<tr><td><span class="draft-card">' + card + '</span></tr></td>');
    });
};

var addPlayer = function(playerData){
    createPlayerCardList(playerData.name,playerData.cards);
    $('#card-count-' + playerData.name.toLowerCase()).text(playerData.cards.length);
    //console.log("addPlayer: " + playerData.name + " function ran successfully");
};

var loadPlayers = function(){
    updateTurnBasedPlayerLabels();

    addPlayer(dataObject.player1);
    addPlayer(dataObject.player2);
    addPlayer(dataObject.player3);
    addPlayer(dataObject.player4);
    addPlayer(dataObject.player5);
    addPlayer(dataObject.player6);
    addPlayer(dataObject.player7);
    addPlayer(dataObject.player8);

    console.log("loadPlayers function ran successfully");
};

var updateTurnBasedPlayerLabels = function(){
    currentPlayerID = dataObject.misc.turnOrder[dataObject.misc.turnIndex];
    $('#current-player-label').text(dataObject[currentPlayerID].name);
    updateLastPickTime();
};
var updateLastPickTime = function() {
    console.log(dataObject.chosenCards.length);
    getLastTime = dataObject.chosenCards[dataObject.chosenCards.length -1].pickTime;
    updatedTime = (Date.now() - getLastTime);
    hours = (updatedTime / (1000 * 60 * 60)).toFixed(1);


    $('#timer').html("It has been " + hours + " hours since the last pick.");
}
var goToNextTurn = function(i){
  if(dataObject.misc.countingUp){
    dataObject.misc.turnIndex++;
  }
  else {
    dataObject.misc.turnIndex--;
  }

  //If we've reached the end of the array start counting down
  if(dataObject.misc.turnIndex >= dataObject.misc.turnOrder.length) {
    dataObject.misc.countingUp = false;
    dataObject.misc.turnIndex--;
    //console.log(' SNAKE FOR ' + dataObject.misc.turnOrder[dataObject.misc.turnIndex]);
  }
  //If we've reached the bottom of the array, move players & start counting up
  else if(dataObject.misc.turnIndex < 0) {
    var firstPick = dataObject.misc.turnOrder[0];
    dataObject.misc.turnOrder.splice(0,1);
    dataObject.misc.turnOrder.push(firstPick);
    dataObject.misc.countingUp = true;
    dataObject.misc.turnIndex = 0;
    dataObject.misc.roundNumber++;
    //console.log('NEXT ROUND ' + dataObject.misc.turnOrder);
  }

  dataObject.misc.pickNumber++;
};

var returnPlayer = function(){
    //Advance Turn Order before returning dataObject
    goToNextTurn();
    //SEND THE PLAYER DATA BACK & RELOAD IT
    $.ajax({
        type: 'PUT',
        url: serviceURL,
        data: JSON.stringify(dataObject),
        success: function(response) {
          console.log("returnPlayer success");
             dataObject = response;
             updateDataObjectElements();
             //notifyNextPlayer();
             clearForm();
             $("#cardSubmissionModal").modal('hide');
         },
         failure: function(response){
            console.log('Well Return Player failed... bad stuff');
         },
        contentType: "application/json",
        dataType: 'json'
    });
};

var notifyNextPlayer = function(){
    console.log(lastPick);
    var notificationData = {
        "notification" : {
            "body": "This is a test",
            "title" : lastPick,
            "target_url" : "http://andrewmaul.com/fun/draftleague2016/index.html"
        }
    };

    $.ajax({
        type: 'POST',
        url: notificationURL,
        crossDomain: true,
        data: JSON.stringify(notificationData),
        dataType: 'json',
        headers: {
            'Access-Control-Allow-Origin' : "*",
            'Authorization': 'Token token="' + notificationAuthToken + '"',
            'Accept': 'application/json'
        },
        failure: function(response) {
            console.log(response);
        },
        success: function(response) {
            console.log(response);
        },
        contentType: "application/jsonp"
    });
};

var clearForm = function(){
    $('#form-card').val('');
    console.log("clearForm function ran successfully");
};

var notificationUrls = {
  "player1" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=01&uid_signature=1b716ae8523d1a5ce173c9ba70eb002714a24a58",
  "player2" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=02&uid_signature=af4aa4bab5714c4b0cde17424a34ec7c794bda76",
  "player3" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=03&uid_signature=3803bb9cc8001d02a5dd5195d15be06ee778e84e",
  "player4" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=04&uid_signature=8b0ae6731b40e09e201ebbecf587cff96eb2c125",
  "player5" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=05&uid_signature=d2d7cd4f2d7a9786eee44009507559108de91695",
  "player6" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=06&uid_signature=95691b54448ba83828cdebc2a6fcc747742f905e",
  "player7" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=07&uid_signature=03520f4841ff2a5ba32e2caaf52194edfc12b42b",
  "player8" : "https://pushpad.xyz/projects/1042/subscription/edit?uid=08&uid_signature=7cf6dbdab24fcab6c2d017a4eb52986c2586223d",
};

var banlist = ["Ancestral Recall","Balance","Biorhythm","Black Lotus","Braids, Cabal Minion","Coalition Victory","Channel","Emrakul, the Aeons Torn","Erayo, Soratami Ascendant","Fastbond","Gifts Ungiven","Griselbrand","Karakas","Library of Alexandria","Limited Resources","Mox Sapphire","Mox Ruby", "Mox Pearl", "Mox Emerald","Mox Jet","Painter's Servant","Panoptic Mirror","Primeval Titan","Prophet of Kruphix","Protean Hulk","Recurring Nightmare","Rofellos, Llanowar Emissary","Sway of the Stars","Sundering Titan","Sylvan Primordial","Time Vault","Time Walk","Tinker","Tolarian Academy","Trade Secrets","Upheaval","Worldfire","Yawgmoth's Bargain","Advantageous Proclamation","Amulet of Quoz","Backup Plan","Brago's Favor","Bronze Tablet","Chaos Orb","Contract from Below","Darkpact","Demonic Attorney","Double Stroke","Falling Star","Immediate Action","Iterative Analysis","Jeweled Bird","Muzzio's Preparations","Power Play","Rebirth","Secret Summoning","Secrets of Paradise","Sentinel Dispatch","Shahrazad","Tempest Efreet","Timmerian Fiends","Unexpected Potential","Worldknit"];
function saveSelectedCard(cardToSave){
  lastPick = dataObject[currentPlayerID].name + " picked " + cardToSave;

  dataObject[currentPlayerID].cards.push(cardToSave);

  dataObject.chosenCards.push(chosenCardObject(cardToSave));
}

function chosenCardObject(chosenCard){
  var tempObject = {
    "cardName" : chosenCard,
    "player" : dataObject[currentPlayerID].name,
    "pickNumber" : dataObject.misc.pickNumber,
    "pickTime" : Date.now()
  };

  return tempObject;
}

$('#ban-alert .close').click(function(){
  $('#ban-alert').hide();
});
$('#picked-alert .close').click(function(){
  $('#picked-alert').hide();
});

function catchInput(){
  $('#card-submit').on('click', function(e){
    e.preventDefault();
    chosenCardString = $('#form-card').val();
    $('#ban-alert').hide();
    $('#picked-alert').hide();

    if(cardInBanList(chosenCardString)) {
      $('#ban-alert .alert-message').html("<strong>" + chosenCardString + "</strong>" + " is banned. Please pick again.");
      $('#ban-alert').show();
      $('#form-card').val('');
    }
    else if(cardAlreadyPicked(chosenCardString)){
      $('#picked-alert .alert-message').html("<strong>" + chosenCardString + "</strong>" + " has already been chosen. Please pick again.");
      $('#picked-alert').show();
      $('#form-card').val('');
    }
    else {
      setupConfirmationModal();
      loadJSONData();
    }
  });

  $('#cardSubmissionModalConfirmationButton').on('click', function(e){
    e.preventDefault();

    chosenCardString = $('#form-card').val();

    console.log('We confirmed & are picking: ' + chosenCardString);

    $('#cardSubmissionModalConfirmationButton').prop('disabled', true);
    //clearTimeout(modalTimeOutFunction);
    saveSelectedCard(chosenCardString);
    returnPlayer();
  });
}

//var modalTimeOutFunction;
function setupConfirmationModal(){
  //clearTimeout(modalTimeOutFunction);

  $('#cardSubmissionModal').modal();

  $('#cardSubmissionModal .modal-body').text('Loading...');
  $('#cardSubmissionModal .modal-title').text('Loading...');
  $('#cardSubmissionModalConfirmationButton').addClass('disabled');
  $('#cardSubmissionModalConfirmationButton').prop('disabled', true);

  // modalTimeOutFunction = setTimeout(function(){
  //   $("#cardSubmissionModal").modal('hide');
  // },5000);
}

function loadModalString(){
  var chosenCardString = $('#form-card').val();
  var modalText = '<span class="draft-player">' + dataObject[currentPlayerID].name + '</span> is picking <span class="draft-card">' + chosenCardString + '</span>';

  $('#cardSubmissionModal .modal-body').text('Are you absolutely certain this is correct? Screwing up the draft has dire consequences...');

  if(cardAlreadyPicked(chosenCardString)){
    modalText = 'Something went wrong, this card was already chosen. Please try again';
    clearForm();
  }
  else { //Card can be picked so allow the button to be pressed
    $('#cardSubmissionModalConfirmationButton').removeClass('disabled');
    $('#cardSubmissionModalConfirmationButton').prop('disabled', false);
  }

  $('#cardSubmissionModal .modal-title').html(modalText);
}

function arrayFind(arr, fn) {
    for( var i = 0, len = arr.length; i < len; ++i ) {
        if( fn(arr[i]) ) {
            return i;
        }
    }
    return -1;
}

function cardInBanList(cardToCheck){
  if( $.inArray( chosenCardString, banlist ) >= 0 ) {
    return true;
  }

  return false;
}

function cardAlreadyPicked(cardToCheck){
  cardValidationResult = arrayFind(dataObject.chosenCards, function(v){
      return v.cardName === cardToCheck;
  });

  if(cardValidationResult >= 0){
    return true;
  }

  return false;
}

function updateDataObjectElements(){
  loadPlayers();
  loadCardFeed();
  loadModalString();
}

function loadJSONData(){
  $.ajax({
      url: serviceURL
  }).then(function(data) {
      dataObject = data;
      updateDataObjectElements();
  });
}

$(document).ready(function(){
  loadJSONData();
  catchInput();

  var retrievedData,
      cards;

  var typeaheadLaunch = function(){
    if($('body').hasClass('draft')){
      console.log("Typeahead is launching...");
      var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
          var matches, substringRegex;
          matches = [];
          substrRegex = new RegExp(q, 'i');
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              matches.push(str);
            }
          });

          cb(matches);
        };
      };
      retrievedData = localStorage.getItem("mtgjsonLocation");
      cards = JSON.parse(retrievedData);
      $('#the-basics .typeahead').typeahead({
        hint: false,
        highlight: true,
        minLength: 1
      },
      {
        name: 'cards',
        source: substringMatcher(cards)
      });
    }
  };

//Loads mtgjson object to client side for typeahead.js to reference
    var needRefresh = false;
    var mtgjsonLocation = "http://andrewmaul.com/fun/draftleague2016/js/json/cardNames.json";


    if(localStorage.getItem('mtgjsonLocation')==null){
      needRefresh = true;
    }

    if(needRefresh){
      $.getJSON(mtgjsonLocation, function( data ) {
          // var localjson=[];
          // for (var key in data){
          //     localjson.push(data[key].name);
          // }
          localStorage.setItem('mtgjsonLocation', JSON.stringify(data));
          retrievedData = localStorage.getItem("mtgjsonLocation");
          if(retrievedData != null){
            //initialize typeahead
            typeaheadLaunch();
          }
      });
    }else {
      typeaheadLaunch();
    }
});
