const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
var _ = require("underscore")._;
const { SlippiGame } = require("@slippi/slippi-js");

const slpTools = require("./slpTools.js");
const logging = require("./logging");

const ignoredRegex = /^[/\w\.-]+(?<!\.slp)$/;

/**
 * Get the most recent game data from a directory for use on multi-setup tracking.
 * Format the games identical to how the main process does so they can be submitted
 * to start.gg in the application using existing methods.
 * 
 * @param {*} dir           Directory to search in
 * @param {*} [startIndex = 0]    Starting index to skip to
 * @param {*} [length = 10]        Number of games to return
 */
exports.getGames = (subdirectory, startIndex = 0, length = 10) => new Promise((resolve, reject) => {
    dirPath = path.resolve(config["Slippi"]["Spectator Directory"], subdirectory)

    startIndex = Math.max(startIndex, 0)
    length = Math.min(length, 20)
    endIndex = startIndex+length-1
    logging.log(`Getting files ${startIndex} to ${endIndex} in '${dirPath}'`)
    fsp.readdir(dirPath, {withFileTypes: true})
    .then((files) => {
        sortedFiles = files.sort(creationTime).filter(slpFilter)
        //ensure indices are not outwide the length of the list of files
        startIndex = startIndex > (sortedFiles.length-1) ? (sortedFiles.length-1-length) : startIndex
        endIndex = endIndex > (sortedFiles.length-1) ? (sortedFiles.length-1) : endIndex
        let games = []
        for(x = startIndex; x<= endIndex; x++) {
            let filePath = path.join(sortedFiles[x].path, sortedFiles[x].name)
            games.push(processGame(filePath))
        }
        resolve(games)
    })
    .catch((err) => {
        //return empty array on issue reading directory
        return []
    })
})

function creationTime(a, b) {
    let fileA = fs.statSync(path.join(a.path, a.name))
    let fileB = fs.statSync(path.join(a.path, b.name))
    if(fileA.ctime < fileB.ctime) {
        return 1;
    } else if(fileB.ctime < fileA.ctime) {
        return -1
    } else {
        return 0;
    }
}
function slpFilter(file) {
    return path.extname(file.name).toLowerCase() === '.slp'
}

/**
 * Extrapolated from processSlp.gameEnd()
 * @param {SlippiGame} game                 Slippi game object
 * @param {*} settings                      Settings of the slippi game
 * @param {slpTools.getSlippiTeams} teams   Teams in play
 * @returns                                 Promise to write output to info.json
 */
const processGame = (filePath) => {
    const game = new SlippiGame(filePath);
    const settings = game.getSettings();
    const teams = slpTools.getSlippiTeams(settings.players);

    const winner = slpTools.getWinner(game);

    if (winner.length != Math.floor(settings.players.length / 2)) {
        logging.log("Too many or no winners in game, draw?");
        //DO SOMETHING
    }

    const winnerPlayerNumber = teams
        .findIndex((t) => t.find(({ playerIndex }) => playerIndex === winner[0].playerIndex)) + 1;

    // Update match_data and/or match_result.json
    const { players: playersLatestFrame } = game.getLatestFrame();

    const gameData = teams.reduce((acc, [player, playerDoubles], index) => {
        const key = index + 1
        p1Char = slpTools.getCharacter(player)
        p2Char = ""
        if(settings.players.length === 4) {
            p2Char = slpTools.getCharacter(playerDoubles)
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

    return gameData;
};