const {readFile, writeFile} = require("fs/promises");
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
        .catch(() => logging.log(`Failed to open ${file}`))
    : {};