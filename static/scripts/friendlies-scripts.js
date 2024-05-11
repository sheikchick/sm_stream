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

	load_changes();

	obs.connect(obsurl, obs_password)
		.then(() => {
			$("#scenes").show();
			$("#update_scene").show();
			obs.call(
				'GetSceneList'
			)
			.then(function(value) {
				$("#scene_box").show()
				$("#round_change").css("margin-top", "-35px")
				$(".best_of").css("margin-top", "-30px")
				$(".toggle_doubles").css("margin-top", "-30px")
				$(".update").css("margin-top", "-30px")
				value["scenes"].forEach(function(scene) {
					$("#scenes").append(new Option(scene["sceneName"], scene["sceneName"]));
				})
				$("#scenes").val(value["current-scene"])
		  	})
		})
		.catch(err => {
        	console.log(err);
    });

	if($(".toggle_doubles").attr("value") === "true") {
		is_doubles = false;
	} else {
		is_doubles = true;
	}

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

function update() {
	player1name = $("#p1_name").val();
	player1char = $("#p1_character_actual").attr("character");
	player1colour = $("#p1_character_actual").attr("colour");
	player1pronouns = $("#p1_pronouns").val();

	player2name = $("#p2_name").val();
	player2char = $("#p2_character_actual").attr("character");
	player2colour = $("#p2_character_actual").attr("colour");
	player2pronouns = $("#p2_pronouns").val();

	player3name = $("#p3_name").val();
	player3char = $("#p3_character_actual").attr("character");
	player3colour = $("#p3_character_actual").attr("colour");
	player3pronouns = $("#p3_pronouns").val();

	player4name = $("#p4_name").val();
	player4char = $("#p4_character_actual").attr("character");
	player4colour = $("#p4_character_actual").attr("colour");
	player4pronouns = $("#p4_pronouns").val();

	round = $("#round_change").val();
	caster1 = "";
	caster2 = "";

	const update_controller = new AbortController()
	const update_timeout = setTimeout(() => {
		update_controller.abort()
		$(".update").css("background-color", "#F56262");
		$(".update").css("border-bottom", "3px solid #F53535");
		$(".update").text("Error ");
		$(".update").append('<i class="fa-solid fa-triangle-exclamation"></i>')
		setTimeout(function(){
			$(".update").css("background-color", "#CBFFC7");
			$(".update").css("border-bottom", "3px solid #64B55E");
			$(".update").text("Update ");
			$(".update").append('<i class="fa fa-sync"></i>')
		}, 2000);
	}, 5000);
	fetch("/update", {
		method: 'POST',
		headers: { "Content-Type": "application/json"},
		body: JSON.stringify({
			Player1: {
				name: player1name,
				character: player1char,
				colour: player1colour,
				pronouns: player1pronouns,
			},
			Player2: {
				name: player2name,
				character: player2char,
				colour: player2colour,
				pronouns: player2pronouns,
			},
			Player3: {
				name: player3name,
				character: player3char,
				colour: player3colour,
				pronouns: player3pronouns,
			},
			Player4: {
				name: player4name,
				character: player4char,
				colour: player4colour,
				pronouns: player4pronouns,
			},
			active_players: ['Player1', 'Player2'],
			round: round,
			caster1: caster1,
			caster2: caster2,
			is_doubles: is_doubles,
			best_of: best_of_value
		}),
		signal: update_controller.signal
	}).then(() => {
		clearTimeout(update_timeout)
		$(".update").css("background-color", "#55F76B");
		$(".update").css("border-bottom", "3px solid #349641");
		$(".update").text("Updated ");
		$(".update").append('<i class="fa-solid fa-thumbs-up"></i>')
		setTimeout(function(){
			$(".update").css("background-color", "#CBFFC7");
			$(".update").css("border-bottom", "3px solid #64B55E");
			$(".update").text("Update ");
			$(".update").append('<i class="fa fa-sync"></i>')
		}, 2000);
	})
}

