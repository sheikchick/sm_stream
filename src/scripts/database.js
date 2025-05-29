let players = []
let slug = ""

let clickedDelete = "";

function clickedListener() {
    $("body").on("click", function (el) {
        if (!el.target.id.includes('delete') && !el.target?.parentElement?.id?.includes('delete') && !el.target?.parentElement?.parentElement?.id?.includes('delete')) {
            clickedDelete = "";
            $(".delete").removeClass("clicked")
        }
    });
}

function getDB(full = false) {
    $.ajax({
        type: 'POST',
        url: "/database.db",
        success: function (response) {
            let index = 0;
            db = response.sort(function compare(a,b) {
                if(a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if(b.name.toLowerCase() < a.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
            for (let player of db) {
                index++;
                let character = "static/img/stock_icons/smash.png"
                if (player.character != "") {
                    if (player.colour != "") {
                        character = `static/img/stock_icons/${player.character}/${player.colour}.png`
                    } else {
                        character = `static/img/stock_icons/${getDefaultIcon(player.character)}`
                    }
                }
                entry = `
                    <div class="entry" id="player${index}" index=${index}>
                        <button class="delete" id="delete${index}" index=${index} onclick="deletePlayer(this.id)"><i class="fa-solid fa-trash"></i></button>
                        <input class="slug" id="slug${index}" value='${player.slug}'>
                        <input class="name" id="name${index}" value='${player.name}'>
                        <input class="country" id="country${index}" value='${player.country}'>
                        <input class="pronouns" id="pronouns${index}" value='${player.pronouns}'>
                        <img class="character" id="character-change${index}"
                            character="${player.character}" colour="${player.colour}" src="${character}" onclick="swapCharacter(this.id)">
                        <button class="submit" id="submit${index}" index=${index} onclick="updatePlayer(this)">Submit</button>
                    </div>
                `
                $("#database").append(entry)
            }
        },
        error: function (response) {
            console.log(response)
        },
        timeout: 5000
    })
}

function updatePlayer(el) {
    const index = $(el).attr("index")
    console.log(index)
    let request = {
        "slug": $(`#player${index}>.slug`).val(),
        "name": $(`#player${index}>.name`).val(),
        "country": $(`#player${index}>.country`).val(),
        "pronouns": $(`#player${index}>.pronouns`).val(),
        "character": $(`#player${index}>.character`).attr("character"),
        "colour": $(`#player${index}>.character`).attr("colour")
    }
    submitPlayer(request, el)
}

function deletePlayer(el) {
    const index = $(`#${el}`).attr("index")
    if(clickedDelete === index) {
        let request = {
            "slug": $(`#player${index}>.slug`).val(),
            "name": $(`#player${index}>.name`).val(),
            "country": $(`#player${index}>.country`).val(),
            "pronouns": $(`#player${index}>.pronouns`).val(),
            "character": $(`#player${index}>.character`).attr("character"),
            "colour": $(`#player${index}>.character`).attr("colour")
        }
        $.ajax({
            type: 'POST',
            url: "/deletePlayer",
            data: {
                player: request
            },
            success: function (response) {
                $(`#player${index}`).remove()
                $(`#${el}`).css("background-color", "#CBFFC7");
                $(`#${el}`).css("border-bottom", "3px solid #64B55E");
                $(`#${el}`).text("");
                $(`#${el}`).append('<i class="fa-solid fa-thumbs-up"></i>')
                setTimeout(function () {
                    $(`#${el}`).css("background-color", "#FFF");
                    $(`#${el}`).css("border-bottom", "3px solid #AAA");
                    $(`#${el}`).text("");
                    $(`#${el}`).append('<i class="fa-solid fa-trash"></i>')
                }, 2000);
            },
            error: function (response) {
                console.log(response)
                $(`#${el}`).css("background-color", "#F56262");
                $(`#${el}`).css("border-bottom", "3px solid #F53535");
                $(`#${el}`).text("");
                $(`#${el}`).append('<i class="fa-solid fa-triangle-exclamation"></i>')
                setTimeout(function () {
                    $(`#${el}`).css("background-color", "#FFF");
                    $(`#${el}`).css("border-bottom", "3px solid #AAA");
                    $(`#${el}`).text("");
                    $(`#${el}`).append('<i class="fa-solid fa-trash"></i>')
                }, 2000);
            },
            timeout: 5000
        })
    } else {
        $(".delete").removeClass("clicked")
        clickedDelete = index;
        $(`#${el}`).addClass("clicked");
    }

}

function submitPlayer(request, el) {
    $.ajax({
        type: 'POST',
        url: "/updatePlayer",
        data: {
            player: request
        },
        success: function (response) {
            submitFinished(el, false)
        },
        error: function (response) {
            console.log(response)
            submitFinished(el, true)
        },
        timeout: 5000
    })
}

function submitFinished(el, err) {
    originalText = $(el).text()
    if(err) {
        $(el).css("background-color", "#F56262");
        $(el).css("border-bottom", "3px solid #F53535");
        $(el).text("Error ");
        $(el).append('<i class="fa-solid fa-triangle-exclamation"></i>')
    } else {
        $(el).css("background-color", "#CBFFC7");
        $(el).css("border-bottom", "3px solid #64B55E");
        $(el).text("");
        $(el).append('<i class="fa-solid fa-thumbs-up"></i>')
    }
    setTimeout(function () {
        $(el).css("background-color", "#FFF");
        $(el).css("border-bottom", "3px solid #AAA");
        $(el).text(originalText);
    }, 2000);
}

const getTournamentPlayers = (tournamentSlug) => new Promise((resolve, reject) => {
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query tournamentCountry($name:String!){
					tournament(slug: $name){
						participants(
							query:{
								page: 1,
								perPage: 500
							}
						){
							nodes {
								gamerTag
								contactInfo{
									country
								}
								user {
									discriminator
									genderPronoun
									location {
										country
									}
								}
							}
						}
					}
				}
			`,
			variables: {
				name: tournamentSlug
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		players = []
		const promises = []
		for(let participant of result.data.tournament.participants.nodes) {
			promises.push(new Promise((resolve) => {
				if(participant.user !== null) {
					players.push({
						"slug": participant.user.discriminator,
						"name": participant.gamerTag,
						"pronouns": participant.user.genderPronoun,
						"country": participant.contactInfo?.country || participant.user.location.country || "",
						"character": "",
						"colour": ""
					})
				}
				resolve()
			}))
		}
		Promise.all(promises).then(() => {
			resolve(players);
		})
	});
});

function load() {
    slug = $("#tournament-slug").val()
    getTournamentPlayers(slug).then((res) => {
        $("#list").text("");
        players = res
        for(let player of players) {
            $("#list").html($("#list").html() + player.name + "<br>")
        }
    })
}

function addToDB(el) {
    $.ajax({
        type: 'POST',
        url: "/updatePlayers",
        data: {
            players: players
        },
        success: function (response) {
            submitFinished(el, false)
        },
        error: function (response) {
            console.log(response)
            submitFinished(el, true)
        },
        timeout: 5000
    })
}

function saveFilter(el) {
    filtered = []
    players.forEach((player) => {
        filtered.push(player.slug)
    })
    $.ajax({
        type: 'POST',
        url: "/saveFilter",
        data: {
            players: filtered,
            slug: slug
        },
        success: function (response) {
            submitFinished(el, false)
        },
        error: function (response) {
            console.log(response)
            submitFinished(el, true)
        },
        timeout: 5000
    })
}

function clearList() {
    players = []
    console.log($("#list"))
    $("#list").text("");
}