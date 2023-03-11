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

	change_best_of(best_of_value);

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
	player1tag = $("#p1_tag").val();
	player1char = $("#p1_character_actual").attr("character");
	player1colour = $("#p1_character_actual").attr("colour");
	player1pronouns = $("#p1_pronouns").val();

	player1dtag = $("#p1d_tag").val();
	player1dchar = $("#p1d_character_actual").attr("character");
	player1dcolour = $("#p1d_character_actual").attr("colour");
	player1dpronouns = $("#p1d_pronouns").val();

	player1score = $("#p1_score_change").val();

	player2tag = $("#p2_tag").val();
	player2char = $("#p2_character_actual").attr("character");
	player2colour = $("#p2_character_actual").attr("colour");
	player2pronouns = $("#p2_pronouns").val();

	player2dtag = $("#p2d_tag").val();
	player2dchar = $("#p2d_character_actual").attr("character");
	player2dcolour = $("#p2d_character_actual").attr("colour");
	player2dpronouns = $("#p2d_pronouns").val();

	player2score = $("#p1_score_change").val();
	round = $("#round_change").val();
	caster1 = "";
	caster2 = "";

	$.ajax({
		type: 'POST',
		url: "/update",
		data: {
				p1_tag: player1tag,
				p1_char: player1char,
				p1_colour: player1colour,
				p1_pronouns: player1pronouns,
				p1d_tag: player1dtag,
				p1d_char : player1dchar,
				p1d_colour: player1dcolour,
				p1d_pronouns: player1dpronouns,
				p1_score: player1score,
				p2_tag: player2tag,
				p2_char: player2char,
				p2_colour: player2colour,
				p2_pronouns: player2pronouns,
				p2d_tag: player2dtag,
				p2d_char : player2dchar,
				p2d_colour: player2dcolour,
				p2d_pronouns: player2dpronouns,
				p2_score: player2score,
				round: round,
				caster1: caster1,
				caster2: caster2,
				is_doubles: is_doubles,
				best_of: best_of_value
			},
		success: function() {
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
		},
		error: function() {
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
		},
		timeout: 5000
	})
}

function swap_sides() {
	player1tag = $("#p1_tag").val();
	player1dtag = $("#p1d_tag").val();
	player2tag = $("#p2_tag").val();
	player2dtag = $("#p2d_tag").val();

	$("#p1_tag").val(player2tag);
	$("#p1d_tag").val(player2dtag);
	$("#p2_tag").val(player1tag);
	$("#p2d_tag").val(player1dtag);
}

function swap_team(n) {
	player_tag = $("#p" + n + "_tag").val();
	playerd_tag = $("#p" + n + "d_tag").val();

	$("#p" + n + "_tag").val(playerd_tag);
	$("#p" + n + "d_tag").val(player_tag);
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
		$(".tag_container.change").css("grid-column", "2")
		$("#p1_character_change").css("grid-column", "3")
		$("#p2_character_change").css("grid-column", "3")
		$(".score.change").css("grid-column", "4")
		$(".info.change").css("grid-template-columns", "100px [col-start] 380px [col-start] 240px [col-start] 100px [col-start]");
		$(".tag.change").css("width", "340px")

		$("#p2_tag").attr("placeholder", "Player 2 Tag")

		$("#p1d_tag").hide();
		$("#p2d_tag").hide();
		$("#p1d_tag_actual").hide();
		$("#p2d_tag_actual").hide();

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
		$(".tag_container.change").css("grid-column", "3")
		$("#p1_character_change").css("grid-column", "4")
		$("#p2_character_change").css("grid-column", "4")
		$(".score.change").css("grid-column", "6")
		$(".info.change").css("grid-template-columns", "100px [col-start] 80px [col-start] 300px [col-start] 120px [col-start] 120px [col-start] 100px [col-start]");
		$(".tag.change").css("width", "260px")
		

		$("#p2_tag").attr("placeholder", "Player 1 Tag")
		$("#p1d_tag").show();
		$("#p2d_tag").show();

		$("#p1d_tag_actual").show();
		$("#p2d_tag_actual").show();

		is_doubles = true;
	}
}

