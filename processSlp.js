const path = require("path");

const slpTools = require("./slp_tools.js");
const logging = require("./logging.js");
const { SlippiGame } = require("@slippi/slippi-js");
const { readData, writeData, INFO, MATCH_RESULT } = require("./data.js");
const { readFile, writeFile } = require("fs/promises");
const { getTimecode, getDirectory } = require("./obs.js");
const recordLive = require("./recordLive.js");

const fs = require("fs/promises");

const FORMAT = "utf8";

const get_first_to = (best_of) => Math.ceil((best_of || 3)/2);

exports.check_set_start = (() => {
    const FRIENDLIES = 'friendlies';
    const gf = "grand final";
    const l = " (L)";
    const lRegex = /\s*(?:\(L\))?$/;

    return (info) => {
        const round = info.round?.toLowerCase();    
        if (!round.includes(FRIENDLIES)) {
            const first_to = get_first_to(info.best_of);
            const p1_score = info.Player1.score;
            const p2_score = info.Player2.score;
            const total_score = p1_score + p2_score;

            if (p1_score >= first_to || p2_score >= first_to || total_score === 0) {                       
                logging.log('New set detected');
                if (round.includes(gf) && total_score) {
                    logging.log('Grand Final reset detected. Both players now in losers')
                    info.Player1.name = info.Player1.name.replace(lRegex, l);
                    info.Player2.name = info.Player2.name.replace(lRegex, l);
                }

                info.Player1.score = 0;
                info.Player2.score = 0;
                current_set = [];


                if (!global.auto_timecode) {
                    getTimecode().then((timecode) => {
                        global.auto_timecode = recordLive.timecodeOffset(timecode, -5000); //start the auto recording 10 seconds earlier
                        recordLive.takeScreenshot(timecode, "auto", "1", "960x540")
                            .then(() => {
                            }).catch((f) => {
                                logging.error(`Auto screenshot error: ${f}`)
                            });
                    });
                }
            }
        }
    };
})();

check_set_end = async (info) => {
    const first_to = get_first_to(info.best_of);
    if(info.Player1.score >= first_to || info.Player2.score >= first_to) {
        //need to tidy up with .catch() for each
        getTimecode().then((timecode) => {
            getDirectory().then((directory) => {
                recordLive.getLatestRecordingFile(directory).then((vod) => {
                    recordLive.saveRecording("auto", auto_timecode, recordLive.timecodeOffset(timecode, 15000)) //save 15 seconds after end of set
                        .then(() => global.auto_timecode = "")
        
                    writeData(MATCH_RESULT, {
                        tags: [info.Player1.name, info.Player2.name],
                        games: current_set
                    }).then(() => {
                        logging.log(`Wrote match data to match_result.json`)
                    }).catch((e) => {
                        logging.error();(`Writing match_result.json: ${e}`)
                    });
        
                    const tournament_filename = `${info.tournament ? info.tournament.replace(/ /g,"_") : 'default'}.json`;
                    logging.log()
        
                    //THE MOST IMPORTANT FUNCTION GOING FORWARD
                    const json_file = path.join("data/json/tournaments/", tournament_filename);
                    const data = {
                        players: [
                            {
                                tag: info.Player1.name,
                                entrant_id: info.Player1.startgg_entrant
                            },
                            {
                                tag: info.Player2.name,
                                entrant_id: info.Player2.startgg_entrant
                            }
                        ],
                        round: info.round,
                        vod: vod,
                        set_id: 0, //TODO: startgg set id
                        timecodes: [auto_timecode, recordLive.timecodeOffset(timecode, 15000)],
                        games: current_set
                    }
                    readFile(json_file, FORMAT)
                        .then((read_file) => {
                            var parsed_file = JSON.parse(read_file)
                            parsed_file.push(data)
                            writeFile(json_file, JSON.stringify(parsed_file), FORMAT).then(() => {
                                logging.log(`Appended match data "${info.Player1.name} vs ${info.Player2.name}" to ${tournament_filename}`)
                            })
                            .catch((e) => 
                                logging.error(`Failed to write ${json_file}: ${e}`
                            ));
                        })
                        .catch(() => {
                            logging.log(`File ${json_file} doesn't exist yet, creating...`);
                            writeFile(json_file, `[${JSON.stringify(data)}]`, FORMAT).then(() => {
                                logging.log(`Match data "${info.Player1.name} vs ${info.Player2.name}" written to file ${tournament_filename}`)
                                //MAY BE INCORRECT
                                app.get(`/tournaments/${tournament_filename}`, (req, res) => {
                                    res.sendFile(json_file);
                                })
                            })
                            .catch((e) => 
                                logging.error(`Failed to write ${json_file}: ${e}`
                            ));
                        });
                    }); 
                });
            });
    }
};


