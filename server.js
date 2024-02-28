//and here we go...
const express = require("express");
var cors = require('cors')
const path = require("path");
const toml = require("toml");
const fs = require("fs");
const OBSWebSocket = require('obs-websocket-js').default;
const { SlippiGame } = require("@slippi/slippi-js");
const slpTools = require("./slp_tools.js");
const logging = require("./logging.js");

const obs = new OBSWebSocket();
const app = express()


global.slippi_loop = false;
global.config;

global.recording_status = false;
global.current_timestamp = "";

loadConfig();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use("/static", express.static("static"));
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended: true}));

if(config.obs.host != 0 && config.obs.port != 0) {
    obs.connect(`ws://${config.obs.host}:${config.obs.port}`, config.obs.password).then(() => {
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

app.post("/save_recording", (req, res) => {
    if(recording_status) {
        //end recording
        obs.call(
            'GetRecordDirectory'
        )
        .then(function(value) {
            input_filename = getLatestRecordingFile(value.recordDirectory);
            if (input_filename) {
                fs.readFile("data/json/info.json", (err, file) => {
                    data = JSON.parse(file);
                    filename = `${data.Player1.name} vs ${data.Player2.name} - ${data.round}`.replace(/[/\\?%*:|"<>]/g, '');
                    command = `ffmpeg -i "${input_filename}" -ss ${current_timestamp} -to ${req.body.timecode} -c copy "${filename}.mp4"\n`;
                    fs.appendFile(`${value.recordDirectory}/sets.bat`, command, "utf8", (err) => {
                        current_timestamp = "";
                        if (err) {
                            logging.error(err);
                            res.sendStatus(500);
                        } else {
                            res.json({recording_status: recording_status ? 1 : 0})
                        }
                    });
                });
            }
        });
        recording_status = false;
    } else {
        //start recording
        current_timestamp = req.body.timecode;
        recording_status = true;
        res.json({recording_status: recording_status ? 1 : 0});
    }
});

app.post("/save_clip", (req, res) => {
    obs.call(
        'GetRecordDirectory'
    )
    .then(function(value) {
        const clipDirectory = `${value.recordDirectory}/clips`;
        const input_filename = getLatestRecordingFile(clipDirectory);
        if (input_filename) {
                const {timecode} = req.body;
                const regex = /\d\d(?::\d\d)+/;
                const noMillis = timecode.match(regex)?.[0].split(":") || [];
                const seconds = (noMillis.pop() || 0) - 30;
                const minutes = (noMillis.pop() || 0) - (seconds < 0 | 0);
                const hours = (noMillis.pop() || 0) - (minutes < 0 | 0);
                const ss = hours < 0
                    ? "00:00:00"
                    : `${`${hours}`.padStart(2, '0')}:${`${(60 + minutes) % 60}`.padStart(2, '0')}:${`${(60 + seconds) % 60}`.padStart(2, '0')}`;

                command = `ffmpeg -i "${input_filename}" -ss ${ss} -to ${timecode} -c copy "${timecode.replaceAll(":", "-")}.mp4"\n`;
                fs.appendFile(`${clipDirectory}/clips.bat`, command, "utf8", (err) => {
                    res.sendStatus(err ? 500 : 200);
                });
        }
    });
});

//TODO: refactor tablet endpoints

/*Views*/

app.get("/", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        var data = JSON.parse(file);
        data.api_key = config.startgg.key;
        data.obs_port = config.obs.port;
        data.obs_password = config.obs.password;
        res.render("glaikit", data);
    });
})

app.get("/manual", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        res.render("manual-new", JSON.parse(file));
    });
})

app.get("/manual-old", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        res.render("manual", JSON.parse(file));
    });
})

