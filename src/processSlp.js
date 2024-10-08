const path = require("path");

const slpTools = require("./slpTools.js");
const logging = require("./logging.js");
const { SlippiGame } = require("@slippi/slippi-js");
const { readData, writeData, INFO, MATCH_RESULT } = require("./data.js");
const { appendFile, readFile, writeFile, mkdir } = require("fs/promises");
const { getTimecode, getDirectory } = require("./obs.js");
const recordLive = require("./recordLive.js");
const startgg = require("./startgg.js")
const { changeScene } = require('./obs');

const { delayPromiseStart } = require("./util.js")

const FORMAT = "utf8";

const getFirstTo = (bestOf) => Math.ceil((bestOf || 3) / 2);

//Hacky solution for getting most played between Sheik and Zelda per person
var sheikZeldaPlaytime = {
    team1: [{"zelda": 0, "sheik": 0},{"zelda": 0, "sheik": 0}],
    team2: [{"zelda": 0, "sheik": 0},{"zelda": 0, "sheik": 0}]
}

/**
 * Check if a new set has started and set up the info.json file appropriately
 */
exports.checkSetStart = (() => {
    const FRIENDLIES = 'friendlies';
    const gf = "grand final";
    const l = " (L)";
    const lRegex = /\s*(?:\(L\))?$/;

    return (info, isGameStart) => {
        const round = info.round?.toLowerCase();
        if (!round.includes(FRIENDLIES)) {
            const firstTo = getFirstTo
                (info.bestOf);
            const p1Score = info.team1.score;
            const p2Score = info.team2.score;
            const totalScore = p1Score + p2Score;

            if (p1Score >= firstTo || p2Score >= firstTo || totalScore === 0) {
                logging.log('New set detected');
                if (round.includes(gf) && totalScore) {
                    logging.log('Grand Final reset detected. Both players now in losers')
                    info.team1.players[0].name = info.team1.players[0].name.replace(lRegex, l);
                    info.team2.players[0].name = info.team2.players[0].name.replace(lRegex, l);
                }

                info.team1.score = 0;
                info.team2.score = 0;
                currentSet = [];

                sheikZeldaPlaytime = {
                    team1: [{"zelda": 0, "sheik": 0},{"zelda": 0, "sheik": 0}],
                    team2: [{"zelda": 0, "sheik": 0},{"zelda": 0, "sheik": 0}]
                }


                if (isGameStart || !global.timecodeAuto) {
                    getTimecode().then((timecode) => {
                        global.timecodeAuto = recordLive.timecodeOffset(timecode, -5000); //start the auto recording 5 seconds earlier
                    });
                }
            }
        }
    };
})();

/**
 * Used to ascertain whether or not a set has ended.
 * On a set end will write the set information to match_result.json; to /data/json/{tournamentName}/set_data.json;
 * and if enabled in the config, will create the output .mp4 file corresponding to the set.
 */
