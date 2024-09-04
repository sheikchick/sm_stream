const logging = require("./logging.js");

exports.submitStartggSet = async (data) => {
    const setData = constructGQLSet(data)
    let winnerId = data.winner === 1 ? data.team1.entrantId : data.team2.entrantId;
    GQLSubmit("reportBracketSet", data.setId, winnerId, setData)
        .then(() => {
            logging.log(`Submitted set to start.gg -  ${data.team1.names[0]} vs ${data.team2.names[0]} - ${data.round}`)
        }).catch((e) => {
            logging.error(`Failed to submit set to start.gg -    ${data.team1.names[0]} vs ${data.team2.names[0]} - ${data.round}`)
            return;
            //return due to issues with updating a set that has already been reported, likely not ever needed anyway
            GQLSubmit("updateBracketSet", data.setId, winnerId, setData)
                .then(() => {
                    logging.log(`Updated set on start.gg -    ${data.team1.names[0]} vs ${data.team2.names[0]} - ${data.round}`)
                }).catch((e) => {
                    logging.error(`Failed to submit set to start.gg -    ${data.team1.names[0]} vs ${data.team2.names[0]} - ${data.round}`)
                })
        })
}

const GQLSubmit = (type, setId, winnerId, gameData) => new Promise((resolve, reject) => {
    const submitController = new AbortController()
    const submitTimeout = setTimeout(() => {
        reject();
    }, 5000);
    fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + config["start.gg"]["API key"],
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
				mutation ${type}($setId: ID!, $winnerId: ID!, $gameData: [BracketSetGameDataInput]) {
					${type}(setId: $setId, winnerId: $winnerId, gameData: $gameData) {
						id
						state
					}
				}
			`,
            variables: {
                "setId": setId,
                "winnerId": winnerId,
                "gameData": gameData
            },
        }),
        signal: submitController.signal,
    }).then((res) => res.json())
        .then((result) => {
            clearTimeout(submitTimeout)
            if (typeof result.errors !== "undefined") {
                reject();
            } else {
                resolve();
            }
        })
});

function constructGQLSet(data) {
    let index = 1;
    let set = []
    for (let game of data.games) {
        set.push(constructGQLGame(index, game, data))
    }
    return set
}

function constructGQLGame(gameIndex, data, info) {
    const game = {
        "winnerId": data.winner == 1 ? info.team1.entrantId : info.team2.entrantId,
        "gameNum": gameIndex,
        "entrant1Score": data.team1[0].stocks,
        "entrant2Score": data.team2[0].stocks,
        "stageId": resolveStartggStage(data.stage),
        "selections": [
            {
                "entrantId": info.team1.entrantId,
                "characterId": resolveStartggCharacter(data.team1[0].character)
            },
            {
                "entrantId": info.team2.entrantId,
                "characterId": resolveStartggCharacter(data.team2[0].character)
            }
        ]
    }
    return game
}

/* start.gg has different character indices than we use */
function resolveStartggCharacter(character) {
    switch (character) {
        case "bowser":
            return 1
        case "captainfalcon":
            return 2
        case "donkeykong":
            return 3
        case "drmario":
            return 4
        case "falco":
            return 5
        case "fox":
            return 6
        case "ganondorf":
            return 7
        case "iceclimbers":
            return 8
        case "puff":
        case "jigglypuff":
            return 9
        case "kirby":
            return 10
        case "link":
            return 11
        case "luigi":
            return 12
        case "mario":
            return 13
        case "marth":
            return 14
        case "mewtwo":
            return 15
        case "mrgameandwatch":
        case "gameandwatch": //oops
            return 16
        case "ness":
            return 17
        case "peach":
            return 18
        case "pichu":
            return 19
        case "pikachu":
            return 20
        case "roy":
            return 21
        case "samus":
            return 22
        case "sheik":
            return 23
        case "yoshi":
            return 24
        case "younglink":
            return 25
        case "zelda":
            return 26
        case "empty":
        default:
            return 0
    }
}

/* start.gg has different stage indices than we use */
function resolveStartggStage(stage) {
    switch (stage) {
        case "Mushroom Kingdom":
        case "Mushroom Kingdom I":
            return 1
        case "Princess Peachs Castle":
        case "Princess Peach's Castle":
            return 2
        case "Rainbow Cruise":
            return 3
        case "Yoshis Island":
        case "Yoshi's Island":
            return 4
        case "Yoshi's Story":       //LEGAL
        case "Yoshis Story":
            return 5
        case "Kongo Jungle":
            return 6
        case "Jungle Japes":
            return 7
        case "Great Bay":
            return 8
        case "Temple":
        case "Hyrule Temple":
            return 9
        case "Brinstar":
            return 10
        case "Fountain of Dreams":  //LEGAL
            return 11
        case "Green Greens":
            return 12
        case "Corneria":
            return 13
        case "Venom":
            return 14
        case "Pokemon Stadium":     //LEGAL
        case "Pokémon Stadium":
            return 15
        case "Mute City":
            return 16
        case "Onett":
            return 17
        case "Icicle Mountain":
            return 18
        case "Battlefield":         //LEGAL
            return 19
        case "Final Destination":   //LEGAL
            return 20
        case "Mushroom Kingdom II":
            return 21
        case "Yoshi's Island 64":
            return 22
        case "Kongo Jungle 64":
            return 23
        case "Brinstar Depths":
            return 24
        case "Dream Land":          //LEGAL
        case "Dream Land 64":
        case "Dream Land N64":
            return 25
        case "Poke Floats":
        case "Poké Floats":
            return 26
        case "Big Blue":
            return 27
        case "Fourside":
            return 28
        case "Flat Zone":
            return 29
        case "":
        default:
            return 0
    }
}