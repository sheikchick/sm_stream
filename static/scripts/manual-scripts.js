is_doubles = false;
var obs;

$(document).ready(function(){
	obs = new OBSWebSocket();
	url = window.location.href;
	var arr = url.split(":");
	var ip = arr[1].substr(2, this.length);
	obsurl = ip + ':4444';
	console.log(obsurl);
	
	

	$("#p1_character").attr("character", $("#p1_character").attr("src").split("/")[3].split(".")[0]);
	$("#p1d_character").attr("character", $("#p1d_character").attr("src").split("/")[3].split(".")[0]);
	$("#p2_character").attr("character", $("#p2_character").attr("src").split("/")[3].split(".")[0]);
	$("#p2d_character").attr("character", $("#p2d_character").attr("src").split("/")[3].split(".")[0]);

	obs.connect({
		address: obsurl, password: 'password'
		})
		.then(() => {
			$("#scenes").show();
			$("#update_scene").show();
			obs.send(
				'GetSceneList', {}
			)
			.then(function(value) {
				value["scenes"].forEach(function(scene) {
					$("#scenes").append(new Option(scene["name"], scene["name"]));
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

	promise1 = obs.send('GetSceneList', {});
	promise1.then(function(value) {
	  	console.log(value);
	});

	$.getJSON("/database.json", function(data) {
		data["players"].forEach(function(player) {
			$("#p1_select").append(new Option(player["tag"], player["character"]));
			$("#p2_select").append(new Option(player["tag"], player["character"]));
		});
	});

	toggle_doubles();
	
	//P1

	$("#bowser1").click(function(){
		get(1, "bowser");
	});
	
	$("#captainfalcon1").click(function(){
		get(1, "captainfalcon");
	});
	
	$("#donkeykong1").click(function(){
		get(1, "donkeykong");
	});
	
	$("#drmario1").click(function(){
		get(1, "drmario");
	});
	
	$("#falco1").click(function(){
		get(1, "falco");
	});
	
	$("#fox1").click(function(){
		get(1, "fox");
	});
	
	$("#ganondorf1").click(function(){
		get(1, "ganondorf");
	});
	
	$("#iceclimbers1").click(function(){
		get(1, "iceclimbers");
	});
	
	$("#jigglypuff1").click(function(){
		get(1, "jigglypuff");
	});
	
	$("#kirby1").click(function(){
		get(1, "kirby");
	});
	
	$("#link1").click(function(){
		get(1, "link");
	});
	
	$("#luigi1").click(function(){
		get(1, "luigi");
	});
	
	$("#mario1").click(function(){
		get(1, "mario");
	});
	
	$("#marth1").click(function(){
		get(1, "marth");
	});
	
	$("#mewtwo1").click(function(){
		get(1, "mewtwo");
	});
	
	$("#gameandwatch1").click(function(){
		get(1, "gameandwatch");
	});
	
	$("#ness1").click(function(){
		get(1, "ness");
	});
	
	$("#peach1").click(function(){
		get(1, "peach");
	});
	
	$("#pichu1").click(function(){
		get(1, "pichu");
	});
	
	$("#pikachu1").click(function(){
		get(1, "pikachu");
	});
	
	$("#roy1").click(function(){
		get(1, "roy");
	});
	
	$("#samus1").click(function(){
		get(1, "samus");
	});
	
	$("#sheik1").click(function(){
		get(1, "sheik");
	});
	
	$("#yoshi1").click(function(){
		get(1, "yoshi");
	});
	
	$("#younglink1").click(function(){
		get(1, "younglink");
	});
	
	$("#zelda1").click(function(){
		get(1, "zelda");
	});
	
	//P1_D
	
	$("#bowser1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "bowser");
	});
	
	$("#captainfalcon1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "captainfalcon");
	});
	
	$("#donkeykong1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "donkeykong");
	});
	
	$("#drmario1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "drmario");
	});
	
	$("#falco1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "falco");
	});
	
	$("#fox1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "fox");
	});
	
	$("#ganondorf1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "ganondorf");
	});
	
	$("#iceclimbers1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "iceclimbers");
	});
	
	$("#jigglypuff1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "jigglypuff");
	});
	
	$("#kirby1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "kirby");
	});
	
	$("#link1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "link");
	});
	
	$("#luigi1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "luigi");
	});
	
	$("#mario1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "mario");
	});
	
	$("#marth1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "marth");
	});
	
	$("#mewtwo1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "mewtwo");
	});
	
	$("#gameandwatch1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "gameandwatch");
	});
	
	$("#ness1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "ness");
	});
	
	$("#peach1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "peach");
	});
	
	$("#pichu1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "pichu");
	});
	
	$("#pikachu1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "pikachu");
	});
	
	$("#roy1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "roy");
	});
	
	$("#samus1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "samus");
	});
	
	$("#sheik1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "sheik");
	});
	
	$("#yoshi1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "yoshi");
	});
	
	$("#younglink1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "younglink");
	});
	
	$("#zelda1").on('long-press', function(e) {
		e.preventDefault();
		doubles(1, "zelda");
	});
	
	//P2

	$("#bowser2").click(function(){
		get(2, "bowser");
	});
	
	$("#captainfalcon2").click(function(){
		get(2, "captainfalcon");
	});
	
	$("#donkeykong2").click(function(){
		get(2, "donkeykong");
	});
	
	$("#drmario2").click(function(){
		get(2, "drmario");
	});
	
	$("#falco2").click(function(){
		get(2, "falco");
	});
	
	$("#fox2").click(function(){
		get(2, "fox");
	});
	
	$("#ganondorf2").click(function(){
		get(2, "ganondorf");
	});
	
	$("#iceclimbers2").click(function(){
		get(2, "iceclimbers");
	});
	
	$("#jigglypuff2").click(function(){
		get(2, "jigglypuff");
	});
	
	$("#kirby2").click(function(){
		get(2, "kirby");
	});
	
	$("#link2").click(function(){
		get(2, "link");
	});
	
	$("#luigi2").click(function(){
		get(2, "luigi");
	});
	
	$("#mario2").click(function(){
		get(2, "mario");
	});
	
	$("#marth2").click(function(){
		get(2, "marth");
	});
	
	$("#mewtwo2").click(function(){
		get(2, "mewtwo");
	});
	
	$("#gameandwatch2").click(function(){
		get(2, "gameandwatch");
	});
	
	$("#ness2").click(function(){
		get(2, "ness");
	});
	
	$("#peach2").click(function(){
		get(2, "peach");
	});
	
	$("#pichu2").click(function(){
		get(2, "pichu");
	});
	
	$("#pikachu2").click(function(){
		get(2, "pikachu");
	});
	
	$("#roy2").click(function(){
		get(2, "roy");
	});
	
	$("#samus2").click(function(){
		get(2, "samus");
	});
	
	$("#sheik2").click(function(){
		get(2, "sheik");
	});
	
	$("#yoshi2").click(function(){
		get(2, "yoshi");
	});
	
	$("#younglink2").click(function(){
		get(2, "younglink");
	});
	
	$("#zelda2").click(function(){
		get(2, "zelda");
	});
	
	//P2_D
	
	$("#bowser2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "bowser");
	});
	
	$("#captainfalcon2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "captainfalcon");
	});
	
	$("#donkeykong2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "donkeykong");
	});
	
	$("#drmario2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "drmario");
	});
	
	$("#falco2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "falco");
	});
	
	$("#fox2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "fox");
	});
	
	$("#ganondorf2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "ganondorf");
	});
	
	$("#iceclimbers2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "iceclimbers");
	});
	
	$("#jigglypuff2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "jigglypuff");
	});
	
	$("#kirby2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "kirby");
	});
	
	$("#link2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "link");
	});
	
	$("#luigi2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "luigi");
	});
	
	$("#mario2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "mario");
	});
	
	$("#marth2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "marth");
	});
	
	$("#mewtwo2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "mewtwo");
	});
	
	$("#gameandwatch2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "gameandwatch");
	});
	
	$("#ness2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "ness");
	});
	
	$("#peach2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "peach");
	});
	
	$("#pichu2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "pichu");
	});
	
	$("#pikachu2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "pikachu");
	});
	
	$("#roy2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "roy");
	});
	
	$("#samus2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "samus");
	});
	
	$("#sheik2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "sheik");
	});
	
	$("#yoshi2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "yoshi");
	});
	
	$("#younglink2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "younglink");
	});
	
	$("#zelda2").on('long-press', function(e) {
		e.preventDefault();
		doubles(2, "zelda");
	});
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

