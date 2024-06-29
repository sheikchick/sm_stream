//and here we go...
const express = require("express");
const hbs = require("hbs");
const cors = require('cors');
const path = require("path");
const open = require('open');
const fs = require("fs/promises");

const logging = require("./logging.js");
const serverConfig = require("./config.js");
const { loadObs } = require("./obs.js");
const recordLive = require("./recordLive.js");
const { recordReplays } = require("./recordReplays.js");
const charInfo = require("./charInfo.js");
const { readData, writeData, updateTournament, INFO, DATA_FILES, REPLAY_QUEUE, DIRECTORY } = require("./data.js");
const { watch } = require("./slpWatch.js");
const { checkSetStart } = require("./processSlp.js");
const { msToHHmmss } = require("./util.js")

const { trayIcon, mainWindow } = require("./gui.js")

const tray = trayIcon();
tray.show();
global.tray = tray;

let server;

global.app = express();

global.gameInProgress = false;

global.config;

global.recordingStatusManual = false;
global.timecodeManual = "";

global.recordingStatusAuto = false;
global.timecodeAuto = "";

global.currentSet = [];

const layoutsDir = path.join(__dirname, 'views', 'layouts');

const tournamentDataDir = path.join(__dirname, 'data', 'json', 'tournaments');


app.set('views', layoutsDir);
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use("/static", express.static("static"));
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.redirect('/auto');
});

app.all("/favicon.ico", (req, res) => {
    fs.readFile("static/favicon.ico").then((f) => {
        res.json(f);
    });
});

app.post("/update", (req, res) => {
    const info = req.body;
    if(gameInProgress) {
        checkSetStart(info);
    }
    writeData(INFO, info)
        .then(() => {
            res.sendStatus(200);
        })
        .catch(() => {
            res.sendStatus(500);
        });
});

// Endpoints for files in /views/layouts

fs.readdir(layoutsDir, {withFileTypes: true}).then((files) => {
    const hbs = '.hbs';
    files.filter((f) => f.isFile() && f.name.endsWith(hbs)).forEach((f) => {
        const layout = f.name.replace(hbs, '');
        app.get(`/${layout}`, (req, res) => {
            readData(INFO).then((data) => {
                res.render(layout, {
                    ...data,
                    apiKey: config.startgg.key,
                    obsPort: config.obs.port,
                    obsPassword: config.obs.password
                });
            });
        })
    })
});

// endpoints for overlays in /views/overlay

const overlayDir = path.join(__dirname, 'views', 'overlay');
fs.readdir(overlayDir, {withFileTypes: true}).then((overlays) => {
    const html = '.html'
    overlays
        .filter((f) => f.isDirectory())
        .forEach(({name}) => {
            const currentOverlay = `overlay/${name}`;
            const currentDir = path.join(overlayDir, name);
            fs.readdir(currentDir, {withFileTypes: true}).then((f) => {
                f
                    .filter((f) => f.isFile() && f.name.endsWith(html))
                    .forEach((f) => {
                        const name = f.name.replace(html, '');
                        const filePath = path.join(currentDir, f.name);
                        app.get(`/${currentOverlay}/${name}`, (req, res) => {
                            res.sendFile(filePath);
                        });
                    })
            });
})});

// endpoints for data in /data/json

DATA_FILES.forEach((f) => {
    app.get(`/${f}`, (req, res) => {
        res.sendFile(path.join(__dirname, DIRECTORY + f));
    });
});

/* TOURNAMENT SET DATA */

app.get(`/tournaments`, (req, res) => {
    fs.readdir(tournamentDataDir, {withFileTypes: true}).then((files) => {
        const json = '.json';
        const data = files.filter((f) => f.isFile() && f.name.endsWith(json));
        const output = []
        data.forEach((element) => {
            output.push(element.name)
        })
        res.json(output)
    });
})

fs.readdir(tournamentDataDir, {withFileTypes: true}).then((files) => {
    const json = '.json';
    files.filter((f) => f.isFile() && f.name.endsWith(json)).forEach((f) => {
        const tournament = f.name;
        app.get(`/tournaments/${tournament}`, (req, res) => {
            res.sendFile(path.join(tournamentDataDir, `${tournament}`));
        })
    })
});

/* CONFIG ENDPOINTS */

app.all("/get_config", (req, res) => {
    parseConfig()
        .then(() => {
            res.json(config);
        }).catch(() => {
            res.sendStatus(500);
        });
});

