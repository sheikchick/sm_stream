const { SlippiGame } = require("@slippi/slippi-js");
const { exit } = require("process");

const game = new SlippiGame(process.argv[2]);

// Get frames of the game
const frames = game.getFrames();
len = Object.keys(frames).length
for (i = 0; i<len; i++) {
    frame = frames[len-i];
    //find last frame
    if (frame !== undefined) {
        console.log(JSON.stringify(frame));
        process.exit();
    }
}