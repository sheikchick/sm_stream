const fadeInTime = 1; //(seconds)
const fadeOutTime = .4;

const reset = (charImagePosMods) => {
	const entries = Object.entries(charImagePosMods);
	const playerChars = entries.map(([player, {fade}]) => 
		fadeOut(`#${player}CharacterPortrait`, fade));
	const scores = entries
		.filter(([player]) => !player.includes('Dubs'))
		.map(([player, {fade}]) => fadeOutChildren(`${player}Scores`, fade));
	return Promise.all([fadeOut('span.name,span.port'), ...playerChars, ...scores]);
};

const startupAll = async (scInfo) => {
	let addOrRemove = 'remove';
	let charImagePosMods = coordsByPlayerSingles;
	let getPortLabel = getSlotLabel;
	let updateDoubles = () => [];

	const {round, tournamentName, date, isDoubles} = scInfo;

	if (isDoubles) {
		addOrRemove = 'add';
		charImagePosMods = coordsByPlayerDubs;
		getPortLabel = getTeamLabel;
		updateDoubles = updateAllDoubles;
	}

	updateText('round', round);
	updateText('tournament', tournamentName);
	updateText('date', date);
	

	document.querySelectorAll('span.name')
		.forEach(el => el.classList[addOrRemove]('dubs'));

	fadeIn('.set-info');
		
	updateAll(scInfo, {round, tournamentName, date, isDoubles}, {charImagePosMods, getPortLabel, updateDoubles});
	return;
};

const updateAll = async (scInfo, prev, singlesOrDoublesStuff) => {
	if (scInfo.isDoubles !== prev.isDoubles) {
		reset(singlesOrDoublesStuff.charImagePosMods).then(() => startupAll(scInfo));
		return;
	}
	const {charImagePosMods, getPortLabel, updateDoubles} = singlesOrDoublesStuff;

	const {round, tournamentName, date} = scInfo;
	
	if (round !== prev.round) {
		const roundId = 'round';
		const roundIdHash = `#${roundId}`;
		fadeOut(roundIdHash).then(() => {
			updateText(roundId, round);
			fadeIn(roundIdHash);
		});
	}

	if (tournamentName !== prev.tournamentName) {
		const tournamentId = 'tournament';
		const tournamentIdHash = `#${tournamentId}`;
		fadeOut(tournamentIdHash).then(() => {
			updateText(tournamentId, tournamentName);
			fadeIn(tournamentIdHash);
		});
	}

	if (date !== prev.date) {
		const dateId = 'date';
		const dateIdHash = `#${dateId}`;
		fadeOut(dateIdHash).then(() => {
			updateText(dateId, date);
			fadeIn(dateIdHash);
		});
	}

	Promise.all([
		...updateDoubles(scInfo, prev),
		...updateSinglesPlayer('p1', scInfo, prev, charImagePosMods, getPortLabel),
		...updateSinglesPlayer('p2', scInfo, prev, charImagePosMods, getPortLabel)
	].map(update => update()))
		.then(callbacks => {
			callbacks.forEach(callback => callback());
			setTimeout(() => getInfo()
				.then((info) => updateAll(info, scInfo, singlesOrDoublesStuff)), 1000);
		});
};

function updateSinglesPlayer(player, scInfo, prev, charImagePosMods, getPortLabel) {
	const updates = [];
	const portKey = `${player}Port`;
	const scoreKey = `${player}Score`;
	const wlKey = `${player}WL`;
	const {
		[portKey]: port,
		[scoreKey]: score,
		[wlKey]: wl,
		firstTo
	} = scInfo;

	const playerCharImagePosMods = charImagePosMods[player];

	if (port !== prev[portKey]) {
		const portId = `${player}Port`;
		const portIdHash = `#${portId}`;
		updates.push(() => fadeOut(portIdHash).then(() => {
			updatePort(portId, port, getPortLabel);
			return () => fadeIn(portIdHash);
		}));
	}

	if (wl !== prev[wlKey] || firstTo !== prev.firstTo) {
		const scoresId = `${player}Scores`;
		updates.push(() => fadeOutChildren(scoresId, playerCharImagePosMods.fade).then(() => {
			refreshScoreElements(player, firstTo, wl);
			setScore(player, score, port);
			return () => fadeInChildren(scoresId, playerCharImagePosMods.fade);
		}));
	} else if (score !== prev[scoreKey] || port !== prev[portKey]) {
		updates.push(() => Promise.resolve(() => updateScore(player, score, port)));
	}

	return [...updates, ...updatePlayer(player, scInfo, prev, playerCharImagePosMods)];
}

