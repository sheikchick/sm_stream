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
	$(".char_colour").hide();

	load_changes();

	change_best_of(best_of_value);

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

	if($(".toggle_doubles").attr("value") === "true") {
		is_doubles = false;
	} else {
		is_doubles = true;
	}

	toggle_doubles();

	manual_stuff();
});

function hide(player, slot) {
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
	player1char = $("#p1_character_change").attr("character");
	player1colour = $("#p1_character_change").attr("colour");
	player1pronouns = $("#p1_pronouns").val();

	player1dname = $("#p1d_name").val();
	player1dchar = $("#p1d_character_change").attr("character");
	player1dcolour = $("#p1d_character_change").attr("colour");
	player1dpronouns = $("#p1d_pronouns").val();

	player1score = parseInt($("#p1_score_change").val());

	player2name = $("#p2_name").val();
	player2char = $("#p2_character_change").attr("character");
	player2colour = $("#p2_character_change").attr("colour");
	player2pronouns = $("#p2_pronouns").val();

	player2dname = $("#p2d_name").val();
	player2dchar = $("#p2d_character_change").attr("character");
	player2dcolour = $("#p2d_character_change").attr("colour");
	player2dpronouns = $("#p2d_pronouns").val();

	player2score = parseInt($("#p2_score_change").val());
	round = $("#round_change").val();
	tournament = $("#tournament_change").val();
	caster1 = "";
	caster2 = "";

	console.log(JSON.stringify({
		Player1: {
			name: player1name,
			character: player1char,
			colour: player1colour,
			pronouns: player1pronouns,
			name_dubs: player1dname,
			character_dubs : player1dchar,
			colour_dubs: player1dcolour,
			pronouns_dubs: player1dpronouns,
			score: player1score,
		},
		Player2: {
			name: player2name,
			character: player2char,
			colour: player2colour,
			pronouns: player2pronouns,
			name_dubs: player2dname,
			character_dubs : player2dchar,
			colour_dubs: player2dcolour,
			pronouns_dubs: player2dpronouns,
			score: player2score,
		},
		round: round,
		tournament,
		caster1: caster1,
		caster2: caster2,
		is_doubles: is_doubles,
		best_of: best_of_value
	}))

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
				name_dubs: player1dname,
				character_dubs : player1dchar,
				colour_dubs: player1dcolour,
				pronouns_dubs: player1dpronouns,
				score: player1score,
			},
			Player2: {
				name: player2name,
				character: player2char,
				colour: player2colour,
				pronouns: player2pronouns,
				name_dubs: player2dname,
				character_dubs : player2dchar,
				colour_dubs: player2dcolour,
				pronouns_dubs: player2dpronouns,
				score: player2score,
			},
			round: round,
			tournament,
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
		load_changes();
	})
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
		type: 'POST',
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
			load_char("1", response.Player1["character"], response.Player1["colour"])
			load_char("1d", response.Player1["character_dubs"], response.Player1["colour_dubs"])
			load_char("2", response.Player2["character"], response.Player2["colour"])
			load_char("2d", response.Player2["character_dubs"], response.Player2["colour_dubs"])
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
	update_record_button();
}

function load_char(player, character, colour) {
	$("#p" + player + "_character_actual").attr("src", "static/img/stock_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_character_change").attr("src", "static/img/csp_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_character_actual").attr("character", character);
	$("#p" + player + "_character_actual").attr("colour", colour);
}

function update_record_button() {
	return obs.call('GetRecordStatus')
		.then(({outputActive}) => {
			$('#record_set')[outputActive ? 'addClass' : 'removeClass']('recording');
			$('#clip').prop('disabled', !outputActive);
		})
		.catch(() => {
			$('#record_set').removeClass('recording');
			$('#clip').prop('disabled', true);
		});
}

function recordSet() {
	return obs.call('ToggleRecord')
		.then(({outputActive}) => console.log(`${outputActive ? 'Started' : 'Stopped'} recording.`))
		.catch(() => console.log('Failed to toggle recording.'));
}

