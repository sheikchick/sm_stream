is_doubles = false;
var obs;
var ip;
var sets = [];
var set_page = 0;

const phone_aspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");

$(document).ready(function(){
	obsConnect();
	load_changes();
	change_best_of(best_of_value);
	toggle_doubles();
	updateTournamentData(tournament);
});

function obsConnect() {
	obs = new OBSWebSocket();

	ip = window.location.href.split(":")[1].substring(2);
	obsurl = "ws://" + ip + ":" + obs_port;

	obs.connect(obsurl, obs_password)	
		.then(() => {
			$("#obs_wrapper").css('display', 'flex');
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
}

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
	player1entrant = $("#p1_entrant").val();

	player2name = $("#p2_name").val();
	player2char = $("#p2_character_actual").attr("character");
	player2colour = $("#p2_character_actual").attr("colour");
	player2pronouns = $("#p2_pronouns").val();

	player2dname = $("#p2d_name").val();
	player2dchar = $("#p2d_character_actual").attr("character");
	player2dcolour = $("#p2d_character_actual").attr("colour");
	player2dpronouns = $("#p2d_pronouns").val();

	player2score = parseInt($("#p2_score_change").val());
	player2entrant = $("#p2_entrant").val();

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
				startgg_entrant: player1entrant
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
				startgg_entrant: player2entrant
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
		updateTournamentData(tournament)
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
	is_doubles = $(".toggle_doubles").attr("value") != "true"
	//changing to singles
	if(is_doubles) {
		$(".toggle_doubles").attr("value", "true");
		$(".toggle_doubles").text("Singles ");
		$(".toggle_doubles").append("<i class='fa fa-user'></i>");

		$("#p1d_character_actual").hide();
		$("#p2d_character_actual").hide();
		$("#p1d_character_change").hide();
		$("#p2d_character_change").hide();
		$(".pronouns.change.doubles").hide();

		//resize for singles

		$(".swap").hide()
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
		$(".toggle_doubles").attr("value", "false");
		$(".toggle_doubles").text("Doubles ");
		$(".toggle_doubles").append("<i class='fa fa-user-friends'></i>");

		$("#p1d_character_actual").show();
		$("#p2d_character_actual").show();
		$("#p1d_character_change").show();
		$("#p2d_character_change").show();
		$(".pronouns.change.doubles").show();

		//resize for doubles

		$(".swap").show()
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
	if (obs !== null) {
		getRecordStatus();
	}
	//update images
	$.ajax({
		url: "static/img/screenshots/set/1.png",
		type: "GET",
		success: function () {
			$("#screenshot-1").attr("src", `static/img/screenshots/set/1.png?${Date.now()}`)
			try{
				$.ajax({
					url: "static/img/screenshots/set/2.png",
					type: "GET",
					success: function () {
						$("#screenshot-2").attr("src", `static/img/screenshots/set/2.png?${Date.now()}`)
					},
					error: function(e) {
					},
					timeout: 5000
				});
			} catch (e) {

			}
		},
		error: function() {
		},
		timeout: 5000
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

function getRecordStatus() {
	obs.call('GetRecordStatus')
		.catch(() => false)
		.then(({outputActive}) => {
			$.ajax({
				type: 'GET',
				url: "/recording_status",
				data: {},
				success: function(response) {
					if (outputActive && response.recording_status) {
						$("#ffmpeg-record").text("Recording...");
						$("#ffmpeg-record").css("background-color", "#9146FF");
						$("#ffmpeg-record").css("border-bottom", "3px solid #44158a");
					} else {
						$("#ffmpeg-record").text("Record");
						$("#ffmpeg-record").css("background-color", "#FFFFFF");
						$("#ffmpeg-record").css("border-bottom", "3px solid #AAA");
					}
				},
				error: function(response) {
					console.log(response)
				},
				timeout: 5000
			})
			$('#ffmpeg-record').prop('disabled', !outputActive);
			$('#ffmpeg-clip').prop('disabled', !outputActive);
		});
}

function recordSet(offset_ms) {
	obs.call(
		'GetRecordStatus'
	)
	.then(function(status) {
		current_color = $("#ffmpeg-record").css("background-color");
		current_status = $("#ffmpeg-record").text();
		current_border = $("#ffmpeg-record").css("border-bottom");

		if(!status.outputActive) {
			$("#ffmpeg-record").css("background-color", "#F56262");
			$("#ffmpeg-record").css("border-bottom", "3px solid #F53535");
			$("#ffmpeg-record").text("OBS not recording");
			$("#ffmpeg-record").append('<i class="fa-solid fa-triangle-exclamation"></i>')

			setTimeout(function(){
				$("#ffmpeg-record").css("background-color", current_color);
				$("#ffmpeg-record").css("border-bottom", current_border);
				$("#ffmpeg-record").text(current_status);
			}, 2000);
			return;
		} 

		const record_controller = new AbortController()
		const record_timeout = setTimeout(() => {
			record_controller.abort()

			current_color = $("#ffmpeg-record").css("background-color");
			current_status = $("#ffmpeg-record").text();

			$("#ffmpeg-record").css("background-color", "#F56262");
			$(".update").css("border-bottom", "3px solid #F53535");
			$("#ffmpeg-record").text("OBS timeout");
			$("#ffmpeg-record").append('<i class="fa-solid fa-triangle-exclamation"></i>')

			setTimeout(function(){
				$("#ffmpeg-record").css("background-color", current_color);
				$("#ffmpeg-record").css("border-bottom", current_border);
				$("#ffmpeg-record").text(current_status);
			}, 2000);
		}, 5000);
		fetch("/save_recording", {
			method: 'POST',
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({
				timecode: status.outputDuration
			}),
			signal: record_controller.signal
		})
		.then((response) => response.json())
		.then((data) => {
			clearTimeout(record_timeout)
			console.log(data)
			if(!data.recording_status) {
				$("#ffmpeg-record").text("Recorded!");
				$("#ffmpeg-record").css("background-color", "#55F76B");
				$("#ffmpeg-record").css("border-bottom", "3px solid #349641");
				setTimeout(function(){
					$("#ffmpeg-record").text("Record");
					$("#ffmpeg-record").css("background-color", "#FFFFFF");
					$("#ffmpeg-record").css("border-bottom", "3px solid #AAA");
				}, 2000);
			} else {
				$("#ffmpeg-record").text("Recording...");
				$("#ffmpeg-record").css("background-color", "#9146FF");
				$("#ffmpeg-record").css("border-bottom", "3px solid #44158a");
			}

		})
	})
}

function autoRecord(offset_ms) {
	obs.call(
		'GetRecordStatus'
	)
	.then(function(status) {
		var timecode = status.outputDuration
		if(!status.outputActive) {
		} 

		const record_controller = new AbortController()
		const record_timeout = setTimeout(() => {
			record_controller.abort()
			$("auto-record").text("Failed")
			setTimeout(function(){
				$("auto-record").text("Record")
			}, 2000);
		}, 5000);
		fetch("/save_auto_recording", {
			method: 'POST',
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({
				timecode: timecode
			}),
			signal: record_controller.signal
		})
		.then((response) => response.json())
		.then((data) => {
			clearTimeout(record_timeout)
			if(!data.recording_status) {
				record_controller.abort()
				$("#auto-record").text("Recorded")
				setTimeout(function(){
					$("#auto-record").text("Record")
				}, 2000);
			} else {
				$("#auto-record").text("Recording")
			}
		})
	})
}

function getAutoStatus() {
	obs.call('GetRecordStatus')
		.catch(() => false)
		.then(({outputActive}) => {
			$.ajax({
				type: 'GET',
				url: "/recording_status_auto",
				data: {},
				success: function(response) {
					console.log(response)
				},
				error: function(response) {
					console.log(response)
				},
				timeout: 5000
			})
		});
}

function clip() {
	obs.call(
		'GetRecordStatus'
	)
	.then(function(status) {
		current_color = $("#ffmpeg-clip").css("background-color");
		current_status = $("#ffmpeg-clip").text();
		current_border = $("#ffmpeg-clip").css("border-bottom");
		
		if(!status.outputActive) {
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
				timecode: status.outputDuration
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
				$(".ffmpeg-clip").css("border-bottom", "3px solid #F53535");
				$("#ffmpeg-clip").text("Error!");
				$("#ffmpeg-clip").append('<i class="fa-solid fa-triangle-exclamation"></i>')
			}

		})
	})

}

function change_best_of(value) {
	$("#bo3").prop('disabled', value == 3 ? true : false);
	$("#bo5").prop('disabled', value == 5 ? true : false);
	if (value != 3 && value != 5){
		console.log("ERROR: wrong best-of value provided - " + value)
	} else {
		best_of_value = value;
	}
}

/**
 * up : direction of page (true/false)
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
				$(`#set${x+1}`).css("display", "none");
			} else {
				$("#right_wrapper").css("display", "flex")

				$(`#set${x+1}`).css("display", "flex");
				$(`#set${x+1}`).attr("match_id", sets[index]["id"])

				if(sets[index]["player1"]["data"][1]["name"] != "") {
					$(`#set${x+1}_name1`).text(`${sets[index]["player1"]["data"][0]["name"]} / ${sets[index]["player1"]["data"][1]["name"]}`)
				} else {
					$(`#set${x+1}_name1`).text(sets[index]["player1"]["data"][0]["name"])
				}
				$(`#set${x+1}_name1`).attr("data-p1", JSON.stringify(sets[index]["player1"]["data"][0]))
				$(`#set${x+1}_name1`).attr("data-p2", JSON.stringify(sets[index]["player1"]["data"][1]))
				$(`#set${x+1}_name1`).attr("data-entrant", JSON.stringify(sets[index]["player1"]["entrant_id"]))

				if(sets[index]["player2"]["data"][1]["name"] != "") {
					$(`#set${x+1}_name2`).text(`${sets[index]["player2"]["data"][0]["name"]} / ${sets[index]["player2"]["data"][1]["name"]}`)
				} else {
					$(`#set${x+1}_name2`).text(sets[index]["player2"]["data"][0]["name"])
				}
				$(`#set${x+1}_name2`).attr("data-p1", JSON.stringify(sets[index]["player2"]["data"][0]))
				$(`#set${x+1}_name2`).attr("data-p2", JSON.stringify(sets[index]["player2"]["data"][1]))
				$(`#set${x+1}_name2`).attr("data-entrant", JSON.stringify(sets[index]["player2"]["entrant_id"]))

				$(`#set${x+1}_round`).text(sets[index]["round"])
			}
		} else {
			$(`#set${x+1}`).css("display", "none");
		}
	}
	if(sets.length == 0) {
		$("#right_wrapper").css("display", "none")
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

function load_set(x) {
	p1_data = JSON.parse($(`#set${x}_name1`).attr("data-p1"))
	p1d_data = JSON.parse($(`#set${x}_name1`).attr("data-p2"))
	p2_data = JSON.parse($(`#set${x}_name2`).attr("data-p1"))
	p2d_data = JSON.parse($(`#set${x}_name2`).attr("data-p2"))

	$("#p1_name").val(p1_data["name"])
	$("#p1d_name").val(p1d_data["name"])
	$("#p2_name").val(p2_data["name"])
	$("#p2d_name").val(p2d_data["name"])

	$("#p1_entrant").val($(`#set${x}_name1`).attr("data-entrant"))
	$("#p2_entrant").val($(`#set${x}_name2`).attr("data-entrant"))

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

/*async function reloadImg(url) {
	await fetch(url, { cache: 'reload', mode: 'no-cors' })
	document.body.querySelectorAll(`img[src='${url}']`)
	  .forEach(img => img.src = url)
}

probably delete this function*/

/* SET DATA */

function updateTournamentData(tournament) {
	$("#tournament_data").empty()
	const tournamentUrl = `${tournament.split(" ").join("_")}.json`
	$.ajax({
		type: 'GET',
		url: "/tournaments",
		data: {},
		success: function(response) {
			if (response.includes(tournamentUrl)) {
				$.ajax({
					type: 'GET',
					url: `/tournaments/${tournamentUrl}`,
					data: {},
					success: function(response) {
						$("#tournament_data").append(new Option(`Select set`, -1));
						var index = 0;
						for(let set of response) {
							console.log(set)
							var option = $('<option />')
								.text(`${set.players[0].tag} vs ${set.players[1].tag} - ${set.round}`)
								.val(index)
								.attr("data-set", JSON.stringify(set))
								.attr("data-tournament", tournament)
							$("#tournament_data").append(option);
							index++;
						}
						$("#screenshot-container-1").hide()
						$("#screenshot-container-2").hide()
						$("#set_update").hide()
						$("#load_tournament_data").show()
					},
					error: function(e) {
						console.log(`No valid tournament data found for ${tournamentUrl} - ${e}`)
						$("#load_tournament_data").hide()
					},
					timeout: 5000
				})
			} else {
				console.log(`No valid tournament data found for ${tournamentUrl}`)
				$("#load_tournament_data").hide()
			}
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
}

//make this shit pretty then make it submit to start.gg
function getTournamentSet() {
	var set = JSON.parse($("#tournament_data :selected").attr("data-set"));
	if(!set) {
		return
	}
	$("#display_set_results").empty()
	var player_names = $('<span />')
		.text(`${set.players[0].tag} vs ${set.players[1].tag}`)
	$("#display_set_results").append(player_names)
	for(let game of set.games) {
		var game_data = $('<span />')
			.text(`${game.Player1.stocks} ${game.Player1.character} vs ${game.Player2.character} ${game.Player2.stocks}`)
		$("#display_set_results").append(game_data);
	}
	index = 1;
	$("#screenshot-container-1").hide()
	$("#screenshot-container-2").hide()
	let success = true;
	for(let timecode of set.timecodes) {
		if(set.vod) {
			takeScreenshot(timecode, index, set.vod)
			$(`#timecode-${index}`).val(ms_to_hhmmss(timecode))
		}
		index++;
	}
	$(".screenshot_container").show()
	$("#set_update").show()
}

function takeScreenshot(timecode, index, vod) {
	$.ajax({
		type: 'POST',
		url: "/take_screenshot",
		data: {
			timecode: timecode,
			index: index,
			vod: vod
		},
		success: function(response) {
			return true;
		},
		error: function(response) {
			console.error(response)
			$(".screenshot_container").hide()
			$("#set_update").hide()
			return false;
		},
		timeout: 5000
	})
}

function showGetSets() {
	$("#get_sets").show()
}

function updateSet() {
	let data = JSON.parse($('#tournament_data :selected').attr("data-set"))
	data.timecodes[0] = hhmmss_to_ms($("#timecode-1").val())
	data.timecodes[1] = hhmmss_to_ms($("#timecode-2").val())

	let index = $('#tournament_data :selected').val()
	let tournament = `${$('#tournament_data :selected').attr("data-tournament")}.json`

	$.ajax({
		type: 'POST',
		url: "/update_set",
		data: {
			data: data,
			index: index,
			tournament: tournament
		},
		success: function() {
			$("#set_update").css("background-color", "#55F76B");
			$("#set_update").css("border-bottom", "3px solid #349641");
			$("#set_update").text("Success ");
			$("#set_update").append('<i class="fa-solid fa-thumbs-up"></i>')
			setTimeout(function(){
				$("#set_update").css("background-color", "#FFF");
				$("#set_update").css("border-bottom", "3px solid #AAA");
				$("#set_update").text("Submit");
			}, 2000);
			return true;
		},
		error: function(response) {
			console.error(response)
			$("#set_update").css("background-color", "#F56262");
			$("#set_update").css("border-bottom", "3px solid #F53535");
			$("#set_update").text("Error ");
			$("#set_update").append('<i class="fa-solid fa-triangle-exclamation"></i>')
			setTimeout(function(){
				$("#set_update").css("background-color", "#FFF");
				$("#set_update").css("border-bottom", "3px solid #AAA");
				$("#set_update").text("Submit");
			}, 2000);
			return false;
		},
		timeout: 5000
	})
}

function update_timecode(index) {
	const timecode = hhmmss_to_ms($(`#timecode-${index}`).val())
	const vod = JSON.parse($("#tournament_data :selected").attr("data-set")).vod;
	takeScreenshot(timecode, index, vod)
}

function ms_to_hhmmss(ms) {
	console.log(ms)
    let seconds = parseInt(ms / 1000);

	const minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms%1000).padStart(3, '0')}`;
};

function hhmmss_to_ms(input) {
	let raw = input.split(".")

	let hhmmss = raw[0].split(":")

	let ms = parseInt(raw[1])

	ms += parseInt(hhmmss[0])*60*60*1000
	ms += parseInt(hhmmss[1])*60*1000
	ms += parseInt(hhmmss[2])*1000
	
	return ms;
};