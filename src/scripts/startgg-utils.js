/* start.gg has different character indices than we use */
function resolveStartggCharacter(character) {
    switch(character) {
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
    switch(stage) {
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

function startggState(int) {
    switch(int) {
        case 1:
            return "CREATED"
        case 2:
            return "ACTIVE"
        case 3:
            return "COMPLETED"
        case 4:
            return "READY"
        case 5:
            return "INVALID"
        case 6:
            return "CALLED"
        case 7:
            return "QUEUED"
        default:
            return null
    }   
}

/*TODO: extra pretty for doubles, take average stocks of both players (Math.floor) on team, create list of characters and iterate through them for each team
ie: team1 plays FOX/FALCO game 1 but plays SHEIK/FALCO game 2 and 3, on startgg display characters as g1 FOX g2 FALCO g3 SHEIK
*/

function constructSet(p1Id, p2Id, games, swapped) {
    /*
    if(games[0].team1.length > 1) {
        if(games[0].team1[1] != {}) {
            var chars = getDoublesCharactersArray(games)
        }
    }*/
    let index = 1;
    let set = []
    let characterIndex = 0
    for(let game of games) {
        console.log(game)
        let char1 = ""
        let char2 = ""
        /*
        if(games[0].team1.length > 1) {
            if(games[0].team1[1] != {}) {
                char1 = chars[0][characterIndex % chars[0].length]
                char2 = chars[1][characterIndex % chars[1].length]
            } else {
                char1 = game.team1[0].character
                char2 = game.team2[0].character
            }
        } else {*/
            char1 = swapped ? game.team2[0].character : game.team1[0].character
            char2 = swapped ? game.team1[0].character : game.team2[0].character
        //}
        set.push(constructGame(index, p1Id, p2Id, char1, char2, game, swapped))
        characterIndex++;
        index++;
    }
    return set
}

function constructGame(gameIndex, p1Id, p2Id, p1Char, p2Char, data, swapped) {
    const game = {
        "winnerId": data.winner == 1 ? (swapped ? p2Id : p1Id) : (swapped ? p1Id : p2Id),
        "gameNum": gameIndex,
        "entrant1Score": swapped ? data.team2[0].stocks : data.team1[0].stocks,
        "entrant2Score": swapped ? data.team1[0].stocks : data.team2[0].stocks,
        "stageId": resolveStartggStage(data.stage),
        "selections": [
          {
            "entrantId": p1Id,
            "characterId": resolveStartggCharacter(p1Char)
          },
          {
            "entrantId": p2Id,
            "characterId": resolveStartggCharacter(p2Char)
          }
        ]
    }
    return game
}

function getDoublesCharactersArray(games) {
    let charObj = [{},{}]
    for(let game of games) {
        for(x = 0; x < games[0].team1.length; x++) {
            for(let player of game[`team${x}`].players) {
                if(charObj[x][player.character] !== undefined) {
                    charObj[x][player.character]+=1
                } else {
                    charObj[x][player.character] = 1
                }
            }
        }
    }
    let charArr = [[],[]]
    for(x = 0; x < games[0].team1.length; x++) {
        for (var char in charObj[x]) {
            charArr[x].push([char, charObj[x][char]]);
        }
        charArr[x].sort(function(a, b) {
            return a[1] - b[1];
        });
    }
    return charArr;
}