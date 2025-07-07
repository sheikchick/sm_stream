//and here we go...
const express = require("express");
var favicon = require('serve-favicon');

const hbs = require("hbs");
const cors = require('cors');
const path = require("path");
const fs = require("fs/promises");

const { Ports } = require('@slippi/slippi-js')

const logging = require("./logging.js");
const realtime = require("./realtime.js")
const serverConfig = require("./config.js");
const playerDB = require("./database.js")
const { loadObs } = require("./obs.js");
const recordLive = require("./recordLive.js");
const { recordReplays } = require("./recordReplays.js");
const charInfo = require("./charInfo.js");
const { readData, writeData, updateTournament, MELEE, CREWS, CHARACTER_DATA, DATA_FILES, REPLAY_QUEUE, DIRECTORY } = require("./data.js");
const { watch } = require("./slpWatch.js");
const { getGames } = require("./slpResults.js");
const { checkSetStart, test } = require("./processSlp.js");
const { msToHHmmss } = require("./util.js")

let server;

global.app = express();
global.config;
global.livestream;
global.realtime;

global.gameInProgress = false;
global.timecode = "";
global.currentSet = [];

const layoutsDir = path.join(__dirname, 'views/layouts');

app.set('views', layoutsDir);
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use("/static", express.static(path.join(__dirname, "../static")));
app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/css", express.static(path.join(__dirname, "css")));

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.use(favicon(path.join(__dirname, '../static/favicon.ico')));

app.get("/", (req, res) => {
    res.redirect('/auto');
});

app.post("/update-melee", (req, res) => {
    const info = req.body;
    if (gameInProgress) {
        checkSetStart(info);
    }
    writeData(MELEE, info)
        .then(() => {
            res.sendStatus(200);
        })
        .catch(() => {
            res.sendStatus(500);
        });
});

app.post("/update-melee-crews", (req, res) => {
    const info = req.body;
    writeData(CREWS, info)
        .then(() => {
            res.sendStatus(200);
        })
        .catch(() => {
            res.sendStatus(500);
        });
});

// Endpoints for files in /views/layouts

fs.readdir(layoutsDir, { withFileTypes: true }).then((files) => {
    const hbs = '.hbs';
    files.filter((f) => f.isFile() && f.name.endsWith(hbs)).forEach((f) => {
        const layout = f.name.replace(hbs, '');
        app.get(`/${layout}`, (req, res) => {
            if (layout === "crews") {
                readData(CREWS).then((data) => {
                    res.render(layout, {
                        ...data,
                        apiKey: config["start.gg"]["API key"],
                        obsPort: config["OBS"]["Websocket"]["Port"],
                        obsPassword: config["OBS"]["Websocket"]["Password"],
                    });
                });
            } else {
                readData(MELEE).then((data) => {
                    res.render(layout, {
                        ...data,
                        hideSwapAll: config["Web"]["Hide 'Swap All'"],
                        apiKey: config["start.gg"]["API key"],
                        obsPort: config["OBS"]["Websocket"]["Port"],
                        obsPassword: config["OBS"]["Websocket"]["Password"],
                    });
                });
            }
        })
    })
});

// endpoints for overlays in /views/overlay

/*const overlayDir = path.join(__dirname, 'views', 'overlay');
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
})});*/

// endpoints for data in /data/json

DATA_FILES.forEach((f) => {
    app.get(`/${f}`, (req, res) => {
        res.sendFile(path.join(process.cwd(), DIRECTORY + f), (error) => {
            if (error) {
                if (f === "melee.json") {
                    res.sendFile(path.join(process.cwd(), DIRECTORY + "melee-default.json"), (error) => {
                        if (error) {
                            logging.error(`Error serving melee.json: ${error}`)
                            res.send(`Error serving melee.json`)
                        }
                    })
                } else {
                    res.send(`${req.path} not found`)
                }
            }
        });
    });
});

/* PLAYER DATABASE */

app.post("/database.db", (req, res) => {
    if (!!req.body.full) {
        //override for no filter
        playerDB.getDB((db) => {
            res.json(db)
        })
    } else {
        //will fallback to full DB if filter is incorrect
        playerDB.getFilteredDB((db) => {
            res.json(db)
        })

    }
});

app.post("/getPlayer", (req, res) => {
    if (!!req.body.slug) {
        playerDB.getPlayer(req.body.slug, (db) => {
            res.json(db)
        })
    } else {
        res.sendStatus(400);
    }
});

app.post("/deletePlayer", (req, res) => {
    if (!!req.body.player) {
        playerDB.removePlayer(req.body.player.slug, (err) => {
            if (err) {
                res.sendStatus(200)
            } else {
                logging.log(`Removed player '${req.body.player.name}' from database.`)
                res.sendStatus(200)
            }
        })
    } else {
        res.sendStatus(400);
    }
});

app.post("/updatePlayer", (req, res) => {
    if (!!req.body.player) {
        playerDB.addPlayer(req.body.player, (err, data, updated) => {
            if (err) {
                res.sendStatus(200)
            } else {
                updated ?
                    logging.log(`Updated player '${data}' in database.`)
                    :
                    logging.log(`Added player '${data}' to database.`)
                res.sendStatus(200)
            }
        })
    } else {
        res.sendStatus(400);
    }
});

app.post("/updatePlayers", (req, res) => {
    if (!!req.body.players) {
        let count = 0;
        let promises = []
        for (let player of req.body.players) {
            promises.push(new Promise((resolve, reject) => {
                playerDB.updatePlayer(player, (err, data) => {
                    if (!err) {
                        count++;
                        resolve()
                    } else {
                        reject(err)
                        logging.error(JSON.stringify(player))
                    }
                })
            }))
        }
        Promise.all(promises)
        .then(() => {
            logging.log(`Added/updated ${count} players in the database.`)
            res.sendStatus(200)
        })
        .catch((e) => {
            res.sentStatus(500).send(e)
        })
    } else {
        res.sendStatus(400).send("No player data found in request");
    }
});

