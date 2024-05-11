const fs = require("fs/promises");
const toml = require("toml");

const configPath = './config.toml';

exports.read = (onConfigRead) => fs.readFile(configPath)
    .then((f) => {
        global.config = toml.parse(f);
        onConfigRead();
    });