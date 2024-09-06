const getCharacterInfo = (id) => new Promise((resolve, reject) => {
    $.ajax({
		type: 'POST',
		url: "/player_character",
		data: {
            "id": id
        },
		success: function (response) {
			console.log(response)
			console.log("resolving!")
            resolve(response)
		},
		error: function (response) {
			console.log("Error getting character data for " + id)
			reject(null)
		},
		timeout: 5000
	})
});