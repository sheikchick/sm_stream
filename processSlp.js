const slpTools = require("./slp_tools.js");
const logging = require("./logging.js");
const { SlippiGame } = require("@slippi/slippi-js");
const { readData, writeData, INFO, MATCH_RESULT } = require("./data.js");

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
            auto_timecode = getTimecode() //PROBABLY WRONG
        }
    };
})();

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
    maintainScore(info);
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

exports.gameEnd = async ({game, settings, teams}, match_data = []) => {
    if(!config.slippi.debug_mode && !slpTools.isValidGame(game)) {
        return match_data;
    }

    const winner = slpTools.getWinner(game);

    if(winner.length != Math.floor(settings.players.length / 2)) {
        logging.log("Too many or no winners in game, draw?");
        return match_data;
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

    match_data.push(game_data);
    
    if(info.Player1.score >= Math.ceil(info.best_of/2) || info.Player2.score >= Math.ceil(info.best_of/2)) {
        match_data = [];
        await writeData(MATCH_RESULT, {
            tags: [info.Player1.name, info.Player2.name],
            games: match_data
        });
    }

    return writeInfoPromise.then(() => match_data);
};