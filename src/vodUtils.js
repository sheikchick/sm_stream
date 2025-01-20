const fs = require("fs");
const path = require("path");
const util = require("./util.js");
var _ = require("underscore")._;

async function main() {
    try {
        if(process.argv.length < 4) {
            console.log("USAGE: node vodUtils.js [vods | thumbnails] [tournament_file.json] [webpage_url]")
            process.exit()
        }
        
        switch(process.argv[2]) {
            case "vods":
                console.log("Creating VOD commands:")
                createVods(path.join(process.cwd(), "../data/json/tournaments", process.argv[3], "set_data.json"), process.argv[3]);
                break;
            case "thumbnails":
                console.log("Creating thumbnails:")
                if(process.argv.length < 4) {
                    console.log("USAGE: node vodUtils.js [vods | thumbnails] [tournament_file.json] [webpage_url]")
                    process.exit()
                }
                break;
            case "timestamps":
                console.log("Creating YouTube timestamps:")
                createTimestamps(process.argv[3])
                break;
            default:
                console.log("USAGE: node vodUtils.js [vods | thumbnails | timestamps] [tournament_file.json]")
                process.exit()
        }
    }
    catch(err) {
      console.log(err);
    }
}

main()

function createVods(vodDir, tournamentName) {
    file = fs.readFileSync(vodDir)
    jsonInput = JSON.parse(file);

    vodDirSplit = vodDir.split("\\")
    tournament = tournamentName.replaceAll("_", " ")
    dir = vodDirSplit.slice(0, -1).join("\\");
    fs.appendFileSync(`${dir}\\${vodDirSplit[vodDirSplit.length-1].replaceAll(".json", "")}.bat`, `mkdir "${tournament.replace(/[^a-zA-Z0-9 ]/g, "")}"\n`);
    for (let set of jsonInput) {
        team1 = set.team1.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        team2 = set.team2.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        if(set.team1.names.length > 2 && set.team2.names.length > 2) {
            if(game.team1.names[1] != "" && set.team2.names[1] != "") {
                team1 = `${team1} & ${set.team1.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
                team2 = `${team2} & ${set.team2.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
            }
        }
        let command = `ffmpeg -ss ${set.timecodes[0]}ms -to ${set.timecodes[1]}ms -i "${set.vod}" -c copy -avoid_negative_ts make_zero "${team1} vs ${team2} – ${tournament} – ${set.round}.mp4"\n`
        fs.appendFileSync(`${dir}\\${vodDirSplit[vodDirSplit.length-1].replaceAll(".json", "")}.bat`, command);
    }
    console.log(`Saved all to ${dir}\\${vodDirSplit[vodDirSplit.length-1].replaceAll(".json", ".bat")}`)
}

function createTimestamps(vodDir) {
    file = fs.readFileSync(vodDir)
    jsonInput = JSON.parse(file);

    vodDirSplit = vodDir.split("\\")
    tournament = vodDirSplit[vodDirSplit.length-1].replaceAll("_", " ").replaceAll(".json", "")
    dir = vodDirSplit.slice(0, -1).join("\\");
    fs.appendFileSync(`${dir}\\${vodDirSplit[vodDirSplit.length-1].replaceAll(".json", "")}.bat`, `mkdir "${tournament.replace(/[^a-zA-Z0-9 ]/g, "")}"\n`);
    for (let set of jsonInput) {
        team1 = set.team1.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        team2 = set.team2.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        if(set.team1.names.length > 2 && set.team2.names.length > 2) {
            if(game.team1.names[1] != "" && set.team2.names[1] != "") {
                team1 = `${team1} & ${set.team1.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
                team2 = `${team2} & ${set.team2.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
            }
        }
        let command = `${util.msToHHmmss(set.timecodes[0])} – ${team1} vs ${team2} – ${set.round}`
        console.log(command)
    }
}

function mostPlayedCharacter(games, player) {
    const counter = {}; 
    games.forEach((el) => {
        if (counter[el[`team${player}`][0].character]) {
            counter[el[`team${player}`][0].character] += 1;
        } else {
            counter[el[`team${player}`][0].character] = 1;
        }
    })
    console.log(counter)
    var char = _.max(Object.keys(counter), function (o) { return counter[o]; });
    let color = "red"
    games.forEach((el) => {
        if(el[`team${player}`][0].character === char) {
            color = el[`team${player}`][0].colour;
        }
    })
    console.log({'character': char, 'color': color})
    return({'character': char, 'color': color}); //should never proc
}

/**
 * Creates all the data required for automatic creation of thumbnails
 * @param {*} vodDir 
 */
async function createThumbnails(vodDir, url, capture) {
    vodDir = path.win32.normalize(vodDir)
    file = fs.readFileSync(vodDir)
    jsonInput = JSON.parse(file);

    let vodDirSplit = vodDir.split("\\")
    dir = vodDirSplit.slice(0, -1).join("\\");

    tournament = vodDirSplit[vodDirSplit.length-1].replaceAll("_", " ").replaceAll(".json", "")

    thumbnailDir = `thumbnails\\${tournament}`

    if (!fs.existsSync(thumbnailDir)){
        fs.mkdirSync(thumbnailDir)
    }

    for (let set of jsonInput) {
        team1 = (set.team1.names[0].replace(" (L)", "")).replace(/[^a-zA-Z0-9 ]/g, "");
        /*if(team1 !== "Ayda Fox") {
            continue;
        }*/
        team2 = (set.team2.names[0].replace(" (L)", "")).replace(/[^a-zA-Z0-9 ]/g, "");
        if(set.team1.names.length > 2 && set.team2.names.length > 2) {
            if(set.team1.names[1] != "" && set.team2.names[1] != "") {
                team1 = `${team1} & ${(set.team1.names[1].replace(" (L)", "")).replace(/[^a-zA-Z0-9 ]/g, "")}`
                team2 = `${team2} & ${(set.team2.names[1].replace(" (L)", "")).replace(/[^a-zA-Z0-9 ]/g, "")}`
            }
        }
        t1CharInfo = mostPlayedCharacter(set.games, 1)
        t2CharInfo = mostPlayedCharacter(set.games, 2)
        team1Char = t1CharInfo.character
        team1Color = t1CharInfo.color
        team2Char = t2CharInfo.character
        team2Color = t2CharInfo.color
        tournament = vodDirSplit[vodDirSplit.length-1].replaceAll("_", " ").replaceAll(".json", "")
        round = set.round

        params = `?p1=${team1}&p2=${team2}&p1char=${team1Char}&p1color=${team1Color}&p2char=${team2Char}&p2color=${team2Color}&tournament=${tournament}&round=${round}`

        filename = `${team1} vs ${team2} - ${round} - ${tournament}`

        await capture.default.file(`${url}${params}`, `${thumbnailDir}\\${filename}.png`, {
            waitForElement: "#signal",
            timeout: 10,
            width: 1280,
            height: 720,
            overwrite: true,
        });

        console.log(`Thumbnail created for ${params}`)
    }
}