//set char singles
function get(player, character) {
	$("#p" + player + "_character").attr("src",	"static/img/csp_icons/" + character + ".png")
	$("#p" + player + "_character").attr("character", character)
}

//set char doubles
function doubles(player, character) {
	if(is_doubles) {
		$("#p" + player + "d_character").attr("src", "static/img/csp_icons/" + character + ".png");
		$("#p" + player + "d_character").attr("character", character)
		$("#p" + player + "d_character").show();
	}
}

function reset_background(player) {
	$(".css" + player).css("background-color", "transparent");
}

function update() {
	player1tag = $("#p1_tag").val();
	player1dtag = $("#p1d_tag").val();
	player1char = $("#p1_character").attr("character");
	player1dchar = $("#p1d_character").attr("character");
	player1score = $("#p1_score").val();
	player2tag = $("#p2_tag").val();
	player2dtag = $("#p2d_tag").val();
	player2char = $("#p2_character").attr("character");
	player2dchar = $("#p2d_character").attr("character");
	player2score = $("#p2_score").val();
	round = $("#round").val();
	caster1 = $("#caster1").val();
	caster2 = $("#caster2").val();

	$.ajax({
		type: 'POST',
		url: "/update",
		data: {
				p1_tag: player1tag,
				p1d_tag: player1dtag,
				p1_char: player1char,
				p1d_char : player1dchar,
				p1_score: player1score,
				p2_tag: player2tag,
				p2d_tag: player2dtag,
				p2_char: player2char,
				p2d_char : player2dchar,
				p2_score: player2score,
				round: round,
				caster1: caster1,
				caster2: caster2,
				is_doubles: is_doubles,
				best_of: 5
			},
		success: function() {
			$("#update_status").css("color", "#CBFFC7");
			$("#update_status").text("Updated");
			$("#update_status").css("opacity", "1");
			setTimeout(function(){
				$("#update_status").css("opacity", "0");
			}, 2000);
		},
		error: function() {
			$("#update_status").css("color", "#F56262");
			$("#update_status").text("Error");
			$("#update_status").css("opacity", "1");
			setTimeout(function(){
				$("#update_status").css("opacity", "0");
			}, 2000);
		},
		timeout: 5000
	})
}

