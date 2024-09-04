const path = require("path");
const fs = require("fs/promises");
const ffmpeg = require("fluent-ffmpeg")

const logging = require("./logging.js");
const { readData, INFO } = require("./data.js");

const { getTimecode, getDirectory } = require("./obs.js");

const { msToHHmmss: msToHHmmss } = require("./util.js")

const FILE_NOT_FOUND = "FILE NOT FOUND";

exports.saveClip = async (filename, timecode) => {
    await rejectIfObsNotRecording();

    const recordDirectory = path.join(
        (await obs.call('GetRecordDirectory')).recordDirectory,
        'clips'
    );

    const vod = await this.getLatestRecordingFile(recordDirectory);

    const startMs = this.timecodeOffset(timecode, -(parseInt(config["OBS"]["Clip Length"])*1000));
    const startTimestamp = msToHHmmss(startMs);
    const endTimestamp = msToHHmmss(timecode);

    const command = `ffmpeg -ss ${startTimestamp} -to ${endTimestamp} -i "${vod}" -c copy -avoid_negative_ts make_zero "${endTimestamp}.mp4"\n`; //put -ss before -i to speed up ffmpeg
    const batFile = path.join(recordDirectory, filename + '.bat');

    await fs.appendFile(batFile, command, "utf8");
    logging.log(`Command to extract clip from vertical VoD saved to ${batFile}`);

    if (vod === FILE_NOT_FOUND) {
        const message = "Unable to find VoD. Command saved with placeholder filename";
        logging.error(message)
        //throw new Error(message); // Throw simply to return a 500
    } 
};

/** Offset timecode value, capping at 0
 * 
 * @param {*} timecode  timecode value in ms
 * @param {*} value     offset in ms
 * @returns 
 */
exports.timecodeOffset = (timecode, value) => {
    return Math.max(0, timecode + value)
}

const rejectIfObsNotRecording = () => new Promise((resolve, reject) => {
    obs?.call('GetRecordStatus').then(({outputActive}) => {
        outputActive
            ? resolve()
            : reject();
    });
});

exports.getRecordingStatus = () => !!global.timecodeManual;

exports.getLatestRecordingFile = (directory) => fs.mkdir(directory, {recursive: true})
    .then(() => fs.readdir(directory))
    .then((files) => Promise.all(files.map(async (f) => [
        f,
        (await fs.stat(path.join(directory, f))).mtimeMs
    ])))
    .then((files) => files.reduce(
        (acc, cur) => (cur[0].endsWith('.mkv') && cur[1] > acc[1])
            ? cur
            : acc
        , [FILE_NOT_FOUND, 0]
    )[0]);