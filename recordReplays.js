
const { join } = require('path')
const { SlippiGame } = require('@slippi/slippi-js')
const fs = require("fs/promises");
const { spawn } = require("child_process");
const slpRealtime = require("@vinceau/slp-realtime");
const { DolphinLauncher, DolphinPlaybackStatus: { FILE_LOADED, PLAYBACK_START, PLAYBACK_END, QUEUE_EMPTY } } = slpRealtime;
const { Subject, combineLatest } = require("rxjs");
const { map, filter, distinct } = require("rxjs/operators");
const os = require('os');
const processSlp = require("./processSlp");
const { REPLAY_QUEUE, writeData, INFO, DOLPHIN, DIRECTORY } = require('./data');
const { changeScene } = require('./obs');

const sceneBlank = 'blank';

exports.recordReplays = async ([nextSet, ...restSets]) => {
    if (nextSet) {
        const games = await parseSlippiGames(nextSet);
        if (games.length) {
            return loadSet(nextSet)
                .then(() => recordSet(games))
                .then(() => writeData(REPLAY_QUEUE, restSets))
                .then(() => this.recordReplays(restSets))
                .catch(() => {
                    console.log('Failed to record set');
                });
        } 
    }
}

const parseSlippiGames = (() => {    
    const readFiles = dir => fs.readdir(dir, { withFileTypes: true }).then(files => Promise.all(files
        .map(async f => {
            const { name } = f
            const path = join(dir, name)
            return f.isDirectory() ? await readFiles(path) : [{ name, path }]
        })
    )).then(files => files.flat(Infinity))
    
    const getStartAt = ({ path }) => ({
        startAt: new Date(new SlippiGame(path).getMetadata().startAt),
        path
    })

    return (dir) => readFiles(dir).then(files => files
        .filter(({ name }) => name.endsWith('.slp'))
        .map(getStartAt)
        .sort(({ startAt: a }, { startAt: b }) => a > b ? 1 : a < b ? -1 : 0)
        .map(({ path }) => (path))
    )
})();

const delayPromiseStart = (timeout, fn) => new Promise((resolve, reject) => {
    setTimeout(() => {
        fn().then(resolve).catch(reject);
    }, timeout);
});

const loadSet = (() => {
    const savedDataName = 'set-data.json';

    const getFilename = ({
        Player1,
        Player2,
        tournament,
        round,
        date,
        is_doubles
    }) => [
        date,
        tournament,
        round,
        is_doubles
            ? `${Player1.name} & ${Player1.name_dubs} vs ${Player2.name} & ${Player2.name_dubs}`
            : `${Player1.name} vs ${Player2.name}`
    ].filter(x => x).join(' - ');

    const loadSetJson = (dir, savedData) => fs.access(dir).then(() => fs.readFile(savedData)
        .then((data) => {
            const info = JSON.parse(data);
            writeData(INFO, info).then(() => getFilename(info));
        }));

    return (dir) => {
        const savedData = join(dir, savedDataName);
        console.log(`Loading set data from ${savedData}...`);
        return loadSetJson(dir, savedData);
    };
})();

