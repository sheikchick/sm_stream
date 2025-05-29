var info;

isDoubles = false;
var obs;
var ip;
var sets = [];
var setPage = 0;

var swapped = false;

const phoneAspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");

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
	$("#swap-chars").hover(highlightChars, clearChars)
	$("#swap-all").hover(() => {
		highlightInfo()
		highlightChars()
	}, () => {
		clearInfo()
		clearChars()
	})
	$("#team1-swap").hover(() => {
		gsap.to($("input.slug.change.left"), {"background-color": "#FFFFCC", duration: 0.2})
		gsap.to($("input.pronouns.change.left"), {"background-color": "#FFFFCC", duration: 0.2})
		gsap.to($("select.flag.change.left"), {"background-color": "#FFFFCC", duration: 0.2})
		gsap.to($("input.name.change.left"), {"background-color": "#FFFFCC", duration: 0.2})
	}, () => {
		gsap.to($("input.slug.change.left"), {"background-color": "white", duration: 0.2})
		gsap.to($("input.pronouns.change.left"), {"background-color": "white", duration: 0.2})
		gsap.to($("select.flag.change.left"), {"background-color": "white", duration: 0.2})
		gsap.to($("input.name.change.left"), {"background-color": "white", duration: 0.2})
	})
	$("#team2-swap").hover(() => {
		gsap.to($("input.slug.change.right"), {"background-color": "#FFFFCC", duration: 0.2})
		gsap.to($("input.pronouns.change.right"), {"background-color": "#FFFFCC", duration: 0.2})
		gsap.to($("select.flag.change.right"), {"background-color": "#FFFFCC", duration: 0.2})
		gsap.to($("input.name.change.right"), {"background-color": "#FFFFCC", duration: 0.2})
	}, () => {
		gsap.to($("input.slug.change.right"), {"background-color": "white", duration: 0.2})
		gsap.to($("input.pronouns.change.right"), {"background-color": "white", duration: 0.2})
		gsap.to($("select.flag.change.right"), {"background-color": "white", duration: 0.2})
		gsap.to($("input.name.change.right"), {"background-color": "white", duration: 0.2})
	})
}

function highlightInfo() {
	gsap.to($("input.slug.change"), {"background-color": "#FFFFCC", duration: 0.2})
	gsap.to($("input.pronouns.change"), {"background-color": "#FFFFCC", duration: 0.2})
	gsap.to($("select.flag.change"), {"background-color": "#FFFFCC", duration: 0.2})
	gsap.to($("input.name.change"), {"background-color": "#FFFFCC", duration: 0.2})

}
function clearInfo() {
	gsap.to($("input.slug.change"), {"background-color": "white", duration: 0.2})
	gsap.to($("input.pronouns.change"), {"background-color": "white", duration: 0.2})
	gsap.to($("select.flag.change"), {"background-color": "white", duration: 0.2})
	gsap.to($("input.name.change"), {"background-color": "white", duration: 0.2})
}

function highlightChars() {
	gsap.to($(".csp.change"), {"background-color": "rgba(255,255,170,0.3)", duration: 0.2})
}

