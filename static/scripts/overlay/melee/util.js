const introDelay = .4;
window.onload = () => {
	getInfo().then(startupAll);
};

const RANDOM = 'random';
const CPU = 'CPU';

const initialPort = 'rgb(32, 32, 32)';
const portToRgb = [
	'rgb(128, 128, 128)',
	'rgb(229, 76, 76)',
	'rgb(75, 76, 229)',
	'rgb(255, 203, 0)',
	'rgb(0, 178, 0)'
];

const portToColour = [
	"original",
	"red",
	"blue",
	"yellow",
	"green"
];

const fadeOut = (itemID, x = 0) => new Promise((onComplete) => 
	gsap.to(itemID, {x, opacity: 0, duration: fadeOutTime, ease: "power1.in", onComplete}));

function fadeIn(itemID, duration = fadeInTime) {
	gsap.to(itemID, {x: 0, opacity: 1, duration, ease: "power2.out"});
}

const fadeOutChildren = (id, move) => Promise.all([
	...document.getElementById(id).children
].map(({id}) => fadeOut(`#${id}`, move)));

function fadeInChildren(id, x = 0) {
	const scoreEls = [...document.getElementById(id).children];

	const subFromDuration = fadeInTime * 0.5;
	const duration = fadeInTime - subFromDuration; 
	const durationInc = subFromDuration / (scoreEls.length - 1)

	scoreEls.reduce((delay, el) => {
		gsap.fromTo(el, 
			{x, opacity: 0},
			{delay, x: 0, opacity: 1, ease: "power2.out", duration});
		return delay + durationInc;
	}, 0);
}

const refreshScoreElements = (player, firstTo = 2, wl) => {
	parentEl = document.getElementById(`${player}Scores`);
	[...parentEl.children].forEach(el => el.remove());
	const _winBackgroundPoints = winBackgroundPoints[player];
	const _winForegroundPoints = winForegroundPoints[player];
	const scoreEls = Array.from(
		{length: firstTo},
		(_, i) => createScoreEl(_winBackgroundPoints, () => createWinForeground(`${player}Win${i+1}`, _winForegroundPoints))
	).reverse();

	if (wl) {
		scoreEls.push(createScoreEl(_winBackgroundPoints, () => createWlForeground(wl)));
	}

	scoreEls.forEach(el => parentEl.appendChild(el));
};

const createScoreEl = (backgroundPoints, createForeground) => {
	const div = document.createElement('div');
	div.className = 'score-tick';

	const svg = createSvgElement('svg');
	svg.setAttributeNS(null, 'class', 'score-tick-svg');
	svg.setAttributeNS(null, "viewBox", '0 0 64 48');

	const background = createSvgElement('polygon');
	background.setAttributeNS(null, 'class', 'score-tick-background');
	background.setAttributeNS(null, 'points', backgroundPoints);

	svg.appendChild(background);
	svg.appendChild(createForeground());
	div.appendChild(svg);
	return div;
};

const createSvgElement = tag => document.createElementNS('http://www.w3.org/2000/svg', tag);

const createWinForeground = (id, points) => {
	const foreground = createSvgElement('polygon');
	foreground.id = id
	foreground.setAttributeNS(null, 'class', 'score-tick-foreground');
	foreground.setAttributeNS(null, 'points', points);
	return foreground;
};

const createWlForeground = (wl) => {
	const text = createSvgElement('text');
	text.textContent = wl;
	text.setAttributeNS(null, 'class', 'score-tick-foreground-wl');
	text.setAttributeNS(null, 'x', '50%');
	text.setAttributeNS(null, 'text-anchor', 'middle');
	text.setAttributeNS(null, 'y', '50%');
	text.setAttributeNS(null, 'dominant-baseline', 'central');
	return text;
}

const [winBackgroundPoints, winForegroundPoints] = (() => {
	const winBackgroundXCoords = [16, 64, 48, 0];
	const winBackgroundYCoords = [0, 0, 48, 48];
	const winForegroundXCoords = [20, 56, 44, 8];
	const winForegroundYCoords = [6, 6, 42, 42];

	const P1 = 'p1';
	const P2 = 'p2';

	const coordsReduce = (xCoords, yCoords) => xCoords.reduce((acc, cur, i) => `${acc}${cur},${yCoords[i]} `, '').slice(0, -1);

	return [
		{
			[P1]: coordsReduce(winBackgroundXCoords, winBackgroundYCoords),
			[P2]: coordsReduce(winBackgroundXCoords.reverse(), winBackgroundYCoords)
		},
		{
			[P1]: coordsReduce(winForegroundXCoords, winForegroundYCoords),
			[P2]: coordsReduce(winForegroundXCoords.reverse(), winForegroundYCoords)
		}
	];
})();

