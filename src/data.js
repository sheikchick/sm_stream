const path = require("path");
const { readFile, writeFile } = require("fs/promises");
const logging = require("./logging");

exports.INFO = 'info.json';
exports.MATCH_RESULT = 'match_result.json';
exports.DOLPHIN = 'dolphin.json';
exports.REPLAY_QUEUE = 'replay-queue.json';
exports.TOP_8 = 'top_8.json';
exports.REGIONS = 'regions.json';

exports.DATA_FILES = [
    this.INFO,
    this.MATCH_RESULT,
    this.DOLPHIN,
    this.REPLAY_QUEUE,
    this.TOP_8,
    this.REGIONS
];

exports.DIRECTORY = "data/json/";

const FORMAT = "utf8";

exports.writeData = async (file, data) => this.DATA_FILES.includes(file) &&
    writeFile(this.DIRECTORY + file, JSON.stringify(data), FORMAT);

exports.readData = async (file) => this.DATA_FILES.includes(file)
    ? readFile(this.DIRECTORY + file, FORMAT)
        .then((data) => JSON.parse(data))
        .catch((e) => logging.log(`Failed to open ${file} - ${e}`))
    : {};

exports.updateTournament = async (data, index, tournamentFilename) => {
    const jsonFile = path.join("data/json/tournaments/", tournamentFilename);
    readFile(jsonFile, FORMAT)
        .then((readFile) => {
            var parsedFile = JSON.parse(readFile)
            parsedFile[index] = (data)
            writeFile(jsonFile, JSON.stringify(parsedFile), FORMAT).then(() => {
                logging.log(`Modified match data "${data.team1.names[0]} vs ${data.team2.names[0]}" to ${tournamentFilename}`)
            })
            .catch((e) => {
                const message = `Failed to write ${jsonFile}: ${e}`;
                console.error(message)
                throw new Error(message);
            });
        })
        .catch(() => {
            const message = `File ${jsonFile} doesn't exist`;
            console.error(message)
            throw new Error(message);
        });
};