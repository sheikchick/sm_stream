const path = require("path");
const fs = require("fs/promises");
const ffmpeg = require("fluent-ffmpeg")

const logging = require("./logging.js");
const { readData, INFO } = require("./data.js");

const FILE_NOT_FOUND = "FILE NOT FOUND";
let setStartedAt = "";

exports.saveRecording = async (filename, start, end) => {
    await rejectIfObsNotRecording();
    //end recording

    const {recordDirectory} = await obs.call('GetRecordDirectory');
    const [data, vod] = await Promise.all([
        readData(INFO),
        getLatestRecordingFile(recordDirectory)
    ]);

    const videoName = `${data.Player1.name} vs ${data.Player2.name} - ${data.round}`.replace(/[/\\?%*:|"<>]/g, '');
    const command = `ffmpeg -i "${vod}" -ss ${ms_to_hhmmss(start)} -to ${ms_to_hhmmss(end)} -c copy "${videoName}.mp4"\n`; //put -ss before -i to speed up ffmpeg
    const batFile = path.join(recordDirectory, filename + '.bat');

    await fs.appendFile(batFile, command, "utf8");
    logging.log(`Command to extract set from VoD saved to ${batFile}`);
    
    setStartedAt = "";
    if (vod === FILE_NOT_FOUND) {
        const message = "Unable to find VoD. Command saved with placeholder filename";
        logging.error(message)
        throw new Error(message); // Throw simply to return a 500
    } 

    return this.getRecordingStatus();
};

exports.saveClip = async (filename, timecode) => {
    await rejectIfObsNotRecording();

    const recordDirectory = path.join(
        (await obs.call('GetRecordDirectory')).recordDirectory,
        'clips'
    );
    const vod = await getLatestRecordingFile(recordDirectory);

    const startMs = this.timecodeOffset(timecode, -(config.obs.clip_length*1000));
    const startTimestamp = ms_to_hhmmss(startMs);
    const endTimestamp = ms_to_hhmmss(timecode);

    const command = `ffmpeg -i "${vod}" -ss ${startTimestamp}ms -to ${endTimestamp}ms -c copy "${endTimestamp}.mp4"\n`; //put -ss before -i to speed up ffmpeg
    const batFile = path.join(recordDirectory, filename + '.bat');

    await fs.appendFile(batFile, command, "utf8");
    logging.log(`Command to extract clip from vertical VoD saved to ${batFile}`);

    if (vod === FILE_NOT_FOUND) {
        const message = "Unable to find VoD. Command saved with placeholder filename";
        logging.error(message)
        throw new Error(message); // Throw simply to return a 500
    } 
};

exports.takeScreenshot = async (timecode, filename, dimensions) => {
    await rejectIfObsNotRecording();

    var dir_arr = process.argv[1].split("\\")
    dir_arr.pop()
    var dir = dir_arr.join("\\")

    const {recordDirectory} = await obs.call('GetRecordDirectory');

    const timestamp = ms_to_hhmmss(timecode);

    const vod = await getLatestRecordingFile(recordDirectory);

    const vod_dir = path.join(recordDirectory, vod)

    if (vod === FILE_NOT_FOUND) {
        const message = "Unable to find VoD. Command saved with placeholder filename";
        logging.error(message)
    }
    logging.debug(vod_dir)

    ffmpeg(vod_dir)
        .on('end', function() {
            logging.log(`Screenshot produced for ${vod} at timestamp ${timestamp} ${dir}`);
        })
        .screenshots({
            timestamps: [timecode/1000],
            folder: "static/img/",
            filename: filename,
            size: dimensions
        });
}

const ms_to_hhmmss = (ms) => {
    let seconds = ms / 1000;
    
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;

    const minutes = parseInt(seconds / 60);
    seconds = seconds % 60;

    return `${String(hours).padStart(2, '')}:${String(minutes).padStart(2, '')}:${String(seconds).padStart(2, '')}`;
};

exports.timecodeOffset = (timecode, value) => {
    return Math.max(0, timecode + value)
}

const rejectIfObsNotRecording = () => new Promise((resolve, reject) => {
    obs.call('GetRecordStatus').then(({outputActive}) => {
        outputActive
            ? resolve()
            : reject();
    });
});

exports.getRecordingStatus = () => !!setStartedAt;

const getLatestRecordingFile = (directory) => fs.mkdir(directory, {recursive: true})
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