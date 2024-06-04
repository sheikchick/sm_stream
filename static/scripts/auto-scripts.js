isDoubles = false;
var obs;
var ip;
var sets = [];
var setPage = 0;

const phoneAspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");

$(document).ready(function () {
	obsConnect();
	loadChanges();
	changeBestOf(bestOfValue);
	toggleDoubles();
	updateTournamentData(tournament);
});

function obsConnect() {
	obs = new OBSWebSocket();

	ip = window.location.href.split(":")[1].substring(2);
	obsUrl = "ws://" + ip + ":" + obsPort;

	obs.connect(obsUrl, obsPassword)
		.then(() => {
			$("#obs-wrapper").css('display', 'flex');
			obs.call('GetSceneList')
				.then(function (value) {
					$("#scene-box").css('display', 'flex')
					value["scenes"].forEach(function (scene) {
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
	$(`p${player}-colour${slot}`).attr("src", "");
	$(`p${player}-colour${slot}`).hide();
	$(`p${player}-stock${slot}`).attr("src", "");
	$(`p${player}-stock${slot}` + slot).hide();
};

function resetBackground(player) {
	$(".css" + player).css("background-color", "transparent");
}

function update() {
	player1name = $("#p1-name").val();
	player1char = $("#p1-character-actual").attr("character");
	player1colour = $("#p1-character-actual").attr("colour");
	player1pronouns = $("#p1-pronouns").val();

	player1dname = $("#p1d-name").val();
	player1dchar = $("#p1d-character-actual").attr("character");
	player1dcolour = $("#p1d-character-actual").attr("colour");
	player1dpronouns = $("#p1d-pronouns").val();

	player1score = parseInt($("#p1-score-change").val());
	player1entrant = $("#p1-entrant").val();

	player2name = $("#p2-name").val();
	player2char = $("#p2-character-actual").attr("character");
	player2colour = $("#p2-character-actual").attr("colour");
	player2pronouns = $("#p2-pronouns").val();

	player2dname = $("#p2d-name").val();
	player2dchar = $("#p2d-character-actual").attr("character");
	player2dcolour = $("#p2d-character-actual").attr("colour");
	player2dpronouns = $("#p2d-pronouns").val();

	player2score = parseInt($("#p2-score-change").val());
	player2entrant = $("#p2-entrant").val();

	round = $("#round-change").val();
	setId = $("#set-id").val()
	tournament = $("#tournament-change").val();
	caster1 = "";
	caster2 = "";

	const updateController = new AbortController()
	const updateTimeout = setTimeout(() => {
		updateController.abort()
		$(".update").css("background-color", "#F56262");
		$(".update").css("border-bottom", "3px solid #F53535");
		$(".update").text("Error ");
		$(".update").append('<i class="fa-solid fa-triangle-exclamation"></i>')
		setTimeout(function () {
			$(".update").css("background-color", "#CBFFC7");
			$(".update").css("border-bottom", "3px solid #64B55E");
			$(".update").text("Update ");
			$(".update").append('<i class="fa fa-sync"></i>')
		}, 2000);
	}, 5000);
	fetch("/update", {
		method: 'POST',
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			team1: {
				players: [
					{
						name: player1name,
						character: player1char,
						colour: player1colour,
						pronouns: player1pronouns
					},
					{
						name: player1dname,
						character: player1dchar,
						colour: player1dcolour,
						pronouns: player1dpronouns,
					}
				],
				score: player1score,
				startggEntrant: player1entrant
			},
			team2: {
				players: [
					{
						name: player2name,
						character: player2char,
						colour: player2colour,
						pronouns: player2pronouns
					},
					{
						name: player2dname,
						character: player2dchar,
						colour: player2dcolour,
						pronouns: player2dpronouns,
					},
				],
				score: player2score,
				startggEntrant: player2entrant
			},
			round,
			setId,
			tournament,
			caster1,
			caster2,
			isDoubles,
			bestOf: bestOfValue
		}),
		signal: updateController.signal
	}).then(() => {
		clearTimeout(updateTimeout)
		updateTournamentData(tournament)
		$(".update").css("background-color", "#55F76B");
		$(".update").css("border-bottom", "3px solid #349641");
		$(".update").text("Updated ");
		$(".update").append('<i class="fa-solid fa-thumbs-up"></i>')
		setTimeout(function () {
			$(".update").css("background-color", "#CBFFC7");
			$(".update").css("border-bottom", "3px solid #64B55E");
			$(".update").text("Update ");
			$(".update").append('<i class="fa fa-sync"></i>')
		}, 2000);
	})
}

function swapSides() {
	player1name = $("#p1-name").val();
	player1dname = $("#p1d-name").val();
	player2name = $("#p2-name").val();
	player2dname = $("#p2d-name").val();

	player1pronouns = $("#p1-pronouns").val();
	player1dpronouns = $("#p1d-pronouns").val();
	player2pronouns = $("#p2-pronouns").val();
	player2dpronouns = $("#p2d-pronouns").val();

	$("#p1-name").val(player2name);
	$("#p1d-name").val(player2dname);
	$("#p2-name").val(player1name);
	$("#p2d-name").val(player1dname);

	$("#p1-pronouns").val(player2pronouns);
	$("#p1d-pronouns").val(player2dpronouns);
	$("#p2-pronouns").val(player1pronouns);
	$("#p2d-pronouns").val(player1dpronouns);
}

function swapTeam(n) {
	player1Name = $(`p${n}-name`).val();
	player2Name = $(`p${n}d-name`).val();

	player1Pronouns = $(`p${n}-pronouns`).val();
	player2Pronouns = $(`p${n}d-pronouns`).val();

	$(`p${n}-name`).val(player2Name);
	$(`p${n}d-name`).val(player1Name);

	$(`p${n}-pronouns`).val(player2Pronouns);
	$(`p${n}d-pronouns`).val(player1Pronouns);
}

function toggleDoubles() {
	isDoubles = $(".toggle-doubles").attr("value") != "true"
	//changing to singles
	if (isDoubles) {
		$(".toggle-doubles").attr("value", "true");
		$(".toggle-doubles").text("Singles ");
		$(".toggle-doubles").append("<i class='fa fa-user'></i>");

		$("#p1d-character-actual").hide();
		$("#p2d-character-actual").hide();
		$("#p1d-character-change").hide();
		$("#p2d-character-change").hide();
		$(".pronouns.change.doubles").hide();

		//resize for singles

		$(".swap").hide()
		$(".name.change").css("width", "340px")

		$("#p2-name").attr("placeholder", "Player 2 name")

		$("#p1d-name").hide();
		$("#p2d-name").hide();
		$("#p1d-name-actual").hide();
		$("#p2d-name-actual").hide();

		isDoubles = false;
	}
	//changing to doubles
	else {
		$(".toggle-doubles").attr("value", "false");
		$(".toggle-doubles").text("Doubles ");
		$(".toggle-doubles").append("<i class='fa fa-user-friends'></i>");

		$("#p1d-character-actual").show();
		$("#p2d-character-actual").show();
		$("#p1d-character-change").show();
		$("#p2d-character-change").show();
		$(".pronouns.change.doubles").show();

		//resize for doubles

		$(".swap").show()
		$(".name.change").css("width", "260px")


		$("#p2-name").attr("placeholder", "Player 1 name")
		$("#p1d-name").show();
		$("#p2d-name").show();

		$("#p1d-name-actual").show();
		$("#p2d-name-actual").show();

		isDoubles = true;
	}
}

function loadChanges() {
	$.ajax({
		type: 'GET',
		url: "/info.json",
		data: {},
		success: function (response) {
			$("#p1-name-actual").attr("value", response.team1.players[0].name)
			$("#p1d-name-actual").attr("value", response.team1.players[1].name)
			$("#p1-score-actual").attr("value", response.team1.score)

			$("#p2-name-actual").attr("value", response.team2.players[0].name)
			$("#p2d-name-actual").attr("value", response.team2.players[1].name)
			$("#p2-score-actual").attr("value", response.team2.score)

			$("#round-actual").attr("value", response.round)
			$("#best-of-actual").attr("value", "Best of " + response.bestOf)
			loadCharActual("1", response.team1.players[0].character, response.team1.players[0].colour)
			loadCharActual("1d", response.team1.players[1].character, response.team1.players[1].colour)
			loadCharActual("2", response.team2.players[0].character, response.team2.players[0].colour)
			loadCharActual("2d", response.team2.players[1].character, response.team2.players[1].colour)
		},
		error: function (response) {
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
			try {
				$.ajax({
					url: "static/img/screenshots/set/2.png",
					type: "GET",
					success: function () {
						$("#screenshot-2").attr("src", `static/img/screenshots/set/2.png?${Date.now()}`)
					},
					error: function (e) {
					},
					timeout: 5000
				});
			} catch (e) {

			}
		},
		error: function () {
		},
		timeout: 5000
	});
	setTimeout(loadChanges, 1000)
}

function loadCharActual(player, character, colour) {
	const characterParams = new URLSearchParams();
	characterParams.append('character', character);
	characterParams.append('colour', colour);
	const characterString = characterParams.toString();

	const characterActual = $(`#p${player}-character-actual`);
	characterActual.attr("character", character);
	characterActual.attr("colour", colour);

	characterActual.attr("src", '/stock?' + characterString);
	$(`#p${player}-character-change`).attr("src", "/csp?" + characterString);
}

function updateScene() {
	newScene = $("#scenes :selected").text();
	obs.call(
		'SetCurrentProgramScene', { 'sceneName': newScene }
	)
		.then(function (value) {
			console.log("Changed scene to '" + newScene + "'");
		})
}

function getRecordStatus() {
	obs.call('GetRecordStatus')
		.catch(() => false)
		.then(({ outputActive }) => {
			$.ajax({
				type: 'GET',
				url: "/recording_status",
				data: {},
				success: function (response) {
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
				error: function (response) {
					console.log(response)
				},
				timeout: 5000
			})
			$('#ffmpeg-record').prop('disabled', !outputActive);
			$('#ffmpeg-clip').prop('disabled', !outputActive);
		});
}

function recordSet() {
	obs.call(
		'GetRecordStatus'
	)
		.then(function (status) {
			currentColor = $("#ffmpeg-record").css("background-color");
			currentStatus = $("#ffmpeg-record").text();
			currentBorder = $("#ffmpeg-record").css("border-bottom");

			if (!status.outputActive) {
				$("#ffmpeg-record").css("background-color", "#F56262");
				$("#ffmpeg-record").css("border-bottom", "3px solid #F53535");
				$("#ffmpeg-record").text("OBS not recording");
				$("#ffmpeg-record").append('<i class="fa-solid fa-triangle-exclamation"></i>')

				setTimeout(function () {
					$("#ffmpeg-record").css("background-color", currentColor);
					$("#ffmpeg-record").css("border-bottom", currentBorder);
					$("#ffmpeg-record").text(currentStatus);
				}, 2000);
				return;
			}

			const recordController = new AbortController()
			const recordTimeout = setTimeout(() => {
				recordController.abort()

				currentColor = $("#ffmpeg-record").css("background-color");
				currentStatus = $("#ffmpeg-record").text();

				$("#ffmpeg-record").css("background-color", "#F56262");
				$(".update").css("border-bottom", "3px solid #F53535");
				$("#ffmpeg-record").text("OBS timeout");
				$("#ffmpeg-record").append('<i class="fa-solid fa-triangle-exclamation"></i>')

				setTimeout(function () {
					$("#ffmpeg-record").css("background-color", currentColor);
					$("#ffmpeg-record").css("border-bottom", currentBorder);
					$("#ffmpeg-record").text(currentStatus);
				}, 2000);
			}, 5000);
			fetch("/save_recording", {
				method: 'POST',
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					timecode: status.outputDuration
				}),
				signal: recordController.signal
			})
				.then((response) => response.json())
				.then((data) => {
					clearTimeout(recordTimeout)
					console.log(data)
					if (!data.recordingStatus) {
						$("#ffmpeg-record").text("Recorded!");
						$("#ffmpeg-record").css("background-color", "#55F76B");
						$("#ffmpeg-record").css("border-bottom", "3px solid #349641");
						setTimeout(function () {
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

function clip() {
	obs.call(
		'GetRecordStatus'
	)
		.then(function (status) {
			currentColor = $("#ffmpeg-clip").css("background-color");
			currentStatus = $("#ffmpeg-clip").text();
			currentBorder = $("#ffmpeg-clip").css("border-bottom");

			if (!status.outputActive) {
				$("#ffmpeg-clip").css("background-color", "#F56262");
				$("#ffmpeg-clip").css("border-bottom", "3px solid #F53535");
				$("#ffmpeg-clip").text("OBS not recording");
				$("#ffmpeg-clip").append('<i class="fa-solid fa-triangle-exclamation"></i>')

				setTimeout(function () {
					$("#ffmpeg-clip").css("background-color", currentColor);
					$("#ffmpeg-clip").css("border-bottom", currentBorder);
					$("#ffmpeg-clip").text(currentStatus);
				}, 2000);
				return;
			}

			const recordController = new AbortController()
			const recordTimeout = setTimeout(() => {
				recordController.abort()

				currentColor = $("#ffmpeg-clip").css("background-color");
				currentStatus = $("#ffmpeg-clip").text();

				$("#ffmpeg-clip").css("background-color", "#F56262");
				$(".update").css("border-bottom", "3px solid #F53535");
				$("#ffmpeg-clip").text("OBS timeout");
				$("#ffmpeg-clip").append('<i class="fa-solid fa-triangle-exclamation"></i>')

				setTimeout(function () {
					$("#ffmpeg-clip").css("background-color", currentColor);
					$("#ffmpeg-clip").css("border-bottom", currentBorder);
					$("#ffmpeg-clip").text(currentStatus);
				}, 2000);
			}, 5000);

			$("#ffmpeg-clip").text("Clipping...");
			$("#ffmpeg-clip").css("background-color", "#9146FF");
			$("#ffmpeg-clip").css("border-bottom", "3px solid #44158a");

			fetch("/save_clip", {
				method: 'POST',
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					timecode: status.outputDuration
				}),
				signal: recordController.signal
			})
				.then((response) => {
					if (`${response.status}`.startsWith(2)) {
						$("#ffmpeg-clip").text("Clipped!");
						$("#ffmpeg-clip").css("background-color", "#55F76B");
						$("#ffmpeg-clip").css("border-bottom", "3px solid #349641");
						setTimeout(function () {
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

function changeBestOf(value) {
	$("#bo3").prop('disabled', value == 3 ? true : false);
	$("#bo5").prop('disabled', value == 5 ? true : false);
	if (value != 3 && value != 5) {
		console.log("ERROR: wrong best-of value provided - " + value)
	} else {
		bestOfValue = value;
	}
}

/**
 * up : direction of page (true/false)
 */
function showSets(up) {
	const MAX_PER_PAGE = 5;
	if (up) {
		//check if going over the amount
		maxIndex = setPage * MAX_PER_PAGE;
		if (maxIndex < sets.length) {
			setPage++;
		}
		//should never occur but just in case
		else if (setPage > Math.ceil(sets.length / MAX_PER_PAGE)) {
			setPage = Math.ceil(sets.length / MAX_PER_PAGE);
		}
	} else {
		//limit to 1
		if (setPage > 1) {
			setPage--;
		}
		//should never occur but just in case
		else {
			setPage = 1;
		}
	}

	for (x = 0; x < MAX_PER_PAGE; x++) {
		index = x + ((setPage - 1) * MAX_PER_PAGE);
		if (typeof (sets.length) != "undefined") {
			if (sets.length == 0 || index >= sets.length) {
				$(`#set${x + 1}`).css("display", "none");
			} else {
				$("#right-wrapper").css("display", "flex")

				$(`#set${x + 1}`).css("display", "flex");
				$(`#set${x + 1}`).attr("data-id", sets[index]["id"])

				if (sets[index]["player1"]["data"][1]["name"] != "") {
					$(`#set${x + 1}-name1`).text(`${sets[index]["player1"]["data"][0]["name"]} / ${sets[index]["player1"]["data"][1]["name"]}`)
				} else {
					$(`#set${x + 1}-name1`).text(sets[index]["player1"]["data"][0]["name"])
				}
				$(`#set${x + 1}-name1`).attr("data-p1", JSON.stringify(sets[index]["player1"]["data"][0]))
				$(`#set${x + 1}-name1`).attr("data-p2", JSON.stringify(sets[index]["player1"]["data"][1]))
				$(`#set${x + 1}-name1`).attr("data-entrant", JSON.stringify(sets[index]["player1"]["entrantId"]))

				if (sets[index]["player2"]["data"][1]["name"] != "") {
					$(`#set${x + 1}-name2`).text(`${sets[index]["player2"]["data"][0]["name"]} / ${sets[index]["player2"]["data"][1]["name"]}`)
				} else {
					$(`#set${x + 1}-name2`).text(sets[index]["player2"]["data"][0]["name"])
				}
				$(`#set${x + 1}-name2`).attr("data-p1", JSON.stringify(sets[index]["player2"]["data"][0]))
				$(`#set${x + 1}-name2`).attr("data-p2", JSON.stringify(sets[index]["player2"]["data"][1]))
				$(`#set${x + 1}-name2`).attr("data-entrant", JSON.stringify(sets[index]["player2"]["entrantId"]))

				$(`#set${x + 1}-round`).text(sets[index]["round"])
			}
		} else {
			$(`#set${x + 1}`).css("display", "none");
		}
	}
	if (sets.length == 0) {
		$("#right-wrapper").css("display", "none")
	}

	//Hide arrows based on page number
	if (setPage == 1 || setPage == 0) {
		$("#page-left").hide()
	} else {
		$("#page-left").show()
	}
	maxIndex = setPage * MAX_PER_PAGE;
	if (maxIndex >= sets.length) {
		$("#page-right").hide()
	} else {
		$("#page-right").show()
	}
}

function loadSet(x) {
	p1Data = JSON.parse($(`#set${x}-name1`).attr("data-p1"))
	p1dData = JSON.parse($(`#set${x}-name1`).attr("data-p2"))
	p2Data = JSON.parse($(`#set${x}-name2`).attr("data-p1"))
	p2dData = JSON.parse($(`#set${x}-name2`).attr("data-p2"))

	$("#p1-name").val(p1Data["name"])
	$("#p1d-name").val(p1dData["name"])
	$("#p2-name").val(p2Data["name"])
	$("#p2d-name").val(p2dData["name"])

	$("#p1-entrant").val($(`#set${x}-name1`).attr("data-entrant"))
	$("#p2-entrant").val($(`#set${x}-name2`).attr("data-entrant"))

	p1pronouns = p1Data["pronouns"]
	p1dpronouns = p1dData["pronouns"]
	p2pronouns = p2Data["pronouns"]
	p2dpronouns = p2dData["pronouns"]
	$("#p1-pronouns").val(p1pronouns)
	$("#p1d-pronouns").val(p1dpronouns)
	$("#p2-pronouns").val(p2pronouns)
	$("#p2d-pronouns").val(p2dpronouns)
	$("#round-change").val($("#set" + x + "-round").text())
	$("#set-id").val($(`#set${x}`).attr("data-id"))
}

/* SET DATA */

function updateTournamentData(tournament) {
	$("#tournament-data").empty()
	const tournamentUrl = `${tournament.split(" ").join("_")}.json`
	$("#display-set-results").hide()
	$.ajax({
		type: 'GET',
		url: "/tournaments",
		data: {},
		success: function (response) {
			if (response.includes(tournamentUrl)) {
				$.ajax({
					type: 'GET',
					url: `/tournaments/${tournamentUrl}`,
					data: {},
					success: function (response) {
						$("#tournament-data").append(new Option(`Select set`, -1));
						var index = 0;
						for (let set of response) {
							console.log(set)
							var option = $('<option />')
								.text(`${set.team1.names[0]} vs ${set.team2.names[0]} - ${set.round}`)
								.val(index)
								.attr("data-set", JSON.stringify(set))
								.attr("data-tournament", tournament)
							$("#tournament-data").append(option);
							index++;
						}
						$("#screenshot-container-1").hide()
						$("#screenshot-container-2").hide()
						$("#set-update").hide()
						$("#load-tournament-data").show()
					},
					error: function (e) {
						console.log(`No valid tournament data found for ${tournamentUrl} - ${e}`)
						$("#load-tournament-data").hide()
					},
					timeout: 5000
				})
			} else {
				console.log(`No valid tournament data found for ${tournamentUrl}`)
				$("#load-tournament-data").hide()
			}
		},
		error: function (response) {
			console.log(response)
		},
		timeout: 5000
	})
}

function submitStartggSet() {
	var set = JSON.parse($("#tournament-data :selected").attr("data-set"));
	var startggSet = constructSet(set.team1.entrantId, set.team2.entrantId, set.games)
	submitSet(set.setId, set[`team${set.winner}`].entrantId, startggSet)
}

//make this shit pretty then make it submit to start.gg
function getTournamentSet() {
	const STOCK_ICON = `static/img/stock_icons`

	var set = JSON.parse($("#tournament-data :selected").attr("data-set"));
	if (!set) {
		return
	}
	$("#display-set-results").empty()
	$("#display-set-results").show()
	var playerNames = $('<span />')
		.text(`${set.team1.names[0]} vs ${set.team1.names[0]}`)
	$("#display-set-results").append(playerNames)
	for (let game of set.games) {
		var gameRow = $('<div />')
		for (x = 0; x < 4 - game.team1[0].stocks; x++) {
			gameRow.append($('<img />').attr("src", `${STOCK_ICON}/${getDefaultIcon(game.team1[0].character)}`).attr("class", 'stock-icon dark'))
		}
		for (x = 0; x < game.team1[0].stocks; x++) {
			gameRow.append($('<img />').attr("src", `${STOCK_ICON}/${getDefaultIcon(game.team1[0].character)}`).attr("class", 'stock-icon'))
		}
		gameRow.append($('<span />').attr("class", 'stage').text(` ${getStageShort(game.stage)} `))
		for (x = 0; x < game.team2[0].stocks; x++) {
			gameRow.append($('<img />').attr("src", `${STOCK_ICON}/${getDefaultIcon(game.team2[0].character)}`).attr("class", 'stock-icon'))
		}
		for (x = 0; x < 4 - game.team2[0].stocks; x++) {
			gameRow.append($('<img />').attr("src", `${STOCK_ICON}/${getDefaultIcon(game.team2[0].character)}`).attr("class", 'stock-icon dark'))
		}
		$("#display-set-results").append(gameRow);
	}
	$("#display-set-results").append($('<button />').attr('id', 'submitStartggSet').attr('onClick', 'submitStartggSet()').text("Submit start.gg"));
	index = 1;
	$("#screenshot-container-1").hide()
	$("#screenshot-container-2").hide()
	let success = true;
	for (let timecode of set.timecodes) {
		if (set.vod) {
			takeScreenshot(timecode, index, set.vod)
			$(`#timecode-${index}`).val(msToHHmmss(timecode))
		}
		index++;
	}
	$(".screenshot-container").show()
	$("#set-update").show()
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
		success: function (response) {
			return true;
		},
		error: function (response) {
			console.error(response)
			$(".screenshot-container").hide()
			$("#set-update").hide()
			return false;
		},
		timeout: 5000
	})
}

function showGetSets() {
	$("#get-sets").show()
}

function updateSet() {
	let data = JSON.parse($('#tournament-data :selected').attr("data-set"))
	data.timecodes[0] = HHmmssToMs($("#timecode-1").val())
	data.timecodes[1] = HHmmssToMs($("#timecode-2").val())

	let index = $('#tournament-data :selected').val()
	let tournament = `${$('#tournament-data :selected').attr("data-tournament")}.json`

	$.ajax({
		type: 'POST',
		url: "/update_set",
		data: {
			data: data,
			index: index,
			tournament: tournament
		},
		success: function () {
			$("#set-update").css("background-color", "#55F76B");
			$("#set-update").css("border-bottom", "3px solid #349641");
			$("#set-update").text("Success ");
			$("#set-update").append('<i class="fa-solid fa-thumbs-up"></i>')
			setTimeout(function () {
				$("#set-update").css("background-color", "#FFF");
				$("#set-update").css("border-bottom", "3px solid #AAA");
				$("#set-update").text("Submit timestamps");
			}, 2000);
			return true;
		},
		error: function (response) {
			console.error(response)
			$("#set-update").css("background-color", "#F56262");
			$("#set-update").css("border-bottom", "3px solid #F53535");
			$("#set-update").text("Error ");
			$("#set-update").append('<i class="fa-solid fa-triangle-exclamation"></i>')
			setTimeout(function () {
				$("#set-update").css("background-color", "#FFF");
				$("#set-update").css("border-bottom", "3px solid #AAA");
				$("#set-update").text("Submit timestamps");
			}, 2000);
			return false;
		},
		timeout: 5000
	})
}

function updateTimecode(index) {
	const timecode = HHmmssToMs($(`#timecode-${index}`).val())
	const vod = JSON.parse($("#tournament-data :selected").attr("data-set")).vod;
	takeScreenshot(timecode, index, vod)
}

function msToHHmmss(ms) {
	console.log(ms)
	let seconds = parseInt(ms / 1000);

	const minutes = parseInt(seconds / 60);
	seconds = seconds % 60;

	const hours = parseInt(seconds / 3600);
	seconds = seconds % 3600;

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};

function HHmmssToMs(input) {
	let raw = input.split(".")

	let hhmmss = raw[0].split(":")

	let ms = parseInt(raw[1])

	ms += parseInt(hhmmss[0]) * 60 * 60 * 1000
	ms += parseInt(hhmmss[1]) * 60 * 1000
	ms += parseInt(hhmmss[2]) * 1000

	return ms;
};

function getDefaultIcon(character) {
	switch (character) {
		case "bowser":
		case "link":
		case "luigi":
		case "yoshi":
		case "younglink":
			return `${character}/green.png`
		case "iceclimbers":
		case "marth":
			return `${character}/blue.png`
		case "kirby":
		case "mario":
		case "ness":
		case "peach":
		case "samus":
			return `${character}/red.png`
		default:
			return `${character}/original.png`
	}
}

function getStageShort(stage) {
	switch (stage) {
		case "Yoshi's Story":
			return "YS"
		case "Fountain of Dreams":
			return "FoD"
		case "Pokemon Stadium":
		case "Pokémon Stadium":
			return "PS"
		case "Battlefield":
			return "BF"
		case "Final Destination":
			return "FD"
		case "Dream Land":
		case "Dream Land 64":
		case "Dream Land N64":
			return "DL"
		default:
			return "VS"
	}
}