function load_changes() {
	$.ajax({
		type: 'POST',
		url: "/data.json",
		data: {},
		success: function(response) {
			$("#p1_tag_actual").attr("value", response.Player1["name"])
			$("#p1d_tag_actual").attr("value", response.Player1["name_dubs"])
			$("#p1_score_actual").attr("value", response.Player1["score"])
			$("#p2_tag_actual").attr("value", response.Player2["name"])
			$("#p2d_tag_actual").attr("value", response.Player2["name_dubs"])
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
	setTimeout(load_changes, 1000)
}


function load_char(player, character, colour) {
	$("#p" + player + "_character_actual").attr("src", "static/img/stock_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_character_change").attr("src", "static/img/csp_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_character_actual").attr("character", character);
	$("#p" + player + "_character_actual").attr("colour", colour);
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
	if(value == 3) {
		$("#bo3").css("background-color", "#AAA");
		$("#bo3").css("border-bottom", "3px solid #999");
		$("#bo3").hover(
			function() {
				$(this).css("background-color","#AAA");
			},
			function() {
				$(this).css("background-color", "#AAA");
			});
		$("#bo5").css("background-color", "#FFF");
		$("#bo5").css("border-bottom", "3px solid #AAA");
		$("#bo5").hover(
			function() {
				$(this).css("background-color","#CCC");
			},
			function() {
				$(this).css("background-color", "#FFF");
			});
		best_of_value = 3
	} else if (value == 5) {
		$("#bo5").css("background-color", "#AAA");
		$("#bo5").css("border-bottom", "3px solid #999");
		$("#bo5").hover(
			function() {
				$(this).css("background-color","#AAA");
			},
			function() {
				$(this).css("background-color", "#AAA");
			});
		$("#bo3").css("background-color", "#FFF");
		$("#bo3").css("border-bottom", "3px solid #AAA");
		$("#bo3").hover(
			function() {
				$(this).css("background-color","#CCC");
			},
			function() {
				$(this).css("background-color", "#FFF");
			});
		best_of_value = 5
	} else {
		console.log("ERROR: wrong best-of value provided")
	}
}

function settings() {
	//window.location.href = "/settings";
	return
}

function manual() {
	window.location.href = "/manual";
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
					$("#set" + (x+1) + "_tag1").text(sets[index]["player1"]["name"] + " / " + sets[index]["player1_doubles"]["name"])
				} else {
					$("#set" + (x+1) + "_tag1").text(sets[index]["player1"]["name"])
				}
				$("#set" + (x+1) + "_tag1").attr("p1_data", JSON.stringify(sets[index]["player1"]))
				$("#set" + (x+1) + "_tag1").attr("p2_data", JSON.stringify(sets[index]["player1_doubles"]))

				if(sets[index]["player2_doubles"]["name"] != "") {
					$("#set" + (x+1) + "_tag2").text(sets[index]["player2"]["name"] + " / " + sets[index]["player2_doubles"]["name"])
				} else {
					$("#set" + (x+1) + "_tag2").text(sets[index]["player2"]["name"])
				}
				$("#set" + (x+1) + "_tag2").attr("p1_data", JSON.stringify(sets[index]["player2"]))
				$("#set" + (x+1) + "_tag2").attr("p2_data", JSON.stringify(sets[index]["player2_doubles"]))

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
							p2_doubles_name = team1["entrant"]["participants"][1]["gamerTag"]
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
	p1_data = JSON.parse($("#set" + x + "_tag1").attr("p1_data"))
	p1d_data = JSON.parse($("#set" + x + "_tag1").attr("p2_data"))
	p2_data = JSON.parse($("#set" + x + "_tag2").attr("p1_data"))
	p2d_data = JSON.parse($("#set" + x + "_tag2").attr("p2_data"))

	$("#p1_tag").val(p1_data["name"])
	$("#p1d_tag").val(p1d_data["name"])
	$("#p2_tag").val(p2_data["name"])
	$("#p2d_tag").val(p2d_data["name"])
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

//run on aspect ratio change
/*function handle_aspect_change(e) {
	//phone
	if (e.matches) {
		if(is_doubles) {
			
		} else {

		}
	}
	//desktop
	else {
		if(is_doubles) {

		} else {
			
		}
	}
}*/