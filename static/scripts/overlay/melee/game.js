const fadeInTime = .7; //(seconds)
const fadeOutTime = .35;

const fades = (() => {
	const charImageFade = 30;
	return {
		'p1': charImageFade,
		'p2': -charImageFade
	};
})();

const startupAll = async (scInfo) => {
	intro(scInfo).then(() => updateAll(scInfo, {}));
	return;
};

const intro = (() => {
	const backgrounds = ['purple', 'blue', 'green', 'red', 'yellow'];
	const params = new URLSearchParams(window.location.search);
	const background = backgrounds[Math.max(0, backgrounds.indexOf(params.get('background')))];

	const introFadeIn = 1;
	const introDuration = introFadeIn * 2000;
	const introFadeOut = introFadeIn / 2;

	const introAnimation = (scInfo, dubs) => new Promise((onComplete) => Promise.all([
		new Promise((onComplete) => gsap.to('#intro-content', {opacity: 1, delay: introDelay, duration: introFadeIn, ease: "power2.out", onComplete})),
		new Promise((onComplete) => gsap.from('.intro-border', {scaleX: (0), delay: introDelay, duration: introFadeIn, ease: "power2.out",  onComplete})),
		new Promise((onComplete) => gsap.fromTo('#p1-intro-container', 
			{x: '-2em'},
			{x: 0, textShadow: `0 0 0.5em ${portToRgb[scInfo[`p1${dubs}Port`]]}`, delay: introDelay, duration: introFadeIn, onComplete})),
		new Promise((onComplete) => gsap.fromTo('#p2-intro-container',
			{x: '2em'},
			{x: 0, textShadow: `0 0 0.5em ${portToRgb[scInfo[`p2${dubs}Port`]]}`, delay: introDelay, duration: introFadeIn, onComplete}))
	]).then(() => setTimeout(onComplete, introDuration)));

	const createPlayer = (scInfo, player, container) => {
		const p = document.createElement('span');
		p.textContent = scInfo[`${player}Name`];
		container.appendChild(p);
	};

	return async (scInfo) => {
		document.getElementById('background').src = `/static/img/overlay/melee/bg-${background}.webm`;
		if (params.get('intro') !== null) {
			const {round, tournamentName, date, p1Score, p2Score} = scInfo;
			
			document.getElementById('intro-round').textContent = round;
			document.getElementById('intro-tournament').textContent = tournamentName;

			const score = p1Score + p2Score;
			let dubs = '';
			if (score) {
				const vs = document.getElementById('intro-vs');
				vs.style.transform = 'scale(2)';
				const game = score + 1;
				vs.textContent = `Bo${game}` === scInfo.bestOf ? 'Final Game' : `Game ${game}`;
			} else {
				const p1Container = document.getElementById('p1-intro-container');
				const p2Container = document.getElementById('p2-intro-container');
				createPlayer(scInfo, 'p1', p1Container);
				createPlayer(scInfo, 'p2', p2Container);

				if (scInfo.isDoubles) {
					dubs = 'Dubs';
					createPlayer(scInfo, 'p1Dubs', p1Container);
					createPlayer(scInfo, 'p2Dubs', p2Container);
				}
			}
			
			await introAnimation(scInfo, dubs);
		}
		
		gsap.to('#intro', {opacity: 0, duration: introFadeOut, ease: "power1.in"})
			.then(() => document.getElementById('intro').style.transform = 'scale(0)');
		gsap.to('.link', {opacity: 1, duration: fadeInTime, delay: fadeOutTime, ease: "power2.out"});
	};
})();

const updateAll = async (scInfo, prev, updateDoublesPrev) => {
	const {round, tournamentName, date, isDoubles} = scInfo;
	
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

	let updateDoubles = updateDoublesPrev;

	if (isDoubles !== prev.isDoubles) {
		const {init, update} = doublesUpdaters[(scInfo.isDoubles | 0)];
		updateDoubles = (scInfo, prev) => {
			updateDoubles = update;
			return [...init(scInfo, prev), ...update(scInfo, prev)];
		};

	}

	Promise.all([
		...updateDoubles(scInfo, prev),
		...updateSinglesPlayer('p1', scInfo, prev),
		...updateSinglesPlayer('p2', scInfo, prev)
	].map(update => update()))
		.then(callbacks => {
			callbacks.forEach(callback => callback());
			setTimeout(() => getInfo()
				.then((info) => updateAll(info, scInfo, updateDoubles)), 1000);
		});
};

function updateSinglesPlayer(player, scInfo, prev) {
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

	const fade = fades[player];

	if (wl !== prev[wlKey] || firstTo !== prev.firstTo) {
		const scoresId = `${player}Scores`;
		updates.push(() => fadeOutChildren(scoresId, fade).then(() => {
			refreshScoreElements(player, firstTo, wl);
			setScore(player, score, port);
			return () => fadeInChildren(scoresId, fade);
		}));
	} else if (score !== prev[scoreKey] || port !== prev[portKey]) {
		updates.push(() => Promise.resolve(() => updateScore(player, score, port)));
	}

	return [...updates, ...updatePlayer(player, scInfo, prev, fade)];
}

const doublesUpdaters = (() => {
	const nothing = () => {};
	const alwaysInit = [
		() => Promise.resolve(() => fadeIn('#p1Overlay')),
		() => Promise.resolve(() => fadeIn('#p2Overlay'))
	];

	const updateDoublesPlayer = (player, scInfo, prev) => {
		const dubsPlayer = `${player}Dubs`;
		scInfo[`${player}Port`] = scInfo[`${dubsPlayer}Port`];
		return updatePlayer(dubsPlayer, scInfo, prev, fades[player]);
	};

	return [
		{
			init: () => [
				...alwaysInit,
				() => fadeOut('#p1DubsOverlay').then(() => nothing),
				() => fadeOut('#p2DubsOverlay').then(() => nothing)
			],
			update: () => []
		},
		{
			init: () => [
				...alwaysInit,
				() => Promise.resolve(() => fadeIn('#p1DubsOverlay')),
				() => Promise.resolve(() => fadeIn('#p2DubsOverlay'))
			],
			update: (scInfo, prev) => [
				...updateDoublesPlayer('p1', scInfo, prev),
				...updateDoublesPlayer('p2', scInfo, prev)
			]
		}
	];
})();

function updatePlayer(player, scInfo, prev, fade) {
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

	if (character !== prev[characterKey] || skin !== prev[skinKey]) {
		const portraitId = `${characterKey}Portrait`;
		updates.push(() => fadeOutChildren(portraitId, fade).then(() => 
			updateCharImage(`${characterKey}Img`, `${player}Saga`, character, skin)
				.then(() => () => fadeInChildren(portraitId, fade))));
	}

	if (port !== prev[portKey]) {
		updates.push(() => Promise.resolve(() => updatePort(`#${player}Port`, port)));
	}

	return updates;
};

const updatePort = (portId, port) => new Promise((onComplete) =>
	gsap.to(portId, {backgroundColor: portToRgb[port], duration: fadeInTime, onComplete}));

async function updateCharImage(charId, sagaId, pCharacter, pSkin) {
	const charEl = document.getElementById(charId);
	const sagaEl = document.getElementById(sagaId);

	return Promise.all([
		new Promise((resolve) => {
			charEl.onload = resolve;
			const params = new URLSearchParams();
			params.append('character', pCharacter);
			params.append('colour', pSkin);
			charEl.setAttribute('src', `/csp?${params.toString()}`);
		}),
		new Promise((resolve) => {
			sagaEl.onload = resolve;
			sagaEl.setAttribute('src', `/saga?character=${pCharacter}`);
		})
	]);
};