app.get("/friendlies", (req, res) => {
    fs.readFile("data/json/info.json", (err, file) => {
        res.render("friendlies", JSON.parse(file));
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

app.all("/recording_status", (req, res) => {
    res.json({recording_status: recording_status ? 1 : 0})
});

/* External endpoints */

app.post("/update_stats", (req, res) => {
    updateStats(new SlippiGame(req.body.file));
    fs.readFile("data/json/info.json", (err, file) => {
        res.json(JSON.parse(file));
    });
});

app.post("/process_slp", (req, res) => {
    processResult(new SlippiGame(req.body.file), []);
    fs.readFile("data/json/info.json", (err, file) => {
        res.json(JSON.parse(file));
    });
});

/* Run app */
  
app.listen(config.web.port, () => {
    logging.log("Web application listening on port " + config.web.port)
})

/**
 * change obs scene using obs-websocket.
 * @param {string} scene 
 * @returns {Promise} resolves to a boolean indicating whether scene was changed.
 */
const changeScene = (scene) => new Promise((resolve) => {
    if(config.obs.scene_changer) {
        obs.call(
            'SetCurrentProgramScene', {'sceneName': scene}
        )
        .then(() => {
            logging.log(`Changed scene to ${scene}.`);
            resolve(true);
        }).catch(() => {
            logging.log(`Failed to change scene to ${scene}.`);
            resolve(false);
        });
    };
    resolve(false);
});

function loadConfig() {
    try {
        config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
    } catch (e) {
        logging.error("Error parsing config.toml, exiting.");
        process.exit(0);
    }
}

function getLatestRecordingFile(directory) {
    try {
        var recent_file = null;
        var modified_time = 0;

        fs.mkdirSync(directory, {recursive: true});
        fs.readdirSync(directory).forEach(file => {
            stats = fs.statSync(directory + "\/" + file);
            if (stats.mtimeMs > modified_time && file.endsWith('.mkv')) {
                recent_file = file;
                modified_time = stats.mtimeMs;
            }
        });
        return recent_file;

    } catch (e) {
        //ideally would stop the .slp loop after this exception is thrown
        if(e instanceof TypeError) {
            logging.error("Directory \"" + directory + "\" doesn't exist");
        }
        throw(e)
    }
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
        }
        throw(e)
    }
}

/* PROMISES */

function getNewFile(file_path) {
    return new Promise(function(resolve) {
        const timer = setInterval(() => {
            var file = getLatestFile();
            if(file != file_path) {
                clearInterval(timer);
                logging.log("File found: " + file);
                resolve(file);
            }
        }, 500)
    });
}

function getGameComplete(game) {
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            const stat = game.getGameEnd();
            if (stat != null) {
                clearInterval(timer);
                setTimeout(() => resolve(stat), stat.lrasIndicatorIndex === -1 ? 500 : 0);
            } else {
                updateStats(game);
            }
        }, 1000);
    });
}

const maintainScore = (() => {
    const FRIENDLIES = 'friendlies';
    const gf = "grand final";
    const l = " (L)";
    const lRegex = /\s\(L\)/;
    const notL = "";

    const newSet = (info, round) => {
        info.Player1.score = 0;
        info.Player2.score = 0;

        let p1Name = info.Player1.name.replace(lRegex, notL);
        let p2Name = info.Player2.name.replace(lRegex, notL);

        if (round.includes(gf)) {
            // If round is already gf, it must be a gf reset.
            p1Name = p1Name + l;
            p2Name = p2Name + l;
        }

        info.Player1.name = p1Name;
        info.Player2.name = p2Name;
    };
    
    return (info) => {
        const round = info.round.toLowerCase();
        const firstTo = round === FRIENDLIES
            ? Number.MAX_SAFE_INTEGER
            : Math.ceil((info.best_of || 3)/2);

        if (info.Player1.score >= firstTo || info.Player2.score >= firstTo) {
            newSet(info, round);
        }
    };
})();


const getActiveRotationPlayers = (info, players) => (Object.keys(info)
    .filter(k => k.startsWith('Player'))
    .length === 2
        ? [1, 2]
        : [players[0].port, players[1].port]
    ).map(p => `Player${p}`);

function updateStats(game) {
    var settings = game.getSettings();
    const info = JSON.parse(fs.readFileSync("data/json/info.json", {encoding:'utf8', flag:'r'}));
    maintainScore(info);

    const players = [...settings.players];
    const playersLatestFrame = game.getLatestFrame().players;
    const teams = slpTools.getSlippiTeams(players);
    if(teams.length === 2) {
        const activePlayers = getActiveRotationPlayers(info, players);
        info.active_players = activePlayers;

        teams.forEach(([p, pd = {}], index) => {
            pData = slpTools.getCharacter(p, playersLatestFrame);

            pDData = Object.entries(slpTools.getCharacter(pd, playersLatestFrame))
                .reduce((acc, [key, val]) => ({
                    ...acc,
                    [`${key}_dubs`]: val
                }), {});

            const key = activePlayers[index];
            info[key] = {
                ...info[key],
                ...pData,
                ...pDData
            };
        });
    }
    fs.writeFileSync("data/json/info.json", JSON.stringify(info), "utf8");
}

