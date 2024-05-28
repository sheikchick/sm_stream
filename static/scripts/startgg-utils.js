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
            return 1
        case "Princess Peach's Castle":
            return 2
        case "Rainbow Cruise":
            return 3
        case "Yoshi's Island":
            return 4
        case "Yoshi's Story":       //LEGAL
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

function constructSet(p1_id, p2_id, games) {
    let index = 1;
    let set = []
    for(let game of games) {
        set.push(constructGame(index, p1_id, p2_id, game))
    }
    return set
}

function constructGame(game_index, p1_id, p2_id, data) {
    const game = {
        "winnerId": 16739083,
        "gameNum": game_index,
        "entrant1Score": data.Player1.stocks,
        "entrant2Score": data.Player2.stocks,
        "stageId": resolveStartggStage(data.stage),
        "selections": [
          {
            "entrantId": p1_id,
            "characterId": resolveStartggCharacter(data.Player1.character)
          },
          {
            "entrantId": p2_id,
            "characterId": resolveStartggCharacter(data.Player2.character)
          }
        ]
    }
    return game
}