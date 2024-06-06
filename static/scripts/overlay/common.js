var OVERLAY, scoresGraphical, specificUpdate;
specificUpdate = () => {};

const commonUpdate = (() => {
	const url = '/info.json';
	const roundId = '#round';

	return () => new Promise((resolve, reject) => {
		fetch(url/*, {cache, headers: {[if_modified_since]: modified_after}}*/)
			.then((response) => {
				resolve(response.json().then((json) => {
					getDate(json.date);
					swapText(roundId, json.round);
					return json;
				}))
			});
	});
})();

function swapText(element, new_text) {
	if($(element).text() !== new_text) {
		$(element).text(new_text);
	}
}

function swapSrc(element, new_src) {
	if($(element).attr('src') !== new_src) {
		$(element).attr('src', new_src);
	}
}

const fitPlayerTags = (useTooTall = false) => {
	const nameTooBig = (el) => el.clientWidth > el.parentElement.clientWidth;
	const nameTooTall = (el) => el.clientHeight/1.3 > parseInt($(el.parentElement).css('font-size'));
	$('.player-name').each(function(i, obj) {
		var size = parseInt($(obj.parentElement).css('font-size'))
		$(obj).css('font-size', size)
		while((nameTooBig(obj) || (useTooTall && nameTooTall(obj))) && size > 0) {
			console.log(nameTooBig(obj))
			size = size - 1;
			console.log(size)
			$(obj).css('font-size', size)
		}
	})
};

function getDate(jsonDate) {
	const date = new Date();
	$('#date').text(jsonDate || `${date.getFullYear()}-${String(1 + date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
}

const setStockIcon = (key, character, colour, overlay) => {
	const el = $(`#${key}-character`);
	el.attr('src', `/stock?character=${character}&colour=${colour}${overlay ? `&overlay=${overlay}` : ''}`);
	el.attr('character', character);
}


const setPlayer = (key = '', team = {}, index, bestOf) => {
	const {name, l} = getName(team.players[index].name);
	const id = key.toLowerCase();
	console.log(team.players[0])
	_setPlayer(id, {...team.players[0], name});
	(scoresGraphical || scoresNumerical)(id, team.score, Math.max(parseInt(bestOf)/2), l);
};

const _setPlayer = (key, {
	name,
	pronouns,
	character,
	colour
}) => {
	swapText(`#${key}-name`, name);
	if (name) {
		swapText(`#${key}-pronouns`, pronouns);
		setStockIcon(key, character, colour, OVERLAY || '');
		$(`.${key}`).removeClass('hidden');
	} else {
		swapText(`#${key}-pronouns`, '');
		setStockIcon(key, '', '', OVERLAY);
		$(`.${key}`).addClass('hidden');
	}
};

const getName = (() => {
	const lRegex = /\s*\(L\)$/;
	return (name = '') => ({name: name.replace(lRegex, ''), l: lRegex.test(name)});
})();

const getDoublesPlayers = () => [...document.getElementsByClassName('player-doubles')];

const scoresNumerical = (player, score, firstTo, l) => {
	$(`#${player}-score`).text(score);
	$(`#${player}-l`).text("L");
	$(`#${player}-l`).attr('class', l ? 'l' : 'hidden');
};