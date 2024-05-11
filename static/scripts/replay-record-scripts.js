is_doubles = false;
var obs;
var sets = [];
var set_page = 0;

const phone_aspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");

$(document).ready(function(){
	obs = new OBSWebSocket();
	url = window.location.href;
	var arr = url.split(":");
	var ip = arr[1].substr(2, this.length);
	obsurl = "ws://" + ip + ":" + obs_port;

	$("#best_of_change").val($("#best_of_change").val() || "5");

	const date = new Date();
	$("#date_change").val($("#date_change").val() || 
		`${date.getFullYear()}-${String(1 + date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);

	load_changes();

	obs.connect(obsurl, obs_password)	
		.then(() => {
			$("#row7").css('display', 'flex');
			obs.call('GetSceneList')
				.then(function(value) {
					$("#scene_box").css('display', 'flex')
					value["scenes"].forEach(function(scene) {
						$("#scenes").append(new Option(scene["sceneName"], scene["sceneName"]));
					})
					$("#scenes").val(value["current-scene"])
				})
		})
		.catch(err => {
        	console.log(err);
    	});

	is_doubles = $(".toggle_doubles").attr("value") !== "true"
	toggle_doubles();
});

function hideColour(player, slot) {
	$("#p" + player + "_colour" + slot).attr("src", "");
	$("#p" + player + "_colour" + slot).hide();
	$("#p" + player + "_stock" + slot).attr("src", "");
	$("#p" + player + "_stock" + slot).hide();
};

function reset_background(player) {
	$(".css" + player).css("background-color", "transparent");
}

function saveTo() {
	player1name = $("#p1_name").val();
	player1pronouns = $("#p1_pronouns").val();

	player1dname = $("#p1d_name").val();
	player1dpronouns = $("#p1d_pronouns").val();

	player2name = $("#p2_name").val();
	player2pronouns = $("#p2_pronouns").val();

	player2dname = $("#p2d_name").val();
	player2dpronouns = $("#p2d_pronouns").val();

	round = $("#round_change").val();
	tournament = $("#tournament_change").val();
	date = $("#date_change").val();
	best_of = parseInt($("#best_of_change").val());

	const blob = new Blob(
		[JSON.stringify({
			Player1: {
				name: player1name,
				pronouns: player1pronouns,
				name_dubs: player1dname,
				pronouns_dubs: player1dpronouns,
			},
			Player2: {
				name: player2name,
				pronouns: player2pronouns,
				name_dubs: player2dname,
				pronouns_dubs: player2dpronouns,
			},
			round,
			tournament,
			date,
			is_doubles: is_doubles,
			best_of
		})],
		{type: 'application/json'}
	);

	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = 'set-details.json';

	const clickHandler = () => {
		setTimeout(() => {
			URL.revokeObjectURL(url);
			removeEventListener('click', clickHandler);
		}, 150);
	};

	a.addEventListener('click', clickHandler, false);
	a.click();
}

function swap_sides() {
	player1name = $("#p1_name").val();
	player1dname = $("#p1d_name").val();
	player2name = $("#p2_name").val();
	player2dname = $("#p2d_name").val();

	player1pronouns = $("#p1_pronouns").val();
	player1dpronouns = $("#p1d_pronouns").val();
	player2pronouns = $("#p2_pronouns").val();
	player2dpronouns = $("#p2d_pronouns").val();

	$("#p1_name").val(player2name);
	$("#p1d_name").val(player2dname);
	$("#p2_name").val(player1name);
	$("#p2d_name").val(player1dname);

	$("#p1_pronouns").val(player2pronouns);
	$("#p1d_pronouns").val(player2dpronouns);
	$("#p2_pronouns").val(player1pronouns);
	$("#p2d_pronouns").val(player1dpronouns);
}

function swap_team(n) {
	player_name = $("#p" + n + "_name").val();
	playerd_name = $("#p" + n + "d_name").val();
	
	player_pronouns = $("#p" + n + "_pronouns").val();
	playerd_pronouns = $("#p" + n + "d_pronouns").val();

	$("#p" + n + "_name").val(playerd_name);
	$("#p" + n + "d_name").val(player_name);

	$("#p" + n + "_pronouns").val(playerd_pronouns);
	$("#p" + n + "d_pronouns").val(player_pronouns);
}

function toggle_doubles() {
	//changing to singles
	if(is_doubles) {
		$(".toggle_doubles").text("Singles ");
		$(".toggle_doubles").append("<i class='fa fa-user'></i>");

		$("#p1d_character_actual").hide();
		$("#p2d_character_actual").hide();
		$(".pronouns.change.doubles").hide();

		//resize for singles
		$("#p1_score_actual").css("grid-column", "3");
		$("#p1_info_actual").css("grid-template-columns", "280px [col-start] 90px [col-start] 50px [col-start]")

		$("#p2_text_actual").css("grid-column", "3");
		$("#p2_info_actual").css("grid-template-columns", "50px [col-start] 90px [col-start] 280px [col-start]")

		$(".swap").hide()
		$(".pronouns_container.change").css("grid-column", "1")
		$(".name_container.change").css("grid-column", "2")
		$(".info.change").css("grid-template-columns", "100px [col-start] 380px [col-start] 240px [col-start] 100px [col-start]");
		$(".name.change").css("width", "340px")

		$("#p2_name").attr("placeholder", "Player 2 name")

		$("#p1d_name").hide();
		$("#p2d_name").hide();
		$("#p1d_name_actual").hide();
		$("#p2d_name_actual").hide();

		is_doubles = false;
	}
	//changing to doubles
	else {
		$(".toggle_doubles").text("Doubles ");
		$(".toggle_doubles").append("<i class='fa fa-user-friends'></i>");

		$("#p1d_character_actual").show();
		$("#p2d_character_actual").show();

		//resize for doubles
		$("#p1_score_actual").css("grid-column", "4");
		$("#p1_info_actual").css("grid-template-columns", "280px [col-start] 45px [col-start] 45px [col-start] 50px [col-start]")

		$("#p2_text_actual").css("grid-column", "4");
		$("#p2_info_actual").css("grid-template-columns", "50px [col-start] 45px [col-start] 45px [col-start] 280px [col-start]")

		$(".swap").show()
		$(".pronouns_container.change").css("grid-column", "2")
		$(".name_container.change").css("grid-column", "3")
		$(".info.change").css("grid-template-columns", "100px [col-start] 80px [col-start] 300px [col-start] 120px [col-start] 120px [col-start] 100px [col-start]");
		$(".name.change").css("width", "260px")
		

		$("#p2_name").attr("placeholder", "Player 1 name")
		$("#p1d_name").show();
		$("#p2d_name").show();

		$("#p1d_name_actual").show();
		$("#p2d_name_actual").show();

		is_doubles = true;
	}
}

function load_changes() {
	$.ajax({
		type: 'GET',
		url: "/info.json",
		data: {},
		success: function(response) {
			$("#p1_name_actual").attr("value", response.Player1["name"])
			$("#p1d_name_actual").attr("value", response.Player1["name_dubs"])
			$("#p1_score_actual").attr("value", response.Player1["score"])
			$("#p2_name_actual").attr("value", response.Player2["name"])
			$("#p2d_name_actual").attr("value", response.Player2["name_dubs"])
			$("#p2_score_actual").attr("value", response.Player2["score"])
			$("#round_actual").attr("value", response.round)
			$("#best_of_actual").attr("value", "Best of " + response.best_of)
			load_char_actual("1", response.Player1["character"], response.Player1["colour"])
			load_char_actual("1d", response.Player1["character_dubs"], response.Player1["colour_dubs"])
			load_char_actual("2", response.Player2["character"], response.Player2["colour"])
			load_char_actual("2d", response.Player2["character_dubs"], response.Player2["colour_dubs"])
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	});
	$.ajax({
		type: 'GET',
		url: '/replay-queue.json',
		success: displayQueue
	});
	setTimeout(load_changes, 1000)
}

function load_char_actual(player, character, colour) {
	const characterParams = new URLSearchParams();
	characterParams.append('character', character);
	characterParams.append('colour', colour);
	const characterString = characterParams.toString();

	const characterActual = $(`#p${player}_character_actual`);
	characterActual.attr("character", character);
	characterActual.attr("colour", colour);

	characterActual.attr("src", '/stock?' + characterString);
}

function record() {
	$.ajax({
		type: 'POST',
		url: "/replay-record",
		data: {},
		success: function(response) {
			console.log(response);
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	});
}

function settings() {
	//window.location.href = "/settings";
	return
}

function auto() {
	window.location.href = "/";
}

/**
 * up : 			direction of page
 */
function showSets() {
	if(up) {
		//check if going over the amount
		max_index = set_page * 5;
		console.log(max_index)
		console.log(sets.length)
		if (max_index < sets.length) {
			set_page++;
		}
		//should never occur but just in case
		else if(set_page > Math.ceil(sets.length/5)) {
			set_page = Math.ceil(sets.length/5);
		}
	} else {
		//limit to 1
		if(set_page > 1) {
			set_page--;
		}
		//should never occur but just in case
		else {
			set_page = 1;
		}
	}

	for(x = 0; x<5; x++) {
		index = x + ((set_page-1)*5);
		if (typeof(sets.length) != "undefined") {
			if(sets.length == 0 || index >= sets.length) {
				$("#set" + (x+1)).css("display", "none");
			} else {
				console.log(sets[index])
				$("#row2r").css("display", "grid")

				$("#set" + (x+1)).css("display", "grid");

				if(sets[index]["player1_doubles"]["name"] != "") {
					$("#set" + (x+1) + "_name1").text(sets[index]["player1"]["name"] + " / " + sets[index]["player1_doubles"]["name"])
				} else {
					$("#set" + (x+1) + "_name1").text(sets[index]["player1"]["name"])
				}
				$("#set" + (x+1) + "_name1").attr("p1_data", JSON.stringify(sets[index]["player1"]))
				$("#set" + (x+1) + "_name1").attr("p2_data", JSON.stringify(sets[index]["player1_doubles"]))

				if(sets[index]["player2_doubles"]["name"] != "") {
					$("#set" + (x+1) + "_name2").text(sets[index]["player2"]["name"] + " / " + sets[index]["player2_doubles"]["name"])
				} else {
					$("#set" + (x+1) + "_name2").text(sets[index]["player2"]["name"])
				}
				$("#set" + (x+1) + "_name2").attr("p1_data", JSON.stringify(sets[index]["player2"]))
				$("#set" + (x+1) + "_name2").attr("p2_data", JSON.stringify(sets[index]["player2_doubles"]))

				$("#set" + (x+1) + "_round").text(sets[index]["round"])
			}
		} else {
			$("#set" + (x+1)).css("display", "none");
		}
	}
	if(sets.length == 0) {
		$("#row2r").css("display", "none")
	}

	//Hide arrows based on page number
	if(set_page == 1 || set_page == 0) {
		$("#page_left").hide()
	} else {
		$("#page_left").show()
	}
	max_index = set_page * 5;
	if(max_index >= sets.length) {
		$("#page_right").hide()
	} else {
		$("#page_right").show()
	}
}

function updateSets(sets) {
	$(".set-button").prop("disabled", true);
	return fetch("/replay-queue-update", {
		method: 'POST',
		headers: { "Content-Type": "application/json"},
		body: JSON.stringify(sets.reduce((acc, cur) => {
			!acc.includes(cur) && acc.push(cur);
			return acc;
		}, []))
	});
}

const onSetSelect = (e) => {
	$("#set-add").prop("disabled", !e.target.value);
};

const addSet = () => {
	const setSelect = $("#set-select");
	updateSets([...sets, setSelect.val()])
		.then(() => setSelect.val(""));
};

const cancelSet = (set, index) => updateSets(sets.filter((s, i) => s !== set || i !== index));

function displayQueue(newSets) {
	if (JSON.stringify(newSets) !== JSON.stringify(sets)) {
		sets = newSets;
		$("#row2r").empty();
		sets.forEach((set, i) => {
			const $delete = $('<button type="button" class="set-button set-delete"><i class="fa fa-times"></i></button>');
			$delete.click(() => cancelSet(set, i));
			
			const $buttons = $('<div class="set-buttons"></div>');
			$buttons.append($delete);
			const $set = $(`<div class="set"><span>${set}</span></div>`);
			$set.append($buttons);
			$("#row2r").append($set);
		});
		$(".set-delete").prop("disabled", false);
	}
}