checkSetEnd = async (info) => {
    const createFile = (jsonFile, data, info, tournamentName) => {
        appendFile(jsonFile, "", FORMAT)
        .then(() => {
            readFile(jsonFile, FORMAT)
            .then((readFile) => {
                var parsedFile
                try {
                    parsedFile = JSON.parse(readFile)
                } catch (e) {
                    parsedFile = []
                }
                parsedFile.push(data)
                //write to tournament json file
                writeFile(jsonFile, JSON.stringify(parsedFile), FORMAT)
                .then(() => {
                    logging.log(`Match data "${info.team1.players[0].name} vs ${info.team2.players[0].name}" written to /${tournamentName}/`)
                    global.timecodeAuto = ""
                    //submit data to start.gg
                    if(config["start.gg"]["Auto-submit sets"] === "true") {
                        startgg.submitStartggSet(data, info.startggSwapped)
                    }
                    //write to match_result for data purposes
                    writeData(MATCH_RESULT, data)
                    .then(() => {
                        logging.log(`Wrote match data to match_result.json`)
                    })
                    .catch((e) => {
                        logging.error(`Failed to write match_result.json: ${e}`);
                    });
                })
            })
        })
        .catch((e) =>
            logging.error(`Failed to write ${jsonFile}: ${e}`
        ));
    }

    const firstTo = getFirstTo(info.bestOf);
    if (info.team1.score >= firstTo || info.team2.score >= firstTo) {
        getTimecode()
        .then((timecode) => {
            getDirectory()
            .then((directory) => {
                recordLive.getLatestRecordingFile(directory)
                .then((vod) => {
                    const tournamentName = info.tournament ? info.tournament.replace(/ /g, "_") : 'default'
                    const tournamentPath = path.join("data/json/tournaments/", tournamentName);
                    const jsonFile = path.join("data/json/tournaments/", tournamentName, "set_data.json");
                    const winner = info.team1.score >= firstTo ? 1 : info.team2.score >= firstTo ? 2 : 0 //0 should never occur
                    const data = {
                        team1: {
                            entrantId: info.team1.startggEntrant,
                            names: [
                                info.team1.players[0].name,
                                info.team1.players[1].name
                            ]
                        },
                        team2: {
                            entrantId: info.team2.startggEntrant,
                            names: [
                                info.team2.players[0].name,
                                info.team2.players[1].name
                            ]
                        },
                        round: info.round,
                        vod: directory ? path.join(directory, vod) : vod,
                        setId: info.startggSetId,
                        winner: winner,
                        timecodes: [timecodeAuto, recordLive.timecodeOffset(timecode, 15000)],
                        isDoubles: info.isDoubles,
                        games: currentSet
                    }
                    //create directory if not exists
                    mkdir(tournamentPath)
                    .then(() => {
                        createFile(jsonFile, data, info, tournamentName)
                        if(config["OBS"]["VODs"]["Auto-record"] === "true") {
                            logging.log("Saving VOD in 20s")
                            setTimeout(() => {recordLive.createVod(data, info.tournament)}, 20000)
                        }
                    })
                    .catch(() => {
                        createFile(jsonFile, data, info, tournamentName)
                        if(config["OBS"]["VODs"]["Auto-record"] === "true") {
                            logging.log("Saving VOD in 20s")
                            setTimeout(() => {recordLive.createVod(data, info.tournament)}, 20000)
                        }
                    })
                })
            })
        })
    }
};

/**
 * Used to get the active ports on the rotation, but currently doesn't work and isn't required so just returns [1,2]
 * @returns [1,2]
 */
const getActiveRotationPlayers = () => {
    return [1,2]
}

/**
 * Executed on game start
 * @param {*} path  Path to the .slp file
 * @returns         Write output to info.json
 */
exports.gameStart = async (path) => {
    const game = new SlippiGame(path, { processOnTheFly: true });
    const settings = game.getSettings();
    const teams = slpTools.getSlippiTeams(settings.players);

    const info = await readData(INFO);

    this.checkSetStart(info, true);
    if (teams.length === 2) {
        const activePlayers = getActiveRotationPlayers(info, settings.players);
        info.activePlayers = activePlayers;

        teams.forEach(([p1, p2 = {}], index) => {
            p1Data = slpTools.getCharacter(p1);
            p2Data = slpTools.getCharacter(p2);

            const key = activePlayers[index];
            info[`team${key}`].players[0] = {
                ...info[`team${key}`].players[0],
                ...p1Data,
                port: p1.port
            };
            if (settings.players.length === 4) {
                info[`team${key}`].players[1] = {
                    ...info[`team${key}`].players[1],
                    ...p2Data,
                    port: p2.port
                };
            }
        });
    }

    return writeData(INFO, info).then(() => ({
        game,
        settings,
        teams
    }));
};


/**
 * Literally only used so that the overlay updates when Zelda/Sheik transforms mid-game.
 * Character info in game.getSettings() does not update when Zelda/Sheik transforms, so we instead
 * get this info from game.getLatestFrame().
 * @param {SlippiGame} game                 Slippi game object
 * @param {*} settings                      Settings of the slippi game
 * @param {slpTools.getSlippiTeams} teams   Teams in play
 * @returns         Write output to info.json
 */