app.all("/write_config", (req, res) => {
    writeConfig(res.json)
        .then(() => {
            res.sendStatus(200);
        }).catch(() => {
            res.sendStatus(500);
        });
});

/* lIVE-RECORDING ENDPOINTS */

app.all("/save_recording", (req, res) => {
    if(timecodeManual == "") {
        timecodeManual = req.body.timecode

        fs.unlink('static/img/screenshots/manual/1.png')
        .catch((e) => {
            if(e.code === 'ENOENT') {
                // file doens't exist
            } else {
                logging.error(e)
            }
        });

        recordLive.takeScreenshot(req.body.timecode, "manual/", "1", "960x540").catch((e)=>{
            logging.error(`Failed to create screenshot 1.png`)
        })
        
        fs.unlink('static/img/screenshots/manual/2.png')
            .catch((e) => {
                if(e.code === 'ENOENT') {
                    // file doens't exist
                } else {
                    logging.error(e)
                }
            });
        res.json({recording_status : true});
    } else {
        recordLive.saveRecording("sets", timecodeManual, req.body.timecode)
            .then(() => {
                recordLive.takeScreenshot(req.body.timecode, "manual/", "2", "960x540").catch((e)=>{
                    logging.error(`Failed to create screenshot 2.png`)
                })
                timecodeManual = ""
                res.json({recordingStatus: recordingStatusManual});
            }).catch((f) => {
                console.error(f)
                res.sendStatus(500);
            });
    }
});

app.post("/save_clip", (req, res) => {
    recordLive.saveClip(req.body.timecode)
        .then(() => {
            res.sendStatus(200);
        }).catch((e) => {
            logging.error(e);
            res.sendStatus(500);
        });
});

app.get("/recording_status", (req, res) => {
    res.json({recording_status: recordLive.getRecordingStatus()});
});

app.get("/recording_timecode", (req, res) => {
    const timecode = timecodeManual ? msToHHmmss(timecodeManual) : "";
    res.json({timecode: timecode})
})

app.all("/take_screenshot", (req, res) => {
    recordLive.takeVodScreenshot(req.body.timecode, "set/", req.body.index, "960x540", req.body.vod)
        .then(() => {
            res.sendStatus(200);
        }).catch((e)=>{
            logging.error(`Failed to create screenshot - ${e}`)
            res.sendStatus(500);
        })
});

/* RECORDING SET ENDPOINTS */

app.all(`/${REPLAY_QUEUE}`, (req, res) => {
    readData(REPLAY_QUEUE)
        .then((queue) => res.json(queue))
        .catch(() => res.sendStatus(500));
});

app.post("/replay-queue-update", (req, res) => {
    writeData(REPLAY_QUEUE, req.body)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.post("/replay-record", (req, res) => {
    readData(REPLAY_QUEUE).then((queue) => {
        recordReplays(queue);
        res.sendStatus(200);
    }).catch((e) => {
        logging.log(e)
        res.sendStatus(500)
    });
});

/* START.GG SETS */

app.all("/update_set", (req, res) => {
    updateTournament(req.body.data, req.body.index, req.body.tournament)
        .then(() => {
            res.sendStatus(200);
        }).catch((e)=>{
            logging.error(`Failed to update set - ${e}`)
            res.sendStatus(500);
        })
});

/* CHARACTER INFO ENDPOINTS */

app.get("/character/:characterName", (req, res) => {
    res.json(charInfo.getCharacterByName(req.params.characterName));
});

app.get("/saga", (req, res) => {
    res.sendFile(charInfo.getSaga(req.query.character));
});

app.get(`/css`, (req, res) => {
    res.sendFile(charInfo.getCss(req.query.character));
});

app.get(`/csp`, (req, res) => {
    const {query: {character, colour}} = req;
    res.sendFile(charInfo.getCsp(character, colour));
});

app.get(`/stock`, (req, res) => {
    const {query: {character, colour, overlay}} = req;
    res.sendFile(charInfo.getStock(character, colour, overlay));
});

app.get(`/vs`, (req, res) => {
    const {query: {character, colour, side}} = req;
    res.sendFile(charInfo.getVs(character, colour, side));
});

/* START APP */

async function startApp() {
    server?.close();
    await loadObs();
    server = app.listen(config.web.port, () => {
        logging.log("Web application listening on port " + config.web.port)
        open(`http://127.0.0.1:${config.web.port}`)
    });
    watch(config.slippi.directory);
}

if(require.main == module) {
    serverConfig.read(startApp);
}