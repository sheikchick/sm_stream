const { SlippiGame } = require("@slippi/slippi-js");
const logging = require("./logging");

exports.isValidGame = (() => {
    const VALID_DAMAGE = 120;

    function getDamageDealt(game) {
        const frames = game.getFrames();
        let frame = frames[0];
        const acc = frame.players.map(({post: {stocksRemaining}}) => ({stocksRemaining, totalDamage: 0, percent: 0}));
        let i = 1;
        // Not doing for frame in frames because there are a number of frames with a negative index
        // that we get to skip by simply starting at index 0.
        do {
            frame.players.forEach(({post}) => {
                const player = acc[post.playerIndex];
                if (post.stocksRemaining < acc[post.playerIndex].stocksRemaining) {
                    player.stocksRemaining--;
                    player.totalDamage = player.totalDamage + player.percent;
                }
                player.percent = post.percent;
            });
            frame = frames[i++];
        } while (frame && acc.every(({percent}) => percent < VALID_DAMAGE));
        return acc.map(({percent}) => percent);
    }
    
    return function(game) {
        settings = game.getSettings();

        for(let player of settings.players) {
            if(player.type == 1) {
                logging.log("No contest: Game included CPU player.");
                return false;
            }
        }

        if(settings.gameInfoBlock.bombRainEnabled) {
            logging.log("No contest: Game is 'Sudden Death'.");
            return false;
        }
        const stats = game.getStats();

        if(stats.playableGameCount < 2700) {
            logging.log("No contest: Game less than 45 seconds.");
            return false;
        }

        if (settings.players.length % 2) {
            logging.log("No contest: odd number of players.");
            return false;
        }

        const correctDamage = stats.overall.some(({totalDamage}) => totalDamage > 0)
            ? stats.overall.map(({totalDamage}) => totalDamage)
            : getDamageDealt(game);

        if (correctDamage.every((damage) => damage < VALID_DAMAGE)) {
            logging.log(`No contest: No player dealt ${VALID_DAMAGE}% or more.`);
            return false;
        }

        return true;
    }
})();

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

exports.getWinner = (game) => {
    const winner = game.getWinners();
    if(winner.length === 0) {
        logging.log("Replay does not list winner. Calculating manually...");
        return game.getSettings().players.length === 2
            ? getSinglesWinner(game)
            : getDoublesWinner(game);
    }
    return winner;
};

/**
 * Get winner of a game of singles. Likely deprecated by next slippi-js update
 * @param {SlippiGame} game 
 * @returns winner and position
 */
getSinglesWinner = function(game) {
    const {players} = game.getSettings();
    const playersLatestFrame = game.getLatestFrame().players;

    const [p1Data, p2Data] = players.map(({playerIndex}) => {
        const pData = playersLatestFrame[playerIndex]?.post || {stocksRemaining: 0, percent: 0};
        return {stocks: pData.stocksRemaining, damage: pData.percent};
    });

    const winner = getWinner(p1Data, p2Data);
    return winner
        ? [players[winner - 1]].map(({playerIndex}) => ({playerIndex, position: 0}))
        : [];
}

getDoublesWinner = function(game) {
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

    const [t1Data, t2Data] = teams.reduce((acc, team) => {
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

    const winner = getWinner(t1Data, t2Data);
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
        saga: "starfox",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    2: {
        character: "captainfalcon",
        saga: "fzero",
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
        saga: "mario",
        colours: [
            "green",  
            "red",  
            "blue",
            "black"
        ]
    },
    6: {
        character: "link",
        saga: "zelda",
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
        saga: "zelda",
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
        saga: "mother",
        colours: [
            "red",
            "gold",
            "blue",
            "green"
        ]
    },
    9: {
        character: "peach",
        saga: "mario",
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
        saga: "pokemon",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    13: {
        character: "samus",
        saga: "metroid",
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
        saga: "pokemon",
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
        saga: "pokemon",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    17: {
        character: "luigi",
        saga: "mario",
        colours: [
            "green",
            "white",
            "blue",
            "red"
        ]
    },
    18: {
        character: "marth",
        saga: "fireemblem",
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
        saga: "zelda",
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
        saga: "mario",
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
        saga: "starfox",
        colours: [
            "original",
            "red",
            "blue",
            "green"
        ]
    },
    23: {
        character: "pichu",
        saga: "pokemon",
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
        saga: "zelda",
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
        saga: "fireemblem",
        colours: [
            "original",
            "red",
            "blue",
            "green",
            "gold"
        ]
    }
};

exports.characterRandom = {
    character: "random",
    saga: "smash",
    stock: "smash",
    css: "empty",
    colours: [
        "cpu",
        "p1",
        "p2",
        "p3",
        "p4"
    ]
};

const charactersByExternalId = [
    2,  // captainfalcon
    3,  // donkeykong
    1,  // fox
    24, // gameandwatch
    4,  // kirby
    5,  // bowser
    6,  // link
    17, // luigi
    0,  // mario
    18, // marth
    16, // mewtwo
    8,  // ness
    9,  // peach
    12, // pikachu
    10, // iceclimbers
    15, // jigglypuff
    13, // samus
    14, // yoshi
    19, // zelda
    7,  // sheik
    22, // falco
    20, // younglink
    21, // drmario
    26, // roy
    23, // pichu
    25  // ganondorf
].map((id) => characters[id]);


exports.charactersByName = Object.values(characters).reduce((acc, cur) => {
    acc[cur.character] = cur;
    return acc;
}, {});

exports.getLatestCharacter = (playerSettings, playersLatestFrame) => {
    const character = characters[playersLatestFrame[playerSettings.playerIndex]?.post.internalCharacterId];
    return character?.character;
};

exports.getCharacter = ({characterId, characterColor}) => {
    const character = charactersByExternalId[characterId];
    return character
        ? {character: character.character, colour: character.colours[characterColor]}
        : {};
};