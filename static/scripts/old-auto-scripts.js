is_doubles = false;
var obs;

const phone_aspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");


$(document).ready(function(){
	obs = new OBSWebSocket();
	url = window.location.href;
	var arr = url.split(":");
	var ip = arr[1].substr(2, this.length);
	obsurl = ip + ':4455';

	load_changes();

	/*$("#p1_character").attr("character", $("#p1_character").attr("src").split("/")[3].split(".")[0]);
	$("#p1d_character").attr("character", $("#p1d_character").attr("src").split("/")[3].split(".")[0]);
	$("#p2_character").attr("character", $("#p2_character").attr("src").split("/")[3].split(".")[0]);
	$("#p2d_character").attr("character", $("#p2d_character").attr("src").split("/")[3].split(".")[0]);*/

	obs.connect(obsurl, '00000000')
		.then(() => {
			$("#scenes").show();
			$("#update_scene").show();
			obs.call(
				'GetSceneList', {}
			)
			.then(function(value) {
				value["scenes"].forEach(function(scene) {
					$("#scenes").append(new Option(scene["sceneName"], scene["name"]));
				})
				$("#scenes").val(value["current-scene"])
		  		//console.log(value);
		  	})
		})
		.catch(err => {
        	console.log(err);
    });

	if($(".toggle_doubles").attr("value") === "true") {
		is_doubles = false;
	} else {
		is_doubles = true;
	}

	toggle_doubles();
});

function set(player, slot, character, colour) {
	side = "left"
	if (player == 1) {
		side = "left";
	} else {
		side = "right";
	}
	$("#p" + player + "_colour" + slot).attr("src", "static/img/csp_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_colour" + slot).show();
	$("#p" + player + "_stock" + slot).attr("src", "static/img/stock_icons/" + side + "/" + character + ".png");
	$("#p" + player + "_stock" + slot).hide();
};

function hide(player, slot) {
		$("#p" + player + "_colour" + slot).attr("src", "");
		$("#p" + player + "_colour" + slot).hide();
		$("#p" + player + "_stock" + slot).attr("src", "");
		$("#p" + player + "_stock" + slot).hide();
};

function reset_background(player) {
	$(".css" + player).css("background-color", "transparent");
}

function update() {
	player1tag = $("#p1_tag").val();
	player1dtag = $("#p1d_tag").val();
	player1char = $("#p1_character").attr("character");
	player1colour = $("#p1_character").attr("colour");
	player1dchar = $("#p1d_character").attr("character");
	player1dcolour = $("#p1d_character").attr("colour");
	player1score = $("#p1_score").val();
	player2tag = $("#p2_tag").val();
	player2dtag = $("#p2d_tag").val();
	player2char = $("#p2_character").attr("character");
	player2colour = $("#p2_character").attr("colour");
	player2dchar = $("#p2d_character").attr("character");
	player2dcolour = $("#p2d_character").attr("colour");
	player2score = $("#p2_score").val();
	round = $("#round").val();
	caster1 = "";
	caster2 = "";
	best_of = $("#best_of").find(":selected").text();

	console.log(best_of)

	$.ajax({
		type: 'POST',
		url: "/update",
		data: {
				p1_tag: player1tag,
				p1d_tag: player1dtag,
				p1_char: player1char,
				p1_colour: player1colour,
				p1d_char : player1dchar,
				p1d_colour: player1colour,
				p1_score: player1score,
				p2_tag: player2tag,
				p2d_tag: player2dtag,
				p2_char: player2char,
				p2_colour: player2colour,
				p2d_char : player2dchar,
				p2d_colour: player2dcolour,
				p2_score: player2score,
				round: round,
				caster1: caster1,
				caster2: caster2,
				is_doubles: is_doubles,
				best_of: best_of
			},
		success: function() {
			$(".update").css("background-color", "#55F76B");
			$(".update").css("border-bottom", "3px solid #349641");
			$(".update").text("Updated ");
			$(".update").append('<i class="fa-solid fa-thumbs-up"></i>')
			setTimeout(function(){
				$(".update").css("background-color", "#CBFFC7");
				$(".update").css("border-bottom", "3px solid #64B55E");
				$(".update").text("Update ");
				$(".update").append('<i class="fa fa-sync"></i>')
			}, 2000);
		},
		error: function() {
			$(".update").css("background-color", "#F56262");
			$(".update").css("border-bottom", "3px solid #F53535");
			$(".update").text("Error ");
			$(".update").append('<i class="fa-solid fa-triangle-exclamation"></i>')
			setTimeout(function(){
				$(".update").css("background-color", "#CBFFC7");
				$(".update").css("border-bottom", "3px solid #64B55E");
				$(".update").text("Update ");
				$(".update").append('<i class="fa fa-sync"></i>')
			}, 2000);
		},
		timeout: 5000
	})
}