const updateAllDoubles = (scInfo, prev) => [
	...updateDoublesPlayer('p1', scInfo, prev),
	...updateDoublesPlayer('p2', scInfo, prev)
];

function updateDoublesPlayer(player, scInfo, prev) {
	const dubsPlayer = `${player}Dubs`;
	scInfo[`${player}Port`] = scInfo[`${dubsPlayer}Port`];
	return updatePlayer(dubsPlayer, scInfo, prev, coordsByPlayerDubs[dubsPlayer]);
};

function updatePlayer(player, scInfo, prev, playerCharImagePosMods) {
	const updates = [];
	const nameKey = `${player}Name`;
	const characterKey = `${player}Character`;
	const skinKey = `${player}Skin`;
	const portKey = `${player}Port`;
	const {
		[nameKey]: name,
		[characterKey]: character,
		[skinKey]: skin,
		[portKey]: port
	} = scInfo;

	if (name !== prev[nameKey]) {
		const nameId = `#${nameKey}`;
		updates.push(() => fadeOut(nameId).then(() => {
			updateText(nameKey, name);
			return () => fadeIn(nameId);
		}));
	}

	if (character !== prev[characterKey] || skin !== prev[skinKey] || port !== prev[portKey]) {
		const portraitId = `#${characterKey}Portrait`;
		updates.push(() => fadeOut(portraitId, playerCharImagePosMods.fade).then(() => 
			updateCharImage(`${characterKey}Img`, player, character, skin, port, playerCharImagePosMods)
				.then(() => () => fadeIn(portraitId))));

		const charText = getCharText(character, skin);
		const {[characterKey]: prevCharacter, [skinKey]: prevSkin} = prev;
		if (charText !== getCharText(prevCharacter, prevSkin)) {
			const charTextId = `${characterKey}Name`;
			const charTextIdHash = `#${charTextId}`;
			updates.push(() => fadeOut(charTextIdHash).then(() => {
				updateText(charTextId, charText);
				return () => fadeIn(charTextIdHash);
			}));
		}
	}

	return updates;
};

const getSlotLabel = port => portLabels[port];
const getTeamLabel = port => `${port} Team`.replace(' Team', '');
const getCharText = (() => {

	const characters = {
		"captainfalcon": "Captain Falcon",
		"donkeykong": "Donkey Kong",
		"gameandwatch": "Mr Game & Watch",
		"iceclimbers": "Ice Climbers",
		"younglink": "Young Link",
		"drmario": "Dr Mario",
	};
	
	return (character) => characters[character] || (character || '').replace(RANDOM, '');
})();

const portLabels = [
	'',
	'p1',
	'p2',
	'p3',
	'p4'
];

function updatePort(pSlotID, port, getPortLabel = getPortLabel) {
	const portEl = document.getElementById(pSlotID);
	portEl.style.color = portToRgb[port];
	portEl.textContent = getPortLabel(port);
};

async function updateCharImage(charID, player, pCharacter, pSkin, port, coordsByPlayer) {
	const pSide = player.replace('Dubs', '');
	const {x, y, scale} = coordsByPlayer;
	
	const {
		x: charX,
		y: charY,
		scale: charScale
	} = coordsByChar[pCharacter][pSide];

	const charEl = document.getElementById(charID);
	
	charEl.style.left = `${x + charX}px`;
	charEl.style.top = `${y + charY}px`;
	charEl.style.transform = `scale(${scale * charScale})`;

	return new Promise((resolve) => {
		charEl.onload = resolve;
		const params = new URLSearchParams();
		params.append('side', pSide);
		params.append('character', pCharacter);
		params.append('colour', pSkin);
		charEl.setAttribute('src', `/vs/?${params.toString()}`);
	});
};