function swap_sides() {
	player1tag = $("#p1_tag").val();
	player1dtag = $("#p1d_tag").val();
	player1char = $("#p1_character").attr("src");
	player1dchar = $("#p1d_character").attr("src");
	player1score = $("#p1_score").val();
	player2tag = $("#p2_tag").val();
	player2dtag = $("#p2d_tag").val();
	player2char = $("#p2_character").attr("src");
	player2dchar = $("#p2d_character").attr("src");
	player2score = $("#p2_score").val();

	$("#p1_tag").val(player2tag);
	$("#p1d_tag").val(player2dtag);
	$("#p1_score").val(player2score);
	$("#p2_tag").val(player1tag);
	$("#p2d_tag").val(player1dtag);
	$("#p2_score").val(player1score);

	$("#p1_character").attr("src", player2char);
	$("#p1_stock").attr("src", player2char.replace("csp", "stock"));
	$("#p1d_character").attr("src", player2dchar);
	$("#p1d_stock").attr("src", player2dchar.replace("csp", "stock"));
	$("#p2_character").attr("src", player1char);
	$("#p2_stock").attr("src", player1char.replace("csp", "stock"));
	$("#p2d_character").attr("src", player1dchar);
	$("#p2d_stock").attr("src", player1dchar.replace("csp", "stock"));
}

