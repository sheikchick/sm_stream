const chokidar = require("chokidar");
const processSlp = require("./processSlp");
const { changeScene } = require("./obs");
const logging = require("./logging");

const ignoredRegex = /^[/\w\.-]+(?<!\.slp)$/;
const pending = 'pending';

let watcher;

exports.watch = (dir) => {
    watcher?.close();
    watcher = chokidar.watch(dir, {
        ignored: ignoredRegex,
        depth: 0,
        persistent: true,
        usePolling: true,
        ignoreInitial: true,
    });

    const games = {};
    let match_data = [];
    watcher.on("change", (path) => {
        const gameObj = games[path];
        try {
            if (!gameObj) {
                logging.log(`New file at: ${path}`);
                
                games[path] = {
                    lastUpdate: Promise.all([
                        changeScene(config.obs.start_scene),
                        processSlp.gameStart(path, !match_data.length)
                    ]).then(([_, gameObj]) => {
                        games[path] = {...gameObj, lastUpdate: Promise.resolve()};
                    })
                };

                return;
            }
        } catch (err) {
            logging.error(err);
            return;
        }

        const gameEnd = gameObj.game?.getGameEnd();

        // Rarely, gameEnd may be true on the second last onChange, as well as the last.
        // We need to account for this to avoid giving GROM 2 for 1 on wins. 
        //
        // This is bullying, GROM deserves 2 for 1 wins, I'm bringing this up in the council
        if (gameEnd && !gameObj.endHandled) {
            logging.log(`Game over: ${path}`);
            gameObj.endHandled = true;
            gameObj.lastUpdate.then(() => {
                Promise.all([
                    processSlp.gameEnd(gameObj),
                    changeScene(config.obs.end_scene)
                ]).then(([data]) => {
                    match_data = data;
                    !match_data.length && delete games[path];
                });
            });
            return;
        }

        // We want to check for gameStart and gameEnd as often as possible, but if we're mid game we only want
        // to process gameMid() every so often; i.e. we want to process gameMid() based on how much time has 
        // passed since the last time we processed gameMid(), rather than every time we reach this line of
        // watcher.on("change").
        // Instead of lastUpdate.then(gameMid), we want to further delay
        // the gameMid() call with setTimeout(), but since lastUpdate could itself be an unfinished gameMid()
        // execution, we would quickly end up with multiple queued gameMid() calls that would all need to 
        // complete one at a time, delaying the eventual gameEnd() call.
        // So unlike usual where we would do lastUpdate = lastUpdate.then(gameMid_delayed), we don't even want to
        // queue the next gameMid_delayed() in the first place if lastUpdate is not complete.
        Promise.race([gameObj.lastUpdate, pending]).then((promise) => {
            if (promise !== pending) {
                games[path].lastUpdate = new Promise((resolve) => setTimeout(() => resolve(processSlp.gameMid(gameObj)), 500));
            }
        });
    });
};