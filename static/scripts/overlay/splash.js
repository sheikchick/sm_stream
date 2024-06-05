const pollingSpeed = 1000; //in ms

const PLAYER = 'Player';

const PLAYERS = ['Player1', 'Player2', 'Player3', 'Player4'];

const update = () => new Promise((resolve) => {
	commonUpdate()
		.then((json) => {
			const players = Object.keys(json)
				.filter(k => k.startsWith(PLAYER));
		
			PLAYERS
				.forEach((key) => setPlayer(key, json[key]));
		
			if(json.is_doubles) {
				players
					.forEach((key) => setDoublesPlayer(key, json[key]));
			} else {
				players
					.forEach(setDoublesPlayer);
			}
		})
		.catch((e) => {
			console.error(e);
		})
		.finally(() => {
			setTimeout(() => resolve(update()), pollingSpeed);
		});
});

$(document).ready(function() {
	update();
	$('#ui').show();
});