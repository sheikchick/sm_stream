function getCurrentMatchData() {
    $.ajax({
		type: 'GET',
		url: "/match_data.json",
		data: {},
		success: function(response) {
			response.X["Y"]
		},
		error: function(response) {
			console.log(response)
		},
		timeout: 5000
	})
    setTimeout(load_changes, 1000)
}