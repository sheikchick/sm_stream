//and here we go...
const express = require("express");
const path = require("path");
const toml = require("toml");
const fs = require("fs");
const OBSWebSocket = require('obs-websocket-js').default;
const { SlippiGame } = require("@slippi/slippi-js");
const slpTools = require("./slp_tools.js");
const logging = require("./logging.js");

const obs = new OBSWebSocket();
const app = express()

var config;
try {
    config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
} catch (e) {
    logging.error("Error parsing config.toml, exiting.");
    process.exit(0);
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use("/static", express.static("static"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

if(config.obs.host != 0 && config.obs.port != 0) {
    obs.connect(`ws://${config.obs.host}/${config.obs.port}`, config.obs.password).then(() => {
        logging.log("OBS web-socket connected");
    }, () => {
        logging.error("Failed to connect to OBS, proceeding without.");
    });
} else {
    logging.log("No OBS connection information provided, proceeding without.");
}


/*Update Endpoints*/

app.post("/update", (req, res) => {
    fs.writeFile("data/json/info.json", JSON.stringify(req.body), "utf8", (err) => {
        if (err) {
            logging.error(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
})

//TODO: add gregor endpoints and refactor tablet endpoints

/*Views*/

app.get("/", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        res.render("auto", JSON.parse(file));
    });
})

app.get("/manual", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        res.render("manual", JSON.parse(file));
    });
})

/* JSON data */

app.all("/info.json", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        res.json(JSON.parse(file));
    });
});

app.all("/match_result.json", (req, res) => {
    fs.readFile("data/json/match_result.json", (err, file) => {
        res.json(JSON.parse(file));
    });
});

app.all("/top_8.json", (req, res) => {
    fs.readFile("data/json/top_8.json", (err, file) => {
        res.json(JSON.parse(file));
    });
});

app.all("/favicon.ico", (req, res) => {
    fs.readFile("static/favicon.ico", (err, file) => {
        res.json(file);
    });
});
  
app.listen(config.web.port, () => {
    logging.log("Web application listening on port " + config.web.port)
    getLatestFile();
})

/**
 * change obs scene using obs-websocket.
 * @param {string} scene 
 * @returns {boolean} true if success, false if error
 */
function changeScene(scene) {
    if(config.obs.scene_changer) {
        obs.call(
            'SetCurrentProgramScene', {'sceneName': scene}
        )
        .then(function(value) {
            logging.log("Changed scene to \"" + scene + "\"");
            return true
        }, () => {
            return false
        });
    };
    return false;
}


/*
  ____  _ _             _ 
 / ___|| (_)_ __  _ __ (_)
 \___ \| | | '_ \| '_ \| |
  ___) | | | |_) | |_) | |
 |____/|_|_| .__/| .__/|_|
           |_|   |_|      
 */

/**
 * Get latest file from a directory
 * @returns {string} full path to latest .slp file, null if no .slp found
 */
function getLatestFile() {
    try {
        var recent_file = null;
        var modified_time = 0;
        fs.readdirSync(config.slippi.directory).forEach(file => {
            if (file.slice(-4) == ".slp") {
                stats = fs.statSync(config.slippi.directory + "\\" + file);
                if (stats.mtimeMs > modified_time) {
                    recent_file = file;
                    modified_time = stats.mtimeMs;
                }
            }
        });
        file_path = "";
        if(recent_file != null) {
            file_path = config.slippi.directory + "\\" + recent_file
        }
        return file_path;
    } catch (e) {
        //ideally would stop the .slp loop after this exception is thrown
        if(e instanceof TypeError) {
            logging.error("Slippi directory \"" + config.slippi.directory + "\" doesn't exist");
            throw(e)
        }
    }
}

/* PROMISES */

function getNewFile(file_path) {
    return new Promise(function(resolve) {
        const timer = setInterval(() => {
            var file = getLatestFile();
            if(file != file_path) {
                clearInterval(timer);
                resolve(file);
            }
        }, 500)
    });
}

function getGameComplete(game) {
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            var stat = game.getGameEnd();
            if (stat != null) {
                clearInterval(timer);
                resolve(stat);
            }
        }, 1000);
    });
}

