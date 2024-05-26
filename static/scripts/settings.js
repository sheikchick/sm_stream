is_doubles = false;
var obs;
var sets = [];
var set_page = 0;

const phone_aspect = window.matchMedia("(max-aspect-ratio: 1/1), (max-width: 1000px)");

$(document).ready(function(){
	obs = new OBSWebSocket();
	url = window.location.href;
	var arr = url.split(":");
	var ip = arr[1].substr(2, this.length);
	obsurl = "ws://" + ip + ":" + obs_port;

	get_settings();
});

function get_settings() {
	$.ajax({
		type: 'GET',
		url: "/get_config",
		data: {},
		success: function(response) {
			load_changes(response)
			//do something
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
}

function load_changes(data) {
	for(section in data) {
		section_div = $("<div class='section'></div>").attr("id",section)
		section_div.append($("<span class='title section'><b>"+section+"</span>"))
		for(item in data[section]) {
			item_div = $("<div class='item'></div>").attr("id",item)
			item_div.append($("<span class='title item'>"+item+"</span>"))
			switch ((data[section][item])) {
				case true:
				case false:
					item_div.append($("<input type='checkbox' class='input checkbox'></input>").prop("checked", data[section][item]))
					break;
				default:
					item_div.append($("<input class='input'></input>").val(data[section][item]))
					break;
			}

			section_div.append(item_div)
		}
		$("#left_wrapper").append(section_div)
	}
	$("#left_wrapper").append("<button type='button' class='submit' onclick='submitChanges()'>Submit <i class='fa fa-arrow-up'></i></button>")
}

function submitChanges() {
	console.log($("#left_wrapper > div"))
	$("#left_wrapper > div").each((k,v) => {
		$(v).children().each((a,b) => {
			console.log($(b)[0])
		})
	})
}