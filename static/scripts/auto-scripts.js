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

function update() {
	player1name = $("#p1_name").val();
	player1char = $("#p1_character_actual").attr("character");
	player1colour = $("#p1_character_actual").attr("colour");
	player1pronouns = $("#p1_pronouns").val();

	player1dname = $("#p1d_name").val();
	player1dchar = $("#p1d_character_actual").attr("character");
	player1dcolour = $("#p1d_character_actual").attr("colour");
	player1dpronouns = $("#p1d_pronouns").val();

	player1score = parseInt($("#p1_score_change").val());

	player2name = $("#p2_name").val();
	player2char = $("#p2_character_actual").attr("character");
	player2colour = $("#p2_character_actual").attr("colour");
	player2pronouns = $("#p2_pronouns").val();

	player2dname = $("#p2d_name").val();
	player2dchar = $("#p2d_character_actual").attr("character");
	player2dcolour = $("#p2d_character_actual").attr("colour");
	player2dpronouns = $("#p2d_pronouns").val();

	player2score = parseInt($("#p2_score_change").val());
	round = $("#round_change").val();
	tournament = $("#tournament_change").val();
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
	})
	update_record_button();
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

function update_record_button(recording_status) {
	obs.call('GetRecordStatus')
		.catch(() => false)
		.then(({outputActive}) => {
			$.ajax({
				type: 'GET',
				url: "/recording_status",
				data: {},
				success: function(response) {
					if (outputActive && response.recording_status) {
						$("#ffmpeg").text("Recording...");
						$("#ffmpeg").css("background-color", "#9146FF");
						$("#ffmpeg").css("border-bottom", "3px solid #44158a");
					} else {
						$("#ffmpeg").text("Record");
						$("#ffmpeg").css("background-color", "#FFFFFF");
						$("#ffmpeg").css("border-bottom", "3px solid #AAA");
					}
				},
				error: function(response) {
					console.log(response)
				},
				timeout: 5000
			})
			$('#ffmpeg-clip').prop('disabled', !outputActive);
		});
}

function recordSet() {
	obs.call(
		'GetRecordStatus'
	)
	.then(function(value) {
		current_color = $("#ffmpeg").css("background-color");
		current_status = $("#ffmpeg").text();
		current_border = $("#ffmpeg").css("border-bottom");

		if(!value.outputActive) {
			$("#ffmpeg").css("background-color", "#F56262");
			$("#ffmpeg").css("border-bottom", "3px solid #F53535");
			$("#ffmpeg").text("OBS not recording");
			$("#ffmpeg").append('<i class="fa-solid fa-triangle-exclamation"></i>')

			setTimeout(function(){
				$("#ffmpeg").css("background-color", current_color);
				$("#ffmpeg").css("border-bottom", current_border);
				$("#ffmpeg").text(current_status);
			}, 2000);
			return;
		} 

		const record_controller = new AbortController()
		const record_timeout = setTimeout(() => {
			record_controller.abort()

			current_color = $("#ffmpeg").css("background-color");
			current_status = $("#ffmpeg").text();

			$("#ffmpeg").css("background-color", "#F56262");
			$(".update").css("border-bottom", "3px solid #F53535");
			$("#ffmpeg").text("OBS timeout");
			$("#ffmpeg").append('<i class="fa-solid fa-triangle-exclamation"></i>')

			setTimeout(function(){
				$("#ffmpeg").css("background-color", current_color);
				$("#ffmpeg").css("border-bottom", current_border);
				$("#ffmpeg").text(current_status);
			}, 2000);
		}, 5000);
		fetch("/save_recording", {
			method: 'POST',
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({
				timecode: value.outputTimecode
			}),
			signal: record_controller.signal
		})
		.then((response) => response.json())
		.then((data) => {
			clearTimeout(record_timeout)
			console.log(data)
			if(!data.recording_status) {
				$("#ffmpeg").text("Recorded!");
				$("#ffmpeg").css("background-color", "#55F76B");
				$("#ffmpeg").css("border-bottom", "3px solid #349641");
				setTimeout(function(){
					$("#ffmpeg").text("Record");
					$("#ffmpeg").css("background-color", "#FFFFFF");
					$("#ffmpeg").css("border-bottom", "3px solid #AAA");
				}, 2000);
			} else {
				$("#ffmpeg").text("Recording...");
				$("#ffmpeg").css("background-color", "#9146FF");
				$("#ffmpeg").css("border-bottom", "3px solid #44158a");
			}

		})
	})

}

