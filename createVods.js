import fs from 'fs';

createVods(process.argv[2])

function createVods(vodDir) {
    file = fs.readFileSync(vodDir)
    jsonInput = JSON.parse(file);

    vodDirSplit = vodDir.split("\\")
    dir = vodDirSplit.slice(0, -1).join("\\");

    for (let set of jsonInput) {
        team1 = set.team1.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        team2 = set.team2.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        if(set.team1.names.length > 2 && set.team2.names.length > 2) {
            if(game.team1.names[1] != "" && set.team2.names[1] != "") {
                team1 = `${team1} & ${set.team1.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
                team2 = `${team2} & ${set.team2.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
            }
        }
        tournament = vodDirSplit[vodDirSplit.length-1].replaceAll("_", " ").replaceAll(".json", "")
        let command = `ffmpeg -ss ${set.timecodes[0]}ms -to ${set.timecodes[1]}ms -i "${set.vod}" -c copy -avoid_negative_ts make_zero "${tournament}\\${team1} vs ${team2} - ${set.round} - ${tournament}.mp4"\n`
        fs.appendFileSync(`${dir}\\${vodDirSplit[vodDirSplit.length-1].replaceAll(".json", "")}.bat`, command);
    }
    if (!fs.existsSync(`${dir}\\${tournament}`)){
        fs.mkdirSync(`${dir}\\${tournament}`)
    }
    console.log(`Saved all to ${dir}\\${vodDirSplit[vodDirSplit.length-1].replaceAll(".json", ".bat")}`)
}

/**
 * Creates all the data required for automatic creation of thumbnails
 * @param {*} vodDir 
 */
function createThumbnails(vodDir) {
    file = fs.readFileSync(vodDir)
    jsonInput = JSON.parse(file);

    vodDirSplit = vodDir.split("\\")
    dir = vodDirSplit.slice(0, -1).join("\\");

    for (let set of jsonInput) {
        team1 = set.team1.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        team2 = set.team2.names[0].replace(/[^a-zA-Z0-9 ]/g, "");
        if(set.team1.names.length > 2 && set.team2.names.length > 2) {
            if(set.team1.names[1] != "" && set.team2.names[1] != "") {
                team1 = `${team1} & ${set.team1.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
                team2 = `${team2} & ${set.team2.names[1].replace(/[^a-zA-Z0-9 ]/g, "")}`
            }
        }

        tournament = vodDirSplit[vodDirSplit.length-1].replaceAll("_", " ").replaceAll(".json", "")
        team1Char = `${set.games[0].team1[0].character}\\${set.games[0].team1[0].colour}`
        team2Char = `${set.games[0].team2[0].character}\\${set.games[0].team2[0].colour}`
        round = set.round

        console.log(`${team1} ${team2} ${team1Char} ${team2Char} ${tournament} ${round}`)
    }
}