exports.gameMid = async ({ game, settings, teams }) => {
    if (teams.length === 2) {
        const playersLatestFrame = game.getLatestFrame().players;
        const info = await readData(INFO);
        const activePlayers = getActiveRotationPlayers(info, settings.players);
        info.activePlayers = activePlayers;

        teams.forEach(([p, pd = {}], index) => {
            const key = activePlayers[index];
            p1char = slpTools.getLatestCharacter(p, playersLatestFrame)
            if(p1char === "zelda" || p1char === "sheik") {
                sheikZeldaPlaytime[`team${key}`][0][p1char] += 1;
            }
            p2char = slpTools.getLatestCharacter(pd, playersLatestFrame)
            if(p2char === "zelda" || p2char === "sheik") {
                sheikZeldaPlaytime[`team${key}`][1][p2char] += 1;
            }
            info[`team${key}`].players[0].character = p1char
            info[`team${key}`].players[1].character = p2char
        });
        return writeData(INFO, info);
    }
};

/**
 * Executes on the end of a game
 * @param {SlippiGame} game                 Slippi game object
 * @param {*} settings                      Settings of the slippi game
 * @param {slpTools.getSlippiTeams} teams   Teams in play
 * @returns                                 Promise to write output to info.json
 */
exports.gameEnd = async ({ game, settings, teams }) => {
    global.gameInProgress = false;
    //if debug mode disabled and if the game is not valid
    if (config["Slippi"]["Debug Mode"] === "false" && !slpTools.isValidGame(game)) {
        return;
    }

    const winner = slpTools.getWinner(game);

    if (winner.length != Math.floor(settings.players.length / 2)) {
        logging.log("Too many or no winners in game, draw?");
        return;
    }

    const winnerPlayerNumber = teams
        .findIndex((t) => t.find(({ playerIndex }) => playerIndex === winner[0].playerIndex)) + 1;

    logging.log(`Team ${winnerPlayerNumber} wins game.`);

    const info = await readData(INFO);
    const winnerKey = `team${winnerPlayerNumber}`;
    info[winnerKey].score = (info[winnerKey].score || 0) + 1;

    if(info[winnerKey].score === getFirstTo(info.bestOf)) {
        //set ended
        delayPromiseStart(1000, () => changeScene(config["OBS"]["Scenes"]["Set end scene"]))
    } else {
        //game ended
        delayPromiseStart(1000, () => changeScene(config["OBS"]["Scenes"]["Game end scene"]))
    }

    const writeInfoPromise = writeData(INFO, info);

    // Update match_data and/or match_result.json
    const { players: playersLatestFrame } = game.getLatestFrame();

    const gameData = teams.reduce((acc, [player, playerDoubles], index) => {
        const key = index + 1

        //get most playtime between sheik and zelda
        p1Char = slpTools.getCharacter(player)
        p2Char = ""
        if(p1Char.character === "zelda" || p1Char.character === "sheik") {
            sheikZeldaPlaytime[`team${key}`][0].sheik >= sheikZeldaPlaytime[`team${key}`][0].zelda ? p1Char.character = "sheik" : p1Char.character = "zelda";
        }
        if(settings.players.length === 4) {
            p2Char = slpTools.getCharacter(playerDoubles)
            if(p2Char.character === "zelda" || p2Char.character === "sheik") {
                sheikZeldaPlaytime[`team${key}`][1].sheik >= sheikZeldaPlaytime[`team${key}`][1].zelda ? p2Char.character = "sheik" : p2Char.character = "zelda";
            } 
        }

        acc[`team${key}`] = [
            {
                ...p1Char,
                stocks: playersLatestFrame[player.playerIndex]?.post.stocksRemaining || 0
            },
            (settings.players.length === 4
                ? {
                    ...p2Char,
                    stocks: playersLatestFrame[playerDoubles.playerIndex]?.post.stocksRemaining || 0
                }
                : {})
        ];
        return acc;
    }, {
        stage: slpTools.matchStage(settings.stageId),
        winner: winnerPlayerNumber
    });

    currentSet.push(gameData);

    await checkSetEnd(info);

    return writeInfoPromise;
};