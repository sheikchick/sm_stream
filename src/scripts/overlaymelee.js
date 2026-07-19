const GAME = "melee"

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
	fetch("/update-melee", {
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
						prefix: $("#p1-prefix").val(),
						pronouns: $("#p1-pronouns").val(),
						country: $("#p1-flag").find(":selected").val(),
						port: info.team1.players[0].port || 1
					},
					{
						slug: $("#p1d-slug").val(),
						name: $("#p1d-name").val(),
						character: $("#p1d-character-change").attr("character"),
						colour: $("#p1d-character-change").attr("colour"),
						prefix: $("#p1d-prefix").val(),
						pronouns: $("#p1d-pronouns").val(),
						country: $("#p1d-flag").find(":selected").val(),
						port: info.team1.players[1].port || 2
					}
				],
				score: parseInt($("#p1-score-change").val())
			},
			team2: {
				players: [
					{
						slug: $("#p2-slug").val(),
						name: $("#p2-name").val(),
						character: $("#p2-character-change").attr("character"),
						colour: $("#p2-character-change").attr("colour"),
						prefix: $("#p2-prefix").val(),
						pronouns: $("#p2-pronouns").val(),
						country: $("#p2-flag").find(":selected").val(),
						port: info.team2.players[0].port || 3
					},
					{
						slug: $("#p2d-slug").val(),
						name: $("#p2d-name").val(),
						character: $("#p2d-character-change").attr("character"),
						colour: $("#p2d-character-change").attr("colour"),
						prefix: $("#p2d-prefix").val(),
						pronouns: $("#p2d-pronouns").val(),
						country: $("#p2d-flag").find(":selected").val(),
						port: info.team2.players[1].port || 4
					},
				],
				score: parseInt($("#p2-score-change").val())
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
			startgg: {
				entrant1: {
					id: $("#startgg-p1-entrant").text(),
					name: $("#startgg-p1-name").text(),
					score: ""
				},
				entrant2: {
					id: $("#startgg-p2-entrant").text(),
					name: $("#startgg-p2-name").text(),
					score: ""
				},
				round: $("#startgg-set-round").text(),
				setId: $("#startgg-set-id").text(),
				startggSwapped: startggSwapped
			},
			seatOrdering: [
				$("#p1-left-seat").attr("index"),
				$("#p1-right-seat").attr("index"),
				$("#p2-left-seat").attr("index"),
				$("#p2-right-seat").attr("index"),
			],
			round: $("#round-change").val(),
			tournament: $("#tournament-change").val(),
			isDoubles,
			bestOf: bestOfValue,
			isHandwarmer: $("#handwarmer").prop("checked")
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


function loadInitialChanges() {
	$("#tournament-slug").text(localStorage.getItem("startggSlug"))
	$.ajax({
		type: 'GET',
		url: "/melee.json",
		data: {},
		success: function (response) {
			info = fixInfo(response);
			//startgg
			startggSwapped = info.startgg.startggSwapped
			if(info.startgg.setId) {
				$(".no-set").hide()
				$("#startgg-p1-entrant").text(info.startgg.entrant1.id || "")
				$("#startgg-p1-name").text(info.startgg.entrant1.name || "")
				$("#startgg-p2-entrant").text(info.startgg.entrant2.id || "")
				$("#startgg-p2-name").text(info.startgg.entrant2.name || "")
				$("#startgg-set-round").text(info.startgg.round || "")
				$("#startgg-set-id").text(info.startgg.id || "")
				$("#current-set-wrapper-info>.wrapper").show()
				loadInitialStartGG(info)
			}
			
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
		url: "/melee.json",
		data: {},
		success: function (response) {
			let scoreChanged = false;

			info = fixInfo(response);
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

			if (scoreChanged && (info.round === "Grand Final" || info.round === "Grand Finals")) {
				let { l: p1L } = getName(info.team1.players[0].name)
				let { l: p2L } = getName(info.team2.players[0].name)
				let firstTo = Math.ceil(info.bestOf / 2)
				if ((p1L && info.team1.score === firstTo) || (p2L && info.team2.score === firstTo)) {
					setTimeout(() => {
						findStartGGSet("Grand Final Reset")
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
	let { name: p1Name } = getName($("#p1-name").val())
	let { name: p2Name } = getName($("#p2-name").val())
	switch (fullRoundText) {
		case "Grand Final":
			if (startggSwapped) {
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
					"prefix": info?.team1?.players?.[0]?.prefix || "",
					"pronouns": info?.team1?.players?.[0]?.pronouns || "",
					"country": info?.team1?.players?.[0]?.country || "EU",
					"port": info?.team1?.players?.[0]?.port || 1
				},
				{
					"slug": info?.team1?.players?.[1]?.slug || "",
					"name": info?.team1?.players?.[1]?.name || "Player 4",
					"character": info?.team1?.players?.[1]?.character || "falco",
					"colour": info?.team1?.players?.[1]?.colour || "red",
					"prefix": info?.team1?.players?.[1]?.prefix || "",
					"pronouns": info?.team1?.players?.[1]?.pronouns || "",
					"country": info?.team1?.players?.[1]?.country || "EU",
					"port": info?.team1?.players?.[1]?.port || 2
				}
			],
			"score": info?.team1?.score || 0,
		},
		"team2": {
			"players": [
				{
					"slug": info?.team2?.players?.[0]?.slug || "",
					"name": info?.team2?.players?.[0]?.name || "Player 2",
					"character": info?.team2?.players?.[0]?.character || "sheik",
					"colour": info?.team2?.players?.[0]?.colour || "blue",
					"prefix": info?.team2?.players?.[0]?.prefix || "",
					"pronouns": info?.team2?.players?.[0]?.pronouns || "",
					"country": info?.team2?.players?.[0]?.country || "EU",
					"port": info?.team2?.players?.[0]?.port || 1
				},
				{
					"slug": info?.team2?.players?.[1]?.slug || "",
					"name": info?.team2?.players?.[1]?.name || "Player 3",
					"character": info?.team2?.players?.[1]?.character || "peach",
					"colour": info?.team2?.players?.[1]?.colour || "blue",
					"prefix": info?.team2?.players?.[1]?.prefix || "",
					"pronouns": info?.team2?.players?.[1]?.pronouns || "",
					"country": info?.team2?.players?.[1]?.country || "EU",
					"port": info?.team2?.players?.[1]?.port || 2
				}
			],
			"score": info?.team2?.score || 0,
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
		"startgg": {
			"entrant1": {
				"id": info?.startgg?.entrant1?.id || "",
				"name": info?.startgg?.entrant1?.name || "",
				"score": info?.startgg?.entrant1?.score || ""
			},
			"entrant2": {
				"id": info?.startgg?.entrant2?.id || "",
				"name": info?.startgg?.entrant2?.name || "",
				"score": info?.startgg?.entrant2?.score || ""
			},
			"round": info?.startgg?.round || "",
			"setId": info?.startgg?.setId || "",
			"startggSwapped": info?.startgg?.startggSwapped || false,
		},
		"seatOrdering": info?.seatOrdering || ["1", "2", "3", "4"],
		"round": info?.round || "",
		"tournament": info?.tournament || "",
		"isDoubles": info?.isDoubles || false,
		"bestOf": info?.bestOf || 5,
		"isHandwarmer": info?.isHandwarmer || false
	}
	return newInfo;
}

function changeTeamColour(index, colour) {
	loadCharChange(`p${index}`, $(`#p${index}-character-change`).attr("character"), colour)
	loadCharChange(`p${index}d`, $(`#p${index}d-character-change`).attr("character"), colour)
}

function getDefaultColour(character) {
	switch (character) {
		case "marth":
		case "iceclimbers":
			return "blue";
		case "yoshi":
		case "luigi":
		case "link":
		case "younglink":
		case "bowser":
			return "green"
		case "peach":
		case "samus":
		case "mario":
		case "ness":
			return "red";
		default:
			return "default";
	}
}