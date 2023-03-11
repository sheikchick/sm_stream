const { SlippiGame } = require("@slippi/slippi-js");

const game = new SlippiGame(process.argv[2]);

var fn = process.argv[3];

if(fn in game && typeof game[fn] === "function") {
    var resp = game[fn]();
    console.log(JSON.stringify(resp));
} else {
    console.log("[]")
}
