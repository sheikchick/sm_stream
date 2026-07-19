const path = require("path");
const { readFile, writeFile } = require("fs/promises");
const logging = require("./logging");

const TOURNAMENTSETS = 

exports.MELEE = 'melee.json';
exports.CREWS = 'crews.json';
exports.CURRENTSET = 'current-set.json';
exports.MATCHRESULT = 'match-result.json';
exports.DOLPHIN = 'dolphin.json';
exports.REPLAYQUEUE = 'replay-queue.json';
exports.TOP8 = 'top8.json';
exports.TOURNAMENTSETS = 'tournament-sets.json';

exports.DATAFILES = [
    this.MELEE,
    this.CREWS,
    this.CURRENTSET,
    this.MATCHRESULT,
    this.DOLPHIN,
    this.REPLAYQUEUE,
    this.TOP8,
    exports.TOURNAMENTSETS
];

exports.DIRECTORY = "data/json/";

const FORMAT = "utf8";

exports.writeData = async (file, data) => this.DATAFILES.includes(file) &&
    writeFile(this.DIRECTORY + file, file === this.MELEE ? JSON.stringify(this.fixMeleeJSON(data)) : JSON.stringify(data), FORMAT);

exports.readData = async (file) => this.DATAFILES.includes(file)
    ? readFile(this.DIRECTORY + file, FORMAT)
        .then((data) => json === JSON.parse(data))
        .catch((e) => {
            logging.log(`Failed to open ${file} - ${e}`)
            return {};
        })
        .then((json) => file === this.MELEE ? this.fixMeleeJSON(json) : json)
    : {};

exports.updateTournament = async (data, index, tournamentFilename) => {
    const tournamentPath = path.join("data/json/tournaments/", tournamentFilename);
    const jsonFile = path.join("data/json/tournaments/", tournamentPath, TOURNAMENTSETS);
    readFile(jsonFile, FORMAT)
        .then((readFile) => {
            var parsedFile = JSON.parse(readFile)
            parsedFile[index] = (data)
            writeFile(jsonFile, JSON.stringify(parsedFile), FORMAT).then(() => {
                logging.log(`Modified match data "${data.team1.names[0]} vs ${data.team2.names[0]}" in /${tournamentPath}/`)
            })
            .catch((e) => {
                const message = `Failed to write ${jsonFile}: ${e}`;
                console.error(message)
                throw new Error(message);
            });
        })
        .catch(() => {
            const message = `File ${jsonFile} doesn't exist`;
            console.error(message)
            throw new Error(message);
        });
};

exports.fixMeleeJSON = (info) => {
    let newInfo = {
        "team1": {
            "players": [
                {
                    "slug": info?.team1?.players?.[0]?.slug || "",
                    "name": info?.team1?.players?.[0]?.name || "Player 1",
                    "character": info?.team1?.players?.[0]?.character || "fox",
                    "colour": info?.team1?.players?.[0]?.colour || "red",
                    "prefix": info?.team1?.players?.[0]?.prefix || "",
                    "pronouns": info?.team1?.players?.[0]?.pronouns || "",
                    "country": info?.team1?.players?.[0]?.country || "EU",
                    "port": info?.team1?.players?.[0]?.port || 1
                },
                {
                    "slug": info?.team1?.players?.[1]?.slug || "",
                    "name": info?.team1?.players?.[1]?.name || "Player 4",
                    "character": info?.team1?.players?.[1]?.character || "falco",
                    "colour": info?.team1?.players?.[1]?.colour || "red",
                    "prefix": info?.team1?.players?.[1]?.prefix || "",
                    "pronouns": info?.team1?.players?.[1]?.pronouns || "",
                    "country": info?.team1?.players?.[1]?.country || "EU",
                    "port": info?.team1?.players?.[1]?.port || 2
                }
            ],
            "score": info?.team1?.score || 0,
        },
        "team2": {
            "players": [
                {
                    "slug": info?.team2?.players?.[0]?.slug || "",
                    "name": info?.team2?.players?.[0]?.name || "Player 2",
                    "character": info?.team2?.players?.[0]?.character || "sheik",
                    "colour": info?.team2?.players?.[0]?.colour || "blue",
                    "prefix": info?.team2?.players?.[0]?.prefix || "",
                    "pronouns": info?.team2?.players?.[0]?.pronouns || "",
                    "country": info?.team2?.players?.[0]?.country || "EU",
                    "port": info?.team2?.players?.[0]?.port || 1
                },
                {
                    "slug": info?.team2?.players?.[1]?.slug || "",
                    "name": info?.team2?.players?.[1]?.name || "Player 3",
                    "character": info?.team2?.players?.[1]?.character || "peach",
                    "colour": info?.team2?.players?.[1]?.colour || "blue",
                    "prefix": info?.team2?.players?.[1]?.prefix || "",
                    "pronouns": info?.team2?.players?.[1]?.pronouns || "",
                    "country": info?.team2?.players?.[1]?.country || "EU",
                    "port": info?.team2?.players?.[1]?.port || 2
                }
            ],
            "score": info?.team2?.score || 0
        },
        "casters": [
            {
                "name": info?.casters?.[0].name || "",
                "pronouns": info?.casters?.[0].pronouns || "",
            },
            {
                "name": info?.casters?.[1].name || "",
                "pronouns": info?.casters?.[1].pronouns || "",
            }
        ],
        "startgg": {
            "entrant1": {
                "id": info?.startgg?.entrant1?.id || "",
                "name": info?.startgg?.entrant1?.name || "",
                "score": info?.startgg?.entrant1?.score || ""
            },
            "entrant2": {
                "id": info?.startgg?.entrant2?.id || "",
                "name": info?.startgg?.entrant2?.name || "",
                "score": info?.startgg?.entrant2?.score || ""
            },
            "round": info?.startgg?.round || "",
            "setId": info?.startgg?.setId || "",
            "startggSwapped": info?.startgg?.startggSwapped || false,
        },
        "seatOrdering": info?.seatOrdering || [ "1","2","3","4" ],
        "round": info?.round || "",
        "tournament": info?.tournament || "",
        "isDoubles": info?.isDoubles || false,
        "bestOf": info?.bestOf || 5,
        "isHandwarmers": info?.isHandwarmers || false
    }
    return newInfo;
}