function clip() {
	return obs.call(
		'TriggerHotkeyByKeySequence', 
		{keyId: 'OBS_KEY_BACKSPACE', keyModifiers: {shift: true, control: true, alt: true}}
	);
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

function change_best_of(value) {
	$(".best_of").prop('disabled', false);
	$(`#bo${value}`).prop('disabled', true);
}

function settings() {
	//window.location.href = "/settings";
	return
}

function auto() {
	window.location.href = "/";
}

function friendlies() {
	window.location.href = "/friendlies";
}

/**
 * up : 			direction of page
 */
function showSets(up) {
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
				$("#set" + (x+1)).attr("match_id", sets[index]["id"])

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
/**
 * STARTGG
 */

function getTournament() {
	tournament_slug = $("#tournament_slug").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query TournamentEvents($name:String!){
					tournament(slug:$name){
						id
						name
						events{
							id
							name
							phases{
								id
								name
							}
						}
					}
				}
			`,
			variables: {
				name: tournament_slug
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		if(result["data"]["tournament"] == null) {
			$("#event").hide()
			$("#event_submit").hide()
			$("#row2r").css("display", "none")
			return
		}
		$("#event").empty()
        for (let sgg_event of result["data"]["tournament"]["events"]) {
           	phases = []
            for (let sgg_phase of sgg_event["phases"]) {
                phase_json = {
                    "id" : sgg_phase["id"],
                    "name" : sgg_phase["name"],
                }
                phases.push(phase_json)
			}
			event_option = new Option(sgg_event["name"], sgg_event["name"]);
			$(event_option).attr("event_id", JSON.stringify(sgg_event["id"]))
			$(event_option).attr("phases", JSON.stringify(phases))

			$("#event").append(event_option);
			$("#event").attr("tournament_slug", tournament_slug)
			$("#event").show()
			$("#event_submit").show()
		}
	});
}
//
function getEvent() {
	tournament_slug = $("#event").attr("tournament_slug")
	event_name = $("#event :selected").text().toLowerCase().replace(/ /g,"-")
	$("#row2r").attr("tournament_slug", tournament_slug)
	$("#row2r").attr("event_name", event_name)
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query EventSets($eventID:ID!, $page:Int!, $perPage:Int!){
					event(id:$eventID) {
						phases{
							id
							bracketType
							name
							phaseGroups{
								nodes{
									displayIdentifier
									sets(
										page: $page
										perPage: $perPage
										sortType: STANDARD
										filters: {
											hideEmpty: true
											state: [1,2,4,6,7]
										}
									){
										nodes{
											id
											fullRoundText
											slots{
												entrant{
													participants{
														gamerTag
														user{
															discriminator
															genderPronoun
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			`,
			variables: {
				eventID: $("#event :selected").attr("event_id"),
				page: 1,
				perPage: 25
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		sets = []
		console.log(result)
		for (let phase of result["data"]["event"]["phases"]) {
			for (let phase_group of phase["phaseGroups"]["nodes"]) {
				for (let set of phase_group["sets"]["nodes"]) {
					valid = true
					for (let entrant of set["slots"]) {
						if (!(entrant["entrant"])) {
							valid = false
						}
					}
					if (valid) {
						match_id = set["id"]
						if(phase["bracketType"] == "ROUND_ROBIN") {
							match_round = phase["name"] + " " + phase_group["displayIdentifier"]
						} else {
							match_round = set["fullRoundText"]
						}
						team1 = set["slots"][0]
						team2 = set["slots"][1]
						//player 1
						p1_user_id = ""
						p1_pronouns = ""
						if (team1["entrant"]["participants"][0]["user"] != null) {
							p1_user_id = team1["entrant"]["participants"][0]["user"]["discriminator"]
							p1_pronouns = team1["entrant"]["participants"][0]["user"]["genderPronoun"]
						}
						p1_name = team1["entrant"]["participants"][0]["gamerTag"]
						//player 1 doubles
						p1_doubles_user_id = ""
						p1_doubles_pronouns = ""
						p1_doubles_name = ""
						if(team1["entrant"]["participants"].length > 1) {
							if (team1["entrant"]["participants"][1]["user"] != null) {
								p1_doubles_user_id = team1["entrant"]["participants"][1]["user"]["discriminator"]
								p1_doubles_pronouns = team1["entrant"]["participants"][1]["user"]["genderPronoun"]
							}
							p1_doubles_name = team1["entrant"]["participants"][1]["gamerTag"]
						}

						//player 2
						p2_user_id = ""
						p2_pronouns = ""
						if (team2["entrant"]["participants"][0]["user"] != null) {
							p2_user_id = team2["entrant"]["participants"][0]["user"]["discriminator"]
							p2_pronouns = team2["entrant"]["participants"][0]["user"]["genderPronoun"]
						}
						p2_name = team2["entrant"]["participants"][0]["gamerTag"]
						//player 2 doubles
						p2_doubles_user_id = ""
						p2_doubles_pronouns = ""
						p2_doubles_name = ""
						if(team2["entrant"]["participants"].length > 1) {
							if (team2["entrant"]["participants"][1]["user"] != null) {
								p2_doubles_user_id = team2["entrant"]["participants"][1]["user"]["discriminator"]
								p2_doubles_pronouns = team2["entrant"]["participants"][1]["user"]["genderPronoun"]
							}
							p2_doubles_name = team2["entrant"]["participants"][1]["gamerTag"]
						}
						
						match_data = {
							"id": match_id,
							"round": match_round,
							"player1": {
								"id": p1_user_id,
								"name": p1_name,
								"pronouns": p1_pronouns
							},
							"player1_doubles" : {
								"id": p1_doubles_user_id,
								"name": p1_doubles_name,
								"pronouns": p1_doubles_pronouns
							},
							"player2": {
								"id": p2_user_id,
								"name": p2_name,
								"pronouns": p2_pronouns
							},
							"player2_doubles" : {
								"id": p2_doubles_user_id,
								"name": p2_doubles_name,
								"pronouns": p2_doubles_pronouns
							}
						}
						if(sets.length<16) {
							sets.push(match_data)
						}
					}
				}
			}
		}
		set_page = 0;
		showSets(true);
	});
}

function load_set(x) {
	p1_data = JSON.parse($("#set" + x + "_name1").attr("p1_data"))
	p1d_data = JSON.parse($("#set" + x + "_name1").attr("p2_data"))
	p2_data = JSON.parse($("#set" + x + "_name2").attr("p1_data"))
	p2d_data = JSON.parse($("#set" + x + "_name2").attr("p2_data"))

	$("#p1_name").val(p1_data["name"])
	$("#p1d_name").val(p1d_data["name"])
	$("#p2_name").val(p2_data["name"])
	$("#p2d_name").val(p2d_data["name"])
	p1_pronouns = p1_data["pronouns"]
	p1d_pronouns = p1d_data["pronouns"]
	p2_pronouns = p2_data["pronouns"]
	p2d_pronouns = p2d_data["pronouns"]
	$("#p1_pronouns").val(p1_pronouns)
	$("#p1d_pronouns").val(p1d_pronouns)
	$("#p2_pronouns").val(p2_pronouns)
	$("#p2d_pronouns").val(p2d_pronouns)
	$("#round_change").val($("#set" + x + "_round").text())
}


/* MANUAL STUFF */

function manual_stuff() {
	$("#bowser1").click(function(){
		set(1, 1, "bowser", "green");
		set(1, 2, "bowser", "red");
		set(1, 3, "bowser", "blue");
		set(1, 4, "bowser", "black");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#captainfalcon1").click(function(){
		set(1, 1, "captainfalcon", "original");
		set(1, 2, "captainfalcon", "dark");
		set(1, 3, "captainfalcon", "red");
		set(1, 4, "captainfalcon", "white");
		set(1, 5, "captainfalcon", "green");
		set(1, 6, "captainfalcon", "blue");
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#donkeykong1").click(function(){
		set(1, 1, "donkeykong", "original");
		set(1, 2, "donkeykong", "dark");
		set(1, 3, "donkeykong", "red");
		set(1, 4, "donkeykong", "blue");
		set(1, 5, "donkeykong", "green");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#drmario1").click(function(){
		set(1, 1, "drmario", "original");
		set(1, 2, "drmario", "red");
		set(1, 3, "drmario", "blue");
		set(1, 4, "drmario", "green");
		set(1, 5, "drmario", "black");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#falco1").click(function(){
		set(1, 1, "falco", "original");
		set(1, 2, "falco", "red");
		set(1, 3, "falco", "blue");
		set(1, 4, "falco", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#fox1").click(function(){
		set(1, 1, "fox", "original");
		set(1, 2, "fox", "red");
		set(1, 3, "fox", "blue");
		set(1, 4, "fox", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#ganondorf1").click(function(){
		set(1, 1, "ganondorf", "original");
		set(1, 2, "ganondorf", "red");
		set(1, 3, "ganondorf", "blue");
		set(1, 4, "ganondorf", "green");
		set(1, 5, "ganondorf", "purple");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#iceclimbers1").click(function(){
		set(1, 1, "iceclimbers", "blue");
		set(1, 2, "iceclimbers", "green");
		set(1, 3, "iceclimbers", "yellow");
		set(1, 4, "iceclimbers", "red");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#jigglypuff1").click(function(){
		set(1, 1, "jigglypuff", "original");
		set(1, 2, "jigglypuff", "red");
		set(1, 3, "jigglypuff", "blue");
		set(1, 4, "jigglypuff", "green");
		set(1, 5, "jigglypuff", "gold");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#kirby1").click(function(){
		set(1, 1, "kirby", "original");
		set(1, 2, "kirby", "yellow");
		set(1, 3, "kirby", "blue");
		set(1, 4, "kirby", "red");
		set(1, 5, "kirby", "green");
		set(1, 6, "kirby", "white");
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#link1").click(function(){
		set(1, 1, "link", "green");
		set(1, 2, "link", "red");
		set(1, 3, "link", "blue");
		set(1, 4, "link", "black");
		set(1, 5, "link", "white");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#luigi1").click(function(){
		set(1, 1, "luigi", "green");
		set(1, 2, "luigi", "white");
		set(1, 3, "luigi", "blue");
		set(1, 4, "luigi", "red");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#mario1").click(function(){
		set(1, 1, "mario", "red");
		set(1, 2, "mario", "yellow");
		set(1, 3, "mario", "black");
		set(1, 4, "mario", "blue");
		set(1, 5, "mario", "green");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#marth1").click(function(){
		set(1, 1, "marth", "blue");
		set(1, 2, "marth", "red");
		set(1, 3, "marth", "green");
		set(1, 4, "marth", "black");
		set(1, 5, "marth", "white");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#mewtwo1").click(function(){
		set(1, 1, "mewtwo", "original");
		set(1, 2, "mewtwo", "red");
		set(1, 3, "mewtwo", "blue");
		set(1, 4, "mewtwo", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#gameandwatch1").click(function(){
		set(1, 1, "gameandwatch", "original");
		set(1, 2, "gameandwatch", "red");
		set(1, 3, "gameandwatch", "blue");
		set(1, 4, "gameandwatch", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#ness1").click(function(){
		set(1, 1, "ness", "red");
		set(1, 2, "ness", "gold");
		set(1, 3, "ness", "blue");
		set(1, 4, "ness", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#peach1").click(function(){
		set(1, 1, "peach", "red");
		set(1, 2, "peach", "gold");
		set(1, 3, "peach", "white");
		set(1, 4, "peach", "blue");
		set(1, 5, "peach", "green");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#pichu1").click(function(){
		set(1, 1, "pichu", "original");
		set(1, 2, "pichu", "red");
		set(1, 3, "pichu", "blue");
		set(1, 4, "pichu", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#pikachu1").click(function(){
		set(1, 1, "pikachu", "original");
		set(1, 2, "pikachu", "red");
		set(1, 3, "pikachu", "blue");
		set(1, 4, "pikachu", "green");
		hide(1, 5);
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#roy1").click(function(){
		set(1, 1, "roy", "original");
		set(1, 2, "roy", "red");
		set(1, 3, "roy", "blue");
		set(1, 4, "roy", "green");
		set(1, 5, "roy", "gold");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#samus1").click(function(){
		set(1, 1, "samus", "red");
		set(1, 2, "samus", "pink");
		set(1, 3, "samus", "dark");
		set(1, 4, "samus", "green");
		set(1, 5, "samus", "blue");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#sheik1").click(function(){
		set(1, 1, "sheik", "original");
		set(1, 2, "sheik", "red");
		set(1, 3, "sheik", "blue");
		set(1, 4, "sheik", "green");
		set(1, 5, "sheik", "white");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#yoshi1").click(function(){
		set(1, 1, "yoshi", "green");
		set(1, 2, "yoshi", "red");
		set(1, 3, "yoshi", "blue");
		set(1, 4, "yoshi", "yellow");
		set(1, 5, "yoshi", "pink");
		set(1, 6, "yoshi", "cyan");
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#younglink1").click(function(){
		set(1, 1, "younglink", "green");
		set(1, 2, "younglink", "red");
		set(1, 3, "younglink", "blue");
		set(1, 4, "younglink", "black");
		set(1, 5, "younglink", "white");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#zelda1").click(function(){
		set(1, 1, "zelda", "original");
		set(1, 2, "zelda", "red");
		set(1, 3, "zelda", "blue");
		set(1, 4, "zelda", "green");
		set(1, 5, "zelda", "white");
		hide(1, 6);
		reset_background(1);
		$(this).css("background-color", "white");
	});

	$("#empty1").click(function(){
		empty(1, 1);
	});

	$("#empty1").on('long-press', function(e) {
		e.preventDefault();
		empty(1, 2);
	});

	//P2

	$("#bowser2").click(function(){
		set(2, 1, "bowser", "green");
		set(2, 2, "bowser", "red");
		set(2, 3, "bowser", "blue");
		set(2, 4, "bowser", "black");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#captainfalcon2").click(function(){
		set(2, 1, "captainfalcon", "original");
		set(2, 2, "captainfalcon", "black");
		set(2, 3, "captainfalcon", "red");
		set(2, 4, "captainfalcon", "white");
		set(2, 5, "captainfalcon", "green");
		set(2, 6, "captainfalcon", "blue");
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#donkeykong2").click(function(){
		set(2, 1, "donkeykong", "original");
		set(2, 2, "donkeykong", "dark");
		set(2, 3, "donkeykong", "red");
		set(2, 4, "donkeykong", "blue");
		set(2, 5, "donkeykong", "green");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#drmario2").click(function(){
		set(2, 1, "drmario", "original");
		set(2, 2, "drmario", "red");
		set(2, 3, "drmario", "blue");
		set(2, 4, "drmario", "green");
		set(2, 5, "drmario", "black");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#falco2").click(function(){
		set(2, 1, "falco", "original");
		set(2, 2, "falco", "red");
		set(2, 3, "falco", "blue");
		set(2, 4, "falco", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#fox2").click(function(){
		set(2, 1, "fox", "original");
		set(2, 2, "fox", "red");
		set(2, 3, "fox", "blue");
		set(2, 4, "fox", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#ganondorf2").click(function(){
		set(2, 1, "ganondorf", "original");
		set(2, 2, "ganondorf", "red");
		set(2, 3, "ganondorf", "blue");
		set(2, 4, "ganondorf", "green");
		set(2, 5, "ganondorf", "purple");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#iceclimbers2").click(function(){
		set(2, 1, "iceclimbers", "blue");
		set(2, 2, "iceclimbers", "green");
		set(2, 3, "iceclimbers", "yellow");
		set(2, 4, "iceclimbers", "red");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#jigglypuff2").click(function(){
		set(2, 1, "jigglypuff", "original");
		set(2, 2, "jigglypuff", "red");
		set(2, 3, "jigglypuff", "blue");
		set(2, 4, "jigglypuff", "green");
		set(2, 5, "jigglypuff", "gold");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#kirby2").click(function(){
		set(2, 1, "kirby", "original");
		set(2, 2, "kirby", "yellow");
		set(2, 3, "kirby", "blue");
		set(2, 4, "kirby", "red");
		set(2, 5, "kirby", "green");
		set(2, 6, "kirby", "white");
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#link2").click(function(){
		set(2, 1, "link", "green");
		set(2, 2, "link", "red");
		set(2, 3, "link", "blue");
		set(2, 4, "link", "black");
		set(2, 5, "link", "white");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#luigi2").click(function(){
		set(2, 1, "luigi", "green");
		set(2, 2, "luigi", "white");
		set(2, 3, "luigi", "blue");
		set(2, 4, "luigi", "red");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#mario2").click(function(){
		set(2, 1, "mario", "red");
		set(2, 2, "mario", "yellow");
		set(2, 3, "mario", "black");
		set(2, 4, "mario", "blue");
		set(2, 5, "mario", "green");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#marth2").click(function(){
		set(2, 1, "marth", "blue");
		set(2, 2, "marth", "red");
		set(2, 3, "marth", "green");
		set(2, 4, "marth", "black");
		set(2, 5, "marth", "white");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#mewtwo2").click(function(){
		set(2, 1, "mewtwo", "original");
		set(2, 2, "mewtwo", "red");
		set(2, 3, "mewtwo", "blue");
		set(2, 4, "mewtwo", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#gameandwatch2").click(function(){
		set(2, 1, "gameandwatch", "original");
		set(2, 2, "gameandwatch", "red");
		set(2, 3, "gameandwatch", "blue");
		set(2, 4, "gameandwatch", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#ness2").click(function(){
		set(2, 1, "ness", "red");
		set(2, 2, "ness", "gold");
		set(2, 3, "ness", "blue");
		set(2, 4, "ness", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#peach2").click(function(){
		set(2, 1, "peach", "red");
		set(2, 2, "peach", "gold");
		set(2, 3, "peach", "white");
		set(2, 4, "peach", "blue");
		set(2, 5, "peach", "green");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#pichu2").click(function(){
		set(2, 1, "pichu", "original");
		set(2, 2, "pichu", "red");
		set(2, 3, "pichu", "blue");
		set(2, 4, "pichu", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#pikachu2").click(function(){
		set(2, 1, "pikachu", "original");
		set(2, 2, "pikachu", "red");
		set(2, 3, "pikachu", "blue");
		set(2, 4, "pikachu", "green");
		hide(2, 5);
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#roy2").click(function(){
		set(2, 1, "roy", "original");
		set(2, 2, "roy", "red");
		set(2, 3, "roy", "blue");
		set(2, 4, "roy", "green");
		set(2, 5, "roy", "gold");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#samus2").click(function(){
		set(2, 1, "samus", "red");
		set(2, 2, "samus", "pink");
		set(2, 3, "samus", "dark");
		set(2, 4, "samus", "green");
		set(2, 5, "samus", "blue");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#sheik2").click(function(){
		set(2, 1, "sheik", "original");
		set(2, 2, "sheik", "red");
		set(2, 3, "sheik", "blue");
		set(2, 4, "sheik", "green");
		set(2, 5, "sheik", "white");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#yoshi2").click(function(){
		set(2, 1, "yoshi", "green");
		set(2, 2, "yoshi", "red");
		set(2, 3, "yoshi", "blue");
		set(2, 4, "yoshi", "yellow");
		set(2, 5, "yoshi", "pink");
		set(2, 6, "yoshi", "cyan");
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#younglink2").click(function(){
		set(2, 1, "younglink", "green");
		set(2, 2, "younglink", "red");
		set(2, 3, "younglink", "blue");
		set(2, 4, "younglink", "black");
		set(2, 5, "younglink", "white");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#zelda2").click(function(){
		set(2, 1, "zelda", "original");
		set(2, 2, "zelda", "red");
		set(2, 3, "zelda", "blue");
		set(2, 4, "zelda", "green");
		set(2, 5, "zelda", "white");
		hide(2, 6);
		reset_background(2);
		$(this).css("background-color", "white");
	});

	$("#empty2").click(function(){
		empty(2, 1);
	});

	$("#empty2").on('long-press', function(e) {
		e.preventDefault();
		empty(2, 2);
	});

	//P1 Singles

	$("#p1_colour1").click(function(){
		singles(1, 1);
	});

	$("#p1_colour2").click(function(){
		singles(1, 2);
	});

	$("#p1_colour3").click(function(){
		singles(1, 3);
	});

	$("#p1_colour4").click(function(){
		singles(1, 4);
	});

	$("#p1_colour5").click(function(){
		singles(1, 5);
	});

	$("#p1_colour6").click(function(){
		singles(1, 6);
	});

	//P1 Doubles

	$("#p1_colour1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, 1);
	});

	$("#p1_colour2").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, 2);
	});

	$("#p1_colour3").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, 3);
	});

	$("#p1_colour4").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, 4);
	});

	$("#p1_colour5").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, 5);
	});

	$("#p1_colour6").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, 6);
	});

	//P2 Singles

	$("#p2_colour1").click(function(){
		singles(2, 1);
	});

	$("#p2_colour2").click(function(){
		singles(2, 2);
	});

	$("#p2_colour3").click(function(){
		singles(2, 3);
	});

	$("#p2_colour4").click(function(){
		singles(2, 4);
	});

	$("#p2_colour5").click(function(){
		singles(2, 5);
	});

	$("#p2_colour6").click(function(){
		singles(2, 6);
	});

	//P2 Doubles

	$("#p2_colour1").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, 1);
	});

	$("#p2_colour2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, 2);
	});

	$("#p2_colour3").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, 3);
	});

	$("#p2_colour4").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, 4);
	});

	$("#p2_colour5").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, 5);
	});

	$("#p2_colour6").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, 6);
	});
}

