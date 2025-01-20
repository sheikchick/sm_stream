const path = require("path");
const fs = require("fs/promises");
const ffmpeg = require("fluent-ffmpeg")

const logging = require("./logging.js");
const { readData, INFO } = require("./data.js");

const { getTimecode, getDirectory } = require("./obs.js");

const { msToHHmmss: msToHHmmss } = require("./util.js")

const FILE_NOT_FOUND = "FILE NOT FOUND";

const createFfmpeg = () => {
    let path = config?.["OBS"]?.["ffmpeg Path"]
    let ffmpegInstance = new ffmpeg()
    logging.debugLog(path)
    console.log(config)
    if(typeof path !== "undefined") {
        if(path !== "") {
            logging.debugLog("Using custom ffmpeg path")
            ffmpegInstance.setFfmpegPath(path)
        }
    }
    return ffmpegInstance
}

exports.createVod = (data, tournamentName) => {
    try {
        const outputPath = config?.["OBS"]?.["VODs"]?.["Output path"] || path.join(process.cwd(), "vods")
        const tournamentFolder = tournamentName ? tournamentName.replace(/ /g, "_") : 'default'
        const tournamentDir = path.join(outputPath, tournamentFolder)
        p1Name = `${data.team1.names[0]}${data.isDoubles || false ? ` & ${data.team1.names[1]}` : ""}`
        p2Name = `${data.team2.names[0]}${data.isDoubles || false ? ` & ${data.team2.names[1]}` : ""}`
        setName = `${p1Name} vs ${p2Name} – ${tournamentName} – ${data.round.startsWith("Pools") ? "Pools" : data.round}.mp4`
        startTimestamp = msToHHmmss(data.timecodes[0])
        endTimestamp = msToHHmmss(data.timecodes[1])

        fs.mkdir(tournamentDir, { recursive: true })
        .then(() => {
            const command = `ffmpeg -ss ${startTimestamp} -to ${endTimestamp} -i "${data.vod}" -c copy -avoid_negative_ts make_zero "${setName}"\n`; //put -ss before -i to speed up ffmpeg
            const batFile = path.join(tournamentDir, `${tournamentFolder}_vods.bat`);
            //ensure bat is processed using utf8, repeated codes don't matter
            fs.appendFile(batFile, "chcp 65001\n", "utf8").then(() => {
                fs.appendFile(batFile, command, "utf8").then(() => {
                    vodOutputPath = path.join(tournamentDir, setName)
                    saveVodFile(data.vod, startTimestamp, msToHHmmss(data.timecodes[1] - data.timecodes[0]), vodOutputPath)
                })
            })
        })
    } catch(e) {
        logging.error("Cannot create VOD")
        logging.error(e)
    }
}

const saveVodFile = (vod, startTimestamp, videoLength, outputPath) => new Promise((resolve, reject) => {
    if (config["OBS"]["VODs"]["Auto-record"] !== "true") {
        logging.debugLog(`Auto-record disabled, not saving VOD`);
        resolve();
    }
    var command = createFfmpeg();
    command
        .input(vod)
        .setStartTime(startTimestamp)
        .setDuration(videoLength)
        .outputOptions(
            [
                '-c copy',
                '-avoid_negative_ts make_zero'
            ]
        )
        .on("start", function(commandLine) {
            logging.log(`Creating VOD output for '${setName}'`);
            logging.debugLog(commandLine)
        })
        .on("error", function(err) {
            logging.error(err)
        })
        .on('end', async function(err) {
            if (!err) {
                logging.log(`VOD output completed, saved to '${outputPath}'`)
            } else {
                logging.error(err)
            }
        })
        .saveToFile(outputPath)
});

