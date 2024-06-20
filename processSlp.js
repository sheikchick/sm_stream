const path = require("path");

const slpTools = require("./slpTools.js");
const logging = require("./logging.js");
const { SlippiGame } = require("@slippi/slippi-js");
const { readData, writeData, INFO, MATCH_RESULT } = require("./data.js");
const { readFile, writeFile } = require("fs/promises");
const { getTimecode, getDirectory } = require("./obs.js");
const recordLive = require("./recordLive.js");

const FORMAT = "utf8";

const getFirstTo = (bestOf) => Math.ceil((bestOf || 3) / 2);

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
                    info.team1.player[0].name = info.team1.player[0].name.replace(lRegex, l);
                    info.team2.player[0].name = info.team2.player[0].name.replace(lRegex, l);
                }

                info.team1.score = 0;
                info.team2.score = 0;
                currentSet = [];


                if (isGameStart || !global.timecodeAuto) {
                    getTimecode().then((timecode) => {
                        global.timecodeAuto = recordLive.timecodeOffset(timecode, -5000); //start the auto recording 10 seconds earlier
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

checkSetEnd = async (info) => {
    const firstTo = getFirstTo(info.bestOf);
    if (info.team1.score >= firstTo || info.team2.score >= firstTo) {
        //need to tidy up with .catch() for each
        getTimecode().then((timecode) => {
            getDirectory().then((directory) => {
                recordLive.getLatestRecordingFile(directory).then((vod) => {
                    recordLive.saveRecording("auto", timecodeAuto, recordLive.timecodeOffset(timecode, 15000)) //save 15 seconds after end of set
                        .then(() => global.timecodeAuto = "")

                    writeData(MATCH_RESULT, {
                        names: [info.team1.name, info.team2.name],
                        games: currentSet
                    }).then(() => {
                        logging.log(`Wrote match data to match_result.json`)
                    }).catch((e) => {
                        logging.error(); (`Writing match_result.json: ${e}`)
                    });

                    const tournamentFilename = `${info.tournament ? info.tournament.replace(/ /g, "_") : 'default'}.json`;
                    logging.log()

                    //THE MOST IMPORTANT FUNCTION GOING FORWARD
                    const jsonFile = path.join("data/json/tournaments/", tournamentFilename);
                    const winner = info.team1.score >= firstTo ? 1 : info.team2.score >= firstTo ? 2 : 0 //0 should never occur
                    const data = {
                        team1: {
                            entrantId: info.team1.startggEntrant,
                            names: [
                                info.team1.players[0].name,
                                info.team1.players[1].name //change
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
                        vod: vod,
                        setId: info.setId, //TODO: startgg set id
                        winner: winner,
                        timecodes: [timecodeAuto, recordLive.timecodeOffset(timecode, 15000)],
                        games: currentSet
                    }
                    readFile(jsonFile, FORMAT)
                        .then((readFile) => {
                            var parsedFile = JSON.parse(readFile)
                            parsedFile.push(data)
                            writeFile(jsonFile, JSON.stringify(parsedFile), FORMAT).then(() => {
                                logging.log(`Appended match data "${info.team1.players[0].name} vs ${info.team2.players[0].name}" to ${tournamentFilename}`)
                            })
                                .catch((e) =>
                                    logging.error(`Failed to write ${jsonFile}: ${e}`
                                    ));
                        })
                        .catch(() => {
                            logging.log(`File ${jsonFile} doesn't exist yet, creating...`);
                            writeFile(jsonFile, `[${JSON.stringify(data)}]`, FORMAT).then(() => {
                                logging.log(`Match data "${info.team1.players[0].name} vs ${info.team2.players[0].name}" written to file ${tournamentFilename}`)
                                //MAY BE INCORRECT
                                app.get(`/tournaments/${tournamentFilename}`, (req, res) => {
                                    res.sendFile(jsonFile);
                                })
                            })
                                .catch((e) =>
                                    logging.error(`Failed to write ${jsonFile}: ${e}`
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
).map(p => `team${p}`);

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
            p2Data = slpTools.getCharacter(p1);

            const key = activePlayers[index];
            info[key].players[0] = {
                ...info[key].players[0],
                ...p1Data,
                port: p1.port
            };
            if (teams.length === 4) {
                info[key].players[1] = {
                    ...info[key].players[1],
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
 */
exports.gameMid = async ({ game, settings, teams }) => {
    if (teams.length === 2) {
        const playersLatestFrame = game.getLatestFrame().players;
        const info = await readData(INFO);
        const activePlayers = getActiveRotationPlayers(info, settings.players);
        info.activePlayers = activePlayers;

        teams.forEach(([p, pd = {}], index) => {
            const key = activePlayers[index];
            info[key] = {
                ...info[key],
                character: slpTools.getLatestCharacter(p, playersLatestFrame),
                characterDubs: slpTools.getLatestCharacter(pd, playersLatestFrame),
                port: p.port
            };
        });

        return writeData(INFO, info);
    }
};

exports.gameEnd = async ({ game, settings, teams }) => {
    global.gameInProgress = false;
    if (!config.slippi.debug_mode && !slpTools.isValidGame(game)) {
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

    const writeInfoPromise = writeData(INFO, info);

    // Update match_data and/or match_result.json
    const { players: playersLatestFrame } = game.getLatestFrame();

    const gameData = teams.reduce((acc, [player, playerDoubles], index) => {
        const key = `team${index + 1}`;
        acc[key] = [
            {
                ...slpTools.getCharacter(player),
                stocks: playersLatestFrame[player.playerIndex]?.post.stocksRemaining || 0
            },
            (settings.players.length === 4
                ? {
                    ...slpTools.getCharacter(playerDoubles),
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