function processResult(game, match_data) {
    if(!config.slippi.debug_mode) {
        if(!slpTools.isValidGame(game)) {
            return match_data;
        };
    }
    const settings = game.getSettings();

    if(settings.players.length % 2) {
        logging.error("Odd number of players in game");
        return match_data;
    }

    //determine winner
    let winner = game.getWinners();
    if(winner.length == 0) {
        logging.log("Replay does not list winner. Calculating manually. May take longer for doubles.");
        winner = settings.players.length === 2
            ? slpTools.getSinglesWinner(game)
            : slpTools.getDoublesWinner(game);
    }

    if(winner.length != Math.floor(settings.players.length / 2)) {
        logging.log("Too many or no winners in game, draw?");
        return match_data;
    }

    const teams = slpTools.getSlippiTeams(settings.players);
    const winnerPlayerNumber = teams
        .findIndex((t) => t.find(({playerIndex}) => playerIndex === winner[0].playerIndex)) + 1;
    
    logging.log(`Team ${winnerPlayerNumber} wins game.`);
    const info = JSON.parse(fs.readFileSync("data/json/info.json", "utf8"));
    info[`Player${winnerPlayerNumber}`].score += 1;
    fs.writeFileSync("data/json/info.json", JSON.stringify(info), "utf8");

    // Update match_data and/or match_result.json
    const {players: playersLatestFrame} = game.getLatestFrame();

    const game_data = teams.reduce((acc, [p, pd], index) => {
        const key = `Player${index + 1}`;
        acc[key] = {
            ...slpTools.getCharacterByExternalId(p),
            stocks: playersLatestFrame[p.playerIndex]?.post.stocksRemaining || 0,
            ...(settings.players.length === 4 
                ? Object.entries(slpTools.getCharacterByExternalId(pd)).reduce((acc, [key, val]) => ({
                    ...acc,
                    [`${key}_dubs`]: val
                }), {stocks_dubs: playersLatestFrame[pd.playerIndex]?.post.stocksRemaining || 0})
                : {})
        };
        return acc;
    }, {
        stage: slpTools.matchStage(settings.stageId),
        winner: winnerPlayerNumber
    });

    match_data.push(game_data);
    
    if(info.Player1.score >= Math.ceil(info.best_of/2) || info.Player2.score >= Math.ceil(info.best_of/2)) {
        var match_json = {
            tags: [info.Player1.name, info.Player2.name],
            games: match_data
        }
        match_data = []
        fs.writeFileSync("data/json/match_result.json", JSON.stringify(match_json), "utf8");
    }

    return match_data;
}

async function processGameHandler() {
    try{
        var file = getLatestFile();
        logging.log("File found: " + file);
        var game_in_progress = false;
		if (file != "" && file != null) {
			var game = new SlippiGame(file);
			/*used to skip the first .slp file if it is completed
			if not completed it will continue to process the game*/
			if(game.getGameEnd() == null) {
				game_in_progress = true;
			}
		}
		if(!game_in_progress) {
            logging.log("Waiting for game");
			file = await getNewFile(file)
		}
        changeScene(config.obs.start_scene)
        match_data = []
        while(true) {
            game = new SlippiGame(file);
            //game in progress
            logging.log("Game in progress");

            await getGameComplete(game);
            //game complete
            await changeScene(config.obs.end_scene);
  
            if(config.slippi.track_score) {
                match_data = processResult(game, match_data)
            }
            logging.log("Waiting for game");
            file = await getNewFile(file)
            changeScene(config.obs.start_scene)
        }
    } catch (e) {
        if(e instanceof TypeError) {
            slippi_loop = false;
            return;
        } else {
            slippi_loop = false;
            logging.error(e);
            logging.error("Closing slippi loop, web config will still run")
            return;
        }
    }
}

if(require.main == module) {
    slippi_loop = true;
    processGameHandler();
}