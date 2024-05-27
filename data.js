const path = require("path");
const { readFile, writeFile } = require("fs/promises");
const logging = require("./logging");

exports.INFO = 'info.json';
exports.MATCH_RESULT = 'match_result.json';
exports.DOLPHIN = 'dolphin.json';
exports.REPLAY_QUEUE = 'replay-queue.json';
exports.TOP_8 = 'top_8.json';

exports.DATA_FILES = [
    this.INFO,
    this.MATCH_RESULT,
    this.DOLPHIN,
    this.REPLAY_QUEUE,
    this.TOP_8
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

exports.updateTournament = async (data, index, tournament_filename) => {
    const json_file = path.join("data/json/tournaments/", tournament_filename);
    readFile(json_file, FORMAT)
        .then((read_file) => {
            var parsed_file = JSON.parse(read_file)
            parsed_file[index] = (data)
            writeFile(json_file, JSON.stringify(parsed_file), FORMAT).then(() => {
                logging.log(`Modified match data "${data.tags[0]} vs ${data.tags[1]}" to ${tournament_filename}`)
            })
            .catch((e) => {
                const message = `Failed to write ${json_file}: ${e}`;
                logging.error(message)
                throw new Error(message);
            });
        })
        .catch(() => {
            const message = `File ${json_file} doesn't exist`;
            logging.error(message)
            throw new Error(message);
        });
};