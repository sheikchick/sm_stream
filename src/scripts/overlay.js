var info;
var obs;
var ip;

var tournamentName = ""
var sets = [];
var setPage = 0;

var isDoubles = false;

var startggSwapped = false;

function isMelee() {
	return GAME === "melee"
}

$(document).ready(function () {
	populateFlags();
	obsConnect();
	loadInitialChanges();
	loadChanges();
	updateSeatsLoop();
	changeBestOf(bestOfValue);
	toggleDoubles();
	hoverListeners();
	autocompleteListneners();
	getDBAutocomplete();
});

function hoverListeners() {
	$("#swap-info").hover(highlightInfo, clearInfo)
	if (!hideSwapAll) {
		$("#swap-all, #swap-chars").css("opacity", "1")
		$("#swap-chars").hover(highlightChars, clearChars)
		$("#swap-all").hover(() => {
			highlightInfo()
			highlightChars()
		}, () => {
			clearInfo()
			clearChars()
		})
	} else {
		$("#swap-chars").css("opacity", 0)
		$("#swap-chars").prop("disabled", true)
		$("#swap-all").css("opacity", 0)
		$("#swap-all").prop("disabled", true)
	}
	$("#team1-swap").hover(() => {
		gsap.to($("input.slug.change.left"), { "background-color": "#FFFFCC", duration: 0.2 })
		gsap.to($("input.pronouns.change.left"), { "background-color": "#FFFFCC", duration: 0.2 })
		gsap.to($("select.flag.change.left"), { "background-color": "#FFFFCC", duration: 0.2 })
		gsap.to($("input.name.change.left"), { "background-color": "#FFFFCC", duration: 0.2 })
	}, () => {
		gsap.to($("input.slug.change.left"), { "background-color": "white", duration: 0.2 })
		gsap.to($("input.pronouns.change.left"), { "background-color": "white", duration: 0.2 })
		gsap.to($("select.flag.change.left"), { "background-color": "white", duration: 0.2 })
		gsap.to($("input.name.change.left"), { "background-color": "white", duration: 0.2 })
	})
	$("#team2-swap").hover(() => {
		gsap.to($("input.slug.change.right"), { "background-color": "#FFFFCC", duration: 0.2 })
		gsap.to($("input.pronouns.change.right"), { "background-color": "#FFFFCC", duration: 0.2 })
		gsap.to($("select.flag.change.right"), { "background-color": "#FFFFCC", duration: 0.2 })
		gsap.to($("input.name.change.right"), { "background-color": "#FFFFCC", duration: 0.2 })
	}, () => {
		gsap.to($("input.slug.change.right"), { "background-color": "white", duration: 0.2 })
		gsap.to($("input.pronouns.change.right"), { "background-color": "white", duration: 0.2 })
		gsap.to($("select.flag.change.right"), { "background-color": "white", duration: 0.2 })
		gsap.to($("input.name.change.right"), { "background-color": "white", duration: 0.2 })
	})
}