function updateStats(game) {
    var settings = game.getSettings();
    info = JSON.parse(fs.readFileSync("data/json/info.json", {encoding:'utf8', flag:'r'}));
    if(info.Player1.score == Math.ceil(info.best_of/2) || info.Player2.score == Math.ceil(info.best_of/2)) {
        info.Player1.score == 0;
        info.Player2.score == 0;
    }
    if(settings.players.length == 2) {
        p1_data = slpTools.matchChar(settings.players[0].characterId, settings.players[0].characterColor);
        p2_data = slpTools.matchChar(settings.players[1].characterId, settings.players[1].characterColor);

        info.Player1.character = p1_data.character;
        info.Player1.colour = p1_data.colour;

        info.Player2.character = p2_data.character;
        info.Player2.colour = p2_data.colour;
    } else if (settings.players.length == 4) {
        team1_id = settings.players[0].teamId;

        t1p1_data = slpTools.matchChar(settings.players[0].characterId, settings.players[0].characterColor);
        t1p2_data = null;

        settings.players.slice(1); //remove p1 for search
        for(let player of settings.players) {
            if(player.teamId == team1_id) {
                t1p2_data = slpTools.matchChar(player.characterId, player.characterColor);
                var index = settings.players.indexOf(player);
                if (index > -1) { //remove teammate as not needed
                    settings.players.splice(index, 1);
                }
                break;
            }
        }
        if (t1p2_data == null) {
            return; //no teammate
        }
        t2p1_data = slpTools.matchChar(settings.players[0].characterId, settings.players[0].characterColor);
        t2p2_data = null;
        if(settings.players[0].teamId == settings.players[1].teamId) {
            t2p2_data = slpTools.matchChar(settings.players[1].characterId, settings.players[1].characterColor);
        } else {
            return; //no teammate
        }

        info.Player1.character = t1p1_data.character;
        info.Player1.colour = t1p1_data.colour;
        info.Player1.character_dubs = t1p2_data.character;
        info.Player1.colour_dubs = t1p2_data.colour;

        info.Player2.character = t2p1_data.character;
        info.Player2.colour = t2p1_data.colour;
        info.Player2.character_dubs = t2p2_data.character;
        info.Player2.colour_dubs = t2p2_data.colour;
    }
    fs.writeFileSync("data/json/info.json", JSON.stringify(info), "utf8");
}

function processResult(game, match_data) {
    if(config.slippi.track_score) {
        if(!slpTools.isValidGame(game)) {
            return match_data;
        };
    }
    var stats = game.getStats();
    var winner = game.getWinners();
    var info = JSON.parse(fs.readFileSync("data/json/info.json", "utf8"));
    if(stats.overall.length == 2) {
        var last_frame = game.getLatestFrame();

        var game_data = {"p1": {}, "p2": {}}
        game_data.stage = slpTools.matchStage(settings.stageId)

        //determine winner
        if(winner.length == 0) {
            winner = slpTools.getSinglesWinner(game);
        }
        if(winner.length != 1) {
            logging.log("Too many or no winners in game, draw?")
            return match_data;
        }
        //update data
        p1_character_data = slpTools.matchChar(settings.players[0].characterId, settings.players[0].characterColor)
        p2_character_data = slpTools.matchChar(settings.players[1].characterId, settings.players[1].characterColor)
        
        game_data.p1.char = p1_character_data.character
        game_data.p1.colour = p1_character_data.colour
        game_data.p2.char = p2_character_data.character
        game_data.p2.colour = p2_character_data.colour        
        
        if(winner[0].playerIndex == settings.players[0].playerIndex) {
            logging.log("Player 1 wins game")
            info.Player1.score += 1;
            game_data.winner = 1;
        } else if(winner[0].playerIndex == settings.players[1].playerIndex) {
            logging.log("Player 2 wins game")
            info.Player2.score += 1;
            game_data.winner = 2;
        } else {
            logging.error("Winner cannot be determined, winner's port is incorrect")
        }
        game_data.p1.stocks = last_frame.players[settings.players[0].playerIndex].post.stocksRemaining
        game_data.p2.stocks = last_frame.players[settings.players[1].playerIndex].post.stocksRemaining
        match_data.push(game_data)
        if(info.Player1.score >= Math.ceil(info.best_of/2) || info.Player1.score >= Math.ceil(info.best_of/2)) {
            var match_json = {
                tags: [info.Player1.name, info.Player2.name],
                games: match_data
            }
            match_data = []
            fs.writeFileSync("data/json/match_result.json", JSON.stringify(match_json), "utf8");
        }
        fs.writeFileSync("data/json/info.json", JSON.stringify(info), "utf8");
    } else if(stats.overall.length == 4) {
        //determine winner
        if(winner.length == 0) {
            winner = slpTools.getDoublesWinner(game);
        }
        if(winner.length != 2) {
            logging.log("Too many or no winners in game, draw?");
            return match_data;
        }
        var team1_winner = winner.some((e) => {
            return e.playerIndex == 0;
        })
        if(team1_winner) {
            logging.log("Team 1 wins game");
            info.Player1.score += 1;
        } else {
            logging.log("Team 2 wins game");
            info.Player2.score += 1;
        }
        fs.writeFileSync("data/json/info.json", JSON.stringify(info), "utf8");
    } else {
        logging.error("Odd number of players in game");
    }
    return match_data;

}

async function processGameHandler() {
    try{
        var file = getLatestFile();
        var game = new SlippiGame(file);
        /*used to skip the first .slp file if it is completed
        if not completed it will continue to process the game*/
        if(game.getGameEnd() != null) {
            logging.log("Waiting for game");
            file = await getNewFile(file)
        }
        changeScene(config.obs.start_scene)
        match_data = []
        while(true) {
            game = new SlippiGame(file);
            //game in progress
            logging.log("Game in progress");
            updateStats(game)

            var gameEnd = await getGameComplete(game);
            //game complete
            if(gameEnd.lrasIndicatorIndex != -1) {
                changeScene(config.obs.end_scene)
            } else {
                setTimeout(() => {
                    changeScene(config.obs.end_scene)
                }, 500);
            }
            match_data = processResult(game, match_data)
            logging.log("Waiting for game");
            file = await getNewFile(file)
            changeScene(config.obs.start_scene)
        }
    } catch (e) {
        if(e instanceof TypeError) {
            return;
        } else {
            throw(e);
        }
    }
}

processGameHandler();