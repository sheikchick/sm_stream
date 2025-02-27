var autocompletePlayers = [];

function getDBAutocomplete() {
    $.ajax({
        type: 'POST',
        url: "/database.db",
        data: {
            players: []
        },
        success: function (response) {
            autocompletePlayers = response.sort(function compare(a,b) {
                if(a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if(b.name.toLowerCase() < a.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
        },
        error: function (response) {
            console.log(response)
        },
        timeout: 5000
    })
}

function getDBAutocompleteSlug(slug) {
    $.ajax({
        type: 'POST',
        url: "/database.db",
        data: {
            players: []
        },
        success: function (response) {
            dbPlayers = response.sort(function compare(a,b) {
                if(a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if(b.name.toLowerCase() < a.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
            getTournamentPlayers(slug).then((eventPlayers) => {
                autocompletePlayers = dbPlayers.filter((dbPlayer) => {
                    return eventPlayers.some((eventPlayer) => {
                        return dbPlayer.slug == eventPlayer.slug
                    })
                })
            })
        },
        error: function (response) {
            console.log(response)
        },
        timeout: 5000
    })
}

function autocompleteListneners() {
    $(".autofill").on("click", function(el) {
        indicator = $(el.target).attr("index")
        slug = $(el.target).attr("slug")
        player = autocompletePlayers.find((el) => el.slug === slug)
        $(`#${indicator}-slug`).val(player.slug)
        $(`#${indicator}-name`).val(player.name)
        $(`#${indicator}-pronouns`).val(player.pronouns)
        $(`#${indicator}-flag`).val(player.country)
        loadCharChange(indicator, player.character, player.colour)
    });
    $(".name.change").on("blur", function(el) {
        setTimeout(() => {
            if(el.target.id.includes('p1-name')) {
                $("#p1-autofill").hide()
            }
            if(el.target.id.includes('p1d-name')) {
                $("#p1d-autofill").hide()
            }
            if(el.target.id.includes('p2-name')) {
                $("#p2-autofill").hide()
            }
            if(el.target.id.includes('p2d-name')) {
                $("#p2d-autofill").hide()
            }
        }, 200)
    })
    $("body").on("click", function(el) {
        if(!el.target.id.includes('p1-name')) {
            $("#p1-autofill").hide()
        }
        if(!el.target.id.includes('p1d-name')) {
            $("#p1d-autofill").hide()
        }
        if(!el.target.id.includes('p2-name')) {
            $("#p2-autofill").hide()
        }
        if(!el.target.id.includes('p2d-name')) {
            $("#p2d-autofill").hide()
        }
    });

    $(".name.change").on("click", function(el) {
        showResults(`${el.target.id.split("-")[0]}-autofill`, el.target.value)
    });


}

function autocompleteMatch(input) {
	if (input == '') {
		return [];
	}
	var reg = new RegExp(input.toLowerCase())
	return autocompletePlayers.filter((player) => {
		return player.name.toLowerCase().match(reg)
	});
}

function getPlayer(slug) {
	if (slug == '') {
		return undefined;
	}
	var reg = new RegExp(slug)
	return autocompletePlayers.find((player) => {
		if (player.slug.match(reg)) {
			return player;
		}
	});
}

function showResults(id, val) {
    indicator = id.split("-")[0]
	res = document.getElementById(`${indicator}-autofill`);
	res.innerHTML = '';
	let list = '';
	let terms = autocompleteMatch(val);
	for (i = 0; i < terms.length; i++) {
		list += `<li class="autocomplete-item" index="${indicator}" slug="${terms[i].slug}">${terms[i].name}</li>`;
	}
	res.innerHTML = '<ul>' + list + '</ul>';
    $(res).show();
}