function highlightInfo() {
	gsap.to($("input.slug.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.prefix.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.pronouns.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("select.flag.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.name.change"), { "background-color": "#FFFFCC", duration: 0.2 })

}
function clearInfo() {
	gsap.to($("input.slug.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.prefix.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.pronouns.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("select.flag.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.name.change"), { "background-color": "white", duration: 0.2 })
}

function highlightChars() {
	gsap.to($(".csp.change"), { "background-color": "rgba(255,255,170,0.3)", duration: 0.2 })
}

function clearChars() {
	gsap.to($(".csp.change"), { "background-color": "rgba(255,255,170,0)", duration: 0.2 })
}

function populateFlags() {
	$("select.flag").each((key, select) => {
		//from flags.js
		for (let [key, value] of Object.entries(continents)) {
			optgroup = document.createElement("OPTGROUP")
			$(optgroup).attr("label", key)
			//$(optgroup).append(`<option disabled>${key}</option>`)
			for (let country of value) {
				$(optgroup).append(`<option value="${country.country}">${country.emoji} ${country.country}</option>`)
			}
			$(select).append(optgroup)
		}

	})
}

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

const portColours = [
	"red",
	"blue",
	"yellow",
	"green"
]

function resolveTeamColour(colour) {
	switch (colour) {
		case "red":
		case "blue":
		case "green":
			return colour
		default:
			return "yellow";
	}
}

function fixPlayerColours() {
	if (!info) {
		return
	}
	//background colours
	if (isDoubles) {
		p1colour = resolveTeamColour(info.team1.players[0].colour)
		p2colour = resolveTeamColour(info.team2.players[0].colour)

	} else {
		p1colour = portColours[Math.min(info.team1.players[0].port - 1, 3)]
		p2colour = portColours[Math.min(info.team2.players[0].port - 1, 3)]
	}

	for (let selector of ["input", "button", "select"]) {
		if (!$(`${selector}.left`).hasClass(p1colour)) {
			$(`${selector}.left`).removeClass(portColours)
			$(`${selector}.left`).addClass(p1colour)
		}
		if (!$(`${selector}.right`).hasClass(p2colour)) {
			$(`${selector}.right`).removeClass(portColours)
			$(`${selector}.right`).addClass(p2colour)
		}
	}
	if (!$("#p1-info-change").hasClass(`${p1colour}-bg`)) {
		$("#p1-info-change").removeClass(["red-bg", "blue-bg", "yellow-bg", "green-bg",])
		$("#p1-info-change").addClass(`${p1colour}-bg`)
	}
	if (!$("#p2-info-change").hasClass(`${p2colour}-bg`)) {
		$("#p2-info-change").removeClass(["red-bg", "blue-bg", "yellow-bg", "green-bg",])
		$("#p2-info-change").addClass(`${p2colour}-bg`)
	}
}

function fixSeatColour(index) {
	switch (index) {
		case "1":
		case 1:
		case "2":
		case 2:
			return $("#p1-info-change").css("background-color")
		case "3":
		case 3:
		case "4":
		case 4:
			return $("#p2-info-change").css("background-color")
		default:
			return "#442222"
	}
}

function fixSeatAccent(index) {
	switch (index) {
		case "1":
		case 1:
		case "2":
		case 2:
			return $("input.left").attr("borderColor")
		case "3":
		case 3:
		case "4":
		case 4:
			return $("input.right").attr("borderColor")
		default:
			return "#442222"
	}
}

function updateSeatsLoop() {
	localStorage.setItem("startggSlug", $("#tournament-slug").text())
	$(".seat").each((index, seat) => {
		player = getSeatPlayer(parseInt($(seat).attr("index")))
		$(seat).find(".name").text(player.name)
		$(seat).find(".stock-icon").attr('src', `static/img/${GAME}/stock_icons/${player.character.character || "empty"}/${player.character.colour || "red"}.png`)
		$(seat).css("background-color", fixSeatColour($(seat).attr("index")))
	})
	if (["1", "2"].includes($("#p1-left-seat").attr("index"))) {
		$("#left-seat-changer").css("border-bottom", $(`#t1p1-database`).css("border-bottom"))
		$("#right-seat-changer").css("border-bottom", $(`#t2p1-database`).css("border-bottom"))
	} else {
		$("#left-seat-changer").css("border-bottom", $(`#t2p1-database`).css("border-bottom"))
		$("#right-seat-changer").css("border-bottom", $(`#t1p1-database`).css("border-bottom"))
	}
	fixPlayerColours()
	setTimeout(updateSeatsLoop, 50)
}

function getSeatPlayer(index) {
	sign = ["p1", "p1d", "p2", "p2d"]
	return ({
		name: $(`#${sign[index - 1]}-name`).val(),
		character: {
			character: $(`#${sign[index - 1]}-character-change`).attr("character"),
			colour: $(`#${sign[index - 1]}-character-change`).attr("colour")
		}
	})
}

function resetSeats() {
	$(`#p1-left-seat`).attr("index", "1")
	$(`#p1-right-seat`).attr("index", "2")
	$(`#p2-left-seat`).attr("index", "3")
	$(`#p2-right-seat`).attr("index", "4")
}

function swapSeatTeam(i) {
	index1 = $(`#p${i}-left-seat`).attr("index")
	index2 = $(`#p${i}-right-seat`).attr("index")
	$(`#p${i}-left-seat`).attr("index", index2)
	$(`#p${i}-right-seat`).attr("index", index1)
}

function swapSeatSides() {
	index1 = $(`#p1-left-seat`).attr("index")
	index2 = $(`#p1-right-seat`).attr("index")
	index3 = $(`#p2-left-seat`).attr("index")
	index4 = $(`#p2-right-seat`).attr("index")
	$(`#p1-left-seat`).attr("index", index3)
	$(`#p1-right-seat`).attr("index", index4)
	$(`#p2-left-seat`).attr("index", index1)
	$(`#p2-right-seat`).attr("index", index2)
}

function submitNewPlayer(index) {
	if (!isMelee()) {
		return
	}
	let request = {
		"slug": $(`#p${index}-slug`).val(),
		"name": $(`#p${index}-name`).val().replace(" (L)", ""),
		"country": $(`#p${index}-flag`).val(),
		"pronouns": $(`#p${index}-pronouns`).val(),
		"character": $(`#p${index}-character-change`).attr("character"),
		"colour": $(`#p${index}-character-change`).attr("colour")
	}
	submitPlayer(request)
}

function resetScores() {
	$(`#p1-score-change`).val(0)
	$(`#p2-score-change`).val(0)
}

function changeScore(value, player) {
	initialScore = $(`#p${player}-score-change`).val()
	if ((parseInt(initialScore) <= 0 && value <= -1) || (parseInt(initialScore) >= 99 && value >= 1)) {
		return
	}
	$(`#p${player}-score-change`).val(parseInt(initialScore) + value)
}

function swapSides(info, characters) {
	if (info) {
		console.log(startggSwapped)
		startggSwapped = !startggSwapped
		console.log(startggSwapped)
		player1slug = $("#p1-slug").val();
		player1dslug = $("#p1d-slug").val();
		player2slug = $("#p2-slug").val();
		player2dslug = $("#p2d-slug").val();

		player1name = $("#p1-name").val();
		player1dname = $("#p1d-name").val();
		player2name = $("#p2-name").val();
		player2dname = $("#p2d-name").val();

		player1prefix = $("#p1-prefix").val();
		player1dprefix = $("#p1d-prefix").val();
		player2prefix = $("#p2-prefix").val();
		player2dprefix = $("#p2d-prefix").val();

		player1pronouns = $("#p1-pronouns").val();
		player1dpronouns = $("#p1d-pronouns").val();
		player2pronouns = $("#p2-pronouns").val();
		player2dpronouns = $("#p2d-pronouns").val();

		player1flag = $("#p1-flag").val();
		player1dflag = $("#p1d-flag").val();
		player2flag = $("#p2-flag").val();
		player2dflag = $("#p2d-flag").val();

		$("#p1-slug").val(player2slug);
		$("#p1d-slug").val(player2dslug);
		$("#p2-slug").val(player1slug);
		$("#p2d-slug").val(player1dslug);

		$("#p1-name").val(player2name);
		$("#p1d-name").val(player2dname);
		$("#p2-name").val(player1name);
		$("#p2d-name").val(player1dname);

		$("#p1-prefix").val(player2prefix);
		$("#p1d-prefix").val(player2dprefix);
		$("#p2-prefix").val(player1prefix);
		$("#p2d-prefix").val(player1dprefix);

		$("#p1-pronouns").val(player2pronouns);
		$("#p1d-pronouns").val(player2dpronouns);
		$("#p2-pronouns").val(player1pronouns);
		$("#p2d-pronouns").val(player1dpronouns);

		$("#p1-flag").val(player2flag).change();
		$("#p1d-flag").val(player2dflag).change();
		$("#p2-flag").val(player1flag).change();
		$("#p2d-flag").val(player1dflag).change();
	}
	if (characters) {
		p1 = {
			character: $("#p1-character-change").attr("character"),
			colour: $("#p1-character-change").attr("colour")
		};
		p1d = {
			character: $("#p1d-character-change").attr("character"),
			colour: $("#p1d-character-change").attr("colour")
		};
		p2 = {
			character: $("#p2-character-change").attr("character"),
			colour: $("#p2-character-change").attr("colour")
		};
		p2d = {
			character: $("#p2d-character-change").attr("character"),
			colour: $("#p2d-character-change").attr("colour")
		};

		$("#p1-character-change").attr("character", p2.character);
		$("#p1-character-change").attr("colour", p2.colour);
		$("#p1-character-change").attr("src", `static/img/${GAME}/csp_icons/${p2.character}/${p2.colour}.png`);

		$("#p1d-character-change").attr("character", p2d.character);
		$("#p1d-character-change").attr("colour", p2d.colour);
		$("#p1d-character-change").attr("src", `static/img/${GAME}/csp_icons/${p2d.character}/${p2d.colour}.png`);

		$("#p2-character-change").attr("character", p1.character);
		$("#p2-character-change").attr("colour", p1.colour);
		$("#p2-character-change").attr("src", `static/img/${GAME}/csp_icons/${p1.character}/${p1.colour}.png`);

		$("#p2d-character-change").attr("character", p1d.character);
		$("#p2d-character-change").attr("colour", p1d.colour);
		$("#p2d-character-change").attr("src", `static/img/${GAME}/csp_icons/${p1d.character}/${p1d.colour}.png`);
	}
}

function swapTeam(n) {
	player1Slug = $(`#p${n}-slug`).val();
	player2Slug = $(`#p${n}d-slug`).val();

	player1Name = $(`#p${n}-name`).val();
	player2Name = $(`#p${n}d-name`).val();

	player1Prefix = $(`#p${n}-prefix`).val();
	player2Prefix = $(`#p${n}d-prefix`).val();

	player1Pronouns = $(`#p${n}-pronouns`).val();
	player2Pronouns = $(`#p${n}d-pronouns`).val();

	player1flag = $(`#p${n}-flag`).val();
	player2flag = $(`#p${n}d-flag`).val();

	$(`#p${n}-slug`).val(player2Slug);
	$(`#p${n}d-slug`).val(player1Slug);

	$(`#p${n}-name`).val(player2Name);
	$(`#p${n}d-name`).val(player1Name);

	$(`#p${n}-prefix`).val(player2Prefix);
	$(`#p${n}d-prefix`).val(player1Prefix);

	$(`#p${n}-pronouns`).val(player2Pronouns);
	$(`#p${n}d-pronouns`).val(player1Pronouns);

	$(`#p${n}-flag`).val(player2flag).change();
	$(`#p${n}d-flag`).val(player1flag).change();
}

function toggleDoubles() {
	isDoubles = $(".toggle-doubles").attr("value") != "true"
	//changing to singles
	if (isDoubles) {
		$(".toggle-doubles").attr("value", "true");
		$(".toggle-doubles").text("Singles ");
		$(".toggle-doubles").append("<i class='fa fa-user'></i>");

		$(".name.actual.doubles").hide();
		$(".stock-icon.actual.doubles").hide();

		$(".swap").hide()

		$(".player.header.row.doubles").hide();
		$(".player.info.row.doubles").hide();
		$(".database.doubles").prop("disabled", true);
		$(".slug.doubles").prop("disabled", true);
		$(".name.change.doubles").prop("disabled", true);
		$(".pronouns.change.doubles").prop("disabled", true);
		$(".flag.change.doubles").prop("disabled", true);
		$(".csp.change.doubles").hide();
		$(".team-colour-wrapper").hide();

		$(".seat.right").hide();
		$(".seat-changer.side").hide();
		$(".fa-chair.doubles").hide();

		$("#reset-scores").css({ "margin-left": "23px" })

		//fix seat orientation so always indices 1 and 3
		validIndices = ["1", "3"]
		if (!validIndices.includes($("#p1-left-seat").attr("index"))) {
			swapSeatTeam(1);
		}
		if (!validIndices.includes($("#p2-left-seat").attr("index"))) {
			swapSeatTeam(2);
		}
		isDoubles = false;
	}
	//changing to doubles
	else {
		$(".toggle-doubles").attr("value", "false");
		$(".toggle-doubles").text("Doubles ");
		$(".toggle-doubles").append("<i class='fa fa-user-friends'></i>");

		$(".name.actual.doubles").show();
		$(".stock-icon.actual.doubles").show();

		$(".swap").show()

		$(".player.header.row.doubles").show();
		$(".player.info.row.doubles").show();
		$(".database.doubles").prop("disabled", false);
		$(".slug.doubles").prop("disabled", false);
		$(".name.change.doubles").prop("disabled", false);
		$(".name.change.doubles").prop("disabled", false);
		$(".flag.change.doubles").prop("disabled", false);
		$(".csp.change.doubles").show();
		$(".team-colour-wrapper").show();

		$(".seat.right").show();
		$(".seat-changer.side").show();
		$(".fa-chair.doubles").show();

		$("#reset-scores").css({ "margin-left": "59px" })

		isDoubles = true;
	}
}

/**
 * Load character into slot
 * @param {String} player 1, 1d, 2, 2d
 * @param {*} character character
 * @param {*} colour colour
 */
function loadCharActual(player, character = "empty", colour) {
	const characterActual = $(`#${player}-character-actual`);
	const characterChange = $(`#${player}-character-change`)
	if (characterActual.attr("character") !== character || characterActual.attr("colour") !== colour) {
		characterActual.attr("character", character);
		characterActual.attr("colour", colour);
		characterActual.attr("src", `static/img/${GAME}/stock_icons/${character}/${colour}.png`);

		characterChange.attr("character", character);
		characterChange.attr("colour", colour);
		characterChange.attr("src", `static/img/${GAME}/csp_icons/${character}/${colour}.png`);
	}
}

/**
 * Load character into slot for changing - use when not updating
 * @param {String} player p1, p1d, p2, p2d
 * @param {*} character character
 * @param {*} colour colour
 */
function loadCharChange(player, character, colour) {
	if (!character) {
		return
	}
	if (!colour) {
		colour = getDefaultColour(character)
	}
	const characterChange = $(`#${player}-character-change`)
	characterChange.attr("character", character);
	characterChange.attr("colour", colour);
	characterChange.attr("src", `static/img/${GAME}/csp_icons/${character}/${colour}.png`);
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
				url: "/recording-status",
				data: {},
				success: function (response) {
					if (outputActive && response.recordingStatus) {
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

function clip() {
	obs.call(
		'GetRecordStatus'
	)
		.then(function (status) {
			currentColor = $("#ffmpeg-clip").css("background-color");
			currentStatus = $("#ffmpeg-clip").text();
			currentBorder = $("#ffmpeg-clip").css("border-bottom");

			if (!status.outputActive) {
				console.log("OBS not recording")
				$("#ffmpeg-clip").css("background-color", "#F56262");
				$("#ffmpeg-clip").css("border-bottom", "3px solid #F53535");
				setTimeout(function () {
					$(".clip").attr("src", "static/img/clip.svg");
					$("#ffmpeg-clip").css("background-color", "#FFFFFF");
					$("#ffmpeg-clip").css("border-bottom", "3px solid #AAA");
				}, 2000);
				return;
			}

			const recordController = new AbortController()
			const recordTimeout = setTimeout(() => {
				recordController.abort()
				console.log("Horizontal clip: ERROR")
				console.log("Vertical clip  : ERROR")
				$("#ffmpeg-clip").css("background-color", "#F56262");
				$("#ffmpeg-clip").css("border-bottom", "3px solid #F53535");
				setTimeout(function () {
					$(".clip").attr("src", "static/img/clip.svg");
					$("#ffmpeg-clip").css("background-color", "#FFFFFF");
					$("#ffmpeg-clip").css("border-bottom", "3px solid #AAA");
				}, 2000);
				return;
			}, 5000);

			$("#ffmpeg-clip").css("background-color", "#9146FF");
			$("#ffmpeg-clip").css("border-bottom", "3px solid #44158a");

			fetch("/save-clip", {
				method: 'POST',
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					timecode: status.outputDuration,
					tournament: info?.tournament || "default",
				}),
				signal: recordController.signal
			})
				.then((response) => {
					clearTimeout(recordTimeout)
					console.log(response.status)
					if (response.status === 200) {
						console.log("Horizontal clip: SAVED")
						console.log("Vertical clip  : SAVED")
						$(".clip").attr("src", "static/img/clip_shut.svg");
						$("#ffmpeg-clip").css("background-color", "#55F76B");
						$("#ffmpeg-clip").css("border-bottom", "3px solid #349641");
						setTimeout(function () {
							$(".clip").attr("src", "static/img/clip.svg");
							$("#ffmpeg-clip").css("background-color", "#FFFFFF");
							$("#ffmpeg-clip").css("border-bottom", "3px solid #AAA");
						}, 2000);
					} else if (response.status === 207) {
						console.log("Horizontal clip: SAVED")
						console.log("Vertical clip  : ERROR")
						$(".clip").attr("src", "static/img/clip_shut.svg");
						$("#ffmpeg-clip").css("background-color", "#f7a655");
						$("#ffmpeg-clip").css("border-bottom", "3px solid #965b34");
						setTimeout(function () {
							$(".clip").attr("src", "static/img/clip.svg");
							$("#ffmpeg-clip").css("background-color", "#FFFFFF");
							$("#ffmpeg-clip").css("border-bottom", "3px solid #AAA");
						}, 2000);
					} else {
						console.log("Horizontal clip: ERROR")
						console.log("Vertical clip  : ERROR")
						$("#ffmpeg-clip").css("background-color", "#F56262");
						$("#ffmpeg-clip").css("border-bottom", "3px solid #F53535");
						setTimeout(function () {
							$(".clip").attr("src", "static/img/clip.svg");
							$("#ffmpeg-clip").css("background-color", "#FFFFFF");
							$("#ffmpeg-clip").css("border-bottom", "3px solid #AAA");
						}, 2000);
					}
				})
		})

}

function changeBestOf(value) {
	if (!value) {
		value = $("#best-of-change").find(":selected").val()
	}
	switch (value) {
		case "3":
		case "7":
		case "9":
			bestOfValue = parseInt(value);
			$("#best-of-change").val(value)
			break;
		default:
			bestOfValue = 5;
			$("#best-of-change").val("5")
			break;
	}
}

function showGetSets() {
	$("#get-sets").show()
}

/**
 * up : direction of page (true/false)
 */
function showSets(up, showButtons) {
	$("#page-left").attr("onclick", `showSets(false, ${showButtons})`)
	$("#page-right").attr("onclick", `showSets(true, ${showButtons})`)
	if (showButtons) {
		$(".startgg.button.save").show()
	} else {
		$(".startgg.button.save").hide()
	}
	const MAXPERPAGE = 5;
	if (up) {
		//check if going over the amount
		maxIndex = setPage * MAXPERPAGE;
		if (maxIndex < sets.length) {
			setPage++;
		}
		//should never occur but just in case
		else if (setPage > Math.ceil(sets.length / MAXPERPAGE)) {
			setPage = Math.ceil(sets.length / MAXPERPAGE);
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

	for (x = 1; x <= MAXPERPAGE; x++) {
		index = x + ((setPage - 1) * MAXPERPAGE) - 1;
		if (typeof (sets.length) != "undefined") {
			if (sets.length == 0 || index >= sets.length) {
				$(`#set${x}`).css("display", "none");
			} else if (sets?.[index] == undefined) {
				//not ideal
				$(`#set${x}`).css("display", "none");
			} else {
				$(`#set${x}`).css("display", "flex");
				$(`#set${x}`).attr("set-index", index)

				if (sets[index].player1.data.length > 1) {
					$(`#set${x}-name1`).text(`${sets[index].player1.data[0].name} / ${sets[index].player1.data[1].name}`)
				} else {
					$(`#set${x}-name1`).text(sets[index].player1.data[0].name)
				}

				if (sets[index].player2.data.length > 1) {
					$(`#set${x}-name2`).text(`${sets[index].player2.data[0].name} / ${sets[index].player2.data[1].name}`)
				} else {
					$(`#set${x}-name2`).text(sets[index].player2.data[0].name)
				}

				$(`#set${x}-round`).text(sets[index].round)
			}
		} else {
			$(`#set${x}`).css("display", "none");
		}
	}
	if (sets.length == 0) {
		$("#right-wrapper>.set").hide()
		$(".page-button").hide()
	}

	//Hide arrows based on page number
	if (setPage == 1 || setPage == 0) {
		$("#page-left").hide()
	} else {
		$("#page-left").show()
	}
	maxIndex = setPage * MAXPERPAGE;
	if (maxIndex >= sets.length) {
		$("#page-right").hide()
	} else {
		$("#page-right").show()
	}
}

function loadSet(x) {
	const BLANKPLAYER = {
		slug: "",
		name: "",
		prefix: "",

	}
	startggSwapped = false;

	let setID = parseInt($(`#set${x}`).attr("set-index"))
	let set = sets[setID]

	let p1Loser = set.round === "Grand Final Reset" ? " (L)" : "";
	let p2Loser = set.round.startsWith("Grand Final") ? " (L)" : "";

	//if no data
	if (!set.player1.data[0] || !set.player2.data[0]) {
		return
	}

	//p1
	let p1Data = set.player1.data[0]
	$("#p1-slug").val(p1Data.slug)
	$("#p1-name").val(p1Data.name + p1Loser)
	$("#p1-prefix").val(p1Data.prefix)
	$("#p1-pronouns").val(p1Data.pronouns)
	$("#p1-flag").val(fixCountry(p1Data.country)).change();
	if (isMelee()) {
		let p1Db = getPlayer(p1Data.slug)
		if (p1Db) {
			if (p1Db.character !== "") {
				loadCharChange("p1", p1Db.character, p1Db.colour || undefined) //may need to be || ""
			}
		}
	}

	//p1d
	let p1dData = set.player1.data[1] || BLANKPLAYER
	$("#p1d-slug").val(p1dData.slug)
	$("#p1d-name").val(p1dData.name + p1Loser)
	$("#p1d-prefix").val(p1dData.prefix)
	$("#p1d-pronouns").val(p1dData.pronouns)
	$("#p1d-flag").val(fixCountry(p1dData.country)).change();
	if (isMelee()) {
		let p1dDb = getPlayer(p1dData.slug)
		if (p1dDb) {
			if (p1dDb.character !== "") {
				loadCharChange("p1d", p1dDb.character, p1dDb.colour || undefined)
			}
		}
	}

	let p2Data = set.player2.data[0]
	$("#p2-slug").val(p2Data.slug)
	$("#p2-name").val(p2Data.name + p2Loser)
	$("#p2-prefix").val(p2Data.prefix)
	$("#p2-pronouns").val(p2Data.pronouns)
	$("#p2-flag").val(fixCountry(p2Data.country)).change();
	if (isMelee()) {
		let p2Db = getPlayer(p2Data.slug)
		if (p2Db) {
			if (p2Db.character !== "") {
				loadCharChange("p2", p2Db.character, p2Db.colour || undefined)
			}
		}
	}

	//p2d
	let p2dData = set.player2.data[1] || BLANKPLAYER
	$("#p2d-slug").val(p2dData.slug)
	$("#p2d-name").val(p2dData.name + p2Loser)
	$("#p2d-prefix").val(p2dData.prefix)
	$("#p2d-pronouns").val(p2dData.pronouns)
	$("#p2d-flag").val(fixCountry(p2dData.country)).change();
	if (isMelee()) {
		let p2dDb = getPlayer(p2dData.slug)
		if (p2dDb) {
			if (p2dDb.character !== "") {
				loadCharChange("p2d", p2dDb.character, p2dDb.colour || undefined)
			}
		}
	}
	console.log(set)

	$("#startgg-p1-entrant").text(set.player1.entrantId)
	$("#startgg-p2-entrant").text(set.player2.entrantId)
	$("#startgg-set-id").text(set.id)

	$("#startgg-p1-name").text($(`#set${x}-name1`).text())
	$("#startgg-p2-name").text($(`#set${x}-name2`).text())
	$("#startgg-set-round").text(set.round)


	$(".no-set").hide()
	$("#current-set-wrapper-info>.wrapper").show()

	$("#p1-score-change").val(0)
	$("#p2-score-change").val(0)

	$("#tournament-change").val(set.tournament.replace(/[^a-z0-9 ]/gi, "-"))
	$("#round-change").val(set.round)
	//getSetProgress(set.id)
}