const { SlippiGame } = require("@slippi/slippi-js");

const game = new SlippiGame(process.argv[2]);

// Get game settings – stage, characters, etc
const settings = game.getSettings();
console.log(JSON.stringify(settings));