function toggle_doubles() {
	if(is_doubles) {
		$(".toggle_doubles").text("Singles ");
		$(".toggle_doubles").append("<i class='fa fa-user'></i>");
		$("#p1d_chosen").hide();
		$("#p2d_chosen").hide();
		$(".doubles_red").hide();
		$(".doubles_green").hide();
		$(".doubles_blue").hide();
		$(".text_flex").css("margin-top", "0px");
		$(".text_flex").css("width", "403px");
		$(".tag").css("height", "");
		$("#p2_tag").attr("placeholder", "Player 2 Tag")

		$("#p1_load").text("Load info");
		$("#p1d_load").hide();
		$("#p2_load").text("Load info");
		$("#p2d_load").hide();
		$("#p1d_tag").hide();
		$("#p2d_tag").hide();

		is_doubles = false;
	}
	else {
		$(".toggle_doubles").text("Doubles ");
		$(".toggle_doubles").append("<i class='fa fa-user-friends'></i>");
		$("#p1d_chosen").show();
		$("#p2d_chosen").show();
		$(".doubles_red").show();
		$(".doubles_green").show();
		$(".doubles_blue").show();
		$(".text_flex").css("margin-top", "40px");
		$(".text_flex").css("width", "301px");
		$(".tag").css("height", "16px");
		$("#p2_tag").attr("placeholder", "Player 1 Tag")

		$("#p1_load").text("Load P1");
		$("#p1d_load").show();
		$("#p2_load").text("Load P1");
		$("#p2d_load").show();
		$("#p1d_tag").show();
		$("#p2d_tag").show();

		$("#doubles_info").text("Right-click for 2nd character");
		$("#doubles_info").css("opacity", "1");
		setTimeout(function(){
			$("#doubles_info").css("opacity", "0");
		}, 5000);

		is_doubles = true;
	}
}

function doubles_colour(player, colour_id) {
	colour = "";
	switch(colour_id) {
		case 1:
			colour = "red";
			break;
		case 2:
			colour = "green";
			break;
		case 3:
			colour = "blue";
			break;
	}

	char1 = $("#p" + player + "_character").attr("src").split("/")[3];
	char2 = $("#p" + player + "d_character").attr("src").split("/")[3];
	$("#p" + player + "_character").attr("src", "static/img/csp_icons/" + char1 + "/" + colour + ".png")
	$("#p" + player + "d_character").attr("src", "static/img/csp_icons/" + char2 + "/" + colour + ".png")
	$("#p" + player + "_stock").attr("src", "static/img/stock_icons/" + char1 + "/" + colour + ".png")
	$("#p" + player + "d_stock").attr("src", "static/img/stock_icons/" + char2 + "/" + colour + ".png")
}

function load(player, slot) {
	$("#p" + player + slot + "_tag").attr("value", $("#p" + player + "_select :selected").text());
	$("#p" + player + slot + "_tag").val($("#p" + player + "_select :selected").text());
	$("#p" + player + slot + "_character").attr("src", "static/img/csp_icons/" + $("#p" + player + "_select :selected").attr("value"));
	$("#p" + player + slot + "_stock").attr("src", "static/img/stock_icons/" + $("#p" + player + "_select :selected").attr("value"));
}

function update_scene() {
	newScene = $("#scenes :selected").text();
	obs.send(
		'SetCurrentScene', {'scene-name': newScene}
	)
	.then(function(value) {
		console.log("Changed scene to '" + newScene + "'");
	})
}