exports.fixCrews = (crew) => {
    let newCrews = {
        "crew1": {
			"name": crew?.crew1?.name || "Crew 1",
			"activePlayer": {
				"name": crew?.crew1?.activePlayer?.name || "Player 1",
				"character": crew?.crew1?.activePlayer?.character || "fox",
				"colour": crew?.crew1?.activePlayer?.colour || "red",
                "prefix": crew?.crew1?.activePlayer?.prefix || "",
				"pronouns": crew?.crew1?.activePlayer?.pronouns || "",
				"country": crew?.crew1?.activePlayer?.country || "UK",
				"port": crew?.crew1?.activePlayer?.port || 1
			},
            "players": [
                {
                    "name": crew?.crew1?.players?.[0]?.name || "Player 1",
                    "alive": crew?.crew1?.players?.[0]?.alive || true
                },
				{
                    "name": crew?.crew1?.players?.[1]?.name || "Player 2",
                    "alive": crew?.crew1?.players?.[1]?.alive || true
                },
				{
                    "name": crew?.crew1?.players?.[2]?.name || "Player 3",
                    "alive": crew?.crew1?.players?.[2]?.alive || true
                },
				{
                    "name": crew?.crew1?.players?.[3]?.name || "Player 4",
                    "alive": crew?.crew1?.players?.[3]?.alive || true
                },
				{
                    "name": crew?.crew1?.players?.[4]?.name || "Player 5",
                    "alive": crew?.crew1?.players?.[4]?.alive || true
                }
            ],
            "score": crew?.crew1?.score || 0,
        },
        "crew2": {
			"name": crew?.crew2?.name || "Crew 2",
			"activePlayer": {
				"name": crew?.crew2?.activePlayer?.name || "Player 1",
				"character": crew?.crew2?.activePlayer?.character || "fox",
				"colour": crew?.crew2?.activePlayer?.colour || "red",
                "prefix": crew?.crew2?.activePlayer?.prefix || "",
				"pronouns": crew?.crew2?.activePlayer?.pronouns || "",
				"country": crew?.crew2?.activePlayer?.country || "UK",
				"port": crew?.crew2?.activePlayer?.port || 1
			},
            "players": [
                {
                    "name": crew?.crew2?.players?.[0]?.name || "Player 1",
                    "alive": crew?.crew2?.players?.[0]?.alive || true
                },
				{
                    "name": crew?.crew2?.players?.[1]?.name || "Player 2",
                    "alive": crew?.crew2?.players?.[1]?.alive || true
                },
				{
                    "name": crew?.crew2?.players?.[2]?.name || "Player 3",
                    "alive": crew?.crew2?.players?.[2]?.alive || true
                },
				{
                    "name": crew?.crew2?.players?.[3]?.name || "Player 4",
                    "alive": crew?.crew2?.players?.[3]?.alive || true
                },
				{
                    "name": crew?.crew2?.players?.[4]?.name || "Player 5",
                    "alive": crew?.crew2?.players?.[4]?.alive || true
                }
            ],
            "score": crew?.crew2?.score || 0,
        },
        "casters": [
            {
                "name": crew?.casters?.[0].name || "",
                "pronouns": crew?.casters?.[0].pronouns || "",
            },
            {
                "name": crew?.casters?.[1].name || "",
                "pronouns": crew?.casters?.[1].pronouns || "",
            }
        ],
        "seatOrdering": info?.seatOrdering || [ "1","2","3","4" ],
        "round": info?.round || "",
        "tournament": info?.tournament || ""
    }
    return newCrews;
}