function clip() {
	obs.call(
		'GetRecordStatus'
	)
	.then(function(value) {
		current_color = $("#ffmpeg-clip").css("background-color");
		current_status = $("#ffmpeg-clip").text();
		current_border = $("#ffmpeg-clip").css("border-bottom");
		
		if(!value.outputActive) {
			$("#ffmpeg-clip").css("background-color", "#F56262");
			$("#ffmpeg-clip").css("border-bottom", "3px solid #F53535");
			$("#ffmpeg-clip").text("OBS not recording");
			$("#ffmpeg-clip").append('<i class="fa-solid fa-triangle-exclamation"></i>')

			setTimeout(function(){
				$("#ffmpeg-clip").css("background-color", current_color);
				$("#ffmpeg-clip").css("border-bottom", current_border);
				$("#ffmpeg-clip").text(current_status);
			}, 2000);
			return;
		} 

		const record_controller = new AbortController()
		const record_timeout = setTimeout(() => {
			record_controller.abort()

			current_color = $("#ffmpeg-clip").css("background-color");
			current_status = $("#ffmpeg-clip").text();

			$("#ffmpeg-clip").css("background-color", "#F56262");
			$(".update").css("border-bottom", "3px solid #F53535");
			$("#ffmpeg-clip").text("OBS timeout");
			$("#ffmpeg-clip").append('<i class="fa-solid fa-triangle-exclamation"></i>')

			setTimeout(function(){
				$("#ffmpeg-clip").css("background-color", current_color);
				$("#ffmpeg-clip").css("border-bottom", current_border);
				$("#ffmpeg-clip").text(current_status);
			}, 2000);
		}, 5000);
		
		$("#ffmpeg-clip").text("Clipping...");
		$("#ffmpeg-clip").css("background-color", "#9146FF");
		$("#ffmpeg-clip").css("border-bottom", "3px solid #44158a");

		fetch("/save_clip", {
			method: 'POST',
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({
				timecode: value.outputTimecode
			}),
			signal: record_controller.signal
		})
		.then((response) => {
			if(`${response.status}`.startsWith(2)) {
				$("#ffmpeg-clip").text("Clipped!");
				$("#ffmpeg-clip").css("background-color", "#55F76B");
				$("#ffmpeg-clip").css("border-bottom", "3px solid #349641");
				setTimeout(function(){
					$("#ffmpeg-clip").text("Clip");
					$("#ffmpeg-clip").css("background-color", "#FFFFFF");
					$("#ffmpeg-clip").css("border-bottom", "3px solid #AAA");
				}, 2000);
			} else {
				$("#ffmpeg-clip").css("background-color", "#F56262");
				$(".update").css("border-bottom", "3px solid #F53535");
				$("#ffmpeg-clip").text("Error!");
				$("#ffmpeg-clip").append('<i class="fa-solid fa-triangle-exclamation"></i>')
			}

		})
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

/**
 * up : 			direction of page
 */
function showSets(up) {
	if(up) {
		//check if going over the amount
		max_index = set_page * 5;
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

/* GET EVENTS IN TOURNAMENT (Melee Singles, Melee Doubles, ...) */
function getTournamentEvents() {
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
		$("#events").hide()
		$("#phases").hide()
		$("#phase_groups").hide()
		$("#get_sets").hide()
		if(result["data"]["tournament"] == null) {
			$("#row2r").css("display", "none")
			return
		}
		$("#events").empty()
		$("#events").append(new Option("Select...", 0));
        for (let event of result["data"]["tournament"]["events"]) {
			event_option = new Option(event["name"], event["id"]);
			$("#events").append(event_option);
			$("#events").show()
		}
	});
}

/* GET PHASES IN EVENT (Pools, Pro Bracket, ...) */
function getEventPhases() {
	event_id = $("#events :selected").val()

	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query EventPhases($id:ID!){
					event(id:$id){
						phases{
						  	id
						  	name
						  	phaseGroups{
								nodes{
									id
									displayIdentifier
								}
							}
						}
					}
				}
			`,
			variables: {
				id: event_id
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		$("#phases").hide()
		$("#phase_groups").hide()
		$("#get_sets").hide()
		if(result["data"]["event"]["phases"] == null) {
			$("#row2r").css("display", "none")
			return
		}
		$("#phases").empty()
		$("#phases").append(new Option("Select...", 0));
        for (let phase of result["data"]["event"]["phases"]) {
			phase_option = new Option(phase["name"], phase["id"]);
			$("#phases").append(phase_option);
			$("#phases").attr("tournament_slug", tournament_slug)
			$("#phases").show()
		}
	});
}

/* GET PHASEGROUPS IN PHASE (Pool A1, Pool A2, ...) */
function getPhaseGroups() {
	phase_id = $("#phases :selected").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query PhaseGroups($id:ID!){
					phase(id:$id){
				  		name
				  		phaseGroups{
							nodes{
					  			id
					  			displayIdentifier
							}
				  		}
					}
			  	}
			`,
			variables: {
				id: phase_id
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		$("#phase_groups").hide()
		$("#get_sets").hide()
		if(result["data"]["phase"]["phaseGroups"] == null) {
			$("#row2r").css("display", "none")
			return
		}
		$("#phase_groups").empty()
		if (result["data"]["phase"]["phaseGroups"]["nodes"].length > 1) {
			$("#phase_groups").append(new Option("Select...", 0));
		}
        for (let pg of result["data"]["phase"]["phaseGroups"]["nodes"]) {
			pg_option = new Option(pg["displayIdentifier"], pg["id"]);
			$("#phase_groups").append(pg_option);
			$("#phase_groups").attr("tournament_slug", tournament_slug)
		}
		if (result["data"]["phase"]["phaseGroups"]["nodes"].length > 1) {
			$("#phase_groups").show()
		} else {
			//for overloading - select the only available option and then hide the element for clarity
			$("#phase_groups").val($("#phase_groups option:first").val());
			$("#phase_groups").hide()
			$("#get_sets").show()
		}
	});
}

function showGetSets() {
	$("#get_sets").show()
}

/* GET AND LOAD SETS FOR A GIVEN PHASEGROUP */
function getSets() {
	phase_group = $("#phase_groups :selected").val();
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query GetSets($pgID:ID!, $page:Int!, $perPage:Int!){
					phaseGroup(id:$pgID){
						bracketType
						displayIdentifier
						phase {
							name
						}
						sets(
							page: $page
							perPage: $perPage
							sortType: STANDARD
							filters: {
								hideEmpty: false
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
			`,
			variables: {
				pgID: phase_group,
				page: 1,
				perPage: 80
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		sets = []
		phase_group = result["data"]["phaseGroup"]
		for (let set of phase_group["sets"]["nodes"]) {
			valid = true
			for (let entrant of set["slots"]) {
				if (!(entrant["entrant"])) {
					valid = false
				}
			}
			if (valid) {
				match_id = set["id"]
				if(phase_group["bracketType"] == "ROUND_ROBIN") {
					match_round = phase_group["phase"]["name"] + " " + phase_group["displayIdentifier"]
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
				sets.push(match_data)
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