const recordSet = (() => {
    const [launchDolphin, prepareGame] = (() => {
        let dolphin;
        let running = false;

        const playbackResolve = new Subject();

        const prepareQueue = (queue) => {
            const json = {
                "mode": "queue",
                "replay": "",
                "isRealTimeMode": false,
                "outputOverlayFiles": true,
                queue
            };
            return () => writeData(DOLPHIN, json);
        };

        return [
            () => {
                if (!dolphin) {
                    dolphin = new DolphinLauncher({
                        dolphinPath: join(process.env.APPDATA, "Slippi Launcher", "playback", "Slippi Dolphin.exe"),
                        meleeIsoPath: config.slippi.melee_iso,
                        batch: true,
                        disableSeekBar: false,
                        readEvents: true,
                        startBuffer: 1,
                        endBuffer: 1
                    });

                    dolphin.dolphinRunning$.subscribe((v) => {
                        running = v;
                    });

                    function write(newData, encoding, callback) {
                        if (encoding !== "buffer") {
                            throw new Error(`Unsupported stream encoding. Expected 'buffer' got '${encoding}'.`);
                        }
                    
                        const dataString = newData.toString();
                        const lines = dataString.split(os.EOL).filter((line) => Boolean(line));
                        lines.forEach((line) => {
                            const [command, value] = line.split(/(?<=^\S+)\s/);
                            this._processCommand(command, value);
                        });
                    
                        callback();
                    };
                    
                    dolphin.output._write = write.bind(dolphin.output)

                    function startDolphin(comboFilePath) {
                        if (!this.options.dolphinPath) {
                          throw new Error("Dolphin path is not set!");
                        }
                    
                        const params = ["-i", comboFilePath];
                        if (this.options.meleeIsoPath) {
                          params.push("-e", this.options.meleeIsoPath);
                        }
                        if (this.options.readEvents) {
                          params.push("--cout");
                        }
                        if (this.options.batch) {
                          params.push("--batch");
                        }
                        if (this.options.disableSeekBar) {
                          params.push("--hide-seekbar");
                        }

                        return spawn(this.options.dolphinPath, params, {detached: true});
                      }

                      
                    dolphin._startDolphin = startDolphin.bind(dolphin);

                    
                    const playbackFile = dolphin.output.playbackStatus$.pipe(
                        filter(({status}) => status === FILE_LOADED),
                        map(({data}) => data?.path)
                    );
                    
                    const playbackStatus = dolphin.output.playbackStatus$.pipe(
                        map(({status}) => status),
                        filter(status => status !== PLAYBACK_START)
                    );
                    
                    combineLatest([playbackStatus, playbackFile, playbackResolve]).pipe(
                        map(([status, file, promises]) => ({status, file, ...promises})),
                        distinct(({status, file}) => `${status}-${file}`)
                    ).subscribe(({status, file, onGameEnd}) => {
                        switch(status) {
                            case PLAYBACK_END:
                                console.log('Game complete. Processing winner...')
        
                                delayPromiseStart(1600, () => changeScene(config.obs.end_scene))
                                    .then(() => delayPromiseStart(600, onGameEnd));
        
                                break;
                        };
                    });
            
                } 
                
                return prepareQueue([])().then(() => !running && new Promise((resolve, reject) => {
                    dolphin.loadJSON(DIRECTORY + DOLPHIN);
                    // Give Dolphin time to launch 
                    setTimeout(() => running ? resolve() : reject(), 5000);
                }));
            },
            ({path, ...gameObj}) => [
                prepareQueue([{path}]),
                new Promise((gameOver) => {
                    playbackResolve.next({onGameEnd: () => processSlp.gameEnd(gameObj).then(() => {
                        console.log('Processed winner.');
                        return delayPromiseStart(1500, async () => gameOver());
                    })})
                })
            ]
        ];
    })();

    const recordNextGame = async ([path, ...restGames]) => {
        if (path) {
            const gameObj = await processSlp.gameStart(path);
            console.log('Updated characters.');
            const [playGame, gameOver] = prepareGame(gameObj);
            await delayPromiseStart(4000, () => Promise.all([playGame(), changeScene(config.obs.start_scene)]));
            console.log(`Playing ${path}...`);
            await gameOver;

            return recordNextGame(restGames);
        }
    };

    return (games) => new Promise((onSetEnd, reject) => {
        launchDolphin()
            .then(() => changeScene(sceneBlank))
            .then(() => delayPromiseStart(1000, () => obs.call('StartRecord')))
            .then(() => changeScene(config.obs.end_scene))
            .then(() => delayPromiseStart(3000, () => recordNextGame(games)))
            .then(() => {
                console.log('No games left in set. Stopping recording...');
                return delayPromiseStart(5000, () => obs.call('StopRecord').catch((_) => onSetEnd()))
            })
            .then(({outputPath}) => delayPromiseStart(2000, () => onSetEnd(outputPath)))
            .catch(reject);
    });
})();