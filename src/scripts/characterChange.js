var shown = false;

function swapCharacter(player, slot) {
	shown = true;
	$("#characterSelect").attr("player", player)
	$("#characterSelect").attr("slot", slot)
	switch(player) {
		case 1:
			$("#characterSelect").css("margin-top", "120px")
			break;
		case 2:
			$("#characterSelect").css("margin-top", "378px")
			break;
	}
	for(i = 0; i<=5; i++) {
		$(`#colour${i+1}`).attr('src', `static/img/stock_icons/empty.png`)
	}
	$("#characterSelect").show()
	$("#main").css("opacity", "0.25")
}

$("body").on("click", function(el) {
	if(el.target.id.includes('character-change') || el.target.className === "css-character") {
		""
	} else {
		shown = false;
		$("#characterSelect").hide()
		$("#main").css("opacity", "1")
	}
});

$(".css-character").on("click", function(el) {
	$.ajax({
		type: 'GET',
		url: "/character/" + el.target.id,
		data: {},
		success: function (response) {
			for(i = 0; i<=5; i++) {
				let img = ""
				if (i < response.colours.length) {
					img = `${el.target.id}/${response.colours[i]}.png`
					$(`#colour${i+1}`).attr('character', el.target.id)
					$(`#colour${i+1}`).attr('colour', response.colours[i])
					$(`#colour${i+1}`).show()
				} else {
					img = "empty.png"
					$(`#colour${i+1}`).attr('character', "")
					$(`#colour${i+1}`).attr('colour', "")
					$(`#colour${i+1}`).hide()
				}
				$(`#colour${i+1}`).attr('src', `static/img/stock_icons/${img}`)
			}
			response.colours.forEach(element => {
				console.log(element)
			});
		},
		error: function (response) {
			console.log(response)
		},
		timeout: 5000
	})
});

$(".char-colour").on("click", function(el) {
	player = $("#characterSelect").attr("player")
	slot = $("#characterSelect").attr("slot")
	character = $(el.target).attr("character")
	colour = $(el.target).attr("colour")
	$(`#p${player}${slot === "2" ? "d" : ""}-character-change`).attr("src", `static/img/csp_icons/${character}/${colour}.png`)
	$(`#p${player}${slot === "2" ? "d" : ""}-character-change`).attr("character", character)
	$(`#p${player}${slot === "2" ? "d" : ""}-character-change`).attr("colour", colour)
});

function initCharSelectors() {
	const getColours = (e) => {
		e.preventDefault();
		const [player, character] = e.target.id.split("_");

		fetch(`/character/${character}`).then((response) => response.json()
			.then(({colours}) => {
				const buttons = $(`#${player}_csp`).children();

				let i = 0
				for (i; i < colours.length; i++) {
					const colour = colours[i];
					showColour(player, i + 1, character, colour);
				}

				for (i; i < buttons.length; i++) {
					hideColour(player, i + 1);
				}

				reset_background(player);
				$(e.target).css("background-color", "white");
			}));
	}

	const characterImg = $(".css-character:not(.css-empty)");
	characterImg.contextmenu(getColours);
	characterImg.click(getColours);

	const onChangeChar = (e) => {
		e.preventDefault();
		const character = e.target.getAttribute("character");
		const colour = e.target.getAttribute("colour");
		
		const player = e.target.id.replace(/_.*/, e.type === "contextmenu" ? "d" : "");
		load_char_change(player, character, colour);
	}

	const colourButtons = $(".char_colour");
	colourButtons.click(onChangeChar);
	colourButtons.contextmenu(onChangeChar);

	const onEmpty = (e) => {
		onChangeChar(e);
		reset_background(e.target.id.split("_")[0]);
		colourButtons.hide();
		colourButtons.attr("character", "");
		colourButtons.attr("colour", "");
	}

	const emptyButtons = $(".css-empty");
	emptyButtons.click(onEmpty);
	emptyButtons.contextmenu(onEmpty);
}

const colourButton = (player, slot) => $(`#${player}_colour${slot}`);

function showColour(player, slot, character, colour) {
	const button = colourButton(player, slot);
	button.attr("src", `stock/?${load_char_string(character, colour)}`);
	button.show();
	button.attr("character", character);
	button.attr("colour", colour);
};

function hideColour(player, slot) {
	const button = colourButton(player, slot);
	button.hide();
	button.attr("character", "");
	button.attr("colour", "");
}

function empty(player, port) {
	if(port == 2 && is_doubles) {
		$("#p" + player + "d_character_change").attr("src", "csp");
		$("#p" + player + "d_character_change").attr("character", "")
		$("#p" + player + "d_character_change").attr("colour", "")
	} else if (port == 1) {
		$("#p" + player + "_character_change").attr("src", "csp");
		$("#p" + player + "_character_change").attr("character", "")
		$("#p" + player + "_character_change").attr("colour", "")
	}
}