const getActiveRotationPlayers = (info, players) => (Object.keys(info)
    .filter(k => k.startsWith('Player'))
    .length === 2
        ? [1, 2]
        : [players[0].port, players[1].port]
    ).map(p => `Player${p}`);

exports.gameStart = async (path) => {
    const game = new SlippiGame(path, {processOnTheFly: true});
    const settings = game.getSettings();
    const teams = slpTools.getSlippiTeams(settings.players);

    const info = await readData(INFO);

    this.check_set_start(info);
    if(teams.length === 2) {
        const activePlayers = getActiveRotationPlayers(info, settings.players);
        info.active_players = activePlayers;

        teams.forEach(([p, pd = {}], index) => {
            pData = slpTools.getCharacter(p);

            const {
                character: character_dubs,
                colour: colour_dubs
            } = slpTools.getCharacter(pd);

            const key = activePlayers[index];
            info[key] = {
                ...info[key],
                ...pData,
                character_dubs,
                colour_dubs,
                port: p.port
            };
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
 */
exports.gameMid = async ({game, settings, teams}) => {
    if(teams.length === 2) {
        const playersLatestFrame = game.getLatestFrame().players;
        const info = await readData(INFO);
        const activePlayers = getActiveRotationPlayers(info, settings.players);
        info.active_players = activePlayers;

        teams.forEach(([p, pd = {}], index) => {
            const key = activePlayers[index];
            info[key] = {
                ...info[key],
                character: slpTools.getLatestCharacter(p, playersLatestFrame),
                character_dubs: slpTools.getLatestCharacter(pd, playersLatestFrame),
                port: p.port
            };
        });

        return writeData(INFO, info);
    }
};

exports.gameEnd = async ({game, settings, teams}) => {
    global.game_in_progress = false;
    if(!config.slippi.debug_mode && !slpTools.isValidGame(game)) {
        return;
    }

    const winner = slpTools.getWinner(game);

    if(winner.length != Math.floor(settings.players.length / 2)) {
        logging.log("Too many or no winners in game, draw?");
        return;
    }

    const winnerPlayerNumber = teams
        .findIndex((t) => t.find(({playerIndex}) => playerIndex === winner[0].playerIndex)) + 1;
    
    logging.log(`Team ${winnerPlayerNumber} wins game.`);

    const info = await readData(INFO);
    const winnerKey = `Player${winnerPlayerNumber}`;
    info[winnerKey].score = (info[winnerKey].score || 0) + 1;
    
    const writeInfoPromise = writeData(INFO, info);

    // Update match_data and/or match_result.json
    const {players: playersLatestFrame} = game.getLatestFrame();

    const game_data = teams.reduce((acc, [p, pd], index) => {
        const key = `Player${index + 1}`;
        acc[key] = {
            ...slpTools.getCharacter(p),
            stocks: playersLatestFrame[p.playerIndex]?.post.stocksRemaining || 0,
            ...(settings.players.length === 4 
                ? Object.entries(slpTools.getCharacter(pd)).reduce((acc, [key, val]) => ({
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

    current_set.push(game_data);

    await check_set_end(info);

    return writeInfoPromise;
};