function clearChars() {
	gsap.to($(".csp.change"), {"background-color": "rgba(255,255,170,0)", duration: 0.2})
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
						slug: $("#p1-slug").val(),
						name: $("#p1-name").val(),
						character: $("#p1-character-change").attr("character"),
						colour: $("#p1-character-change").attr("colour"),
						pronouns: $("#p1-pronouns").val(),
						country: $("#p1-flag").find(":selected").val(),
						port: info.team1.players[0].port || 1
					},
					{
						slug: $("#p1d-slug").val(),
						name: $("#p1d-name").val(),
						character: $("#p1d-character-change").attr("character"),
						colour: $("#p1d-character-change").attr("colour"),
						pronouns: $("#p1d-pronouns").val(),
						country: $("#p1d-flag").find(":selected").val(),
						port: info.team1.players[1].port || 2
					}
				],
				score: parseInt($("#p1-score-change").val()),
				startggEntrant: $("#p1-entrant").val()
			},
			team2: {
				players: [
					{
						slug: $("#p2-slug").val(),
						name: $("#p2-name").val(),
						character: $("#p2-character-change").attr("character"),
						colour: $("#p2-character-change").attr("colour"),
						pronouns: $("#p2-pronouns").val(),
						country:  $("#p2-flag").find(":selected").val(),
						port: info.team2.players[0].port || 3
					},
					{
						slug: $("#p2d-slug").val(),
						name: $("#p2d-name").val(),
						character: $("#p2d-character-change").attr("character"),
						colour: $("#p2d-character-change").attr("colour"),
						pronouns: $("#p2d-pronouns").val(),
						country: $("#p2d-flag").find(":selected").val(),
						port: info.team2.players[1].port || 4
					},
				],
				score: parseInt($("#p2-score-change").val()),
				startggEntrant: $("#p2-entrant").val()
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
			startggSetId: $("#set-id").val(),
			startggSwapped: swapped,
			tournament: $("#tournament-change").val(),
			isDoubles,
			bestOf: bestOfValue
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

	for(let selector of ["input", "button", "select"]) {
		if(!$(`${selector}.left`).hasClass(p1colour)) {
			$(`${selector}.left`).removeClass(portColours)
			$(`${selector}.left`).addClass(p1colour)
		}
		if(!$(`${selector}.right`).hasClass(p2colour)) {
			$(`${selector}.right`).removeClass(portColours)
			$(`${selector}.right`).addClass(p2colour)
		}
	}
	if(!$("#p1-info-change").hasClass(`${p1colour}-bg`)) {
		$("#p1-info-change").removeClass(["red-bg", "blue-bg", "yellow-bg", "green-bg",])
		$("#p1-info-change").addClass(`${p1colour}-bg`)
	}
	if(!$("#p2-info-change").hasClass(`${p2colour}-bg`)) {
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

function loadInitialChanges() {
	$("#tournament-slug").text(localStorage.getItem("startggSlug"))
	$.ajax({
		type: 'GET',
		url: "/info.json",
		data: {},
		success: function (response) {
			info = fixInfo(response);
			swapped = info.startggSwapped

			//flags
			$("#p1-flag").val(info.team1.players[0].country)
			$("#p1d-flag").val(info.team1.players[1].country)
			$("#p2-flag").val(info.team2.players[0].country)
			$("#p2d-flag").val(info.team2.players[1].country)
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
		url: "/info.json",
		data: {},
		success: function (response) {
			let scoreChanged = false;

			info = fixInfo(response);
			swapped = info.startggSwapped
			//load team1 data
			$("#p1-name-actual").attr("value", info.team1.players[0].name)
			loadCharActual("p1", info.team1.players[0].character, info.team1.players[0].colour)
			if (info.team1.players.length >= 2) {
				$("#p1d-name-actual").attr("value", info.team1.players[1].name)
				loadCharActual("p1d", info.team1.players[1].character, info.team1.players[1].colour)
			}

			if (document.getElementById("p1-score-actual").value != info.team1.score) {
				scoreChanged = true
				document.getElementById("p1-score-actual").value = info.team1.score
				document.getElementById("p1-score-change").value = info.team1.score
			}

			//load team2 data
			$("#p2-name-actual").attr("value", info.team2.players[0].name)
			loadCharActual("p2", info.team2.players[0].character, response.team2.players[0].colour)
			if (info.team2.players.length >= 2) {
				$("#p2d-name-actual").attr("value", info.team2.players[1].name)
				loadCharActual("p2d", info.team2.players[1].character, response.team2.players[1].colour)
			}

			if (document.getElementById("p2-score-actual").value != info.team2.score) {
				scoreChanged = true
				document.getElementById("p2-score-actual").value = info.team2.score
				document.getElementById("p2-score-change").value = info.team2.score
			}


			//casters
			$("#caster1-name").attr("value", info.casters[0].name)
			$("#caster1-pronouns").attr("value", info.casters[0].pronouns)
			$("#caster2-name").attr("value", info.casters[1].name)
			$("#caster2-pronouns").attr("value", info.casters[1].pronouns)

			//load
			$("#round-actual").attr("value", info.round)
			$("#best-of-actual").attr("value", "Bo" + info.bestOf)

			//Handle Grand Finals Reset with start.gg after 10 seconds
			//Runs every second, need to add an end clause
			
			if(scoreChanged && (info.round === "Grand Final" || info.round === "Grand Finals")) {
				let {l: p1L} = getName(info.team1.players[0].name)
				let {l: p2L} = getName(info.team2.players[0].name)
				let firstTo = Math.ceil(info.bestOf/2)
				if((p1L && info.team1.score === firstTo) || (p2L && info.team2.score === firstTo)) {
					setTimeout(() => {
						findSetForPlayers("Grand Final Reset")
						setTimeout(() => {
							fixLosers("Grand Final Reset")
							document.getElementById("p1-score-actual").value = 0
							document.getElementById("p1-score-change").value = 0
							document.getElementById("p2-score-actual").value = 0
							document.getElementById("p2-score-change").value = 0
						}, 2000)
					}, 10000)
				}
			}
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

function fixLosers(fullRoundText) {
	let {name: p1Name} = getName($("#p1-name").val())
	let {name: p2Name} = getName($("#p2-name").val())
	switch(fullRoundText) {
		case "Grand Final":
			if(swapped) {
				$("#p1-name").val(`${p1Name} (L)`)
				$("#p2-name").val(`${p2Name}`)
			} else {
				$("#p1-name").val(`${p1Name}`)
				$("#p2-name").val(`${p2Name} (L)`)
			}
			break;
		case "Grand Final Reset":
			$("#p1-name").val(`${p1Name} (L)`)
			$("#p2-name").val(`${p2Name} (L)`)
			break;
		default:
			$("#p1-name").val(`${p1Name}`)
			$("#p2-name").val(`${p2Name}`)
	}
}

function fixInfo(info) {
	let newInfo = {
		"team1": {
			"players": [
				{
					"slug": info?.team1?.players?.[0]?.slug || "",
					"name": info?.team1?.players?.[0]?.name || "Player 1",
					"character": info?.team1?.players?.[0]?.character || "fox",
					"colour": info?.team1?.players?.[0]?.colour || "red",
					"pronouns": info?.team1?.players?.[0]?.pronouns || "",
					"country": info?.team1?.players?.[0]?.country || "EU",
					"port": info?.team1?.players?.[0]?.port || 1
				},
				{
					"slug": info?.team1?.players?.[1]?.slug || "",
					"name": info?.team1?.players?.[1]?.name || "Player 4",
					"character": info?.team1?.players?.[1]?.character || "falco",
					"colour": info?.team1?.players?.[1]?.colour || "red",
					"pronouns": info?.team1?.players?.[1]?.pronouns || "",
					"country": info?.team1?.players?.[1]?.country || "EU",
					"port": info?.team1?.players?.[1]?.port || 2
				}
			],
			"score": info?.team1?.score || 0,
			"startggEntrant": info?.team1?.startggEntrant || "",
		},
		"team2": {
			"players": [
				{
					"slug": info?.team2?.players?.[0]?.slug || "",
					"name": info?.team2?.players?.[0]?.name || "Player 2",
					"character": info?.team2?.players?.[0]?.character || "sheik",
					"colour": info?.team2?.players?.[0]?.colour || "blue",
					"pronouns": info?.team2?.players?.[0]?.pronouns || "",
					"country": info?.team2?.players?.[0]?.country || "EU",
					"port": info?.team2?.players?.[0]?.port || 1
				},
				{
					"slug": info?.team2?.players?.[0]?.slug || "",
					"name": info?.team2?.players?.[1]?.name || "Player 3",
					"character": info?.team2?.players?.[1]?.character || "peach",
					"colour": info?.team2?.players?.[1]?.colour || "blue",
					"pronouns": info?.team2?.players?.[1]?.pronouns || "",
					"country": info?.team2?.players?.[1]?.country || "EU",
					"port": info?.team2?.players?.[1]?.port || 2
				}
			],
			"score": info?.team2?.score || 0,
			"startggEntrant": info?.team2?.startggEntrant || "",
		},
		"casters": [
			{
				"name": info?.casters?.[0].name || "",
				"pronouns": info?.casters?.[0].pronouns || "",
			},
			{
				"name": info?.casters?.[1].name || "",
				"pronouns": info?.casters?.[1].pronouns || "",
			}
		],
		"seatOrdering": info?.seatOrdering || ["1", "2", "3", "4"],
		"round": info?.round || "",
		"startggSetId": info?.startggSetId || "",
		"startggSwapped": swapped || false,
		"tournament": info?.tournament || "",
		"isDoubles": info?.isDoubles || false,
		"bestOf": info?.bestOf || 5
	}
	return newInfo;
}

function updateSeatsLoop() {
	localStorage.setItem("startggSlug", $("#tournament-slug").text())
	$(".seat").each((index, seat) => {
		player = getSeatPlayer(parseInt($(seat).attr("index")))
		$(seat).find(".name").text(player.name)
		$(seat).find(".stock-icon").attr('src', `static/img/stock_icons/${player.character.character || "empty"}/${player.character.colour || "red"}.png`)
		$(seat).css("background-color", fixSeatColour($(seat).attr("index")))
	})
	if(["1","2"].includes($("#p1-left-seat").attr("index"))) {
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
	sign = ["p1","p1d","p2","p2d"]
	return ({
		name: $(`#${sign[index-1]}-name`).val(),
		character: {
			character: $(`#${sign[index-1]}-character-change`).attr("character"),
			colour: $(`#${sign[index-1]}-character-change`).attr("colour")
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
		swapped = !swapped
		player1slug = $("#p1-slug").val();
		player1dslug = $("#p1d-slug").val();
		player2slug = $("#p2-slug").val();
		player2dslug = $("#p2d-slug").val();

		player1name = $("#p1-name").val();
		player1dname = $("#p1d-name").val();
		player2name = $("#p2-name").val();
		player2dname = $("#p2d-name").val();

		team1entrant = $("#p1-entrant").val();

		player1pronouns = $("#p1-pronouns").val();
		player1dpronouns = $("#p1d-pronouns").val();
		player2pronouns = $("#p2-pronouns").val();
		player2dpronouns = $("#p2d-pronouns").val();

		team2entrant = $("#p2-entrant").val();

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

		$("#p1-entrant").val(team2entrant);

		$("#p1-pronouns").val(player2pronouns);
		$("#p1d-pronouns").val(player2dpronouns);
		$("#p2-pronouns").val(player1pronouns);
		$("#p2d-pronouns").val(player1dpronouns);

		$("#p2-entrant").val(team1entrant);

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
		$("#p1-character-change").attr("src", `static/img/csp_icons/${p2.character}/${p2.colour}.png`);

		$("#p1d-character-change").attr("character", p2d.character);
		$("#p1d-character-change").attr("colour", p2d.colour);
		$("#p1d-character-change").attr("src", `static/img/csp_icons/${p2d.character}/${p2d.colour}.png`);

		$("#p2-character-change").attr("character", p1.character);
		$("#p2-character-change").attr("colour", p1.colour);
		$("#p2-character-change").attr("src", `static/img/csp_icons/${p1.character}/${p1.colour}.png`);

		$("#p2d-character-change").attr("character", p1d.character);
		$("#p2d-character-change").attr("colour", p1d.colour);
		$("#p2d-character-change").attr("src", `static/img/csp_icons/${p1d.character}/${p1d.colour}.png`);
	}
}

function swapTeam(n) {
	player1Slug = $(`#p${n}-slug`).val();
	player2Slug = $(`#p${n}d-slug`).val();

	player1Name = $(`#p${n}-name`).val();
	player2Name = $(`#p${n}d-name`).val();

	player1Pronouns = $(`#p${n}-pronouns`).val();
	player2Pronouns = $(`#p${n}d-pronouns`).val();

	player1flag = $(`#p${n}-flag`).val();
	player2flag = $(`#p${n}d-flag`).val();

	$(`#p${n}-slug`).val(player2Slug);
	$(`#p${n}d-slug`).val(player1Slug);

	$(`#p${n}-name`).val(player2Name);
	$(`#p${n}d-name`).val(player1Name);

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

		$(".player.info.row.doubles").hide();
		$(".database.doubles").prop("disabled", true);
		$(".slug.doubles").prop("disabled", true);
		$(".name.change.doubles").prop("disabled", true);
		$(".pronouns.change.doubles").prop("disabled", true);
		$(".flag.change.doubles").prop("disabled", true);
		$(".csp.change.doubles").hide();

		$(".seat.right").hide();
		$(".seat-changer.side").hide();
		$(".fa-chair.doubles").hide();

		$("#reset-scores").css({"margin-left": "23px"})

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

		$(".player.info.row.doubles").show();
		$(".database.doubles").prop("disabled", false);
		$(".slug.doubles").prop("disabled", false);
		$(".name.change.doubles").prop("disabled", false);
		$(".name.change.doubles").prop("disabled", false);
		$(".flag.change.doubles").prop("disabled", false);
		$(".csp.change.doubles").show();

		$(".seat.right").show();
		$(".seat-changer.side").show();
		$(".fa-chair.doubles").show();

		$("#reset-scores").css({"margin-left": "83px"})

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
		characterActual.attr("src", `static/img/stock_icons/${character}/${colour}.png`);

		characterChange.attr("character", character);
		characterChange.attr("colour", colour);
		characterChange.attr("src", `static/img/csp_icons/${character}/${colour}.png`);
	}
}

/**
 * Load character into slot for changing - use when not updating
 * @param {String} player p1, p1d, p2, p2d
 * @param {*} character character
 * @param {*} colour colour
 */
function loadCharChange(player, character = "empty", colour) {
	const characterChange = $(`#${player}-character-change`)
	characterChange.attr("character", character);
	characterChange.attr("colour", colour);
	characterChange.attr("src", `static/img/csp_icons/${character}/${colour}.png`);
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

			fetch("/save_clip", {
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
			bestOfValue = 3;
			$("#best-of-change").val("3")
			break;
		case "5":
			bestOfValue = 5;
			$("#best-of-change").val("5")
			break;
		default:
			bestOfValue = 5;
	}
}

function toggleStartggEntrant() {
	current = $(".startgg.display").css('opacity')
	$(".startgg.display").css('opacity', 1-current)
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

	for (x = 1; x <= MAX_PER_PAGE; x++) {
		index = x + ((setPage - 1) * MAX_PER_PAGE)-1;
		if (typeof (sets.length) != "undefined") {
			if (sets.length == 0 || index >= sets.length) {
				$(`#set${x}`).css("display", "none");
			} else if (sets?.[index] == undefined) {
				//not ideal
				$(`#set${x}`).css("display", "none");
			} else {
				$("#right-wrapper").css("display", "flex")

				$(`#set${x}`).css("display", "flex");
				$(`#set${x}`).attr("data-id", sets[index]["id"])

				if (sets[index]["player1"]["data"][1]["name"] != "") {
					$(`#set${x}-name1`).text(`${sets[index]["player1"]["data"][0]["name"]} / ${sets[index]["player1"]["data"][1]["name"]}`)
				} else {
					$(`#set${x}-name1`).text(sets[index]["player1"]["data"][0]["name"])
				}
				$(`#set${x}-name1`).attr("data-p1", JSON.stringify(sets[index]["player1"]["data"][0]))
				$(`#set${x}-name1`).attr("data-p2", JSON.stringify(sets[index]["player1"]["data"][1]))
				$(`#set${x}-name1`).attr("data-entrant", JSON.stringify(sets[index]["player1"]["entrantId"]))

				if (sets[index]["player2"]["data"][1]["name"] != "") {
					$(`#set${x}-name2`).text(`${sets[index]["player2"]["data"][0]["name"]} / ${sets[index]["player2"]["data"][1]["name"]}`)
				} else {
					$(`#set${x}-name2`).text(sets[index]["player2"]["data"][0]["name"])
				}
				$(`#set${x}-name2`).attr("data-p1", JSON.stringify(sets[index]["player2"]["data"][0]))
				$(`#set${x}-name2`).attr("data-p2", JSON.stringify(sets[index]["player2"]["data"][1]))
				$(`#set${x}-name2`).attr("data-entrant", JSON.stringify(sets[index]["player2"]["entrantId"]))

				$(`#set${x}-round`).text(sets[index]["round"])
			}
		} else {
			$(`#set${x}`).css("display", "none");
		}
	}
	if (sets.length == 0) {
		$(".set").hide()
		$(".page-button").hide()
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
	swapped = false;

	round = $(`#set${x}-round`).text()
	let p1Loser = "";
	let p2Loser = "";
	if (round.startsWith("Grand Final")) {
		p2Loser = " (L)"
	}
	if (round === "Grand Final Reset") {
		p1Loser = " (L)"
	}

	//p1
	p1Data = JSON.parse($(`#set${x}-name1`).attr("data-p1"))
	$("#p1-slug").val(p1Data.slug)
	$("#p1-name").val(p1Data["name"] + p1Loser)
	$("#p1-pronouns").val(p1Data["pronouns"])
	$("#p1-flag").val(fixCountry(p1Data["country"])).change();
	p1Db = getPlayer(p1Data.slug)
	if(p1Db) {
		if(p1Db.character !== "" && p1Db.colour !== "") {
			loadCharChange("p1", p1Db.character, p1Db.colour || "red")
		}
	}

	//p1d
	p1dData = JSON.parse($(`#set${x}-name1`).attr("data-p2"))
	$("#p1d-slug").val(p1dData.slug)
	$("#p1d-name").val(p1dData["name"] ? p1dData["name"] + p1Loser : "")
	$("#p1d-pronouns").val(p1dpronouns = p1dData["pronouns"])
	$("#p1d-flag").val(fixCountry(p1dData["country"])).change();
	p1dDb = getPlayer(p1dData.slug)
	if(p1dDb) {
		if(p1dDb.character !== "" && p1dDb.colour !== "") {
			loadCharChange("p1d", p1dDb.character, p1dDb.colour || "red")
		}
	}

	//p2
	p2Data = JSON.parse($(`#set${x}-name2`).attr("data-p1"))
	$("#p2-slug").val(p2Data.slug)
	$("#p2-name").val(p2Data["name"] + p2Loser) 
	$("#p2-pronouns").val(p2Data["pronouns"])
	$("#p2-flag").val(fixCountry(p2Data["country"])).change();
	p2Db = getPlayer(p2Data.slug)
	if(p2Db) {
		if(p2Db.character !== "" && p2Db.colour !== "") {
			loadCharChange("p2", p2Db.character, p2Db.colour || "red")
		}
	}

	//p2d
	p2dData = JSON.parse($(`#set${x}-name2`).attr("data-p2"))
	$("#p2d-slug").val(p2dData.slug)
	$("#p2d-name").val(p2dData["name"] ? p2dData["name"] + p2Loser : "")
	$("#p2d-pronouns").val(p2dData["pronouns"])
	$("#p2d-flag").val(fixCountry(p2dData["country"])).change();
	p2dDb = getPlayer(p2dData.slug)
	if(p2dDb) {
		if(p2dDb.character !== "" && p2dDb.colour !== "") {
			loadCharChange("p2d", p2dDb.character, p2dDb.colour || "red")
		}
	}


	$("#p1-entrant").val($(`#set${x}-name1`).attr("data-entrant"))
	$("#p2-entrant").val($(`#set${x}-name2`).attr("data-entrant"))

	$("#p1-score-change").val(0)
	$("#p2-score-change").val(0)

	$("#round-change").val(round)
	$("#set-id").val($(`#set${x}`).attr("data-id"))
}

function saveSet(x) {
	swapped = false;
	$("#p1-entrant").val($(`#set${x}-name1`).attr("data-entrant"))
	$("#p1-entrant-name").text($(`#set${x}-name1`).text())

	$("#p2-entrant").val($(`#set${x}-name2`).attr("data-entrant"))
	$("#p2-entrant-name").text($(`#set${x}-name2`).text())

	$("#setID-input").val($(`#set${x}`).attr("data-id"))
}

/* SET DATA */

//make this shit pretty then make it submit to start.gg
function getTournamentSet() {
	const STOCK_ICON = `static/img/stock_icons`

	var set = JSON.parse($("#tournament-data :selected").attr("data-set"));
	if (!set) {
		return
	}
	$("#display-set-results").empty()
	$("#display-set-results").show()

	var entrantIds = $('<div />')
		.attr('class', 'row')
	$(entrantIds).append($('<input />').val(`${set.team1.entrantId}`).attr('class', 'startgg display id').attr('id', 'p1-entrant-input'))
	$(entrantIds).append($('<button />').attr('onclick', 'swapEntrants()').attr('class', 'startgg entrant swap').attr('id', 'entrant-swap').append(`<i class="fa-solid fa-arrow-right-arrow-left"></i>`))
	$(entrantIds).append($('<input />').val(`${set.team2.entrantId}`).attr('class', 'startgg display id').attr('id', 'p2-entrant-input'))

	$("#display-set-results").append($('<input />').val(`${set.setId}`).attr('class', 'startgg display id').attr('id', 'setID-input'))
	$("#display-set-results").append(entrantIds)

	var playerNames = $('<div />')
		.attr('class', 'row')
		.attr('id', 'startgg-names')
	$(playerNames).append($('<span />').text(set.team1.names[0]).attr('class', 'startgg display name left').attr('id', 'p1-entrant-name'))
	$(playerNames).append($('<span />').text("vs").attr('class', 'startgg'))
	$(playerNames).append($('<span />').text(set.team2.names[0]).attr('class', 'startgg display name right').attr('id', 'p2-entrant-name'))

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
	$("#display-set-results").append($('<button />').attr('id', 'submit-startgg-set').attr('onClick', 'submitSet()').text("Submit start.gg"));
	index = 1;
	$("#set-update").show()
}

function swapEntrants() {
	swapped = !swapped;

	p1Entrant = $("#p1-entrant-input").val()
	p1Name = $("#p1-entrant-name").text()

	p2Entrant = $("#p2-entrant-input").val()
	p2Name = $("#p2-entrant-name").text()

	$("#p1-entrant-input").val(p2Entrant)
	$("#p1-entrant-name").text(p2Name)

	$("#p2-entrant-input").val(p1Entrant)
	$("#p2-entrant-name").text(p1Name)
}

function showGetSets() {
	$("#get-sets").show()
}

function updateSet() {
	let data = JSON.parse($('#tournament-data :selected').attr("data-set"))
	data.timecodes[0] = HHmmssToMs($("#timecode-1").val())
	data.timecodes[1] = HHmmssToMs($("#timecode-2").val())

	let index = $('#tournament-data :selected').val()
	let tournament = `${$('#tournament-data :selected').attr("data-tournament")}`

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