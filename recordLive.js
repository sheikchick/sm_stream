const path = require("path");
const fs = require("fs/promises");

const { readData, INFO } = require("./data.js");

let current_timestamp = "";
let recording_status = false;

exports.saveRecording = async (timecode) => {
    if(recording_status) {
        //end recording
        const {recordDirectory} = await obs.call('GetRecordDirectory')
        console.log("record directory " + recordDirectory)
        const input_filename = await getLatestRecordingFile(recordDirectory);
        if (input_filename) {
            const data = await readData(INFO);
            const filename = `${data.Player1.name} vs ${data.Player2.name} - ${data.round}`.replace(/[/\\?%*:|"<>]/g, '');
            const command = `ffmpeg -i "${input_filename}" -ss ${current_timestamp} -to ${timecode} -c copy "${filename}.mp4"\n`;

            const thumb_data = `
            ${data.Player1.name}
            ${data.Player1.character}
            ${data.Player1.name_dubs}
            ${data.Player1.character_dubs}
            ${data.Player1.score}
            ${data.Player2.name}
            ${data.Player2.character}
            ${data.Player2.name_dubs}
            ${data.Player2.character_dubs}
            ${data.Player2.score}
            ${data.round}
            ${data.tournament}
            ${data.is_doubles}
            \n`;

            await fs.appendFile(`${recordDirectory}/sets.bat`, command, "utf8");
            await fs.appendFile(`${recordDirectory}/sets.csv`, thumb_data, "utf8");
        }
        current_timestamp = "";
        recording_status = false;
    } else {
        //start recording
        current_timestamp = timecode;
        recording_status = true;
    }
    return this.getRecordingStatus();
};

exports.saveClip = (timecode) => obs.call('GetRecordDirectory').then((value) => {
    const clipDirectory = `${value.recordDirectory}/clips`;
    return getLatestRecordingFile(clipDirectory).then((input_filename) => {
        if (input_filename) {
            const regex = /\d\d(?::\d\d)+/;
            const noMillis = timecode.match(regex)?.[0].split(":") || [];
            const seconds = (noMillis.pop() || 0) - 30;
            const minutes = (noMillis.pop() || 0) - (seconds < 0 | 0);
            const hours = (noMillis.pop() || 0) - (minutes < 0 | 0);
            const ss = hours < 0
                ? "00:00:00"
                : `${`${hours}`.padStart(2, '0')}:${`${(60 + minutes) % 60}`.padStart(2, '0')}:${`${(60 + seconds) % 60}`.padStart(2, '0')}`;

            const command = `ffmpeg -i "${input_filename}" -ss ${ss} -to ${timecode} -c copy "${timecode.replaceAll(":", "-")}.mp4"\n`;
            return fs.appendFile(`${clipDirectory}/clips.bat`, command, "utf8");
        }
    });
});

/**
 * recording_status is a let, so we use !! to return its value rather than its reference
 * so that it cannot be modified from outwith this file.
 */ 
exports.getRecordingStatus = () => !!recording_status;

const getLatestRecordingFile = (directory) => fs.mkdir(directory, {recursive: true})
    .then(() => fs.readdir(directory))
    .then((files) => Promise.all(files.map(async (f) => {
        const stat = await fs.stat(path.join(directory, f))
        return [
            f,
            stat.mtimeMs
        ]
    })))