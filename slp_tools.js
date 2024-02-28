const { SlippiGame } = require("@slippi/slippi-js");

function currentTime() {
    var date = new Date();
    return(date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0") + ":" + date.getSeconds().toString().padStart(2,"0") + "." + date.getMilliseconds().toString().padStart(3,"0"))
}

exports.isValidGame = function(game) {
    settings = game.getSettings();
    //check for CPU players
    for(let player of settings.players) {
        if(player.type == 1) {
            console.log(currentTime() + " INFO: Game included CPU player, ignoring.");
            return false;
        }
    }
    //check if bomb rain enabled (is sudden death)
    if(settings.gameInfoBlock.bombRainEnabled) {
        console.log(currentTime() + " INFO: Game is 'Sudden Death', ignoring.");
        return false;
    }
    stats = game.getStats();
    //if game less than 45 seconds
    if(stats.playableGameCount < 2700) {
        console.log(currentTime() + " INFO: Game less than 45 seconds, ignoring.");
        return false;
    }
    //if neither character dealt over 120%

    if(settings.players.length == 2) {
        if(stats.overall[0].totalDamage < 120 && stats.overall[1].totalDamage < 120) {
            if(stats.overall[0].totalDamage == 0 && stats.overall[1].totalDamage == 0) {
                var damage_dealt = getDamageDealt(game);
                var over_120 = damage_dealt.some((e) => {
                    return e > 120;
                });
                if(!over_120) {
                    console.log(currentTime() + " INFO: No player dealt over 120%, ignoring.");
                    return false;
                }
            } 
        }
    } else if (settings.players.length == 4) {
        var damage_dealt = getDamageDealt(game);
        var over_120 = damage_dealt.some((e) => {
            return e > 120;
        });
        if(!over_120) {
            console.log(currentTime() + " INFO: No player dealt over 120%, ignoring.");
            return false;
        }
    } else {
        console.log(currentTime() + " INFO: Irregular number of players (not 2 or 4), ignoring.");
        return false;
    }
    return true;
}

function getDamageDealt(game) {
    // Get game settings – stage, characters, etc
    const frames = game.getFrames();
    var stocks = [];
    var last_percent = [];
    var percent = [];
    for(x = 0; x < frames[0].players.length; x++) {
        stocks.push(4);
        last_percent.push(0);
        percent.push(0);
    }
    var i = 0
    for(const frame of Object.values(frames)) {
        i++;
        for(x = 0; x < frame["players"].length; x++) {
            if(frame["players"][x]) {
                player = frame["players"][x]["post"];
                if(player["stocksRemaining"] < stocks[x] || i >= Object.keys(frames).length) {
                    stocks[x]--;
                    percent[x] += player["percent"]
                }
            }
        }
        last_percent[x] = player["percent"]
    }
    return percent;
}

exports.getSlippiTeams = (players) => {  
    const teams = Object.values(players.reduce((acc, cur) => ({
        ...acc,
        [cur.teamId]: [
            ...acc[cur.teamId] || [],
            cur
        ]
    }), {}));
  
    return (teams.length === 1
        ? teams[0].map(p => [p])
        : teams.map(t => t.sort((a, b) => a.playerIndex > b.playerIndex ? 1 : -1))
    ).sort((a, b) => a[0].playerIndex > b[0].playerIndex ? 1 : -1)
};

/**
 * Get winner of a game of singles. Likely deprecated by next slippi-js update
 * @param {SlippiGame} game 
 * @returns winner and position
 */
exports.getSinglesWinner = function(game) {
    const {players} = game.getSettings();
    const playersLatestFrame = game.getLatestFrame().players;

    const [p1_data, p2_data] = players.map(({playerIndex}) => {
        const p_data = playersLatestFrame[playerIndex]?.post || {stocksRemaining: 0, percent: 0};
        return {stocks: p_data.stocksRemaining, damage: p_data.percent};
    });

    const winner = getWinner(p1_data, p2_data);
    return winner
        ? [players[winner - 1]].map(({playerIndex}) => ({playerIndex, position: 0}))
        : [];
}

exports.getDoublesWinner = function(game) {
    const {players} = game.getSettings();

    const p1Id = players[0].teamId;
    const teams = players.reduce((teams, player) => {
        // P1 is not necessarily in team 1 in Slippi.
        teams[player.teamId === p1Id | 0].push(player.playerIndex);
        return teams;
    }, [[], []]).reverse();

    if (teams.some(t => t.length !== 2)) {
        return [];
    }

    const playersLatestFrame = game.getLatestFrame().players;

    const [t1_data, t2_data] = teams.reduce((acc, team) => {
        acc.push(team.reduce((acc, player) => {
            const {stocksRemaining, percent} = playersLatestFrame[player]?.post || 
                {stocksRemaining: 0, percent: 0};
            return {
                stocks: acc.stocks + stocksRemaining,
                damage: acc.damage + stocksRemaining ? percent : 0
            };
        }, {stocks: 0, damage: 0}));
        return acc;
    }, []);

    const winner = getWinner(t1_data, t2_data);
    return winner
        ? teams[winner - 1].map(playerIndex => ({playerIndex, position: 0}))
        : [];
}

function getWinner(p1, p2) {
    if (p1.stocks > p2.stocks) {return 1}
    else if (p2.stocks > p1.stocks) {return 2}
    else {
        if(p1.damage > p2.damage) {return 2}
        else if(p2.damage > p1.damage) {return 1}
        else {return 0}
    }
}

exports.matchStage = function(id) {
    switch(id) {
        case 2: //LEGAL
            return "Fountain of Dreams"
        case 3: //LEGAL
            return "Pokemon Stadium"
        case 4:
            return "Princess Peach's Castle"
        case 5:
            return "Kongo Jungle"
        case 6:
            return "Brinstar"
        case 7:
            return "Corneria"
        case 8: //LEGAL
            return "Yoshis Story"
        case 9:
            return "Onett"
        case 10:
            return "Mute City"
        case 11:
            return "Rainbow Cruise"
        case 12:
            return "Jungle Japes"
        case 13:
            return "Great Bay"
        case 14:
            return "Hyrule Temple"
        case 15:
            return "Brinstar Depths"
        case 16:
            return "Yoshi's Island"
        case 17:
            return "Green Greens"
        case 18:
            return "Fourside"
        case 19:
            return "Mushroom Kingdom I"
        case 20:
            return "Mushroom Kingdom II"
        case 22:
            return "Venom"
        case 23:
            return "Poke Floats"
        case 24:
            return "Big Blue"
        case 25:
            return "Icicle Mountain"
        case 27:
            return "Flat Zone"
        case 28: //LEGAL
            return "Dream Land N64"
        case 29:
            return "Yoshi's Island N64"
        case 30:
            return "Kongo Jungle N64"
        case 31: //LEGAL
            return "Battlefield"
        case 32: //LEGAL
            return "Final Destination"
        default:
            return ""
    }
}

const characters = {
    0: {
        character: "mario",
        colours: [
            "red",
            "yellow",
            "black",
            "blue",
            "green"
        ]
    },
    1: {
        character: "fox",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    2: {
        character: "captainfalcon",
        colours: [
            "original",
            "black",
            "red",
            "white",
            "green",
            "blue"
        ]
    },
    3: {
        character: "donkeykong",
        colours: [
            "original",
            "dark",
            "red",
            "blue",
            "green"
        ]
    },
    4: {
        character: "kirby",
        colours: [
            "original",
            "yellow",
            "blue",
            "red",
            "green",
            "white"
        ]
    },
    5: {
        character: "bowser",
        colours: [
            "green",  
            "red",  
            "green",
            "black"
        ]
    },
    6: {
        character: "link",
        colours: [
            "green",
            "red",
            "blue",
            "black",
            "white"
        ]
    },
    7: {
        character: "sheik",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "white"
        ]
    },
    8: {
        character: "ness",
        colours: [
            "red",
            "yellow",
            "blue",
            "green"
        ]
    },
    9: {
        character: "peach",
        colours: [
            "red",
            "gold",
            "white",
            "blue",
            "green"
        ]
    },
    10: {
        character: "iceclimbers",
        colours: [
            "blue",
            "green",
            "yellow",
            "red"
        ]
    },
    12: {
        character: "pikachu",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    13: {
        character: "samus",
        colours: [
            "red",
            "pink",
            "dark",
            "green",
            "blue"
        ]
    },
    14: {
        character: "yoshi",
        colours: [
            "green",
            "red",
            "blue",
            "yellow",
            "pink",
            "cyan"
        ]
    },
    15: {
        character: "jigglypuff",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "gold"
        ]
    },
    16: {
        character: "mewtwo",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    17: {
        character: "luigi",
        colours: [
            "green",
            "white",
            "blue",
            "red"
        ]
    },
    18: {
        character: "marth",
        colours: [
            "blue",
            "red",
            "green",
            "black",
            "white"
        ]
    },
    19: {
        character: "zelda",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "white"
        ]
    },
    20: {
        character: "younglink",
        colours: [
            "green",
            "red",
            "blue",
            "white",
            "black"
        ]
    },
    21: {
        character: "drmario",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "black"
        ]
    },
    22: {
        character: "falco",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    23: {
        character: "pichu",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    24: {
        character: "gameandwatch",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    25: {
        character: "ganondorf",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "purple"
        ]
    },
    26: {
        character: "roy",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "gold"
        ]
    }
};

const charactersByExternalId = [
    2, // captainfalcon
    3, // donkeykong
    1, // fox
    24, // gameandwatch
    4, // kirby
    5, // bowser
    6, // link
    17, // luigi
    0, // mario
    18, // marth
    16, // mewtwo
    8, // ness
    9, // peach
    12, // pikachu
    10, // iceclimbers
    15, // jigglypuff
    13, // samus
    14, // yoshi
    19, // zelda
    7, // sheik
    22, // falco
    20, // younglink
    21, // drmario
    26, // roy
    23, // pichu
    25 // ganondorf
].map((id) => characters[id]);

exports.getCharacter = (playerSettings, playersLatestFrame) => {
    const character = characters[playersLatestFrame[playerSettings.playerIndex]?.post.internalCharacterId];

    return character
        ? {character: character.character, colour: character.colours[playerSettings.characterColor]}
        : {};
};

exports.getCharacterByExternalId = ({characterId, characterColor}) => {
    const character = charactersByExternalId[characterId];

    return character
        ? {character: character.character, colour: character.colours[characterColor]}
        : {};
}