const [coordsByPlayerSingles, coordsByPlayerDubs, coordsByChar] = (() => {
	const charImageFade = 200;
	const charImagePosModX = 225;
	const charImagePosModY = 70;
	const charImagePosModScaleBig = 1;
	const charImagePosModScaleSmall = 0.7;
	const _randomPos = {y: 425, scale: 3};
	
	return [
		{
			'p1': {fade: -charImageFade, x: 0, y: 0, scale: 1},
			'p2': {fade: charImageFade, x: 0, y: 0, scale: 1},
		},
		{
			'p1': {fade: -charImageFade, x: -charImagePosModX, y: charImagePosModY, scale: charImagePosModScaleBig},
			'p1Dubs': {fade: -charImageFade, x: charImagePosModX, y: -charImagePosModY, scale: charImagePosModScaleSmall},
			'p2': {fade: charImageFade, x: -charImagePosModX, y: -charImagePosModY, scale: charImagePosModScaleSmall},
			'p2Dubs': {fade: charImageFade, x: charImagePosModX, y: charImagePosModY, scale: charImagePosModScaleBig}
		},
		{
			random: {
				p1: {x: 400, ..._randomPos},
				p2: {x: 1400, ..._randomPos},
			},
			"mario": {
				"p1":{"x":-75,"y":160,"scale":1.4},
				"p2":{"x":650,"y":0,"scale":1.3}
			},
			"fox": {
				"p1":{"x":0,"y":160,"scale":1.4},
				"p2":{"x":600,"y":0,"scale":1.4}
			},
			"captainfalcon": {
				"p1":{"x":-50,"y":160,"scale":1.4},
				"p2":{"x":900,"y":0,"scale":1.4}
			},
			"donkeykong": {
				"p1":{"x":-50,"y":150,"scale":1.4},
				"p2":{"x":650,"y":0,"scale":1.1}
			},
			"kirby": {
				"p1":{"x":-75,"y":160,"scale":1.4},
				"p2":{"x":700,"y":15,"scale":1.05}
			},
			"bowser": {
				"p1":{"x":-50,"y":160,"scale":1.4},
				"p2":{"x":625,"y":0,"scale":1.1}
			},
			"link": {
				"p1":{"x":0,"y":160,"scale":1.4},
				"p2":{"x":700,"y":0,"scale":1.3}
			},
			"sheik": {
				"p1":{"x":75,"y":275,"scale":1.6},
				"p2":{"x":750,"y":125,"scale":1.3}
			},
			"ness": {
				"p1":{"x":-75,"y":165,"scale":1.4},
				"p2":{"x":625,"y":10,"scale":1}
			},
			"peach": {
				"p1":{"x":200,"y":350,"scale":1.2},
				"p2":{"x":425,"y":275,"scale":1.2}
			},
			"iceclimbers": {
				"p1":{"x":-70,"y":170,"scale":1.4},
				"p2":{"x":650,"y":0,"scale":1.2}
			},
			"pikachu": {
				"p1":{"x":-50,"y":160,"scale":1.4},
				"p2":{"x":625,"y":0,"scale":1.1}
			},
			"samus": {
				"p1":{"x":-100,"y":160,"scale":1.4},
				"p2":{"x":650,"y":0,"scale":1.4}
			},
			"yoshi": {
				"p1":{"x":-50,"y":160,"scale":1.4},
				"p2":{"x":600,"y":0,"scale":1}
			},
			"jigglypuff": {
				"p1":{"x":-75,"y":160,"scale":1.4},
				"p2":{"x":525,"y":0,"scale":0.8}
			},
			"mewtwo": {
				"p1":{"x":125,"y":400,"scale":1.5},
				"p2":{"x":625,"y":275,"scale":1.15}
			},
			"luigi": {
				"p1":{"x":-25,"y":160,"scale":1.4},
				"p2":{"x":700,"y":0,"scale":1.1}
			},
			"marth": {
				"p1":{"x":-50,"y":180,"scale":1.5},
				"p2":{"x":700,"y":0,"scale":1.1}
			},
			"zelda": {
				"p1":{"x":50,"y":430,"scale":1.6},
				"p2":{"x":620,"y":270,"scale":1.4}
			},
			"younglink": {
				"p1":{"x":-100,"y":160,"scale":1.4},
				"p2":{"x":575,"y":0,"scale":1.1}
			},
			"drmario": {
				"p1":{"x":-25,"y":160,"scale":1.4},
				"p2":{"x":600,"y":0,"scale":1.3}
			},
			"falco": {
				"p1":{"x":-50,"y":150,"scale":1.4},
				"p2":{"x":625,"y":10,"scale":1.1}
			},
			"pichu": {
				"p1":{"x":-100,"y":160,"scale":1.4},
				"p2":{"x":575,"y":0,"scale":1}
			},
			"gameandwatch": {
				"p1":{"x":-75,"y":160,"scale":1.4},
				"p2":{"x":600,"y":-25,"scale":1.2}
			},
			"ganondorf": {
				"p1":{"x":50,"y":300,"scale":1.7},
				"p2":{"x":800,"y":275,"scale":1.4}
			},
			"roy": {
				"p1":{"x":-75,"y":160,"scale":1.4},
				"p2":{"x":600,"y":50,"scale":1.4}
			}
		}
	];
})();