function swap_p1_p2() {
	player1name = $("#p1_name").val();
	player2name = $("#p2_name").val();

	player1pronouns = $("#p1_pronouns").val();
	player2pronouns = $("#p2_pronouns").val();

	$("#p1_name").val(player2name);
	$("#p2_name").val(player1name);

	$("#p1_pronouns").val(player2pronouns);
	$("#p2_pronouns").val(player1pronouns);
}

function swap_p2_p3() {
	player2name = $("#p2_name").val();
	player3name = $("#p3_name").val();

	player2pronouns = $("#p2_pronouns").val();
	player3pronouns = $("#p3_pronouns").val();

	$("#p2_name").val(player3name);
	$("#p3_name").val(player2name);

	$("#p2_pronouns").val(player3pronouns);
	$("#p3_pronouns").val(player2pronouns);
}

function swap_p3_p4() {
	player3name = $("#p3_name").val();
	player4name = $("#p4_name").val();

	player3pronouns = $("#p3_pronouns").val();
	player4pronouns = $("#p4_pronouns").val();

	$("#p3_name").val(player4name);
	$("#p4_name").val(player3name);

	$("#p3_pronouns").val(player4pronouns);
	$("#p4_pronouns").val(player3pronouns);
}

function toggle_doubles() {
	//changing to singles
	if(is_doubles) {
		$(".toggle_doubles").text("Singles ");
		$(".toggle_doubles").append("<i class='fa fa-user'></i>");

		$("#p1d_character_actual").hide();
		$("#p2d_character_actual").hide();
		$("#p1d_character_change").hide();
		$("#p2d_character_change").hide();
		$(".pronouns.change.doubles").hide();

		//resize for singles
		$("#p1_score_actual").css("grid-column", "3");
		$("#p1_info_actual").css("grid-template-columns", "280px [col-start] 90px [col-start] 50px [col-start]")

		$("#p2_text_actual").css("grid-column", "3");
		$("#p2_info_actual").css("grid-template-columns", "50px [col-start] 90px [col-start] 280px [col-start]")

		$(".swap").hide()
		$(".pronouns_container.change").css("grid-column", "1")
		$(".name_container.change").css("grid-column", "2")
		$("#p1_character_change").css("grid-column", "3")
		$("#p2_character_change").css("grid-column", "3")
		$(".score.change").css("grid-column", "4")
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
		$("#p1d_character_change").show();
		$("#p2d_character_change").show();
		$(".pronouns.change.doubles").show();

		//resize for doubles
		$("#p1_score_actual").css("grid-column", "4");
		$("#p1_info_actual").css("grid-template-columns", "280px [col-start] 45px [col-start] 45px [col-start] 50px [col-start]")

		$("#p2_text_actual").css("grid-column", "4");
		$("#p2_info_actual").css("grid-template-columns", "50px [col-start] 45px [col-start] 45px [col-start] 280px [col-start]")

		$(".swap").show()
		$(".pronouns_container.change").css("grid-column", "2")
		$(".name_container.change").css("grid-column", "3")
		$("#p1_character_change").css("grid-column", "4")
		$("#p2_character_change").css("grid-column", "4")
		$(".score.change").css("grid-column", "6")
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
			$("#p2_name_actual").attr("value", response.Player2["name"])
			$("#p3_name_actual").attr("value", response.Player3["name"])
			$("#p4_name_actual").attr("value", response.Player4["name"])
			$("#round_actual").attr("value", response.round)
			load_char_actual("1", response.Player1["character"], response.Player1["colour"])
			load_char_actual("2", response.Player2["character"], response.Player2["colour"])
			load_char_actual("3", response.Player3["character"], response.Player3["colour"])
			load_char_actual("4", response.Player4["character"], response.Player4["colour"])
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
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
	$(`#p${player}_character_change`).attr("src", "/csp?" + characterString);
}

function update_scene() {
	newScene = $("#scenes :selected").text();
	obs.call(
		'SetCurrentProgramScene', {'sceneName': newScene}
	)
	.then(function(value) {
		console.log("Changed scene to '" + newScene + "'");
	})
}

function settings() {
	//window.location.href = "/settings";
	return
}

function manual() {
	window.location.href = "/manual";
}

function auto() {
	window.location.href = "/";
}