exports.saveClip = (folderName, timecode, tournamentName) => new Promise((resolve, reject) => {
    rejectIfObsNotRecording()
    .then(() => {
        const outputPath = config?.["OBS"]?.["VODs"]?.["Output path"] || path.join(process.cwd(), "vods")
        const tournamentFolder = tournamentName ? tournamentName.replace(/ /g, "_") : 'default'
        const tournamentDir = path.join(outputPath, tournamentFolder)
        obs.call('GetRecordDirectory')
        .then((response) => {
            const recordDirectory = path.join(response.recordDirectory, folderName);
            this.getLatestRecordingFile(recordDirectory)
            .then((vod) => {
                const clipLength = msToHHmmss(parseInt(config["OBS"]["Clip Length"]) * 1000)
                const startTimestamp = msToHHmmss(this.timecodeOffset(timecode, -(parseInt(config["OBS"]["Clip Length"]) * 1000)));
                const endTimestamp = msToHHmmss(timecode);
            
                const command = `ffmpeg -ss ${startTimestamp} -to ${endTimestamp} -i "${path.join(recordDirectory, vod)}" -c copy -avoid_negative_ts make_zero "${timecode}.mp4"\n`; //put -ss before -i to speed up ffmpeg
                const batFile = path.join(tournamentDir, "clips", folderName, `${tournamentFolder}_clips.bat`);
                fs.mkdir(path.join(tournamentDir, "clips", folderName), { recursive: true })
                .then(() => {
                    //ensure bat is processed using utf8, repeated codes don't matter
                    fs.appendFile(batFile, "chcp 65001\n", "utf8").then(() => {
                        fs.appendFile(batFile, command, "utf8")
                        .then(() => {
                            logging.log(`Command to extract clip from vertical VoD saved to ${batFile}`);
                            if (vod === FILE_NOT_FOUND) {
                                const message = "Unable to find VoD. Command saved with placeholder filename";
                                logging.error(message)
                                //throw new Error(message); // Throw simply to return a 500
                            } else {
                                logging.debugLog("Attempting to saveClipFile")
                                saveClipFile(path.join(recordDirectory, vod), startTimestamp, clipLength, path.join(tournamentDir, "clips", folderName, `${timecode}.mp4`))
                                .then(() => {
                                    resolve();
                                })
                                .catch(() => {
                                    reject()
                                })
                            }
                        })
                    })
                })
            })
        })
    })
});

const saveClipFile = (vod, startTimestamp, videoLength, outputPath) => new Promise((resolve, reject) => {
    if (config["OBS"]["VODs"]["Auto-record"] !== "true") {
        logging.debugLog(`Auto-record disabled, not saving clip`);
        resolve();
    }
    var command = createFfmpeg();
    command
        .input(vod)
        .setStartTime(startTimestamp)
        .setDuration(videoLength)
        .outputOptions(
            [
                '-c copy',
                '-avoid_negative_ts make_zero'
            ]
        )
        .on("start", function(commandLine) {
            logging.log(`Creating clip...`)
            logging.debugLog(commandLine)
        })
        .on("error", function(err) {
            logging.error(err)
            reject()
        })
        .on('end', async function(err) {
            if (!err) {
                logging.log(`Clip output completed, saved to '${outputPath}'`)
                resolve()
            } else {
                logging.error(err)
                reject()
            }
        })
        .saveToFile(outputPath)
});

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
    obs?.call('GetRecordStatus').then(({ outputActive }) => {
        outputActive
            ? resolve()
            : reject();
    });
});

exports.getRecordingStatus = () => !!global.timecodeManual;

exports.getLatestRecordingFile = (directory) => new Promise((resolve, reject) => {
    if(directory) {
        fs.mkdir(directory, { recursive: true })
        .then(() => fs.readdir(directory))
        .then((files) => Promise.all(files.map(async (f) => [
                f,
                (await fs.stat(path.join(directory, f))).mtimeMs
        ])))
        .then((files) => {
            latestFile = files.reduce(
                (acc, cur) => (cur[0].endsWith('.mkv') && cur[1] > acc[1])
                    ? cur
                    : acc
                , [FILE_NOT_FOUND, 0]
            )[0];
            resolve(latestFile)
        })
    } else {
        resolve("PLACEHOLDER")
    }
})