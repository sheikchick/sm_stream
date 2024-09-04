$(document).ready(function(){
	getSettings();
});

function getSettings() {
	$.ajax({
		type: 'GET',
		url: "/config",
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

function load_changes(settings) {
	for(section in settings) {
		sectionDiv = new sectionElement(section, settings[section], 1)
		$("#left_wrapper").append(sectionDiv)
	}
	$("#left_wrapper").append("<button type='button' class='submit' onclick='submitChanges()'>Submit <i class='fa fa-arrow-up'></i></button>")
}

function sectionElement(name, obj, depth) {
	let sectionDiv = $(`<div class='section d${depth}'></div>`).attr("id", name)
	sectionDiv.append($(`<span class='title section d${depth}'><b>${name}</span>`))
	for(item in obj) {
		if(obj[item].constructor == Object) {
			const x = new sectionElement(item, obj[item], depth+1);
			sectionDiv.append(x)
		} else {
			let itemDiv = $("<div class='item'></div>").attr("id", item)
			itemDiv.append($("<span class='title item'>"+item+"</span>"))
			switch ((obj[item])) {
				case "true":
					item = $("<input type='checkbox' class='input checkbox'></input>").prop("checked", obj[item])
					itemDiv.append(item)
					break;
				case "false":
					item = $("<input type='checkbox' class='input checkbox'></input>")
					itemDiv.append(item)
					break;
				default:
					itemDiv.append($("<input type='text' class='input'></input>").val(obj[item]))
					break;
			}
			sectionDiv.append(itemDiv)
		}
	}
	return sectionDiv
}

function isObject(el) {
    return Object.prototype.toString.call(el) === '[object Object]';
}

function submitChanges(element) {
	let data = getSettingsObject("#left_wrapper")
	console.log(data)
	$.ajax({
		type: 'POST',
		url: "/write_config",
		data: data,
		success: function(response) {
			console.log(response)
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
}

const containsDiv = (element) => {
	for(let x of element) {
		if($(x).is("div")) {
			return true
		}
	}
	return false;
}

function getSettingsObject(element) {
	let json = {}
	if (!containsDiv($(element).children())) {
		let el = $(element).children()[1]
		switch($(el).attr('type')) {
			case 'checkbox':
				return el.checked;
			default:
				return $(el).val();
		}
		
	}
	$(element).children("div").each((k,v) => {
		json[$(v).attr("id")] = getSettingsObject(v)
	})
	return json;
}