function set(player, slot, character, colour) {
	/*TODO: clean up left/right (used for STG3)*/
	side = "left"
	if (player == 1) {
		side = "left";
	} else {
		side = "right";
	}
	$("#p" + player + "_colour" + slot).attr("src", "static/img/stock_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_colour" + slot).show();
	$("#p" + player + "_colour" + slot).attr("char", character);
	$("#p" + player + "_colour" + slot).attr("char_colour", colour);
};

function hide(player, slot) {
	$("#p" + player + "_colour" + slot).attr("src", "");
	$("#p" + player + "_colour" + slot).hide();
	$("#p" + player + "_colour" + slot).attr("char", "");
	$("#p" + player + "_colour" + slot).attr("char_colour", "");
}

//set char singles
function singles(player, character) {
	img = $("#p" + player + "_colour" + character).attr("char") + "/" + $("#p" + player + "_colour" + character).attr("char_colour")
	$("#p" + player + "_character_change").attr("src",	"static/img/csp_icons/" + img + ".png")
	$("#p" + player + "_character_change").attr("character", $("#p" + player + "_colour" + character).attr("char"))
	$("#p" + player + "_character_change").attr("colour", $("#p" + player + "_colour" + character).attr("char_colour"))
}

//set char doubles
function doubles(player, character) {
	img = $("#p" + player + "_colour" + character).attr("char") + "/" + $("#p" + player + "_colour" + character).attr("char_colour")
	if(is_doubles) {
		$("#p" + player + "d_character_change").attr("src", "static/img/csp_icons/" + img + ".png");
		$("#p" + player + "d_character_change").attr("character", $("#p" + player + "_colour" + character).attr("char"))
		$("#p" + player + "d_character_change").attr("colour", $("#p" + player + "_colour" + character).attr("char_colour"))
		$("#p" + player + "d_character_change").show();
	}
}

function empty(player, port) {
	console.log(port)
	if(port == 2 && is_doubles) {
		$("#p" + player + "d_character").attr("src", "static/img/stock_icons/empty/original.png");
		$("#p" + player + "d_character").attr("char", "empty")
		$("#p" + player + "d_character").attr("char_colour", "original")
	} else if (port == 1) {
		$("#p" + player + "_character").attr("src", "static/img/stock_icons/empty/original.png");
		$("#p" + player + "_character").attr("char", "empty")
		$("#p" + player + "_character").attr("char_colour", "original")
	}
}
