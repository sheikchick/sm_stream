const path = require("path");
const fs = require("fs/promises");

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
    const command = `ffmpeg -i "${vod}" -ss ${start} -to ${end} -c copy "${videoName}.mp4"\n`;
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

    const videoName = timecode.replaceAll(":", "-");
    const command = `ffmpeg -i "${vod}" -ss ${subtractFromTimescode(timecode)} -to ${timecode} -c copy "${videoName}.mp4"\n`;
    const batFile = path.join(recordDirectory, filename + '.bat');

    await fs.appendFile(batFile, command, "utf8");
    logging.log(`Command to extract set from VoD saved to ${batFile}`);

    if (vod === FILE_NOT_FOUND) {
        const message = "Unable to find VoD. Command saved with placeholder filename";
        logging.error(message)
        throw new Error(message); // Throw simply to return a 500
    } 
};

const subtractFromTimescode = (() => {
    const regex = /\d\d(?::\d\d)+/;
    const startOfVod = "00:00:00";
    return (timecode) => {
        const noMillis = timecode.match(regex)?.[0].split(":") || [];
        const seconds = (noMillis.pop() || 0) - 30;
        const minutes = (noMillis.pop() || 0) - (seconds < 0 | 0);
        const hours = (noMillis.pop() || 0) - (minutes < 0 | 0);
        return hours < 0
            ? startOfVod
            : `${`${hours}`.padStart(2, '0')}:${`${(60 + minutes) % 60}`.padStart(2, '0')}:${`${(60 + seconds) % 60}`.padStart(2, '0')}`;
    };
})();

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