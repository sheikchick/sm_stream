var shown = false;

function swapCharacter(id, index = 0) {
	shown = true;
	$("#characterSelect").attr("imgId", id)
	$("#characterSelect").attr("index", index)
	for (i = 0; i <= 5; i++) {
		$(`#colour${i + 1}`).attr('src', `static/img/melee/stock_icons/empty.png`)
	}
	$("#characterSelect").show()
	$("#main").css("opacity", "0.25")
}


$("body").on("click", function (el) {
	if (!el.target.id.includes('character-change') && el.target.className !== "css-character") {
		shown = false;
		$("#characterSelect").hide()
		$("#main").css("opacity", "1")
	}
});

$(".css-character").on("click", function (el) {
	$(".css-character").css("background-color", "transparent")
	$(el.target).css("background-color", "rgba(255,255,255,0.5)")
	$.ajax({
		type: 'GET',
		url: "/character/" + el.target.id,
		data: {},
		success: function (response) {
			for (i = 0; i <= 5; i++) {
				let img = ""
				if (i < response.colours.length) {
					img = `${el.target.id}/${response.colours[i]}.png`
					$(`#colour${i + 1}`).attr('character', el.target.id)
					$(`#colour${i + 1}`).attr('colour', response.colours[i])
					$(`#colour${i + 1}`).show()
				} else {
					img = "empty.png"
					$(`#colour${i + 1}`).attr('character', "")
					$(`#colour${i + 1}`).attr('colour', "")
					$(`#colour${i + 1}`).hide()
				}
				$(`#colour${i + 1}`).attr('src', `static/img/melee/stock_icons/${img}`)
			}
		},
		error: function (response) {
			console.log(response)
		},
		timeout: 5000
	})
});

$('.css-character').on('dragstart', function (event) { event.preventDefault(); });

$(".char-colour").on("click", function (el) {
	let iconType = "stock_icons"
	switch (window.location.pathname) {
		case "/database":
			iconType = "stock_icons"
			break;
		default:
			iconType = "csp_icons";
			break;

	}
	imgId = $("#characterSelect").attr("imgId")
	character = $(el.target).attr("character")
	colour = $(el.target).attr("colour")
	$(`#${imgId}`).attr("src", `static/img/melee/${iconType}/${character}/${colour}.png`)
	$(`#${imgId}`).attr("character", character)
	$(`#${imgId}`).attr("colour", colour)
	if(window.location.pathname === "/database") {
		showSubmit($("#characterSelect").attr("index"))
	}
});

$('.char-colour').on('dragstart', function (event) { event.preventDefault(); });