function swap_sides() {
	player1tag = $("#p1_tag").val();
	player1dtag = $("#p1d_tag").val();
	player2tag = $("#p2_tag").val();
	player2dtag = $("#p2d_tag").val();

	$("#p1_tag").val(player2tag);
	$("#p1d_tag").val(player2dtag);
	$("#p2_tag").val(player1tag);
	$("#p2d_tag").val(player1dtag);
}

function swap_team(n) {
	player_tag = $("#p" + n + "_tag").val();
	playerd_tag = $("#p" + n + "d_tag").val();

	$("#p" + n + "_tag").val(playerd_tag);
	$("#p" + n + "d_tag").val(player_tag);
}

function toggle_doubles() {
	//changing to singles
	if(is_doubles) {
		$(".toggle_doubles").text("Singles ");
		$(".toggle_doubles").append("<i class='fa fa-user'></i>");
		$("#p1d_chosen").hide();
		$("#p2d_chosen").hide();
		$(".text_flex").css("margin-top", "0px");
		$(".text_flex change").css("width", "403px");
		$(".tag").css("height", "");
		$("#p2_tag").attr("placeholder", "Player 2 Tag")
		$(".swap").hide()

		$("#p1d_tag").hide();
		$("#p2d_tag").hide();
		$("#p1d_tag_actual").hide();
		$("#p2d_tag_actual").hide();
		$(".tag.actual").css("font-size", "30px");
		$(".tag.actual").css("height", "");

		$(".info").css("height", "150px");
		$(".score.change").css("margin-bottom", "0px");
		$(".tag.change").css("margin-top", "0px");

		$(".text_flex.actual").css("width", "");

		is_doubles = false;
	}
	//changing to doubles
	else {
		$(".toggle_doubles").text("Doubles ");
		$(".toggle_doubles").append("<i class='fa fa-user-friends'></i>");
		$("#p1d_chosen").show();
		$("#p2d_chosen").show();
		$(".text_flex").css("margin-top", "0px");
		//$(".text_flex change").css("width", "301px");
		$(".tag").css("height", "16px");
		$("#p2_tag").attr("placeholder", "Player 1 Tag")
		$(".swap").show()

		$("#p1d_tag").show();
		$("#p2d_tag").show();

		$("#p1d_tag_actual").show();
		$("#p2d_tag_actual").show();
		$(".tag.actual").css("font-size", "20px");
		$(".tag.actual").css("height", "20px");

		$(".info").css("height", "200px");
		$(".score.change").css("margin-bottom", "50px");
		$(".tag.change").css("margin-top", "0px");

		$(".text_flex.actual").css("width", "341px !important");

		is_doubles = true;
	}
}

function load_changes() {
	$.ajax({
		type: 'POST',
		url: "/data.json",
		data: {},
		success: function(response) {
			$("#p1_tag_actual").attr("value", response.Player1["name"])
			$("#p1d_tag_actual").attr("value", response.Player1["dubs_name"])
			$("#p1_score_actual").attr("value", response.Player1["score"])
			$("#p2_tag_actual").attr("value", response.Player2["name"])
			$("#p2d_tag_actual").attr("value", response.Player2["dubs_name"])
			$("#p2_score_actual").attr("value", response.Player2["score"])
			$("#round_actual").attr("value", response.round)
			$("#best_of_actual").attr("value", response.best_of)
			load_char("1", response.Player1["character"], response.Player1["colour"])
			load_char("1d", response.Player1["character_dubs"], response.Player1["colour_dubs"])
			load_char("2", response.Player2["character"], response.Player2["colour"])
			load_char("2d", response.Player2["character_dubs"], response.Player2["colour_dubs"])
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
	setTimeout(load_changes, 1000)
}

function load(player, slot) {
	$("#p" + player + slot + "_tag").attr("value", $("#p" + player + "_select :selected").text());
	$("#p" + player + slot + "_tag").val($("#p" + player + "_select :selected").text());
	$("#p" + player + slot + "_character").attr("src", "static/img/csp_icons/" + $("#p" + player + "_select :selected").attr("value"));
	$("#p" + player + slot + "_stock").attr("src", "static/img/stock_icons/" + $("#p" + player + "_select :selected").attr("value"));
}

function load_char(player, character, colour) {
	$("#p" + player + "_character").attr("src", "static/img/csp_icons/" + character + "/" + colour + ".png");
	$("#p" + player + "_character").attr("character", character);
	$("#p" + player + "_character").attr("colour", colour);
}

function update_scene() {
	newScene = $("#scenes :selected").text();
	obs.call(
		'SetCurrentProgramScene', {'sceneName': newScene}
	)
	.then(function(value) {
		console.log("Changed scene to '" + newScene + "'");
	})
}

function settings() {
	window.location.href = "/settings";
}

function manual() {
	window.location.href = "/manual";
}

//run on aspect ratio change
/*function handle_aspect_change(e) {
	//phone
	if (e.matches) {
		if(is_doubles) {
			
		} else {

		}
	}
	//desktop
	else {
		if(is_doubles) {

		} else {
			
		}
	}
}*/