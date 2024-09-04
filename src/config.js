const fs = require("fs/promises");
const logging = require("./logging.js");
const { loadObs } = require("./obs.js");
const { watch } = require("./slpWatch.js");

const configPath = './config.json';
const FORMAT = "utf8";

exports.read = (onConfigRead) => fs.readFile(configPath)
    .then((f) => {
        global.config = JSON.parse(f);
        onConfigRead();
    });

exports.write = async (data) => {
    fs.writeFile(configPath, JSON.stringify(data), FORMAT)
        .then(() => {
            logging.log("Config updated")
            let dir = global.config["Slippi"]["Directory"]
            let ws = global.config["OBS"]["Websocket"]
            global.config = data;
            if(ws["Host"] !== data["OBS"]["Websocket"]["Host"] 
                || ws["Port"] !== data["OBS"]["Websocket"]["Port"] 
                || ws["Password"] !== data["OBS"]["Websocket"]["Password"]) {
                loadObs()
            }
            if(ws !== data['Slippi']['Directory']) {
                watch(config['Slippi']['Directory']);
            }
        });
}