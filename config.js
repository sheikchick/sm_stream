const fs = require("fs/promises");
const toml = require("toml");

const configPath = './config.toml';

exports.parseConfig = () => fs.readFile(configPath)
    .then((f) => {
        global.config = toml.parse(f);
    });

exports.writeConfig = (data) => fs.readFile(configPath)
    .then((f) => {
        console.log(toml.compile(data))
    });