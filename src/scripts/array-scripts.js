var swapped = false;

function loadGames() {
    $.ajax({
		type: 'POST',
		url: "/get-wii-games",
		data: {
            directory: $(".wii-name").val(),
            index: 0,
            amount: 5
        },
		success: function (response) {
            $(".game").css("background-color", "#443344")
            index = 1;
            $(".game").remove()
            $(".score").html(0)
            for(let game of response) {
                element = `
                <div class="game" id="game${index}" winner="${game.winner}" game-data="${JSON.stringify(game).replaceAll("\"", "'")}">
                    <img class="p1 stock-icon${game.winner == 1 ? "" : " loser"}" src="http://127.0.0.1:5000/stock?character=${game.team1[0].character}&colour=${game.team1[0].colour}">
                    <span class="stage">${game.stage}</span>
                    <img class="p2 stock-icon${game.winner == 2 ? "" : " loser"}" src="http://127.0.0.1:5000/stock?character=${game.team2[0].character}&colour=${game.team2[0].colour}">
                </div>
                `
                $(".setup").append(element)
                console.log(game)
                index++;
            }
            $(".game").on("click", (element) => {
                selected = $(element.currentTarget).hasClass("selected")
                switch($(element.currentTarget).attr("winner")) {
                    case "1":
                        value = parseInt($('#p1score').html(), 10) || 0
                        value = selected ? value-1 : value+1
                        $('#p1score').html(value)
                        break;
                    case "2":
                        value = parseInt($('#p2score').html(), 10) || 0
                        value = selected ? value-1 : value+1
                        $('#p2score').html(value)
                        break;
                    default:
                        return;
                }
                selected ? $(element.currentTarget).removeClass("selected") : $(element.currentTarget).addClass("selected")
            });
		},
		error: function (response) {
			console.log(response)
		},
		timeout: 5000
	})
}

function submitSet() {
    const p1 = {
        score: swapped ? parseInt($("#p2score").html()) : parseInt($("#p1score").html()),
        entrantId: $(".player-wrapper").attr("p1-data-entrant")
    }
    const p2 = {
        score: swapped ? parseInt($("#p1score").html()) : parseInt($("#p2score").html()),
        entrantId: $(".player-wrapper").attr("p2-data-entrant")
    }
    if(p1.score === p2.score)
        return
    var winner = p2.score > p1.score ? p2.entrantId : p1.entrantId
	var set = constructSetGames();
	var startggSet = constructSet(p1.entrantId, p2.entrantId, set, swapped)
    console.log(startggSet)
	submitStartggSet($(".player-wrapper").attr("data-id"), winner, startggSet)
}

function swap() {
    swapped = !swapped;
    p1tag = $("#p1tag").html()
    p2tag = $("#p2tag").html()
    $("#p1tag").html(p2tag)
    $("#p2tag").html(p1tag)
}

function constructSetGames() {
    set = []
    $(".game.selected").each((index, element) => {
        gameDataRaw = $(element).attr("game-data").replaceAll("'", "\"")
        set.push(JSON.parse(gameDataRaw))
    })
    return set
}

function showGetSets() {
	$("#get-sets").show()
}

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

$('document').ready(function(){
    $(".set").on("click", (element) => {
        swapped = false;
        index = $(element).attr("index");
        $(".set").css("background-color", "#336")
        $(element.currentTarget).css("background-color", "#446")
        p1data = JSON.parse($(element.currentTarget).find(".startgg.name.left").attr("data-p1"))
        p2data = JSON.parse($(element.currentTarget).find(".startgg.name.right").attr("data-p2"))
        $(".player-wrapper").attr("data-id", $(element.currentTarget).attr("data-id"))
        $("#p1tag").text(p1data.name)
        $(".player-wrapper").attr("p1-data-entrant", $(element.currentTarget).find(".startgg.name.left").attr("data-entrant"))
        $("#p2tag").text(p2data.name)
        $(".player-wrapper").attr("p2-data-entrant", $(element.currentTarget).find(".startgg.name.right").attr("data-entrant"))
    });
});