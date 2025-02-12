sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	'sap/ui/Device',
], function (Controller, JSONModel, BusyIndicator, Device) {
	"use strict";

	return Controller.extend("frontend.controller.Home", {
		onInit: function () {
			BusyIndicator.show();
			var oView = this.getView();
				// set device model
			var deviceModel = new JSONModel({
				isNoTouch : !Device.support.touch,
				isTouch : Device.support.touch
			});
			deviceModel.setDefaultBindingMode("OneWay");
			oView.setModel(deviceModel, "device");
			
			var oDistrictwiseModel = new JSONModel(),
				oStatewiseModel = new JSONModel(),
				oSpotModel = new JSONModel(),
				viewDataModel = new JSONModel({
					"totalData": {},
					"data": ""
					// "deltaCountriesData": ""
				}),
				oView = this.getView();
			oView.setModel(oSpotModel, "SpotModel");
			oView.setModel(viewDataModel)
			oDistrictwiseModel.loadData("https://api.covid19india.org/state_district_wise.json");
			oDistrictwiseModel.attachRequestCompleted(function (oEvent) {
				this.oDtrictwiseData = oEvent.getSource().oData;
				delete this.oDtrictwiseData["Unknown"];
				var akeys = Object.keys(this.oDtrictwiseData);
				for (var i = 0; i < akeys.length; i++) {
					var aDistricts = [],
						aDistrictKeys = [],
						oDistrictData = this.oDtrictwiseData[akeys[i]].districtData;
					aDistrictKeys = Object.keys(oDistrictData);
					for (var j = 0; j < aDistrictKeys.length; j++) {
						var oDist = {
							"district": aDistrictKeys[j],
							"confirmed": oDistrictData[aDistrictKeys[j]].confirmed
						}
						aDistricts.push(oDist)
					}
					this.oDtrictwiseData[akeys[i]].districts = aDistricts;
				}
				oStatewiseModel.loadData("https://api.covid19india.org/data.json");
				oStatewiseModel.attachRequestCompleted(function (oEvent) {
					// var deltaCountries = oEvent.getSource().oData.key_values[0],
					var aStatewiseData = oEvent.getSource().oData.statewise,
						oTotal = aStatewiseData.shift(),
						aSpots = [],
						sType = "",
						oStatePosMap = {
							"Delhi": "77.216721;28.644800;0",
							"Kerala": "76.2711;10.8505;0",
							"Telangana": "79.0193;18.1124;0",
							"Rajasthan": "74.2179;27.0238;0",
							"Haryana": "76.0856;29.0588;0",
							"Uttar Pradesh": "80.9462;26.8467;0",
							"Ladakh": "77.577049;34.152588;0",
							"Tamil Nadu": "78.6569;11.1271;0",
							"Jammu and Kashmir": "76.5762;33.7782;0",
							"Karnataka": "75.7139;15.3173;0",
							"Maharashtra": "75.7139;19.7515;0",
							"Punjab": "75.3412;31.1471;0",
							"Andhra Pradesh": "79.7400;15.9129;0",
							"Uttarakhand": "79.0193;30.0668;0",
							"Odisha": "85.0985;20.9517;0",
							"Puducherry": "79.8083;11.9416;0",
							"West Bengal": "87.8550;22.9868;0",
							"Chandigarh": "76.7794;30.7333;0",
							"Chhattisgarh": "81.8661;21.2787;0",
							"Gujarat": "71.1924;22.2587;0",
							"Himachal Pradesh": "77.1734;31.1048;0",
							"Madhya Pradesh": "78.6569;22.9734;0",
							"Bihar": "85.3131;25.0961;0",
							"Manipur": "93.9063;24.6637;0",
							"Mizoram": "92.9376;23.1645;0",
							"Goa": "74.1240;15.2993;0",
							"Andaman and Nicobar Islands": "92.6586;11.7401;0"
						};
					aStatewiseData = aStatewiseData.filter(function (item) {
						return item["active"] != 0
					})
					for (var i = 0; i < aStatewiseData.length; i++) {
						if (aStatewiseData[i].active != 0 && aStatewiseData[i].active != null && aStatewiseData[i].active != undefined) {
							aStatewiseData[i]['districts'] = this.oDtrictwiseData[aStatewiseData[i].state]['districts'];
							if (aStatewiseData[i].confirmed >= 100) {
								sType = "Error"
							} else if (aStatewiseData[i].confirmed <= 100 && aStatewiseData[i].confirmed >= 50) {
								sType = "Warning"
							} else {
								sType = "Inactive"
							}
							aSpots.push({
								"pos": oStatePosMap[aStatewiseData[i].state],
								"tooltip": aStatewiseData[i].state,
								"type": sType,
								"text": aStatewiseData[i].confirmed,
								"districts":this.oDtrictwiseData[aStatewiseData[i].state]['districts'],
								"active": aStatewiseData[i].active,
								"confirmed": aStatewiseData[i].confirmed,
								"recovered": aStatewiseData[i].recovered,
								"deaths": aStatewiseData[i].deaths,
								
							});
						}
					}
					var sLastUpdated = oTotal.lastupdatedtime;
					this.getView().byId("idLastUpdated").setText(" " + sLastUpdated + " (IST)");
					// var aLastUpdated = sLastUpdated.split(" ")
					// var aDate = aLastUpdated[0].split("/")
					// var aTime = aLastUpdated[0].split(":")
					// var oLastUpdatedDate = new Date(aDate[2], aDate[1] - 1, aDate[0], aTime[0], aTime[1], aTime[2])
					// var oDate = new Date()
					aStatewiseData.push(oTotal);
					this.getView().getModel("SpotModel").setData(aSpots);
					this.getView().getModel().setProperty("/totalData", aStatewiseData);
					this.getView().getModel().setProperty("/data", oTotal);
					// this.getView().getModel().setProperty("/deltaCountriesData", deltaCountries);
					BusyIndicator.hide();
				}.bind(this))
			}.bind(this))
			this.byId("idHTMLContent").setContent("<div class='container'><div id='modal1' class='modal'><canvas id='modal-chart'></canvas></div><div class='widget'><div class='chat_header'><span class='chat_header_title'>COVID-19 Assistance</span><span class='dropdown-trigger' href='#' data-target='dropdown1'><i class='material-icons'>more_vert</i></span><ul id='dropdown1' class='dropdown-content'><li><a href='#' id='clear'>Clear</a></li><li><a href='#' id='restart'>Restart</a></li><li><a href='#' id='close' >Close</a></li></ul></div><div class='chats' id='chats'><div class='clearfix'></div></div><div class='keypad'><textarea id='userInput' placeholder='Type a message...' class='usrInput'></textarea><div id='sendButton'><i class='fa fa-paper-plane' aria-hidden='true'></i></div></div></div><div class='profile_div' id='profile_div'><img class='imgProfile' src='/img/botAvatar2.png' /</div></div>")
		},
		onAfterRendering: function(){
			
					
			// ========================== greet user proactively ========================
$(document).ready(function () {

	//drop down menu for close, restart conversation & clear the chats.
	$('.dropdown-trigger').dropdown();

	//initiate the modal for displaying the charts, if you dont have charts, then you comment the below line
	//$('.modal').modal();

	//enable this if u have configured the bot to start the conversation. 
	// showBotTyping();
	// $("#userInput").prop('disabled', true);
    
    $(".profile_div").toggle();
	$(".widget").toggle();
    
	//global variables
	action_name = "action_greet_user";
	user_id = "Mahesh";

	//if you want the bot to start the conversation
	action_trigger();

			// ========================== restart conversation ========================
function restartConversation() {
	$("#userInput").prop('disabled', true);
	//destroy the existing chart
	//$('.collapsible').remove();

	if (typeof chatChart !== 'undefined') { chatChart.destroy(); }

	$(".chart-container").remove();
	if (typeof modalChart !== 'undefined') { modalChart.destroy(); }
	$(".chats").html("");
	$(".usrInput").val("");
	send("/restart");
}

// ========================== let the bot start the conversation ========================
function action_trigger() {

	// send an event to the bot, so that bot can start the conversation by greeting the user
var url = document.location.protocol + "//" + document.location.hostname;
	$.ajax({
    	url: url + "/rasa/webhooks/rest/webhook",
		//url: url + "/rasa/conversations/${user_id}/execute",
		//url: url + ":5005/conversations/${user_id}/execute",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ message: "Hi", sender: user_id }),
		//data: JSON.stringify({ "name": action_name, "policy": "MappingPolicy", "confidence": "0.98" }),
		success: function (botResponse, status) {
			console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

			//if (botResponse.hasOwnProperty("messages")) {
				//setBotResponse(botResponse.messages);
			//}
			setBotResponse(botResponse);
			$("#userInput").prop('disabled', false);
		},
		error: function (xhr, textStatus, errorThrown) {

			// if there is no response from rasa server
			setBotResponse("");
			console.log("Error from bot end: ", textStatus);
			$("#userInput").prop('disabled', false);
			
			
		}
	});
}

//=====================================	user enter or sends the message =====================
$(".usrInput").on("keyup keypress", function (e) {
	var keyCode = e.keyCode || e.which;

	var text = $(".usrInput").val();
	if (keyCode === 13) {

		if (text == "" || $.trim(text) == "") {
			e.preventDefault();
			return false;
		} else {
			//destroy the existing chart, if yu are not using charts, then comment the below lines
			$('.collapsible').remove();
			if (typeof chatChart !== 'undefined') { chatChart.destroy(); }

			$(".chart-container").remove();
			if (typeof modalChart !== 'undefined') { modalChart.destroy(); }



			$("#paginated_cards").remove();
			$(".suggestions").remove();
			$(".quickReplies").remove();
			$(".usrInput").blur();
			setUserResponse(text);
			send(text);
			e.preventDefault();
			return false;
		}
	}
});

$("#sendButton").on("click", function (e) {
	var text = $(".usrInput").val();
	if (text == "" || $.trim(text) == "") {
		e.preventDefault();
		return false;
	}
	else {
		//destroy the existing chart

		//chatChart.destroy();
		$(".chart-container").remove();
		if (typeof modalChart !== 'undefined') { modalChart.destroy(); }

		$(".suggestions").remove();
		$("#paginated_cards").remove();
		$(".quickReplies").remove();
		$(".usrInput").blur();
		setUserResponse(text);
		send(text);
		e.preventDefault();
		return false;
	}
})

//==================================== Set user response =====================================
function setUserResponse(message) {
	var UserResponse = '<img class="userAvatar" src=' + "/img/userAvatar.jpg" + '><p class="userMsg">' + message + ' </p><div class="clearfix"></div>';
	$(UserResponse).appendTo(".chats").show("slow");

	$(".usrInput").val("");
	scrollToBottomOfResults();
	showBotTyping();
	$(".suggestions").remove();
}

//=========== Scroll to the bottom of the chats after new message has been added to chat ======
function scrollToBottomOfResults() {

	var terminalResultsDiv = document.getElementById("chats");
	terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
}

//============== send the user message to rasa server =============================================
function send(message) {
	var url = document.location.protocol + "//" + document.location.hostname;
	$.ajax({
		url: url + "/rasa/webhooks/rest/webhook",
		//url: url + ":5005/webhooks/rest/webhook",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ message: message, sender: user_id }),
		success: function (botResponse, status) {
			console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

			// if user wants to restart the chat and clear the existing chat contents
			if (message.toLowerCase() == '/restart') {
				$("#userInput").prop('disabled', false);

				//if you want the bot to start the conversation after restart
				// action_trigger();
				return;
			}
			setBotResponse(botResponse);

		},
		error: function (xhr, textStatus, errorThrown) {

			if (message.toLowerCase() == '/restart') {
				// $("#userInput").prop('disabled', false);

				//if you want the bot to start the conversation after the restart action.
				// action_trigger();
				// return;
			}

			// if there is no response from rasa server
			setBotResponse("");
			console.log("Error from bot end: ", textStatus);
		}
	});
}

//=================== set bot response in the chats ===========================================
function setBotResponse(response) {

	//display bot response after 500 milliseconds
	setTimeout(function () {
		hideBotTyping();
		if (response.length < 1) {
			//if there is no response from Rasa, send  fallback message to the user
			var fallbackMsg = "Currently, I don't have a data for it, please try again later!!!";

			var BotResponse = '<img class="botAvatar" src="/img/botAvatar2.png"/><p class="botMsg">' + fallbackMsg + '</p><div class="clearfix"></div>';

			$(BotResponse).appendTo(".chats").hide().fadeIn(1000);
			scrollToBottomOfResults();
		}
		else {

			//if we get response from Rasa
			for (var i = 0; i < response.length; i++) {

				//check if the response contains "text"
				if (response[i].hasOwnProperty("text")) {
					var BotResponse = '<img class="botAvatar" src="/img/botAvatar2.png"/><p class="botMsg">' + response[i].text + '</p><div class="clearfix"></div>';
					$(BotResponse).appendTo(".chats").hide().fadeIn(1000);
				}

				//check if the response contains "images"
				if (response[i].hasOwnProperty("image")) {
					var BotResponse = '<div class="singleCard">' + '<img class="imgcard" src="' + response[i].image + '">' + '</div><div class="clearfix">';
					$(BotResponse).appendTo(".chats").hide().fadeIn(1000);
				}


				//check if the response contains "buttons" 
				if (response[i].hasOwnProperty("buttons")) {
					addSuggestion(response[i].buttons);
				}

				//check if the response contains "custom" message  
				if (response[i].hasOwnProperty("custom")) {

					//check if the custom payload type is "quickReplies"
					if (response[i].custom.payload == "quickReplies") {
						quickRepliesData = response[i].custom.data;
						showQuickReplies(quickRepliesData);
						return;
					}

					//check if the custom payload type is "dropDown"
					if (response[i].custom.payload == "dropDown") {
						dropDownData = response[i].custom.data;
						renderDropDwon(dropDownData);
						return;
					}

					//check if the custom payload type is "location"
					if (response[i].custom.payload == "location") {
						$("#userInput").prop('disabled', true);
						getLocation();
						scrollToBottomOfResults();
						return;
					}

					//check if the custom payload type is "cardsCarousel"
					if (response[i].custom.payload == "cardsCarousel") {
						restaurantsData = (response[i].custom.data)
						showCardsCarousel(restaurantsData);
						return;
					}

					//check if the custom payload type is "chart"
					if (response[i].custom.payload == "chart") {

						// sample format of the charts data:
						// var chartData = { "title": "Leaves", "labels": ["Sick Leave", "Casual Leave", "Earned Leave", "Flexi Leave"], "backgroundColor": ["#36a2eb", "#ffcd56", "#ff6384", "#009688", "#c45850"], "chartsData": [5, 10, 22, 3], "chartType": "pie", "displayLegend": "true" }

						//store the below parameters as global variable, 
						// so that it can be used while displaying the charts in modal.
						chartData = (response[i].custom.data)
						title = chartData.title;
						labels = chartData.labels;
						backgroundColor = chartData.backgroundColor;
						chartsData = chartData.chartsData;
						chartType = chartData.chartType;
						displayLegend = chartData.displayLegend;

						// pass the above variable to createChart function
						createChart(title, labels, backgroundColor, chartsData, chartType, displayLegend)
						return;
					}

					//check of the custom payload type is "collapsible"
					if (response[i].custom.payload == "collapsible") {
						data = (response[i].custom.data);
						//pass the data variable to createCollapsible function
						createCollapsible(data);
					}
				}
			}
			scrollToBottomOfResults();
		}
	}, 500);
}

//====================================== Toggle chatbot =======================================
$("#profile_div").click(function () {
	$(".profile_div").toggle();
	$(".widget").toggle();
});

//====================================== DropDown ==================================================
//render the dropdown messageand handle user selection
function renderDropDwon(data) {
	var options = "";
	for (i = 0; i < data.length; i++) {
		options += '<option value="' + data[i].value + '">' + data[i].label + '</option>'
	}
	var select = '<div class="dropDownMsg"><select class="browser-default dropDownSelect"> <option value="" disabled selected>Choose your option</option>' + options + '</select></div>'
	$(".chats").append(select);

	//add event handler if user selects a option.
	$("select").change(function () {
		var value = ""
		var label = ""
		$("select option:selected").each(function () {
			label += $(this).text();
			value += $(this).val();
		});

		setUserResponse(label);
		send(value);
		$(".dropDownMsg").remove();
	});
}

//====================================== Suggestions ===========================================

function addSuggestion(textToAdd) {
	setTimeout(function () {
		var suggestions = textToAdd;
		var suggLength = textToAdd.length;
		$(' <div class="singleCard"> <div class="suggestions"><div class="menu"></div></div></diV>').appendTo(".chats").hide().fadeIn(1000);
		// Loop through suggestions
		for (i = 0; i < suggLength; i++) {
			$('<div class="menuChips" data-payload=\'' + (suggestions[i].payload) + '\'>' + suggestions[i].title + "</div>").appendTo(".menu");
		}
		scrollToBottomOfResults();
	}, 1000);
}

// on click of suggestions, get the value and send to rasa
$(document).on("click", ".menu .menuChips", function () {
	var text = this.innerText;
	var payload = this.getAttribute('data-payload');
	console.log("payload: ", this.getAttribute('data-payload'))
	setUserResponse(text);
	send(payload);

	//delete the suggestions once user click on it
	$(".suggestions").remove();

});

//====================================== functions for drop-down menu of the bot  =========================================

//restart function to restart the conversation.
$("#restart").click(function () {
	restartConversation()
});

//clear function to clear the chat contents of the widget.
$("#clear").click(function () {
	$(".chats").fadeOut("normal", function () {
		$(".chats").html("");
		$(".chats").fadeIn();
	});
});

//close function to close the widget.
$("#close").click(function () {
	$(".profile_div").toggle();
	$(".widget").toggle();
	scrollToBottomOfResults();
});

//====================================== Cards Carousel =========================================

function showCardsCarousel(cardsToAdd) {
	var cards = createCardsCarousel(cardsToAdd);

	$(cards).appendTo(".chats").show();


	if (cardsToAdd.length <= 2) {
		$(".cards_scroller>div.carousel_cards:nth-of-type(" + i + ")").fadeIn(3000);
	}
	else {
		for (var i = 0; i < cardsToAdd.length; i++) {
			$(".cards_scroller>div.carousel_cards:nth-of-type(" + i + ")").fadeIn(3000);
		}
		$(".cards .arrow.prev").fadeIn("3000");
		$(".cards .arrow.next").fadeIn("3000");
	}


	scrollToBottomOfResults();

	const card = document.querySelector("#paginated_cards");
	const card_scroller = card.querySelector(".cards_scroller");
	var card_item_size = 225;

	card.querySelector(".arrow.next").addEventListener("click", scrollToNextPage);
	card.querySelector(".arrow.prev").addEventListener("click", scrollToPrevPage);


	// For paginated scrolling, simply scroll the card one item in the given
	// direction and let css scroll snaping handle the specific alignment.
	function scrollToNextPage() {
		card_scroller.scrollBy(card_item_size, 0);
	}
	function scrollToPrevPage() {
		card_scroller.scrollBy(-card_item_size, 0);
	}

}

function createCardsCarousel(cardsData) {

	var cards = "";

	for (i = 0; i < cardsData.length; i++) {
		title = cardsData[i].name;
		ratings = Math.round((cardsData[i].ratings / 5) * 100) + "%";
		data = cardsData[i];
		item = '<div class="carousel_cards in-left">' + '<img class="cardBackgroundImage" src="' + cardsData[i].image + '"><div class="cardFooter">' + '<span class="cardTitle" title="' + title + '">' + title + "</span> " + '<div class="cardDescription">' + '<div class="stars-outer">' + '<div class="stars-inner" style="width:' + ratings + '" ></div>' + "</div>" + "</div>" + "</div>" + "</div>";

		cards += item;
	}

	var cardContents = '<div id="paginated_cards" class="cards"> <div class="cards_scroller">' + cards + '  <span class="arrow prev fa fa-chevron-circle-left "></span> <span class="arrow next fa fa-chevron-circle-right" ></span> </div> </div>';

	return cardContents;
}

//====================================== Quick Replies ==================================================

function showQuickReplies(quickRepliesData) {
	var chips = ""
	for (i = 0; i < quickRepliesData.length; i++) {
		var chip = '<div class="chip" data-payload=\'' + (quickRepliesData[i].payload) + '\'>' + quickRepliesData[i].title + '</div>'
		chips += (chip)
	}

	var quickReplies = '<div class="quickReplies">' + chips + '</div><div class="clearfix"></div>'
	$(quickReplies).appendTo(".chats").fadeIn(1000);
	scrollToBottomOfResults();
	const slider = document.querySelector('.quickReplies');
	let isDown = false;
	let startX;
	let scrollLeft;

	slider.addEventListener('mousedown', (e) => {
		isDown = true;
		slider.classList.add('active');
		startX = e.pageX - slider.offsetLeft;
		scrollLeft = slider.scrollLeft;
	});
	slider.addEventListener('mouseleave', () => {
		isDown = false;
		slider.classList.remove('active');
	});
	slider.addEventListener('mouseup', () => {
		isDown = false;
		slider.classList.remove('active');
	});
	slider.addEventListener('mousemove', (e) => {
		if (!isDown) return;
		e.preventDefault();
		const x = e.pageX - slider.offsetLeft;
		const walk = (x - startX) * 3; //scroll-fast
		slider.scrollLeft = scrollLeft - walk;
	});

}

// on click of quickreplies, get the value and send to rasa
$(document).on("click", ".quickReplies .chip", function () {
	var text = this.innerText;
	var payload = this.getAttribute('data-payload');
	console.log("chip payload: ", this.getAttribute('data-payload'))
	setUserResponse(text);
	send(payload);

	//delete the quickreplies
	$(".quickReplies").remove();

});

//====================================== Get User Location ==================================================
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getUserPosition, handleLocationAccessError);
	} else {
		response = "Geolocation is not supported by this browser.";
	}
}

function getUserPosition(position) {
	response = "Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude;
	console.log("location: ", response);

	//here you add the intent which you want to trigger 
	response = '/inform{"latitude":' + position.coords.latitude + ',"longitude":' + position.coords.longitude + '}';
	$("#userInput").prop('disabled', false);
	send(response);
	showBotTyping();
}

function handleLocationAccessError(error) {

	switch (error.code) {
		case error.PERMISSION_DENIED:
			console.log("User denied the request for Geolocation.")
			break;
		case error.POSITION_UNAVAILABLE:
			console.log("Location information is unavailable.")
			break;
		case error.TIMEOUT:
			console.log("The request to get user location timed out.")
			break;
		case error.UNKNOWN_ERROR:
			console.log("An unknown error occurred.")
			break;
	}

	response = '/inform{"user_location":"deny"}';
	send(response);
	showBotTyping();
	$(".usrInput").val("");
	$("#userInput").prop('disabled', false);


}

//======================================bot typing animation ======================================
function showBotTyping() {

	var botTyping = '<img class="botAvatar" id="botAvatar" src="/img/botAvatar2.png"/><div class="botTyping">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div>'
	$(botTyping).appendTo(".chats");
	$('.botTyping').show();
	scrollToBottomOfResults();
}

function hideBotTyping() {
	$('#botAvatar').remove();
	$('.botTyping').remove();
}

//====================================== Collapsible =========================================

// function to create collapsible,
// for more info refer:https://materializecss.com/collapsible.html
function createCollapsible(data) {
	//sample data format:
	//var data=[{"title":"abc","description":"xyz"},{"title":"pqr","description":"jkl"}]
	list = "";
	for (i = 0; i < data.length; i++) {
		item = '<li>' +
			'<div class="collapsible-header">' + data[i].title + '</div>' +
			'<div class="collapsible-body"><span>' + data[i].description + '</span></div>' +
			'</li>'
		list += item;
	}
	var contents = '<ul class="collapsible">' + list + '</uL>';
	$(contents).appendTo(".chats");

	// initialize the collapsible
	$('.collapsible').collapsible();
	scrollToBottomOfResults();
}


//====================================== creating Charts ======================================

//function to create the charts & render it to the canvas
function createChart(title, labels, backgroundColor, chartsData, chartType, displayLegend) {

	//create the ".chart-container" div that will render the charts in canvas as required by charts.js,
	// for more info. refer: https://www.chartjs.org/docs/latest/getting-started/usage.html
	var html = '<div class="chart-container"> <span class="modal-trigger" id="expand" title="expand" href="#modal1"><i class="fa fa-external-link" aria-hidden="true"></i></span> <canvas id="chat-chart" ></canvas> </div> <div class="clearfix"></div>'
	$(html).appendTo('.chats');

	//create the context that will draw the charts over the canvas in the ".chart-container" div
	var ctx = $('#chat-chart');

	// Once you have the element or context, instantiate the chart-type by passing the configuration,
	//for more info. refer: https://www.chartjs.org/docs/latest/configuration/
	var data = {
		labels: labels,
		datasets: [{
			label: title,
			backgroundColor: backgroundColor,
			data: chartsData,
			fill: false
		}]
	};
	var options = {
		title: {
			display: true,
			text: title
		},
		layout: {
			padding: {
				left: 5,
				right: 0,
				top: 0,
				bottom: 0
			}
		},
		legend: {
			display: displayLegend,
			position: "right",
			labels: {
				boxWidth: 5,
				fontSize: 10
			}
		}
	}

	//draw the chart by passing the configuration
	chatChart = new Chart(ctx, {
		type: chartType,
		data: data,
		options: options
	});

	scrollToBottomOfResults();
}

// on click of expand button, get the chart data from gloabl variable & render it to modal
$(document).on("click", "#expand", function () {

	//the parameters are declared gloabally while we get the charts data from rasa.
	createChartinModal(title, labels, backgroundColor, chartsData, chartType, displayLegend)
});

//function to render the charts in the modal
function createChartinModal(title, labels, backgroundColor, chartsData, chartType, displayLegend) {
	//if you want to display the charts in modal, make sure you have configured the modal in index.html
	//create the context that will draw the charts over the canvas in the "#modal-chart" div of the modal
	var ctx = $('#modal-chart');

	// Once you have the element or context, instantiate the chart-type by passing the configuration,
	//for more info. refer: https://www.chartjs.org/docs/latest/configuration/
	var data = {
		labels: labels,
		datasets: [{
			label: title,
			backgroundColor: backgroundColor,
			data: chartsData,
			fill: false
		}]
	};
	var options = {
		title: {
			display: true,
			text: title
		},
		layout: {
			padding: {
				left: 5,
				right: 0,
				top: 0,
				bottom: 0
			}
		},
		legend: {
			display: displayLegend,
			position: "right"
		},

	}

	modalChart = new Chart(ctx, {
		type: chartType,
		data: data,
		options: options
	});

}

})
		},
		onPressState: function (oEvent) {
			var oSource = oEvent.getSource(),
				sPath = oSource.getBindingContextPath(),
				aDistrictData = oSource.getBindingContext().getObject();
			if (aDistrictData.state !== "Total") {
				if (!this.oDistrictsDialog) {
					this.oDistrictsDialog = sap.ui.xmlfragment(this.getView().getId(), "frontend.fragment.Districts",
						this);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDistrictsDialog);
					this.getView().addDependent(this.oDistrictsDialog);
				}
				this.oDistrictsDialog.bindElement({
					path: sPath
				});
				this.oDistrictsDialog.setTitle(aDistrictData.state);
				this.oDistrictsDialog.open();
			}
		},
		onDistrictDialogClose: function () {
			this.oDistrictsDialog.close();
		},
		onMapDistrictDialogClose: function(){
			this.oMapDistrictsDialog.close();
		},
		onClickSpot: function(oEvent){
			var oSource = oEvent.getSource(),
				sPath = oSource.getBindingContext("SpotModel").getPath(),
				aDistrictData = oSource.getBindingContext("SpotModel").getObject();
			if (aDistrictData.state !== "Total") {
				if (!this.oMapDistrictsDialog) {
					this.oMapDistrictsDialog = sap.ui.xmlfragment(this.getView().getId(), "frontend.fragment.MapDistricts",
						this);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oMapDistrictsDialog);
					this.getView().addDependent(this.oMapDistrictsDialog);
				}
				this.oMapDistrictsDialog.bindElement({
					path: sPath,
					model: "SpotModel"
				});
				this.oMapDistrictsDialog.setTitle(aDistrictData.tooltip);
				this.oMapDistrictsDialog.open();
			}
		}
	});
});