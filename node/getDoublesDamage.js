const { SlippiGame } = require("@slippi/slippi-js");

const game = new SlippiGame(process.argv[2]);

// Get game settings – stage, characters, etc
const frames = game.getFrames();

var stocks = [4,4,4,4];
var last_percent = [0,0,0,0];
var percent = [0,0,0,0];

var player_count = 0
var i = 0
for(const [key, frame] of Object.entries(frames)) {
    player_count = frame["players"].length
    i++;
    for(x = 0; x < frame["players"].length; x++) {
        if(typeof frame["players"][x] !== "undefined" && frame["players"][x]) {
            player = frame["players"][x]["post"];
            if(player["stocksRemaining"] < stocks[x] || i >= Object.keys(frames).length) {
                stocks[x]--;
                percent[x] += player["percent"]
            }
        }
    }
    last_percent[x] = player["percent"]
}
var output = [];
for(x = 0; x < player_count; x++) {
    output.push(percent[x])
}
console.log(output)