const fs = require("fs");
const { tap, map, filter } = require("rxjs/operators");
const { Ports } = require('@slippi/slippi-js')

const slpTools = require("./slptools.js");
const logging = require("./logging.js");
const { readData, writeData, MELEE, MATChRESULT } = require("./data.js");

const { SlpLiveStream, SlpRealTime, ComboFilter, generateDolphinQueuePayload } = require("@vinceau/slp-realtime");



const connectionType = "dolphin"; // Change this to "console" if connecting to a relay or Nintendont

exports.start = (address, port) => {
    let gameTimecode = 0;

    let p1dmg = 0;
    let p2dmg = 0;

    

    //setup realtime connection
    global.livestream = new SlpLiveStream(connectionType, {
        outputFiles: true,
    });
    global.realtime = new SlpRealTime();
    
    livestream.start(address, port)
        .then(() => {
            logging.log("Connected to Slippi");
        })
        .catch(console.error);
    
    livestream.connection.on("statusChange", (status) => {
        if(status === 0) {
            logging.log("Disconnected from Slippi")
        }
    });

    realtime.setStream(livestream)

    /* listeners */

    //GAME START
    realtime.game.start$.subscribe(async (payload) => {
        logging.log("Game started");
        const info = await readData(MELEE);

        const teams = slpTools.getSlippiTeams(payload.players);
        if (teams.length === 2) {
            teams.forEach(([p1, p2 = {}], index) => {
                p1Data = slpTools.getCharacter(p1);
                p2Data = slpTools.getCharacter(p2);
    
                info[`team${index+1}`].players[0] = {
                    ...info[`team${index+1}`].players[0],
                    ...p1Data,
                    port: p1.port
                };
                if (payload.players.length === 4) {
                    info[`team${index+1}`].players[1] = {
                        ...info[`team${index+1}`].players[1],
                        ...p2Data,
                        port: p2.port
                    };
                }
            });
        }
        writeData(MELEE, info);
    });
    
    //GAME END
    realtime.game.end$.subscribe((payload) => {
        logging.log("Game ended");
    });
}




