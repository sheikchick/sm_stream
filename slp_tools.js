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

//Returns a dict of the character + colour in string format
exports.matchChar = function(character, colour) {
    var s_character = ""
    var s_colour = ""
    switch(character) {
        case 0: //falcon
            s_character = "captainfalcon"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "black"
                    break;
                case 2:
                    s_colour = "red"
                    break;
                case 3:
                    s_colour = "white"
                    break;
                case 4:
                    s_colour = "green"
                    break;
                case 5:
                    s_colour = "blue"
            }
            break;
        case 1: //dk
            s_character = "donkeykong"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "dark"
                    break;
                case 2:
                    s_colour = "red"
                    break;
                case 3:
                    s_colour = "blue"
                    break;
                case 4:
                    s_colour = "green"
            }
            break;
        case 2: //fox
            s_character = "fox"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 3: //gaw
            s_character = "gameandwatch"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 4: //kirby
            s_character = "kirby"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "yellow"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "red"
                    break;
                case 4:
                    s_colour = "green"
                    break;
                case 5:
                    s_colour = "white"
            }
            break;
        case 5: //bowser
            s_character = "bowser"
            switch(colour) {
                case 0:
                    s_colour = "green"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "green"
                    break;
                case 3:
                    s_colour = "black"
            }
            break;
        case 6: //link
            s_character = "link"
            switch(colour) {
                case 0:
                    s_colour = "green"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "black"
                    break;
                case 4:
                    s_colour = "white"
            }
            break;
        case 7: //luigi
            s_character = "luigi"
            switch(colour) {
                case 0:
                    s_colour = "green"
                    break;
                case 1:
                    s_colour = "white"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "red"
            }
            break;
        case 8: //mario
            s_character = "mario"
            switch(colour) {
                case 0:
                    s_colour = "red"
                    break;
                case 1:
                    s_colour = "yellow"
                    break;
                case 2:
                    s_colour = "black"
                    break;
                case 3:
                    s_colour = "blue"
                    break;
                case 4:
                    s_colour = "green"
            }
            break;
        case 9: //marth
            s_character = "marth"
            switch(colour) {
                case 0:
                    s_colour = "blue"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "green"
                    break;
                case 3:
                    s_colour = "black"
                    break;
                case 4:
                    s_colour = "white"
            }
            break;
        case 10: //mewtwo
            s_character = "mewtwo"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 11: //ness
            s_character = "ness"
            switch(colour) {
                case 0:
                    s_colour = "red"
                    break;
                case 1:
                    s_colour = "yellow"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 12: //peach
            s_character = "peach"
            switch(colour) {
                case 0:
                    s_colour = "red"
                    break;
                case 1:
                    s_colour = "gold"
                    break;
                case 2:
                    s_colour = "white"
                    break;
                case 3:
                    s_colour = "blue"
                    break;
                case 4:
                    s_colour = "green"
            }
            break;
        case 13: //pikachu
            s_character = "pikachu"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 14: //ics
            s_character = "iceclimbers"
            switch(colour) {
                case 0:
                    s_colour = "blue"
                    break;
                case 1:
                    s_colour = "green"
                    break;
                case 2:
                    s_colour = "yellow"
                    break;
                case 3:
                    s_colour = "red"
            }
            break;
        case 15: //jigglypuff
            s_character = "jigglypuff"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "gold"
            }
            break;
        case 16: //samus
            s_character = "samus"
            switch(colour) {
                case 0:
                    s_colour = "red"
                    break;
                case 1:
                    s_colour = "pink"
                    break;
                case 2:
                    s_colour = "dark"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "blue"
            }
            break;
        case 17: //yoshi
            s_character = "yoshi"
            switch(colour) {
                case 0:
                    s_colour = "green"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "yellow"
                    break;
                case 4:
                    s_colour = "pink"
                    break;
                case 5:
                    s_colour = "cyan"
            }
            break;
        case 18: //zelda
            s_character = "zelda"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "white"
            }
            break;
        case 19: //sheik
            s_character = "sheik"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "white"
            }
            break;
        case 20: //falco
            s_character = "falco"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 21: //ylink
            s_character = "younglink"
            switch(colour) {
                case 0:
                    s_colour = "green"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "white"
                    break;
                case 4:
                    s_colour = "black"
            }
            break;
        case 22: //doc
            s_character = "drmario"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "black"
            }
            break;
        case 23: //roy
            s_character = "roy"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "gold"
            }
            break;
        case 24: //pichu
            s_character = "pichu"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
            }
            break;
        case 25: //ganondorf
            s_character = "ganondorf"
            switch(colour) {
                case 0:
                    s_colour = "original"
                    break;
                case 1:
                    s_colour = "red"
                    break;
                case 2:
                    s_colour = "blue"
                    break;
                case 3:
                    s_colour = "green"
                    break;
                case 4:
                    s_colour = "purple"
            }
    }
    return {
        "character": s_character,
        "colour": s_colour
    }
}