function setScore(player, score, port, setWin = _setWin) {
	const idPrefix = `${player}Win`;
	document.querySelectorAll(`[id^="${idPrefix}"]`).forEach((el) => {
		const newPort = score >= el.id.replace(idPrefix, '') ? portToRgb[port] : initialPort;
		window.getComputedStyle(el).fill !== newPort && setWin(el, newPort);
	});
}

const updateScore = (player, score, port) => setScore(player, score, port, updateWin);

function _setWin(scoreEl, port) {
	scoreEl.style.fill = port;
}

function updateWin(scoreEl, port) {
	gsap.to(scoreEl, {fill: "#ffffff", duration: fadeInTime});
	gsap.to(scoreEl, {delay: fadeInTime, fill: port, duration: fadeInTime});
}

//check if in winners/losers in a GF, then change image
function updateWL(player, wl) {
	const wEl = document.getElementById(`${player}W`);
	const lEl = document.getElementById(`${player}L`);
	let wELDisplay = 'none';
	let lELDisplay = 'none';
	if (wl === 'W') {
		wELDisplay = 'block';
	} else if (wl === 'L') {
		lELDisplay = 'block';
	}
	wEl.style.display = wELDisplay;
	lEl.style.display = lELDisplay;
}

function updateText(textId, text) {
	document.getElementById(textId).textContent = text;
}

const getInfo = (() => {
	const RANDOM = 'random';
	const DEFAULT = "original";
	const CPU = 'CPU';
	const p1 = "p1";
	const p2 = "p2";
	const L_NAME = '(L)';
    const W_NAME = '(W)';
    const L = 'L';
    const W = 'W';
    const removeWLFromName = (name) => name.replace(L_NAME, '').trim();

	const getPlayer = (player, {name, name_dubs, character, colour, character_dubs, colour_dubs, score, port}) => ({
        [`${player}Name`]: removeWLFromName(name),
        [`${player}DubsName`]: removeWLFromName(name_dubs),
        [`${player}WL`]: name.includes(L_NAME) ? L : name.includes(W_NAME) ? W : '',
		[`${player}Character`]: character || RANDOM,
		[`${player}Skin`]: colour || DEFAULT,
		[`${player}DubsCharacter`]: character_dubs || RANDOM,
		[`${player}DubsSkin`]: colour_dubs || DEFAULT,
		[`${player}DubsPort`]: Math.max(0, portToColour.indexOf(colour_dubs)) || Number(port) || 0,
		[`${player}Score`]: Number(score) || 0,
		[`${player}Port`]: Number(port) || 0
    });

	const defaultInfo = {
		p1Character: RANDOM,
		p2Character: RANDOM,
		p1DubsCharacter: RANDOM,
		p2DubsCharacter: RANDOM
	};

	const fixWl = (() => {
		const nada = 'Nada';
		const blank = '';
		return ({p1WL = '', p2WL = ''}) => ({p1WL: p1WL.replace(nada, blank), p2WL: p2WL.replace(nada, blank)});
	})();

	const getFirstTo = ({bestOf = 'Bo5'}) => ({bestOf, firstTo: Math.ceil(Number(bestOf.replace('Bo', '')) / 2)});

	const getDate = (jsonDate) => {
		const date = new Date();
		return jsonDate || `${date.getFullYear()}-${String(1 + date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	/**
	 * Gets data from Melee Stream Tool's json file.
	 * Use for automated set recording.
	 */
	const mst = () => new Promise((resolve) => {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", () => {
			const info = JSON.parse(oReq.responseText);
			resolve({...defaultInfo, ...info, ...fixWl(info), ...getFirstTo(info)});
		});
		oReq.open("GET", 'Resources/Texts/ScoreboardInfo.json');
		oReq.send();
	})

	/**
	 * Gets data from the Scottish Melee stream server, convert response into format used
	 * by these overlays.
	 * Use when live recording.
	 * ToDo: Make it usable for automated set recording
	 */
	const smst = async () => {
		const {
			Player1,
			Player2,
			tournament: tournamentName,
			round,
			date,
			is_doubles,
			best_of
		} = await fetch('/info.json').then((response) => response.json());

		const info = {
			...getPlayer(p1, Player1),
			...getPlayer(p2, Player2),
			tournamentName,
			round,
			date: getDate(date),
			isDoubles: is_doubles,
			bestOf: `Bo${best_of || 5}`
		};

		console.log({
			...defaultInfo,
			...info,
			...fixWl(info),
			...getFirstTo(info)
		})
		return {
			...defaultInfo,
			...info,
			...fixWl(info),
			...getFirstTo(info)
		};
	};

	return smst
	// return mst;
})();

function showNothing(itemEL) {
	itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
}