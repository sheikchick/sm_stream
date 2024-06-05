const pollingSpeed = 1000;

const update = () => new Promise((resolve) => {
	commonUpdate()
		.then((json) => {
			const players = [1,2];
		
			players
				.forEach((key) => setPlayer(`player${key}`, json[`team${key}`], 0, json.bestOf));
			if(json.isDoubles) {
				players
					.forEach((key) => setPlayer(`player${key}d`, json[`team${key}`], 1, json.bestOf));
			}

			specificUpdate(json);
		})
		.catch((e) => {
			e && console.error(e);
		})
		.finally(() => {
			setTimeout(() => resolve(update()), pollingSpeed);
		});
});

$(document).ready(function() {
	update();
	$('#ui').show();
});
