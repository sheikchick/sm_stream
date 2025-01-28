function msToHHmmss(ms) {
	let seconds = parseInt(ms / 1000);

	const minutes = parseInt(seconds / 60);
	seconds = seconds % 60;

	const hours = parseInt(seconds / 3600);
	seconds = seconds % 3600;

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};

function HHmmssToMs(input) {
	let raw = input.split(".")

	let hhmmss = raw[0].split(":")

	let ms = parseInt(raw[1])

	ms += parseInt(hhmmss[0]) * 60 * 60 * 1000
	ms += parseInt(hhmmss[1]) * 60 * 1000
	ms += parseInt(hhmmss[2]) * 1000

	return ms;
};

function getDefaultIcon(character) {
	switch (character) {
		case "bowser":
		case "link":
		case "luigi":
		case "yoshi":
		case "younglink":
			return `${character}/green.png`
		case "iceclimbers":
		case "marth":
			return `${character}/blue.png`
		case "kirby":
		case "mario":
		case "ness":
		case "peach":
		case "samus":
			return `${character}/red.png`
		default:
			return `${character}/original.png`
	}
}

function getStageShort(stage) {
	switch (stage) {
		case "Yoshi's Story":
		case "Yoshis Story":
			return "YS"
		case "Fountain of Dreams":
			return "FoD"
		case "Pokemon Stadium":
		case "Pokémon Stadium":
			return "PS"
		case "Battlefield":
			return "BF"
		case "Final Destination":
			return "FD"
		case "Dream Land":
		case "Dream Land 64":
		case "Dream Land N64":
			return "DL"
		default:
			return "VS"
	}
}