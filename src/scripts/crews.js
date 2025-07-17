var info;

isDoubles = false;
var obs;
var ip;
var sets = [];
var setPage = 0;

var swapped = false;

const phoneAspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");

var crew1 = []

var crew2 = []

function isMelee() {
	return true;
}

$(document).ready(function () {
	populateFlags();
	obsConnect();
	loadInitialChanges();
	loadChanges();
	updateSeatsLoop();
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
}

function highlightInfo() {
	gsap.to($("input.slug.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.prefix.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.pronouns.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("select.flag.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.name.change"), { "background-color": "#FFFFCC", duration: 0.2 })
	gsap.to($("input.crew"), { "background-color": "#FFFFCC", duration: 0.2 })

}
function clearInfo() {
	gsap.to($("input.slug.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.prefix.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.pronouns.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("select.flag.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.name.change"), { "background-color": "white", duration: 0.2 })
	gsap.to($("input.crew"), { "background-color": "white", duration: 0.2 })
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

function update() {
	const updateController = new AbortController();
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
	fetch("/update-melee-crews", {
		method: 'POST',
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			crew1: {
				name: $("#crew1-name").val(),
				score: parseInt($("#p1-score-change").val()),
				activePlayer: {
					slug: $("#p1-slug").val(),
					name: $("#p1-name").val(),
					character: $("#p1-character-change").attr("character"),
					colour: $("#p1-character-change").attr("colour"),
					prefix: $("#p1-prefix").val(),
					pronouns: $("#p1-pronouns").val(),
					country: $("#p1-flag").find(":selected").val(),
					port: info.crew1.activePlayer.port || 1
				},
				players: [
					{
						name: $("#t1-crew1").val(),
						slug: $("#t1-crew1").attr("slug"),
						alive: !$("#t1-crew1-toggle").hasClass("defeated")
					},
					{
						name: $("#t1-crew2").val(),
						slug: $("#t1-crew2").attr("slug"),
						alive: !$("#t1-crew2-toggle").hasClass("defeated")
					},
					{
						name: $("#t1-crew3").val(),
						slug: $("#t1-crew3").attr("slug"),
						alive: !$("#t1-crew3-toggle").hasClass("defeated")
					},
					{
						name: $("#t1-crew4").val(),
						slug: $("#t1-crew4").attr("slug"),
						alive: !$("#t1-crew4-toggle").hasClass("defeated")
					},
					{
						name: $("#t1-crew5").val(),
						slug: $("#t1-crew5").attr("slug"),
						alive: !$("#t1-crew5-toggle").hasClass("defeated")
					}
				]
			},
			crew2: {
				name: $("#crew2-name").val(),
				score: parseInt($("#p2-score-change").val()),
				activePlayer: {
					name: $("#p2-name").val(),
					character: $("#p2-character-change").attr("character"),
					colour: $("#p2-character-change").attr("colour"),
					prefix: $("#p2-prefix").val(),
					pronouns: $("#p2-pronouns").val(),
					country: $("#p2-flag").find(":selected").val(),
					port: info.crew2.activePlayer.port || 1
				},
				players: [
					{
						name: $("#t2-crew1").val(),
						slug: $("#t2-crew1").attr("slug"),
						alive: !$("#t2-crew1-toggle").hasClass("defeated")
					},
					{
						name: $("#t2-crew2").val(),
						slug: $("#t2-crew2").attr("slug"),
						alive: !$("#t2-crew2-toggle").hasClass("defeated")
					},
					{
						name: $("#t2-crew3").val(),
						slug: $("#t2-crew3").attr("slug"),
						alive: !$("#t2-crew3-toggle").hasClass("defeated")
					},
					{
						name: $("#t2-crew4").val(),
						slug: $("#t2-crew4").attr("slug"),
						alive: !$("#t2-crew4-toggle").hasClass("defeated")
					},
					{
						name: $("#t2-crew5").val(),
						slug: $("#t2-crew5").attr("slug"),
						alive: !$("#t2-crew5-toggle").hasClass("defeated")
					}
				]
			},
			casters: [
				{
					name: $("#caster1-name").val(),
					pronouns: $("#caster1-pronouns").val()
				},
				{
					name: $("#caster2-name").val(),
					pronouns: $("#caster2-pronouns").val()
				}
			],
			seatOrdering: [
				$("#p1-left-seat").attr("index"),
				$("#p1-right-seat").attr("index"),
				$("#p2-left-seat").attr("index"),
				$("#p2-right-seat").attr("index"),
			],
			round: $("#round-change").val(),
			tournament: $("#tournament-change").val()
		}),
		signal: updateController.signal
	}).then(() => {
		clearTimeout(updateTimeout)
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

const bgColours = [
	"rgb(68, 34, 34)",
	"rgb(34, 34, 68)",
	"rgb(102, 102, 34)",
	"rgb(34, 68, 34)"
]

const accentColours = [
	"rgb(245, 98, 98)",
	"rgb(98, 98, 245)",
	"rgb(205, 165, 68)",
	"rgb(98, 245, 98)"
]

function resolveTeamColour(colour) {
	switch (colour) {
		case "red":
			return 0;
		case "blue":
			return 1;
		case "green":
			return 3;
		default:
			return 2;
	}
}

function fixPlayerColours() {
	if (!info) {
		return
	}
	//background colours
	if (isDoubles) {
		p1ColourIndex = resolveTeamColour(info.crew1.activePlayer.colour)
		p2ColourIndex = resolveTeamColour(info.crew2.activePlayer.colour)

	} else {
		p1ColourIndex = Math.min(info.crew1.activePlayer.port - 1, 3)
		p2ColourIndex = Math.min(info.crew2.activePlayer.port - 1, 3)
	}
	$("#p1-info-change").css("background-color", bgColours[p1ColourIndex])
	$("input.left").css("border-bottom", `2px solid ${accentColours[p1ColourIndex]}`)
	$("input.left").attr("borderColor", accentColours[p1ColourIndex])
	$("#p2-info-change").css("background-color", bgColours[p2ColourIndex])
	$("input.right").css("border-bottom", `2px solid ${accentColours[p2ColourIndex]}`)
	$("input.right").attr("borderColor", accentColours[p2ColourIndex])

	//issues with choosing options on the select if the check isnt made prior
	$("select.left").css("border-bottom") !== `2px solid ${accentColours[p1ColourIndex]}`
		? $("select.left").css("border-bottom", `2px solid ${accentColours[p1ColourIndex]}`)
		: "";
	$("select.left").attr("borderColor") !== accentColours[p1ColourIndex]
		? $("select.left").attr("borderColor", accentColours[p1ColourIndex])
		: ""
	$("select.right").css("border-bottom") !== `2px solid ${accentColours[p2ColourIndex]}`
		? $("select.right").css("border-bottom", `2px solid ${accentColours[p2ColourIndex]}`)
		: ""
	$("select.right").attr("borderColor") !== accentColours[p2ColourIndex]
		? $("select.right").attr("borderColor", accentColours[p2ColourIndex])
		: ""
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

function loadInitialChanges() {
	$.ajax({
		type: 'GET',
		url: "/crews.json",
		data: {},
		success: function (response) {
			info = fixCrews(response);
			//flags
			$("#p1-flag").val(info.crew1.activePlayer.country)
			$("#p2-flag").val(info.crew2.activePlayer.country)
			//player states
			let index = 1;
			for (let player of info.crew1.players) {
				if (player.alive === false) {
					toggleCrew(1, index)
				}
				index++;
			}
			index = 1;
			for (let player of info.crew2.players) {
				if (player.alive === false) {
					toggleCrew(2, index)
				}
				index++;
			}
		},
		error: function (response) {
			console.log(response)
		},
		timeout: 5000
	})
}

function loadChanges() {
	$.ajax({
		type: 'GET',
		url: "/crews.json",
		data: {},
		success: function (response) {
			info = fixCrews(response);
			//load team1 data
			$("#p1-name-actual").attr("value", info.crew1.activePlayer.name)
			loadCharActual("p1", info.crew1.activePlayer.character, info.crew1.activePlayer.colour)
			if (document.getElementById("p1-score-actual").value != info.crew1.score) {
				document.getElementById("p1-score-actual").value = info.crew1.score
				document.getElementById("p1-score-change").value = info.crew1.score
			}

			//load team2 data
			$("#p2-name-actual").attr("value", info.crew2.activePlayer.name)
			loadCharActual("p2", info.crew2.activePlayer.character, info.crew2.activePlayer.colour)
			if (document.getElementById("p2-score-actual").value != info.crew2.score) {
				document.getElementById("p2-score-actual").value = info.crew2.score
				document.getElementById("p2-score-change").value = info.crew2.score
			}

			//fixPlayerColours()

			//casters
			$("#caster1-name").attr("value", info.casters[0].name)
			$("#caster1-pronouns").attr("value", info.casters[0].pronouns)
			$("#caster2-name").attr("value", info.casters[1].name)
			$("#caster2-pronouns").attr("value", info.casters[1].pronouns)

			//load
			$("#round-actual").attr("value", info.round)
		},
		error: function (response) {
			console.log(response)
		},
		timeout: 5000
	})
	if (obs !== null) {
		getRecordStatus();
	}
	setTimeout(loadChanges, 1000)
}

function fixCrews(crew) {
	let newCrews = {
		"crew1": {
			"name": crew?.crew1?.name || "Crew 1",
			"score": crew?.crew1?.score || 0,
			"activePlayer": {
				"slug": crew?.crew1?.activePlayer?.slug || "",
				"name": crew?.crew1?.activePlayer?.name || "Player 1",
				"character": crew?.crew1?.activePlayer?.character || "fox",
				"colour": crew?.crew1?.activePlayer?.colour || "red",
				"prefix": crew?.crew1?.activePlayer?.prefix || "",
				"pronouns": crew?.crew1?.activePlayer?.pronouns || "",
				"country": crew?.crew1?.activePlayer?.country || "UK",
				"port": crew?.crew1?.activePlayer?.port || 1
			},
			"players": [
				{
					"name": crew?.crew1?.players?.[0]?.name || "Player 1",
					"slug": crew?.crew1?.players?.[0]?.slug || "",
					"alive": crew?.crew1?.players?.[0]?.alive
				},
				{
					"name": crew?.crew1?.players?.[1]?.name || "Player 2",
					"slug": crew?.crew1?.players?.[1]?.slug || "",
					"alive": crew?.crew1?.players?.[1]?.alive
				},
				{
					"name": crew?.crew1?.players?.[2]?.name || "Player 3",
					"slug": crew?.crew1?.players?.[2]?.slug || "",
					"alive": crew?.crew1?.players?.[2]?.alive
				},
				{
					"name": crew?.crew1?.players?.[3]?.name || "Player 4",
					"slug": crew?.crew1?.players?.[3]?.slug || "",
					"alive": crew?.crew1?.players?.[3]?.alive
				},
				{
					"name": crew?.crew1?.players?.[4]?.name || "Player 5",
					"slug": crew?.crew1?.players?.[4]?.slug || "",
					"alive": crew?.crew1?.players?.[4]?.alive
				}
			]
		},
		"crew2": {
			"name": crew?.crew2?.name || "Crew 2",
			"score": crew?.crew2?.score || 0,
			"activePlayer": {
				"slug": crew?.crew2?.activePlayer?.slug || "",
				"name": crew?.crew2?.activePlayer?.name || "Player 1",
				"character": crew?.crew2?.activePlayer?.character || "fox",
				"colour": crew?.crew2?.activePlayer?.colour || "red",
				"prefix": crew?.crew2?.activePlayer?.prefix || "",
				"pronouns": crew?.crew2?.activePlayer?.pronouns || "",
				"country": crew?.crew2?.activePlayer?.country || "UK",
				"port": crew?.crew2?.activePlayer?.port || 1
			},
			"players": [
				{
					"name": crew?.crew2?.players?.[0]?.name || "Player 1",
					"slug": crew?.crew2?.players?.[0]?.slug || "",
					"alive": crew?.crew2?.players?.[0]?.alive
				},
				{
					"name": crew?.crew2?.players?.[1]?.name || "Player 2",
					"slug": crew?.crew2?.players?.[1]?.slug || "",
					"alive": crew?.crew2?.players?.[1]?.alive
				},
				{
					"name": crew?.crew2?.players?.[2]?.name || "Player 3",
					"slug": crew?.crew2?.players?.[2]?.slug || "",
					"alive": crew?.crew2?.players?.[2]?.alive
				},
				{
					"name": crew?.crew2?.players?.[3]?.name || "Player 4",
					"slug": crew?.crew2?.players?.[3]?.slug || "",
					"alive": crew?.crew2?.players?.[3]?.alive
				},
				{
					"name": crew?.crew2?.players?.[4]?.name || "Player 5",
					"slug": crew?.crew2?.players?.[4]?.slug || "",
					"alive": crew?.crew2?.players?.[4]?.alive
				}
			]
		},
		"casters": [
			{
				"name": crew?.casters?.[0].name || "",
				"pronouns": crew?.casters?.[0].pronouns || "",
			},
			{
				"name": crew?.casters?.[1].name || "",
				"pronouns": crew?.casters?.[1].pronouns || "",
			}
		],
		"seatOrdering": crew?.seatOrdering || ["1", "2", "3", "4"],
		"round": crew?.round || "",
		"tournament": crew?.tournament || ""
	}
	return newCrews;
}

function updateSeatsLoop() {
	$(".seat").each((index, seat) => {
		player = getSeatPlayer($(seat).attr("index"))
		$(seat).find(".name").text(player.name)
		$(seat).find(".stock-icon").attr('src', `static/img/melee/stock_icons/${player.character.character}/${player.character.colour}.png`)
		$(seat).css("background-color", fixSeatColour($(seat).attr("index")))
	})
	$("#left-seat-changer").css("background-color", `${fixSeatAccent($("#p1-left-seat").attr("index"))}`)
	$("#left-seat-changer").css("border-bottom", `3px solid ${$("#p1-left-seat").css("background-color")}`)

	$("#right-seat-changer").css("background-color", `${fixSeatAccent($("#p2-left-seat").attr("index"))}`)
	$("#right-seat-changer").css("border-bottom", `3px solid ${$("#p2-left-seat").css("background-color")}`)
	fixPlayerColours()
	setTimeout(updateSeatsLoop, 10)
}

function getSeatPlayer(index) {
	let name;
	let character;
	switch (index) {
		case "1":
		case 1:
			name = $("#p1-name").val();
			character = $("#p1-character-change");
			break;
		case "3":
		case 3:
			name = $("#p2-name").val();
			character = $("#p2-character-change");
			break;
		default:
			return ""
	}
	return ({
		name,
		character: {
			character: $(character).attr("character"),
			colour: $(character).attr("colour")
		}
	})
}

function resetSeats() {
	$(`#p1-left-seat`).attr("index", "1")
	$(`#p1-right-seat`).attr("index", "2")
	$(`#p2-left-seat`).attr("index", "3")
	$(`#p2-right-seat`).attr("index", "4")
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

function changeScore(value, player) {
	initialScore = $(`#p${player}-score-change`).val()
	if ((parseInt(initialScore) <= 0 && value <= -1) || (parseInt(initialScore) >= 99 && value >= 1)) {
		return
	}
	$(`#p${player}-score-change`).val(parseInt(initialScore) + value)
}

function swapSides(info, characters) {
	if (info) {
		swapped = !swapped

		let player1name = $("#p1-name").val();
		let player2name = $("#p2-name").val();

		let player1prefix = $("#p1-prefix").val();
		let player2prefix = $("#p2-prefix").val();

		let player1pronouns = $("#p1-pronouns").val();
		let player2pronouns = $("#p2-pronouns").val();

		let player1flag = $("#p1-flag").val();
		let player2flag = $("#p2-flag").val();

		let crew1 = getCrew(1)
		let crew2 = getCrew(2)

		$("#p1-name").val(player2name);
		$("#p2-name").val(player1name);

		$("#p1-prefix").val(player2prefix);
		$("#p2-prefix").val(player1prefix);

		$("#p1-pronouns").val(player2pronouns);
		$("#p2-pronouns").val(player1pronouns);

		$("#p1-flag").val(player2flag).change();
		$("#p2-flag").val(player1flag).change();

		setCrew(1, crew2)
		setCrew(2, crew1)

	}
	if (characters) {
		p1 = {
			character: $("#p1-character-change").attr("character"),
			colour: $("#p1-character-change").attr("colour")
		};
		p2 = {
			character: $("#p2-character-change").attr("character"),
			colour: $("#p2-character-change").attr("colour")
		};

		$("#p1-character-change").attr("character", p2.character);
		$("#p1-character-change").attr("colour", p2.colour);
		$("#p1-character-change").attr("src", `static/img/melee/csp_icons/${p2.character}/${p2.colour}.png`);

		$("#p2-character-change").attr("character", p1.character);
		$("#p2-character-change").attr("colour", p1.colour);
		$("#p2-character-change").attr("src", `static/img/melee/csp_icons/${p1.character}/${p1.colour}.png`);
	}
}

function getCrew(id) {
	return ({
		name: $(`#crew${id}-name`).val(),
		players: [
			{
				name: $(`#t${id}-crew1`).val(),
				slug: $(`#t${id}-crew1`).attr("slug"),
				defeated: $(`#t${id}-crew1-toggle`).hasClass("defeated")
			},
			{
				name: $(`#t${id}-crew2`).val(),
				slug: $(`#t${id}-crew2`).attr("slug"),
				defeated: $(`#t${id}-crew2-toggle`).hasClass("defeated")
			},
			{
				name: $(`#t${id}-crew3`).val(),
				slug: $(`#t${id}-crew3`).attr("slug"),
				defeated: $(`#t${id}-crew3-toggle1`).hasClass("defeated")
			},
			{
				name: $(`#t${id}-crew4`).val(),
				slug: $(`#t${id}-crew4`).attr("slug"),
				defeated: $(`#t${id}-crew4-toggle`).hasClass("defeated")
			},
			{
				name: $(`#t${id}-crew5`).val(),
				slug: $(`#t${id}-crew5`).attr("slug"),
				defeated: $(`#t${id}-crew5-toggle`).hasClass("defeated")
			}
		]
	})
}

function setCrew(id, crew) {
	$(`#crew${id}-name`).val(crew.name)

	$(`#t${id}-crew1`).val(crew.players[0].name)
	$(`#t${id}-crew2`).val(crew.players[1].name)
	$(`#t${id}-crew3`).val(crew.players[2].name)
	$(`#t${id}-crew4`).val(crew.players[3].name)
	$(`#t${id}-crew5`).val(crew.players[4].name)

	$(`#t${id}-crew1`).attr("slug", crew.players[0].slug)
	$(`#t${id}-crew2`).attr("slug", crew.players[1].slug)
	$(`#t${id}-crew3`).attr("slug", crew.players[2].slug)
	$(`#t${id}-crew4`).attr("slug", crew.players[3].slug)
	$(`#t${id}-crew5`).attr("slug", crew.players[4].slug)

	$(`.toggle-crew.c${id}`).removeClass("defeated")

	crew.players[0].defeated && $(`#t${id}-crew1-toggle`).addClass("defeated")
	crew.players[1].defeated && $(`#t${id}-crew2-toggle`).addClass("defeated")
	crew.players[2].defeated && $(`#t${id}-crew3-toggle`).addClass("defeated")
	crew.players[3].defeated && $(`#t${id}-crew4-toggle`).addClass("defeated")
	crew.players[4].defeated && $(`#t${id}-crew5-toggle`).addClass("defeated")
}

function swapTeam(n) {
	player1Name = $(`#p${n}-name`).val();
	player2Name = $(`#p${n}d-name`).val();

	player1Pronouns = $(`#p${n}-pronouns`).val();
	player2Pronouns = $(`#p${n}d-pronouns`).val();

	player1flag = $(`#p${n}-flag`).val();
	player2flag = $(`#p${n}d-flag`).val();

	$(`#p${n}-name`).val(player2Name);
	$(`#p${n}d-name`).val(player1Name);

	$(`#p${n}-pronouns`).val(player2Pronouns);
	$(`#p${n}d-pronouns`).val(player1Pronouns);

	$(`#p${n}-flag`).val(player2flag).change();
	$(`#p${n}d-flag`).val(player1flag).change();
}

function loadCrew(crewIndex, memberIndex) {
	let slug = $(`#t${crewIndex}-crew${memberIndex}`).attr("slug")
	let loser = lRegex.test($(`#p${crewIndex}-name`).val()) ? " (L)" : ""
	if (slug) {
		let player = autocompletePlayers.find((el) => el.slug === slug)
		if (player) {
			$(`#p${crewIndex}-slug`).val(player.slug || "")
			$(`#p${crewIndex}-name`).val((player["name"] || "") + loser)
			$(`#p${crewIndex}-prefix`).val(player.prefix || "")
			$(`#p${crewIndex}-pronouns`).val(player.pronouns || "")
			$(`#p${crewIndex}-flag`).val(fixCountry(player.country)).change();
			if (player.character !== "") {
				loadCharChange(`p${crewIndex}`, player.character, player.colour || undefined)
			}
		} else {
			$(`#p${crewIndex}-name`).val($(`#t${crewIndex}-crew${memberIndex}`).val())
		}
	} else {
		$(`#p${crewIndex}-name`).val($(`#t${crewIndex}-crew${memberIndex}`).val())
	}
}

function toggleCrew(crewIndex, memberIndex) {
	if ($(`#t${crewIndex}-crew${memberIndex}-toggle`).hasClass("defeated")) {
		$(`#t${crewIndex}-crew${memberIndex}-toggle`).removeClass("defeated")
	} else {
		$(`#t${crewIndex}-crew${memberIndex}-toggle`).addClass("defeated")
	}
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

		$(".name.change.doubles").hide();
		$(".name.change.doubles").prop("disabled", true);
		$(".pronouns.change.doubles").hide();
		$(".pronouns.change.doubles").prop("disabled", true);
		$(".flag.change.doubles").hide();
		$(".flag.change.doubles").prop("disabled", true);
		$(".csp.change.doubles").hide();

		$(".seat.right").hide();
		$(".seat-changer.side").hide();
		$(".fa-chair.doubles").hide();

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

		$(".name.change.doubles").show();
		$(".name.change.doubles").prop("disabled", false);
		$(".pronouns.change.doubles").show();
		$(".name.change.doubles").prop("disabled", false);
		$(".flag.change.doubles").show();
		$(".flag.change.doubles").prop("disabled", false);
		$(".csp.change.doubles").show();

		$(".seat.right").show();
		$(".seat-changer.side").show();
		$(".fa-chair.doubles").show();

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
		characterActual.attr("src", `static/img/melee/stock_icons/${character}/${colour}.png`);

		characterChange.attr("character", character);
		characterChange.attr("colour", colour);
		characterChange.attr("src", `static/img/melee/csp_icons/${character}/${colour}.png`);
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
	characterChange.attr("src", `static/img/melee/csp_icons/${character}/${colour}.png`);
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

	for (x = 0; x < MAXPERPAGE; x++) {
		index = x + ((setPage - 1) * MAXPERPAGE);
		if (typeof (sets.length) != "undefined") {
			if (sets.length == 0 || index >= sets.length) {
				$(`#set${x + 1}`).css("display", "none");
			} else if (sets?.[index] == undefined) {
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
	maxIndex = setPage * MAXPERPAGE;
	if (maxIndex >= sets.length) {
		$("#page-right").hide()
	} else {
		$("#page-right").show()
	}
}

function loadSet(x) {
	swapped = false;

	let setID = parseInt($(`#set${x}`).attr("set-index"))
	let set = sets[setID]

	let p1Loser = set.round === "Grand Final Reset" ? " (L)" : "";
	let p2Loser = set.round.startsWith("Grand Final") ? " (L)" : "";

	//if no data
	if (!set.player1.data[0] || !set.player2.data[0]) {
		return
	}

	//crew 1 active player
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
				loadCharChange("p1", p1Db.character, p1Db.colour || undefined)
			}
		}
	}

	//crew 2 active player
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

	for (x = 0; x < 5; x++) {
		let player = set.player1.data[x]
		$(`#t1-crew${x + 1}`).val(player?.name || "")
		$(`#t1-crew${x + 1}`).attr("slug", player?.slug || "")
		player == undefined ? $(`#t1-crew${x + 1}-toggle`).addClass("defeated") : $(`#t1-crew${x + 1}-toggle`).removeClass("defeated")
	}

	for (x = 0; x < 5; x++) {
		let player = set.player2.data[x]
		$(`#t2-crew${x + 1}`).val(player?.name || "")
		$(`#t2-crew${x + 1}`).attr("slug", player?.slug || "")
		player == undefined ? $(`#t2-crew${x + 1}-toggle`).addClass("defeated") : $(`#t2-crew${x + 1}-toggle`).removeClass("defeated")
	}

	$("#crew1-name").val(set.player1.teamName)
	$("#crew2-name").val(set.player2.teamName)

	$("#p1-entrant").val(set.player1.entrant)
	$("#p2-entrant").val(set.player1.entrant)

	$("#p1-score-change").val(set.player1.data.length * 4)
	$("#p2-score-change").val(set.player1.data.length * 4)

	$("#round-change").val(set.round)
	$("#set-id").val(set.id)
}

function saveSet(x) {
	swapped = false;
	$("#p1-entrant").val($(`#set${x}-name1`).attr("data-entrant"))
	$("#p1-entrant-name").text($(`#set${x}-name1`).text())

	$("#p2-entrant").val($(`#set${x}-name2`).attr("data-entrant"))
	$("#p2-entrant-name").text($(`#set${x}-name2`).text())

	$("#setID-input").val($(`#set${x}`).attr("data-id"))
}