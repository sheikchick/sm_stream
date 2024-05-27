const path = require("path");
const fs = require("fs/promises");
const ffmpeg = require("fluent-ffmpeg")

const logging = require("./logging.js");
const { readData, INFO } = require("./data.js");

const { delayPromiseStart, ms_to_hhmmss } = require("./util.js")

const FILE_NOT_FOUND = "FILE NOT FOUND";
let setStartedAt = "";

exports.saveRecording = async (filename, start, end) => {
    await rejectIfObsNotRecording();
    //end recording

    const {recordDirectory} = await obs.call('GetRecordDirectory');
    const [data, vod] = await Promise.all([
        readData(INFO),
        this.getLatestRecordingFile(recordDirectory)
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

    const vod = await this.getLatestRecordingFile(recordDirectory);

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

exports.takeScreenshot = (() => {
    const attempt = async (timecode, screenshot_dir, filename, dimensions) => {
        await rejectIfObsNotRecording();
    
        const {recordDirectory} = await obs.call('GetRecordDirectory');
    
        const timestamp = ms_to_hhmmss(timecode-100);
    
        const vod = await this.getLatestRecordingFile(recordDirectory);
    
        const vod_dir = path.join(recordDirectory, vod)
    
        if (vod === FILE_NOT_FOUND) {
            // maybe put this in the onEnd() since it's talking past tense
            const message = "Unable to find VoD. Command saved with placeholder filename";
            logging.error(message)
        }
    
        return new Promise((resolve, reject) => {
            ffmpeg(vod_dir)
                .on('end', function(err, stdout, stderr) {
                    err && logging.error(`takeScreenshot(): ${err}`);
                    stderr && logging.error(stderr);
                    if(stdout.includes("File ended prematurely")) {
                        reject();
                    } else {
                        logging.log(`Screenshot produced for ${vod} at "static/img/screenshots/${filename}.png"`);
                        resolve();
                    }
                })
                .screenshot({
                    timestamps: [timestamp],
                    folder: path.join("static/img/screenshots/", screenshot_dir),
                    filename: `${filename}.png`,
                    size: dimensions,
                    update: true
                });
        });
    };
    
    const tries = 20;

    return (timecode, screenshot_dir, filename, dimensions) => {
        let p = Promise.reject();
        for(let i = 0; i < tries; i++) {
            p = p.catch(() => delayPromiseStart(500, () => attempt(timecode, screenshot_dir, filename, dimensions)));
        }
        return p;
    };
})();

/*exports.takeScreenshot3 = (() => {
    const attempt = (timecode, screenshot_dir, filename, dimensions) => {
        return rejectIfObsNotRecording().then(() => {
            return obs.call('GetRecordDirectory').then(({recordDirectory}) => {
                const timestamp = ms_to_hhmmss(timecode-100);
                return this.getLatestRecordingFile(recordDirectory).then((vod) => {
                    const vod_dir = path.join(recordDirectory, vod)
                
                    if (vod === FILE_NOT_FOUND) {
                        // maybe put this in the onEnd() since it's talking past tense
                        const message = "Unable to find VoD. Command saved with placeholder filename";
                        logging.error(message)
                    }
                
                    return new Promise((resolve, reject) => {
                        ffmpeg(vod_dir)
                            .on('end', function(err, stdout, stderr) {
                                err && logging.error(err);
                                stderr && logging.error(stderr);
                                if(stdout.includes("File ended prematurely")) {
                                    logging.debug("File ended prematurely");
                                    reject();
                                } else {
                                    logging.log(`Screenshot produced for ${vod} at "static/img/screenshots/${filename}.png"`);
                                    resolve();
                                }
                            })
                            .screenshot({
                                timestamps: [timestamp],
                                folder: path.join("static/img/screenshots/", screenshot_dir),
                                filename: `${filename}.png`,
                                size: dimensions,
                                update: true
                            });
                    });
                });
            });
        });
    };

    return (timecode, screenshot_dir, filename, dimensions) => {
        const tries = 5;
        let p = Promise.reject();
        for(let i=0; tries; i++) {
            p = p.catch(() => delayPromiseStart(1000, () => attempt(timecode, screenshot_dir, filename, dimensions)));
        }
        return p;
    };
  })();*/

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

exports.getRecordingStatus = () => !!global.manual_timecode;

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