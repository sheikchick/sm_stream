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

$(".entry>input").on("keyup", function (el) {
    console.log(el.target)
});

function getDB(full = false) {
    elements = ""
    $.ajax({
        type: 'POST',
        url: "/database.db",
        success: function (response) {
            let index = 0;
            db = response.sort(function compare(a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (b.name.toLowerCase() < a.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
            for (let player of db) {
                index++;
                const character = `/static/img/melee/stock_icons/${player.character
                    ? player.colour
                        ? `${player.character}/${player.colour}.png`
                        : getDefaultIcon(player.character)
                    : 'smash.png'}`
                entry = `
                    <div class="entry" id="player${index}" index=${index}>
                        <button class="delete" id="delete${index}" index=${index} onclick="deletePlayer(this.id)"><i class="fa-solid fa-trash"></i></button>
                        <input readonly class="slug" id="slug${index}" value='${player.slug}'>
                        <input class="prefix" id="prefix${index}" value='${player.prefix}' onKeyUp="showSubmit(${index})">
                        <input class="name" id="name${index}" value='${player.name}' onKeyUp="showSubmit(${index})">
                        <input class="country" id="country${index}" value='${player.country}' onKeyUp="showSubmit(${index})">
                        <input class="pronouns" id="pronouns${index}" value='${player.pronouns}' onKeyUp="showSubmit(${index})">
                        <img class="character" id="character-change${index}"
                            character="${player.character}" colour="${player.colour}" src="${character}" onclick="swapCharacter(this.id, ${index})">
                        <div class="submit-wrapper">
                            <button class="submit" id="submit${index}" index=${index} onclick="updatePlayer(this)">Submit</button>
                        </div>
                    </div>
                `
                elements = elements + entry
            }
            $("#database").append(elements)
        },
        error: function (response) {
            console.log(response)
        },
        timeout: 5000
    })
}

function updatePlayer(el) {
    const index = $(el).attr("index")
    let request = {
        "slug": $(`#player${index}>.slug`).val(),
        "name": $(`#player${index}>.name`).val(),
        "country": $(`#player${index}>.country`).val(),
        "prefix": $(`#player${index}>.prefix`).val(),
        "pronouns": $(`#player${index}>.pronouns`).val(),
        "character": $(`#player${index}>.character`).attr("character"),
        "colour": $(`#player${index}>.character`).attr("colour")
    }
    submitPlayer(request, el)
}

function deletePlayer(el) {
    const index = $(`#${el}`).attr("index")
    if (clickedDelete === index) {
        let request = {
            "slug": $(`#player${index}>.slug`).val(),
            "name": $(`#player${index}>.name`).val(),
            "country": $(`#player${index}>.country`).val(),
            "prefix": $(`#player${index}>.prefix`).val(),
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

function showSubmit(index) {
    console.log($(`#submit${index}`))
    $(`#submit${index}`).show()
}

function submitPlayer(request, el) {
    $.ajax({
        type: 'POST',
        url: "/updatePlayer",
        data: {
            player: request
        },
        success: function (response) {
            if(el) {
                submitFinished(el, false)
            }
        },
        error: function (response) {
            console.log(response)
            if(el) {
                submitFinished(el, true)
            }
        },
        timeout: 5000
    })
}

function submitAll() {
    $(".submit:not(#submit-all)").each((index, el) => {
        if ($(el).is(":visible")) {
            updatePlayer(el)
        }
    })
}

function submitFinished(el, err) {
    originalText = $(el).text()
    if (err) {
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
        if (!err) {
            $(el).hide();
        }
    }, 2000);
}

const getTournamentPlayers = (tournamentSlug, players = [], page = 1) => new Promise((resolve, reject) => {
    getTournamentPlayersPage(tournamentSlug, page)
        .then((result) => {
            players = players.concat(result.players)
            if (result.length >= 128) {
                resolve(getTournamentPlayers(tournamentSlug, players, page + 1))
            } else {
                resolve(players)
            }
        })
        .catch(() => {
            resolve(players)
        });
});

const getTournamentPlayersPage = (tournamentSlug, pageNo) => new Promise((resolve, reject) => {
    fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
				query tournamentData($name:String!){
					tournament(slug: $name){
						participants(
							query:{
								page: ${pageNo},
								perPage: 128
							}
						){
							nodes {
                                prefix
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
            let players = []
            let promises = []
            for (let participant of result.data.tournament.participants.nodes) {
                promises.push(new Promise((resolve) => {
                    if (participant.user !== null) {
                        players.push({
                            "slug": participant.user.discriminator,
                            "name": participant.gamerTag,
                            "prefix": participant.prefix || "",
                            "pronouns": participant.user.genderPronoun || "",
                            "country": participant.contactInfo?.country || participant.user.location.country || "",
                            "character": "",
                            "colour": ""
                        })
                    }
                    resolve()
                }))
            }
            Promise.all(promises).then(() => {
                resolve({players, length: result.data.tournament.participants.nodes.length});
            })
        })
        .catch(() => {
            reject()
        });
});

const getTournamentPlayersBasic = (tournamentSlug) => new Promise((resolve, reject) => {
    fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
				query tournamentData($name:String!){
					tournament(slug: $name){
						participants(
							query:{
								page: 1,
								perPage: 512
							}
						){
							nodes {
								user {
									discriminator
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
            for (let participant of result.data.tournament.participants.nodes) {
                promises.push(new Promise((resolve) => {
                    if (participant.user !== null) {
                        players.push({
                            "slug": participant.user.discriminator,
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
        for (let player of players) {
            $("#list").html($("#list").html() + player.name + "<br>")
        }
    })
}

function addToDB(el) {
    let success = true
    for (x = 0; x < players.length; x += 20) {
        slicedPlayers = players.slice(x, Math.min(x + 20, players.length))
        updatePlayers(slicedPlayers) === false ? success = false : ""
    }
}

//TODO: update to promise, reflect result
function updatePlayers(playerList) {
    //console.log(playerList)
    $.ajax({
        type: 'POST',
        url: "/updatePlayers",
        data: {
            players: playerList
        },
        success: function (response) {
            console.log("Added players")
        },
        error: function (response) {
            console.log(response)
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