app.post("/addPlayers", (req, res) => {
    if (!!req.body.players) {
        count = 0;
        promises = []
        for (let player of req.body.players) {
            console.log(player)
            promises.push(new Promise((res, rej) => {
                playerDB.addIfNotExists(player, (err, data) => {
                    if (!err) {
                        count++;
                    }
                })
            }))
        }
        Promise.all(promises).then(() => {
            logging.log(`Added ${count} players to the database.`)
            res.sendStatus(200)
        })
    } else {
        res.sendStatus(400);
    }
});

app.post("/addPlayer", (req, res) => {
    if (!!req.body.player) {
        playerDB.addPlayer(req.body.player, (err, data) => {
            if (err) {
                logging.error(err)
                res.sendStatus(500)
            } else {
                logging.log(`Added player '${data}' to database.`)
                res.sendStatus(200)
            }
        })
    } else {
        res.sendStatus(400);
    }
});

app.post("/saveFilter", (req, res) => {
    if (!!req.body.players) {
        playerDB.createFilter(req.body.players, req.body.slug, (err) => {
            if (err) {
                logging.error(err)
                res.sendStatus(500)
            } else {
                logging.log(`Filtered database using slug '${req.body.slug}'.`)
                config["start.gg"]["Database filter"] = req.body.slug
                serverConfig.write(config)
                    .catch(() => {
                        logging.error("Error updating config with new database filter.")
                    });
                res.sendStatus(200)
            }
        })
    } else {
        res.sendStatus(400);
    }
});



/* TOURNAMENT SET DATA */

app.get(`/tournaments`, (req, res) => {
    fs.readdir(path.join(process.cwd(), DIRECTORY, "tournaments"), { withFileTypes: true }).then((files) => {
        const json = '.json';
        const data = files.filter((f) => f.isFile() && f.name.endsWith(json));
        const output = []
        data.forEach((element) => {
            output.push(element.name)
        })
        res.json(output)
    });
})

app.get(`/tournaments/*`, (req, res) => {
    res.sendFile(path.join(process.cwd(), DIRECTORY, `${req.path}`), (error) => {
        if (error) {
            res.sendStatus(404);
        }
    });
})

/* CONFIG ENDPOINTS */

app.all("/config", (req, res) => {
    res.json(config);
});

app.all("/write_config", (req, res) => {
    serverConfig.write(req.body)
        .then(() => {
            res.sendStatus(200);
        }).catch(() => {
            res.sendStatus(500);
        });
});

/* lIVE-RECORDING ENDPOINTS */
app.post("/save_clip", (req, res) => {
    //save horizontal clip
    recordLive.saveClip("", req.body.timecode, req.body?.tournament || "default")
        .then(() => {
            recordLive.saveClip("vertical", req.body.timecode, req.body?.tournament || "default")
                .then(() => {
                    res.sendStatus(200);
                }).catch((e) => {
                    res.sendStatus(207);
                });
        }).catch((e) => {
            res.sendStatus(500);
        });
});

app.get("/recording_status", (req, res) => {
    res.json({ recording_status: recordLive.getRecordingStatus() });
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
        }).catch((e) => {
            logging.error(`Failed to update set - ${e}`)
            res.sendStatus(500);
        })
});

app.all("/player_character", (req, res) => {
    readData(CHARACTER_DATA)
        .then((data) => {
            if (data.hasOwnProperty(req.body.id)) {
                res.json({
                    "name": data[req.body.id].name || "",
                    "character": data[req.body.id].character || "",
                    "colour": data[req.body.id].colour || "",
                })
            } else {
                res.sendStatus(404)
            }
        })
        .catch(() => res.sendStatus(500));
});

/* MULTI-SET REPORTING ENDPOINTS */
app.all("/get-wii-games", (req, res) => {
    getGames(req.body.directory, req.body.index, req.body.amount)
        .then((games) => {
            res.json(games)
        })
        .catch(() => {
            res.sendStatus(500)
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
    const { query: { character, colour } } = req;
    res.sendFile(charInfo.getCsp(character, colour));
});

app.get(`/stock`, (req, res) => {
    const { query: { character, colour, overlay } } = req;
    res.sendFile(charInfo.getStock(character, colour, overlay));
});

app.get(`/pm/css`, (req, res) => {
    res.sendFile(charInfo.getPMCss(req.query.character));
});

app.get(`/pm/csp`, (req, res) => {
    res.sendFile(charInfo.getPMCsp(req.query.character));
});

app.get(`/pm/stock`, (req, res) => {
    res.sendFile(charInfo.getPMStock(req.query.character));
});

//fete stock icons
app.get(`/fete`, (req, res) => {
    const { query: { character, colour, overlay } } = req;
    res.sendFile(charInfo.getFeteStock(character, colour, overlay));
});

app.get(`/vs`, (req, res) => {
    const { query: { character, colour, side } } = req;
    res.sendFile(charInfo.getVs(character, colour, side));
});

/* START APP */

async function startApp() {
    logging.log("Starting app")
    server?.close();
    await loadObs()
    server = app.listen(config.Web.Port, () => {
        logging.log("Web application listening on port " + config.Web.Port)
    });
    //file read
    watch(config['Slippi']['Directory'], true);
    //realtime
    //realtime.start("127.0.0.1", Ports.DEFAULT);

}

process.on('exit', function () {
    logging.error("Exiting program...")
});

if (require.main == module) {
    serverConfig.read(startApp);
}